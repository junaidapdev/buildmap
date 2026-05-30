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
import { assembleAgentPrompt } from '@shared/markdown/agent-prompt-markdown.ts';
import {
  AgentPromptModelOutputSchema,
  GenerateAgentPromptInputSchema,
  type TargetAgent,
  TargetAgentSchema,
} from '@shared/schemas/agent-prompt.ts';
import { ContextFileTypeSchema } from '@shared/schemas/context-files.ts';
import { FeatureSpecContentSchema } from '@shared/schemas/feature-spec.ts';
import { PROJECT_AGENT_VALUES, PROJECT_TYPE_VALUES } from '@shared/schemas/project.ts';

const CONTEXT_TYPES = [...ContextFileTypeSchema.options];

// The chunk this prompt is wrapped for; included_features is informational only here. The chunk's
// ref is preferred for the meta line, but the SPA-facing fallback is the chunk id (UUID).
const ChunkSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  ref: z.string().nullable(),
  title: z.string(),
  description: z.string(),
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

const SpecContentSchema = z.object({ content_json: FeatureSpecContentSchema });

const ContextDocTypeSchema = z.object({ type: z.string() });

// Mapping for the user message — keep it stable across regenerations.
const TARGET_AGENT_DISPLAY: Record<TargetAgent, string> = {
  claude_code: 'Claude Code',
  cursor: 'Cursor',
  generic: 'Generic AI agent',
};

// Strip the context delimiter from untrusted values so stored copy cannot break out of the
// <prompt_context> block and inject instructions. Enum fields are already constrained.
function sanitize(value: string): string {
  return value.replace(/<\/?prompt_context>/gi, '');
}

