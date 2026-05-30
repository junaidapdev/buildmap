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
  GeneratePrdInputSchema,
  PrdContentSchema,
  PrdModelOutputSchema,
} from '@shared/schemas/prd.ts';
import { PROJECT_AGENT_VALUES, PROJECT_TYPE_VALUES } from '@shared/schemas/project.ts';

const DOCUMENT_TYPE = 'prd' as const;
const BRIEF_TYPE = 'project_brief' as const;

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  project_type: z.enum(PROJECT_TYPE_VALUES).nullable(),
  preferred_stack: z.string().max(500).nullable(),
  preferred_agent: z.enum(PROJECT_AGENT_VALUES).nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

// The brief must exist and be approved before a PRD can be generated.
const BriefGateSchema = z.object({
  content: z.string(),
  is_final: z.boolean(),
});

// Validates the row returned by the upsert before it is trusted or returned to the SPA.
const PrdRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  type: z.literal(DOCUMENT_TYPE),
  title: z.string(),
  content: z.string(),
  content_json: PrdContentSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

const ExistingPrdSchema = z.object({ version: z.number().int().min(1) });

// Strip the context delimiter from untrusted values so stored copy cannot break out of the
// <project_context> block and inject instructions. Enum fields are already constrained.
function sanitize(value: string): string {
  return value.replace(/<\/?project_context>/gi, '');
}

function buildUserMessage(project: ProjectContext, briefMarkdown: string): string {
  const lines: string[] = [
    '<project_context>',
    `Project name: ${sanitize(project.name)}`,
    project.description ? `Description: ${sanitize(project.description)}` : null,
    project.project_type ? `Type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${sanitize(project.preferred_stack)}` : null,
    project.preferred_agent ? `Preferred AI tool: ${project.preferred_agent}` : null,
    '',
    'Approved project brief:',
    sanitize(briefMarkdown),
    '</project_context>',
  ].filter((line): line is string => line !== null);

  return lines.join('\n');
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
      GENERATION_FUNCTION_NAMES.GENERATE_PRD,
    );

    if (!rateLimitCheck.allowed) {
      logger.info('rate_limit_blocked', {
        userId,
        functionName: GENERATION_FUNCTION_NAMES.GENERATE_PRD,
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

    const parsedRequest = GeneratePrdInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const { projectId: parsedProjectId } = parsedRequest.data;
    projectId = parsedProjectId;
    // RLS scopes both reads to the signed-in user. The brief read gates PRD generation.
    const [projectRes, briefRes] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, description, project_type, preferred_stack, preferred_agent')
        .eq('id', projectId)
        .maybeSingle(),
      supabase
        .from('project_documents')
        .select('content, is_final')
        .eq('project_id', projectId)
        .eq('type', BRIEF_TYPE)
        .maybeSingle(),
    ]);

    if (projectRes.error) {
      logger.error('prd_project_lookup_failed', { userId, projectId });
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
      logger.error('prd_project_invalid', {
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

    if (briefRes.error) {
      logger.error('prd_brief_lookup_failed', { userId, projectId, code: briefRes.error.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const parsedBrief = briefRes.data ? BriefGateSchema.safeParse(briefRes.data) : null;

    // No brief, malformed brief, or an unapproved brief all block PRD generation.
    if (!parsedBrief || !parsedBrief.success || !parsedBrief.data.is_final) {
      return fail(
        ERROR_CODES.BRIEF_NOT_APPROVED,
        ERROR_MESSAGES.BRIEF_NOT_APPROVED,
        HTTP_STATUS.PRECONDITION_FAILED,
        req,
      );
    }

    const result = await generate(
      'prd_generation',
      buildUserMessage(parsedProject.data, parsedBrief.data.content),
      PrdModelOutputSchema,
    );

    // Read-modify-write the version; the unique (project_id, type) constraint keeps a single PRD.
    const { data: existing, error: existingError } = await supabase
      .from('project_documents')
      .select('version')
      .eq('project_id', projectId)
      .eq('type', DOCUMENT_TYPE)
      .maybeSingle();

    if (existingError) {
      logger.error('prd_existing_lookup_failed', { userId, projectId, code: existingError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    let nextVersion = 1;

    if (existing) {
      const parsedExisting = ExistingPrdSchema.safeParse(existing);

      if (!parsedExisting.success) {
        logger.error('prd_existing_invalid', { userId, projectId });
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
      .from('project_documents')
      .upsert(
        {
          project_id: projectId,
          type: DOCUMENT_TYPE,
          title: `PRD — ${parsedProject.data.name}`,
          content: result.data.content_markdown,
          content_json: result.data.content_json,
          version: nextVersion,
          // Regeneration discards any prior approval; the user must re-approve.
          is_final: false,
        },
        { onConflict: 'project_id,type' },
      )
      .select(
        'id, project_id, type, title, content, content_json, version, is_final, created_at, updated_at',
      )
      .single();

    if (writeError) {
      logger.error('prd_write_failed', { userId, projectId, code: writeError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const parsedRow = PrdRowSchema.safeParse(writtenRow);

    if (!parsedRow.success) {
      logger.error('prd_row_invalid', {
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
      functionName: GENERATION_FUNCTION_NAMES.GENERATE_PRD,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens ?? null,
      outputTokens: result.meta.outputTokens ?? null,
      latencyMs: result.meta.latencyMs ?? null,
      success: true,
      errorCode: null,
      metadata: {
        version: parsedRow.data.version,
        featureCount: result.data.content_json.features.length,
        storyCount: result.data.content_json.user_stories.length,
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
      logger.error('prd_ai_invalid_output');
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.GENERATE_PRD,
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
      logger.error('prd_ai_provider_error', { provider: error.provider, status: error.status });
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.GENERATE_PRD,
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

    logger.error('prd_unhandled_error');
    if (supabase && userId) {
      await logGeneration(supabase, {
        userId,
        projectId: projectId ?? null,
        functionName: GENERATION_FUNCTION_NAMES.GENERATE_PRD,
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
