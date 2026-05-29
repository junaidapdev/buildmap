import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { AiInvalidOutputError, AiProviderError, generate } from '@shared/ai/index.ts';
import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';
import { ChunkModelOutputSchema, GenerateChunksInputSchema } from '@shared/schemas/chunks.ts';
import { ContextFileTypeSchema } from '@shared/schemas/context-files.ts';
import { PROJECT_AGENT_VALUES, PROJECT_TYPE_VALUES } from '@shared/schemas/project.ts';

const BRIEF_TYPE = 'project_brief' as const;
const PRD_TYPE = 'prd' as const;
const ARCHITECTURE_TYPE = 'architecture' as const;
const CONTEXT_TYPES = [...ContextFileTypeSchema.options];

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  project_type: z.enum(PROJECT_TYPE_VALUES).nullable(),
  preferred_stack: z.string().max(500).nullable(),
  preferred_agent: z.enum(PROJECT_AGENT_VALUES).nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

// Brief, PRD, and architecture markdown are context; a missing or malformed brief is absent, not
// fatal, while the PRD and architecture rows gate generation by existence (not approval).
const DocContentSchema = z.object({
  content: z.string(),
});

// Lenient extraction of the PRD's feature ids and names from content_json. Extra keys (description,
// priority, etc.) are ignored. The explicit id list is fed to the model so included_features can use
// real ids, and the id set lets the Edge Function drop any unresolvable references afterward.
const PrdFeatureListSchema = z.object({
  features: z.array(z.object({ id: z.string(), name: z.string() })),
});

type PrdFeature = z.infer<typeof PrdFeatureListSchema>['features'][number];

// Strip the context delimiter from untrusted values so stored copy cannot break out of the
// <project_context> block and inject instructions. Enum fields are already constrained.
function sanitize(value: string): string {
  return value.replace(/<\/?project_context>/gi, '');
}

