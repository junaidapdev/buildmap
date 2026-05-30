import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { GENERATION_FUNCTION_NAMES } from '@shared/telemetry/function-names.ts';
import { logGeneration } from '@shared/telemetry/log-generation.ts';
import { checkRateLimit } from '@shared/rate-limit/check-rate-limit.ts';
import type { SupabaseClient } from '@supabase/supabase-js';

import { AiInvalidOutputError, AiProviderError, generate } from '@shared/ai/index.ts';
import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';
import {
  ExtractLearningsInputSchema,
  LearningsModelOutputSchema,
} from '@shared/schemas/learning.ts';
import { PROJECT_TYPE_VALUES } from '@shared/schemas/project.ts';

// Project columns the extraction prompt grounds itself in (name + description + type + preferred
// stack). We deliberately do NOT pass the PRD, architecture, or any other artifact: the AI's job is
// to extract from the paste, not to remix planning documents.
const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  project_type: z.enum(PROJECT_TYPE_VALUES).nullable(),
  preferred_stack: z.string().max(500).nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

// Shape returned by create_learnings_batch.
const CreateLearningsBatchResultSchema = z.object({
  ingest_id: z.string().uuid(),
  count: z.number().int().min(0),
});

// Hard cap that matches the schema (the SPA and AI both stop at 30).
const SOURCE_RAW_TRUNCATE_CHARS = 5000;

// Strip the context delimiter from untrusted values so a stored paste cannot break out of the
// <ingest_context> block and inject instructions.
function sanitize(value: string): string {
  return value.replace(/<\/?ingest_context>/gi, '');
}

function buildUserMessage(args: {
  project: ProjectContext;
  sourceLabel: string | undefined;
  sourceContent: string;
}): string {
  const { project, sourceLabel, sourceContent } = args;

  const lines: (string | null)[] = [
    '<ingest_context>',
    `Project name: ${sanitize(project.name)}`,
    project.description ? `Description: ${sanitize(project.description)}` : null,
    project.project_type ? `Type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${sanitize(project.preferred_stack)}` : null,
    '',
    sourceLabel ? `Source label: ${sanitize(sourceLabel)}` : null,
    '',
    '--- SOURCE CONTENT ---',
    sanitize(sourceContent),
    '</ingest_context>',
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

    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const rateLimitCheck = await checkRateLimit(
      supabase,
      userId,
      GENERATION_FUNCTION_NAMES.EXTRACT_LEARNINGS,
    );

    if (!rateLimitCheck.allowed) {
      logger.info('rate_limit_blocked', {
        userId,
        functionName: GENERATION_FUNCTION_NAMES.EXTRACT_LEARNINGS,
        reason: rateLimitCheck.reason,
        retryAfterSeconds: rateLimitCheck.retryAfterSeconds,
      });

      return fail(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        HTTP_STATUS.TOO_MANY_REQUESTS,
        req,
        {
          retryAfterSeconds: rateLimitCheck.retryAfterSeconds,
          reason: rateLimitCheck.reason,
        },
        { 'Retry-After': String(rateLimitCheck.retryAfterSeconds) },
      );
    }

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

    const parsedRequest = ExtractLearningsInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const { projectId: parsedProjectId, sourceLabel, sourceContent } = parsedRequest.data;
    projectId = parsedProjectId;
    // RLS scopes this read to the signed-in user; a missing or non-owned project reads as null.
    const { data: projectRow, error: projectError } = await supabase
      .from('projects')
      .select('id, name, description, project_type, preferred_stack')
      .eq('id', projectId)
      .maybeSingle();

    if (projectError) {
      logger.error('learnings_project_lookup_failed', { userId, code: projectError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    if (!projectRow) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    const parsedProject = ProjectContextSchema.safeParse(projectRow);

    if (!parsedProject.success) {
      logger.error('learnings_project_invalid', {
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

    const result = await generate(
      'knowledge_extraction',
      buildUserMessage({
        project: parsedProject.data,
        sourceLabel,
        sourceContent,
      }),
      LearningsModelOutputSchema,
    );

    // No learnings found — surface that to the SPA with count: 0 and skip the procedure round-trip.
    if (result.data.learnings.length === 0) {
      await logGeneration(supabase, {
        userId: userId!,
        projectId: projectId ?? null,
        functionName: GENERATION_FUNCTION_NAMES.EXTRACT_LEARNINGS,
        provider: result.meta.provider,
        model: result.meta.model,
        inputTokens: result.meta.inputTokens ?? null,
        outputTokens: result.meta.outputTokens ?? null,
        latencyMs: result.meta.latencyMs ?? null,
        success: true,
        errorCode: null,
        metadata: {
          sourceLength: sourceContent.length,
        },
      });
      return ok({ ingest_id: null, count: 0 }, HTTP_STATUS.OK, req);
    }

    // Truncate the persisted source_raw to keep the row size bounded — the AI already consumed the
    // full text, this is just for traceability in the UI's "view original" toggle.
    const sourceRawForStorage = sourceContent.length > SOURCE_RAW_TRUNCATE_CHARS
      ? sourceContent.slice(0, SOURCE_RAW_TRUNCATE_CHARS) + '\n…[truncated]'
      : sourceContent;

    const { data: rpcResult, error: rpcError } = await supabase.rpc('create_learnings_batch', {
      p_project_id: projectId,
      p_source_label: sourceLabel ?? null,
      p_source_raw: sourceRawForStorage,
      p_learnings: result.data.learnings,
    });

    if (rpcError) {
      logger.error('learnings_batch_failed', { userId, projectId, code: rpcError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const parsedRpc = CreateLearningsBatchResultSchema.safeParse(rpcResult);

    if (!parsedRpc.success) {
      logger.error('learnings_batch_invalid_response', {
        userId,
        projectId,
        issueCount: parsedRpc.error.issues.length,
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
      functionName: GENERATION_FUNCTION_NAMES.EXTRACT_LEARNINGS,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens ?? null,
      outputTokens: result.meta.outputTokens ?? null,
      latencyMs: result.meta.latencyMs ?? null,
      success: true,
      errorCode: null,
      metadata: {
        ingestId: parsedRpc.data.ingest_id,
        count: parsedRpc.data.count,
        sourceLength: sourceContent.length,
      },
    });

    return ok(
      { ingest_id: parsedRpc.data.ingest_id, count: parsedRpc.data.count },
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
      logger.error('learnings_ai_invalid_output');
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.EXTRACT_LEARNINGS,
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
      logger.error('learnings_ai_provider_error', {
        provider: error.provider,
        status: error.status,
      });
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.EXTRACT_LEARNINGS,
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

    logger.error('learnings_unhandled_error');
    if (supabase && userId) {
      await logGeneration(supabase, {
        userId,
        projectId: projectId ?? null,
        functionName: GENERATION_FUNCTION_NAMES.EXTRACT_LEARNINGS,
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
