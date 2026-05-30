import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { GENERATION_FUNCTION_NAMES } from '@shared/telemetry/function-names.ts';
import { logGeneration } from '@shared/telemetry/log-generation.ts';
import type { SupabaseClient } from '@supabase/supabase-js';

import { AiInvalidOutputError, AiProviderError, generate } from '@shared/ai/index.ts';
import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';
import { renderFeatureSpecMarkdown } from '@shared/markdown/feature-spec-markdown.ts';
import { ContextFileTypeSchema } from '@shared/schemas/context-files.ts';
import {
  FeatureSpecContentSchema,
  FeatureSpecModelOutputSchema,
  GenerateFeatureSpecInputSchema,
} from '@shared/schemas/feature-spec.ts';
import { PROJECT_AGENT_VALUES, PROJECT_TYPE_VALUES } from '@shared/schemas/project.ts';

const BRIEF_TYPE = 'project_brief' as const;
const PRD_TYPE = 'prd' as const;
const ARCHITECTURE_TYPE = 'architecture' as const;
const CONTEXT_TYPES = [...ContextFileTypeSchema.options];

// The chunk this spec describes. included_features holds PRD feature ids; dependencies holds the
// refs of chunks that ship first. Both stay untrusted and are validated here.
const ChunkSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  ref: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  included_features: z.array(z.string()),
  dependencies: z.array(z.string()),
  estimated_effort: z.string(),
});

type Chunk = z.infer<typeof ChunkSchema>;

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  project_type: z.enum(PROJECT_TYPE_VALUES).nullable(),
  preferred_stack: z.string().max(500).nullable(),
  preferred_agent: z.enum(PROJECT_AGENT_VALUES).nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

// Brief, PRD, architecture, and each context file contribute markdown context.
const DocContentSchema = z.object({ content: z.string() });

// Lenient extraction of the PRD's feature ids and names so the spec can reference included features
// by name. Extra keys are ignored; a malformed content_json degrades to an empty map.
const PrdFeatureListSchema = z.object({
  features: z.array(z.object({ id: z.string(), name: z.string() })),
});

// Dependency chunks resolved by ref, so the spec can name what must ship first.
const DependencyChunkSchema = z.object({ ref: z.string().nullable(), title: z.string() });

const ContextDocSchema = z.object({ type: z.string(), content: z.string() });

// Validates the row returned by the upsert before it is trusted or returned to the SPA.
const FeatureSpecRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  chunk_id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  content_json: FeatureSpecContentSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

const FEATURE_SPEC_COLUMNS =
  'id, project_id, chunk_id, title, content, content_json, version, is_final, created_at, updated_at';

// Strip the context delimiter from untrusted values so stored copy cannot break out of the
// <spec_context> block and inject instructions. Enum fields are already constrained.
function sanitize(value: string): string {
  return value.replace(/<\/?spec_context>/gi, '');
}