function buildUserMessage(
  project: ProjectContext,
  briefMarkdown: string,
  prdMarkdown: string,
  architectureMarkdown: string,
  features: PrdFeature[],
): string {
  const featureLines = features.length > 0
    ? features.map((feature) => `- ${feature.id}: ${sanitize(feature.name)}`)
    : ['(none listed)'];

  const lines: (string | null)[] = [
    '<project_context>',
    `Project name: ${sanitize(project.name)}`,
    project.description ? `Description: ${sanitize(project.description)}` : null,
    project.project_type ? `Type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${sanitize(project.preferred_stack)}` : null,
    project.preferred_agent ? `Preferred AI tool: ${project.preferred_agent}` : null,
    '',
    '--- APPROVED PROJECT BRIEF ---',
    briefMarkdown ? sanitize(briefMarkdown) : '(no brief on file)',
    '',
    '--- APPROVED PRD ---',
    sanitize(prdMarkdown),
    '',
    '--- APPROVED ARCHITECTURE ---',
    sanitize(architectureMarkdown),
    '',
    '--- AVAILABLE PRD FEATURE IDS (use these exact ids in included_features) ---',
    ...featureLines,
    '',
    '--- CONTEXT FILES ---',
    'All seven canonical context files have been generated for this project.',
    '</project_context>',
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

  try {
    const { jwt, userId } = await requireAuth(req);
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

    const parsedRequest = GenerateChunksInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const { projectId } = parsedRequest.data;
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // RLS scopes all five reads to the signed-in user. The PRD, architecture, and context-file
    // count gate generation by existence; the brief is optional context.
    const [projectRes, briefRes, prdRes, archRes, contextCountRes] = await Promise.all([
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
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .in('type', CONTEXT_TYPES),
    ]);

    if (projectRes.error) {
      logger.error('chunks_project_lookup_failed', { userId, projectId });
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
      logger.error('chunks_project_invalid', {
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

    if (prdRes.error || archRes.error || briefRes.error || contextCountRes.error) {
      logger.error('chunks_context_lookup_failed', {
        userId,
        projectId,
        prd: prdRes.error?.code,
        architecture: archRes.error?.code,
        brief: briefRes.error?.code,
        context: contextCountRes.error?.code,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    // Existence gates (not approval): downstream generation depends on the prior artifacts existing,
    // so the user can iterate without re-approving each step.
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

    if ((contextCountRes.count ?? 0) < CONTEXT_TYPES.length) {
      return fail(
        ERROR_CODES.CONTEXT_FILES_MISSING,
        ERROR_MESSAGES.CONTEXT_FILES_MISSING,
        HTTP_STATUS.PRECONDITION_FAILED,
        req,
      );
    }

    // Brief is optional: a missing or malformed brief is absent context, not fatal.
    const parsedBrief = briefRes.data ? DocContentSchema.safeParse(briefRes.data) : null;
    const briefMarkdown = parsedBrief?.success ? parsedBrief.data.content : '';

    // Feature ids drive included_features validation. A malformed content_json degrades to an empty
    // list (unresolvable references then drop) rather than failing the whole generation.
    const parsedFeatures = PrdFeatureListSchema.safeParse(prdRes.data?.content_json);
    const features = parsedFeatures.success ? parsedFeatures.data.features : [];
    const prdFeatureIds = new Set(features.map((feature) => feature.id));

    if (!parsedFeatures.success) {
      logger.warn('chunks_prd_features_unreadable', { userId, projectId });
    }

    const result = await generate(
      'chunk_generation',
      buildUserMessage(
        parsedProject.data,
        briefMarkdown,
        parsedPrd.data.content,
        parsedArch.data.content,
        features,
      ),
      ChunkModelOutputSchema,
    );

    const chunks = result.data.chunks;
    const refs = chunks.map((chunk) => chunk.ref);
    const refSet = new Set(refs);

    // Refs must be unique within the set: dependency resolution and (project_id, ref) both rely on
    // it. A duplicate is a contract violation, not recoverable data.
    if (refSet.size !== refs.length) {
      logger.error('chunks_duplicate_refs', {
        userId,
        projectId,
        count: refs.length,
        unique: refSet.size,
      });
      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    // Dependencies must reference refs within this same set. The model's own output should be
    // self-consistent, so an unresolvable dependency is treated as invalid output.
    for (const chunk of chunks) {
      for (const dependency of chunk.dependencies) {
        if (!refSet.has(dependency)) {
          logger.error('chunks_unresolved_dependency', { userId, projectId, ref: chunk.ref });
          return fail(
            ERROR_CODES.AI_INVALID_OUTPUT,
            ERROR_MESSAGES.AI_INVALID_OUTPUT,
            HTTP_STATUS.BAD_GATEWAY,
            req,
          );
        }
      }
    }

    // included_features validation is forgiving: feature ids can drift if the PRD was edited, so an
    // unresolvable id is dropped (with a warning) rather than failing the whole generation.
    const sanitizedChunks = chunks.map((chunk) => {
      const resolved = chunk.included_features.filter((id) => prdFeatureIds.has(id));
      if (resolved.length !== chunk.included_features.length) {
        logger.warn('chunks_dropped_unresolvable_features', {
          userId,
          projectId,
          ref: chunk.ref,
          dropped: chunk.included_features.length - resolved.length,
        });
      }
      return { ...chunk, included_features: resolved };
    });

    // One atomic write: the stored procedure deletes the old set (cascading to feature_specs) and
    // inserts the new one in a single transaction, and returns whether project status advanced.
    const { data: statusAdvanced, error: rpcError } = await supabase.rpc('replace_project_chunks', {
      p_project_id: projectId,
      p_chunks: sanitizedChunks,
    });

    if (rpcError) {
      logger.error('chunks_replace_failed', { userId, projectId, code: rpcError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const advanced = statusAdvanced === true;

    // Per-effort distribution, no chunk content, so the log payload carries no user data.
    const byEffort = sanitizedChunks.reduce<Record<string, number>>((acc, chunk) => {
      acc[chunk.estimated_effort] = (acc[chunk.estimated_effort] ?? 0) + 1;
      return acc;
    }, {});

    // TODO(chunk-27): persist result.meta to generation_logs once usage logging is implemented.
    logger.info('chunks_generated', {
      userId,
      projectId,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens,
      outputTokens: result.meta.outputTokens,
      latencyMs: result.meta.latencyMs,
      count: sanitizedChunks.length,
      statusAdvanced: advanced,
      byEffort,
    });

    return ok(
      { generated: true, count: sanitizedChunks.length, statusAdvanced: advanced },
      HTTP_STATUS.OK,
      req,
    );
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
      logger.error('chunks_ai_invalid_output');
      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('chunks_ai_provider_error', { provider: error.provider, status: error.status });
      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    logger.error('chunks_unhandled_error');
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
}

Deno.serve(handler);
