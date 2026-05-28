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
import {
  type PrdSectionKey,
  RegeneratePrdSectionInputSchema,
  RegeneratePrdSectionOutputSchema,
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

// Strip the context delimiter from untrusted values so stored copy cannot break out of the
// <prd_context> block and inject instructions. Enum fields are already constrained.
function sanitize(value: string): string {
  return value.replace(/<\/?prd_context>/gi, '');
}

function buildUserMessage(
  project: ProjectContext,
  briefMarkdown: string,
  prdContentJson: unknown,
  sectionKey: PrdSectionKey,
): string {
  const lines: string[] = [
    '<prd_context>',
    `Project name: ${sanitize(project.name)}`,
    project.description ? `Description: ${sanitize(project.description)}` : null,
    project.project_type ? `Type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${sanitize(project.preferred_stack)}` : null,
    project.preferred_agent ? `Preferred AI tool: ${project.preferred_agent}` : null,
    '',
    'Approved project brief:',
    sanitize(briefMarkdown),
    '',
    'Current PRD (structured JSON):',
    sanitize(JSON.stringify(prdContentJson)),
    '',
    `section_to_regenerate: ${sectionKey}`,
    '</prd_context>',
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

    const parsedRequest = RegeneratePrdSectionInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const { projectId, sectionKey } = parsedRequest.data;
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // RLS scopes all three reads to the signed-in user.
    const [projectRes, briefRes, prdRes] = await Promise.all([
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
        .select('content_json')
        .eq('project_id', projectId)
        .eq('type', DOCUMENT_TYPE)
        .maybeSingle(),
    ]);

    if (projectRes.error) {
      logger.error('prd_section_project_lookup_failed', { userId, projectId });
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
      logger.error('prd_section_project_invalid', {
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

    if (prdRes.error) {
      logger.error('prd_section_prd_lookup_failed', { userId, projectId, code: prdRes.error.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    // A PRD must exist before one of its sections can be regenerated.
    if (!prdRes.data) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    const briefContent = briefRes.data?.content;
    const briefMarkdown = typeof briefContent === 'string' ? briefContent : '';

    const result = await generate(
      'prd_section_regenerate',
      buildUserMessage(parsedProject.data, briefMarkdown, prdRes.data.content_json, sectionKey),
      RegeneratePrdSectionOutputSchema,
    );

    // The discriminated schema accepts any valid section; ensure the model returned the requested one.
    if (result.data.sectionKey !== sectionKey) {
      logger.error('prd_section_mismatch', {
        userId,
        projectId,
        requested: sectionKey,
        returned: result.data.sectionKey,
      });
      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    // TODO(chunk-27): persist result.meta to generation_logs once usage logging is implemented.
    logger.info('prd_section_regenerated', {
      userId,
      projectId,
      sectionKey,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens,
      outputTokens: result.meta.outputTokens,
      latencyMs: result.meta.latencyMs,
    });

    return ok(
      { sectionKey: result.data.sectionKey, value: result.data.value },
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
      logger.error('prd_section_ai_invalid_output');
      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('prd_section_ai_provider_error', {
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

    logger.error('prd_section_unhandled_error');
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
}

Deno.serve(handler);