function buildUserMessage(args: {
  project: ProjectContext;
  briefMarkdown: string;
  prdMarkdown: string;
  architectureMarkdown: string;
  contextDocs: { type: string; content: string }[];
  chunk: Chunk;
  includedFeatureNames: string[];
  dependencyChunks: { ref: string | null; title: string }[];
}): string {
  const {
    project,
    briefMarkdown,
    prdMarkdown,
    architectureMarkdown,
    contextDocs,
    chunk,
    includedFeatureNames,
    dependencyChunks,
  } = args;

  const featureLines = includedFeatureNames.length > 0
    ? includedFeatureNames.map((name) => `- ${sanitize(name)}`)
    : ['(none listed)'];

  const dependencyLines = dependencyChunks.length > 0
    ? dependencyChunks.map((dep) => `- ${dep.ref ?? '(unknown ref)'}: ${sanitize(dep.title)}`)
    : ['(none)'];

  const contextLines = contextDocs.flatMap((doc) => [
    `--- CONTEXT FILE: ${doc.type} ---`,
    sanitize(doc.content),
    '',
  ]);

  const lines: (string | null)[] = [
    '<spec_context>',
    `Project name: ${sanitize(project.name)}`,
    project.description ? `Description: ${sanitize(project.description)}` : null,
    project.project_type ? `Type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${sanitize(project.preferred_stack)}` : null,
    project.preferred_agent ? `Preferred AI tool: ${project.preferred_agent}` : null,
    '',
    '--- PROJECT BRIEF ---',
    briefMarkdown ? sanitize(briefMarkdown) : '(no brief on file)',
    '',
    '--- PRD ---',
    sanitize(prdMarkdown),
    '',
    '--- ARCHITECTURE ---',
    sanitize(architectureMarkdown),
    '',
    ...contextLines,
    '--- CHUNK TO SPEC ---',
    `Chunk ref: ${chunk.ref ?? '(unknown)'}`,
    `Title: ${sanitize(chunk.title)}`,
    `Description: ${sanitize(chunk.description)}`,
    `Estimated effort: ${chunk.estimated_effort}`,
    'Included PRD features:',
    ...featureLines,
    'Depends on chunks:',
    ...dependencyLines,
    '</spec_context>',
  ];

  return lines.filter((line): line is string => line !== null).join('\n');
}

