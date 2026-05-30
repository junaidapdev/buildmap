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
import {
  ClarifyingQuestionsResponseSchema,
  GenerateClarifyingQuestionsInputSchema,
} from '@shared/schemas/clarification.ts';
import { PROJECT_AGENT_VALUES, PROJECT_TYPE_VALUES } from '@shared/schemas/project.ts';

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  project_type: z.enum(PROJECT_TYPE_VALUES).nullable(),
  preferred_stack: z.string().max(500).nullable(),
  preferred_agent: z.enum(PROJECT_AGENT_VALUES).nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

function formatProjectContext(project: ProjectContext): string {
  return [
    '<project_context>',
    `Project name: ${project.name}`,
    project.description ? `Description: ${project.description}` : null,
    project.project_type ? `Type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${project.preferred_stack}` : null,
    project.preferred_agent ? `Preferred AI tool: ${project.preferred_agent}` : null,
    '</project_context>',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
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

    const parsedRequest = GenerateClarifyingQuestionsInputSchema.safeParse(
      body,
    );

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    projectId = parsedRequest.data.projectId;
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(
        'id, name, description, project_type, preferred_stack, preferred_agent',
      )
      .eq('id', projectId)
      .maybeSingle();

    if (projectError) {
      logger.error('Clarifying question project lookup failed.', {
        userId,
        projectId,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    if (!project) {
      return fail(
        ERROR_CODES.NOT_FOUND,
        ERROR_MESSAGES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
        req,
      );
    }

    const parsedProject = ProjectContextSchema.safeParse(project);

    if (!parsedProject.success) {
      logger.error('Clarifying question project response validation failed.', {
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
      'idea_clarification',
      formatProjectContext(parsedProject.data),
      ClarifyingQuestionsResponseSchema,
    );

    await logGeneration(supabase, {
      userId: userId!,
      projectId: projectId ?? null,
      functionName: GENERATION_FUNCTION_NAMES.GENERATE_CLARIFYING_QUESTIONS,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens ?? null,
      outputTokens: result.meta.outputTokens ?? null,
      latencyMs: result.meta.latencyMs ?? null,
      success: true,
      errorCode: null,
      metadata: {
        questionCount: result.data.questions.length,
      },
    });

    return ok(result.data, HTTP_STATUS.OK, req);
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
      logger.error('AI clarification output failed validation.');
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.GENERATE_CLARIFYING_QUESTIONS,
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
      logger.error('AI clarification provider call failed.', {
        provider: error.provider,
        status: error.status,
      });
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.GENERATE_CLARIFYING_QUESTIONS,
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

    logger.error('Unhandled generate clarifying questions function error.');
    if (supabase && userId) {
      await logGeneration(supabase, {
        userId,
        projectId: projectId ?? null,
        functionName: GENERATION_FUNCTION_NAMES.GENERATE_CLARIFYING_QUESTIONS,
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