function buildUserMessage(args: {
  project: ProjectContext;
  chunk: Chunk;
  specGoal: string;
  specScope: string;
  targetAgent: TargetAgent;
  contextFileNames: string[];
}): string {
  const { project, chunk, specGoal, specScope, targetAgent, contextFileNames } = args;
  const contextFiles = contextFileNames.length > 0
    ? contextFileNames.map((name) => `- ${name}`)
    : ['(none on file)'];

  const lines: (string | null)[] = [
    '<prompt_context>',
    `Project name: ${sanitize(project.name)}`,
    project.description ? `Description: ${sanitize(project.description)}` : null,
    project.project_type ? `Type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${sanitize(project.preferred_stack)}` : null,
    project.preferred_agent ? `Preferred AI tool: ${project.preferred_agent}` : null,
    '',
    `Target coding agent: ${TARGET_AGENT_DISPLAY[targetAgent]}`,
    '',
    '--- CHUNK ---',
    `Ref: ${chunk.ref ?? '(unknown)'}`,
    `Title: ${sanitize(chunk.title)}`,
    `Description: ${sanitize(chunk.description)}`,
    `Estimated effort: ${chunk.estimated_effort}`,
    '',
    '--- SPEC GOAL (for grounding only — the spec body is appended verbatim by the assembler) ---',
    sanitize(specGoal),
    '',
    '--- SPEC SCOPE (for grounding only) ---',
    sanitize(specScope),
    '',
    '--- CONTEXT FILES AVAILABLE ---',
    ...contextFiles,
    '</prompt_context>',
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

    const parsedRequest = GenerateAgentPromptInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const { chunkId, targetAgent } = parsedRequest.data;
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // RLS scopes this read to the signed-in user; a missing or non-owned chunk reads as null.
    const { data: chunkRow, error: chunkError } = await supabase
      .from('feature_chunks')
      .select('id, project_id, ref, title, description, estimated_effort')
      .eq('id', chunkId)
      .maybeSingle();

    if (chunkError) {
      logger.error('agent_prompt_chunk_lookup_failed', { userId, code: chunkError.code });
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
      logger.error('agent_prompt_chunk_invalid', {
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

    // Fan out remaining reads in parallel; RLS scopes each to the signed-in user.
    const [projectRes, specRes, contextRes] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, description, project_type, preferred_stack, preferred_agent')
        .eq('id', projectId)
        .maybeSingle(),
      supabase
        .from('feature_specs')
        .select('content_json')
        .eq('chunk_id', chunkId)
        .maybeSingle(),
      supabase
        .from('project_documents')
        .select('type')
        .eq('project_id', projectId)
        .in('type', CONTEXT_TYPES),
    ]);

    if (projectRes.error || specRes.error || contextRes.error) {
      logger.error('agent_prompt_context_lookup_failed', {
        userId,
        projectId,
        project: projectRes.error?.code,
        spec: specRes.error?.code,
        context: contextRes.error?.code,
      });
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
      logger.error('agent_prompt_project_invalid', {
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

    // Existence gate: a feature spec is required before a prompt can be wrapped around it.
    const parsedSpec = specRes.data ? SpecContentSchema.safeParse(specRes.data) : null;

    if (!parsedSpec || !parsedSpec.success) {
      return fail(
        ERROR_CODES.FEATURE_SPEC_NOT_FOUND,
        ERROR_MESSAGES.FEATURE_SPEC_NOT_FOUND,
        HTTP_STATUS.PRECONDITION_FAILED,
        req,
      );
    }

    const contextFileNames = (contextRes.data ?? [])
      .map((row) => ContextDocTypeSchema.safeParse(row))
      .filter((parsed): parsed is { success: true; data: { type: string } } => parsed.success)
      .map((parsed) => parsed.data.type);

    const result = await generate(
      'agent_prompt_generation',
      buildUserMessage({
        project: parsedProject.data,
        chunk,
        specGoal: parsedSpec.data.content_json.goal,
        specScope: parsedSpec.data.content_json.scope,
        targetAgent,
        contextFileNames,
      }),
      AgentPromptModelOutputSchema,
    );

    // The AI returns framing; the assembler stitches the spec body verbatim. Deterministic so the
    // wrapped prompt's structure stays stable across regenerations.
    const fullPrompt = assembleAgentPrompt({
      ai: result.data,
      spec: parsedSpec.data.content_json,
      chunkTitle: chunk.title,
      chunkRef: chunk.ref ?? chunkId,
      projectName: parsedProject.data.name,
      targetAgent,
    });

    const { data: rpcMeta, error: rpcError } = await supabase.rpc('upsert_agent_prompt', {
      p_chunk_id: chunkId,
      p_target_agent: targetAgent,
      p_content: fullPrompt,
    });

    if (rpcError) {
      logger.error('agent_prompt_upsert_failed', { userId, projectId, code: rpcError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    // Procedure returns the full persisted row; mirror it in the response so the SPA's strict
    // AgentPromptRowSchema (including created_at/updated_at) passes its defense-in-depth check.
    const AgentPromptRowSchema = z.object({
      id: z.string().uuid(),
      chunk_id: z.string().uuid(),
      target_agent: TargetAgentSchema,
      content: z.string(),
      version: z.number().int().min(1),
      created_at: z.string(),
      updated_at: z.string(),
    });

    const parsedRow = AgentPromptRowSchema.safeParse(rpcMeta);

    if (!parsedRow.success) {
      logger.error('agent_prompt_upsert_row_invalid', {
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

    // TODO(chunk-27): persist result.meta to generation_logs once usage logging is implemented.
    logger.info('agent_prompt_generated', {
      userId,
      projectId,
      chunkId,
      targetAgent,
      version: parsedRow.data.version,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens,
      outputTokens: result.meta.outputTokens,
      latencyMs: result.meta.latencyMs,
      promptLength: fullPrompt.length,
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
      logger.error('agent_prompt_ai_invalid_output');
      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('agent_prompt_ai_provider_error', {
        provider: error.provider,
        status: error.status,
      });
      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    logger.error('agent_prompt_unhandled_error');
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
}

Deno.serve(handler);