export async function handler(req: Request): Promise<Response> {
  const preflight = handleCorsPreflight(req);

  if (preflight) {
    return preflight;
  }

  if (req.method !== 'POST') {
    return fail(
      ERROR_CODES.METHOD_NOT_ALLOWED,
      ERROR_MESSAGES.METHOD_NOT_ALLOWED,
      HTTP_STATUS.METHOD_NOT_ALLOWED,
      req,
    );
  }

  let userId: string | undefined;

  let projectId: string | undefined;

  let supabase: SupabaseClient | undefined;

  try {
    const auth = await requireAuth(req);

    userId = auth.userId;

    const jwt = auth.jwt;
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return fail(
        ERROR_CODES.BAD_REQUEST,
        ERROR_MESSAGES.BAD_REQUEST,
        HTTP_STATUS.BAD_REQUEST,
        req,
      );
    }

    const parsedRequest = GenerateFeatureSpecInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const { chunkId } = parsedRequest.data;
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // RLS scopes this read to the signed-in user; a missing or non-owned chunk reads as null.
    const { data: chunkRow, error: chunkError } = await supabase
      .from('feature_chunks')
      .select(
        'id, project_id, ref, title, description, included_features, dependencies, estimated_effort',
      )
      .eq('id', chunkId)
      .maybeSingle();

    if (chunkError) {
      logger.error('feature_spec_chunk_lookup_failed', { userId, code: chunkError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    if (!chunkRow) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    const parsedChunk = ChunkSchema.safeParse(chunkRow);

    if (!parsedChunk.success) {
      logger.error('feature_spec_chunk_invalid', {
        userId,
        issueCount: parsedChunk.error.issues.length,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const chunk = parsedChunk.data;
    const projectId = chunk.project_id;
    const dependencies = chunk.dependencies;

    // RLS scopes every read to the signed-in user. The PRD and architecture gate by existence; the
    // brief and context files are supplementary context.
    const [projectRes, briefRes, prdRes, archRes, contextRes, depsRes] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, description, project_type, preferred_stack, preferred_agent')
        .eq('id', projectId)
        .maybeSingle(),
      supabase
        .from('project_documents')
        .select('content')
        .eq('project_id', projectId)
        .eq('type', BRIEF_TYPE)
        .maybeSingle(),
      supabase
        .from('project_documents')
        .select('content, content_json')
        .eq('project_id', projectId)
        .eq('type', PRD_TYPE)
        .maybeSingle(),
      supabase
        .from('project_documents')
        .select('content')
        .eq('project_id', projectId)
        .eq('type', ARCHITECTURE_TYPE)
        .maybeSingle(),
      supabase
        .from('project_documents')
        .select('type, content')
        .eq('project_id', projectId)
        .in('type', CONTEXT_TYPES),
      dependencies.length > 0
        ? supabase
          .from('feature_chunks')
          .select('ref, title')
          .eq('project_id', projectId)
          .in('ref', dependencies)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (projectRes.error) {
      logger.error('feature_spec_project_lookup_failed', { userId, projectId });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    if (!projectRes.data) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    const parsedProject = ProjectContextSchema.safeParse(projectRes.data);

    if (!parsedProject.success) {
      logger.error('feature_spec_project_invalid', {
        userId,
        projectId,
        issueCount: parsedProject.error.issues.length,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    if (prdRes.error || archRes.error || briefRes.error || contextRes.error || depsRes.error) {
      logger.error('feature_spec_context_lookup_failed', {
        userId,
        projectId,
        prd: prdRes.error?.code,
        architecture: archRes.error?.code,
        brief: briefRes.error?.code,
        context: contextRes.error?.code,
        deps: depsRes.error?.code,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    // Existence gates (not approval), consistent with chunk generation.
    const parsedPrd = prdRes.data ? DocContentSchema.safeParse(prdRes.data) : null;

    if (!parsedPrd || !parsedPrd.success) {
      return fail(
        ERROR_CODES.PRD_NOT_FOUND,
        ERROR_MESSAGES.PRD_NOT_FOUND,
        HTTP_STATUS.PRECONDITION_FAILED,
        req,
      );
    }

    const parsedArch = archRes.data ? DocContentSchema.safeParse(archRes.data) : null;

    if (!parsedArch || !parsedArch.success) {
      return fail(
        ERROR_CODES.ARCHITECTURE_NOT_FOUND,
        ERROR_MESSAGES.ARCHITECTURE_NOT_FOUND,
        HTTP_STATUS.PRECONDITION_FAILED,
        req,
      );
    }

    // Brief is optional supplementary context.
    const parsedBrief = briefRes.data ? DocContentSchema.safeParse(briefRes.data) : null;
    const briefMarkdown = parsedBrief?.success ? parsedBrief.data.content : '';

    // Resolve included feature ids to names; a malformed content_json degrades to ids only.
    const parsedFeatures = PrdFeatureListSchema.safeParse(prdRes.data?.content_json);
    const featureMap = new Map(
      parsedFeatures.success ? parsedFeatures.data.features.map((f) => [f.id, f.name]) : [],
    );
    const includedFeatureNames = chunk.included_features.map((id) => featureMap.get(id) ?? id);

    // Resolve dependency chunks; malformed rows are skipped rather than fatal.
    const dependencyChunks = (depsRes.data ?? [])
      .map((row) => DependencyChunkSchema.safeParse(row))
      .filter((parsed): parsed is { success: true; data: z.infer<typeof DependencyChunkSchema> } =>
        parsed.success
      )
      .map((parsed) => parsed.data);

    const contextDocs = (contextRes.data ?? [])
      .map((row) => ContextDocSchema.safeParse(row))
      .filter((parsed): parsed is { success: true; data: z.infer<typeof ContextDocSchema> } =>
        parsed.success
      )
      .map((parsed) => parsed.data);

    const result = await generate(
      'feature_spec_generation',
      buildUserMessage({
        project: parsedProject.data,
        briefMarkdown,
        prdMarkdown: parsedPrd.data.content,
        architectureMarkdown: parsedArch.data.content,
        contextDocs,
        chunk,
        includedFeatureNames,
        dependencyChunks,
      }),
      FeatureSpecModelOutputSchema,
    );

    // The AI returns content_markdown, but we discard it and render deterministically from
    // content_json so stored copy stays consistent across generation and editing.
    const renderedMarkdown = renderFeatureSpecMarkdown(result.data.content_json, chunk.title);

    // Read-modify-write the version; the unique (chunk_id) constraint keeps a single spec per chunk.
    const { data: existing, error: existingError } = await supabase
      .from('feature_specs')
      .select('version')
      .eq('chunk_id', chunkId)
      .maybeSingle();

    if (existingError) {
      logger.error('feature_spec_existing_lookup_failed', {
        userId,
        projectId,
        code: existingError.code,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const existingVersionSchema = z.object({ version: z.number().int().min(1) });
    let nextVersion = 1;

    if (existing) {
      const parsedExisting = existingVersionSchema.safeParse(existing);

      if (!parsedExisting.success) {
        logger.error('feature_spec_existing_invalid', { userId, projectId });
        return fail(
          ERROR_CODES.INTERNAL,
          ERROR_MESSAGES.INTERNAL,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          req,
        );
      }

      nextVersion = parsedExisting.data.version + 1;
    }

    const { data: writtenRow, error: writeError } = await supabase
      .from('feature_specs')
      .upsert(
        {
          // project_id is required by the composite FK (project_id, chunk_id) -> feature_chunks.
          project_id: projectId,
          chunk_id: chunkId,
          title: `${chunk.title} — Feature Spec`,
          content: renderedMarkdown,
          content_json: result.data.content_json,
          version: nextVersion,
          // Regeneration discards any prior approval; the user must re-approve.
          is_final: false,
        },
        { onConflict: 'chunk_id' },
      )
      .select(FEATURE_SPEC_COLUMNS)
      .single();

    if (writeError) {
      logger.error('feature_spec_write_failed', { userId, projectId, code: writeError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const parsedRow = FeatureSpecRowSchema.safeParse(writtenRow);

    if (!parsedRow.success) {
      logger.error('feature_spec_row_invalid', {
        userId,
        projectId,
        issueCount: parsedRow.error.issues.length,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    await logGeneration(supabase, {
      userId: userId!,
      projectId: projectId ?? null,
      functionName: GENERATION_FUNCTION_NAMES.GENERATE_FEATURE_SPEC,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens ?? null,
      outputTokens: result.meta.outputTokens ?? null,
      latencyMs: result.meta.latencyMs ?? null,
      success: true,
      errorCode: null,
      metadata: {
        chunkId,
        version: parsedRow.data.version,
      },
    });

    return ok(parsedRow.data, HTTP_STATUS.OK, req);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(
        ERROR_CODES.UNAUTHORIZED,
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        req,
      );
    }

    if (error instanceof AiInvalidOutputError) {
      logger.error('feature_spec_ai_invalid_output');
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.GENERATE_FEATURE_SPEC,
          provider: error.provider ?? 'unknown',
          model: error.model ?? 'unknown',
          inputTokens: null,
          outputTokens: null,
          latencyMs: error.latencyMs ?? null,
          success: false,
          errorCode: ERROR_CODES.AI_INVALID_OUTPUT,
          metadata: { reason: error.message },
        });
      }
      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('feature_spec_ai_provider_error', {
        provider: error.provider,
        status: error.status,
      });
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.GENERATE_FEATURE_SPEC,
          provider: error.provider ?? 'unknown',
          model: error.model ?? 'unknown',
          inputTokens: null,
          outputTokens: null,
          latencyMs: error.latencyMs ?? null,
          success: false,
          errorCode: ERROR_CODES.AI_PROVIDER_ERROR,
          metadata: { status: error.status, reason: error.message },
        });
      }
      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    logger.error('feature_spec_unhandled_error');
    if (supabase && userId) {
      await logGeneration(supabase, {
        userId,
        projectId: projectId ?? null,
        functionName: GENERATION_FUNCTION_NAMES.GENERATE_FEATURE_SPEC,
        provider: 'unknown',
        model: 'unknown',
        inputTokens: null,
        outputTokens: null,
        latencyMs: null,
        success: false,
        errorCode: ERROR_CODES.INTERNAL,
        metadata: { reason: error instanceof Error ? error.message : 'unknown' },
      });
    }
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
}

Deno.serve(handler);
