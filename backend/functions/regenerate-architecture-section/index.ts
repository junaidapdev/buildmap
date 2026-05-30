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
  type ArchitectureContent,
  ArchitectureContentSchema,
  type ArchitectureDecision,
  type ArchitectureSectionKey,
  RegenerateArchitectureSectionInputSchema,
  RegenerateArchitectureSectionOutputSchema,
} from '@shared/schemas/architecture.ts';
import { PROJECT_AGENT_VALUES, PROJECT_TYPE_VALUES } from '@shared/schemas/project.ts';

const DOCUMENT_TYPE = 'architecture' as const;
const BRIEF_TYPE = 'project_brief' as const;
const PRD_TYPE = 'prd' as const;

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  project_type: z.enum(PROJECT_TYPE_VALUES).nullable(),
  preferred_stack: z.string().max(500).nullable(),
  preferred_agent: z.enum(PROJECT_AGENT_VALUES).nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

// The architecture's structured content is needed both as model context and to look up the decision
// being regenerated in single_decision mode.
const ArchitectureRowSchema = z.object({ content_json: ArchitectureContentSchema });

// The regeneration target, resolved from the request before the prompt is built.
type RegenTarget =
  | { mode: 'full_section'; sectionKey: ArchitectureSectionKey }
  | { mode: 'single_decision'; decision: ArchitectureDecision };

// Strip the context delimiter from untrusted values so stored copy cannot break out of the
// <architecture_context> block and inject instructions. Enum fields are already constrained.
function sanitize(value: string): string {
  return value.replace(/<\/?architecture_context>/gi, '');
}

function buildUserMessage(
  project: ProjectContext,
  briefMarkdown: string,
  prdMarkdown: string,
  archContent: ArchitectureContent,
  target: RegenTarget,
): string {
  const targetLines = target.mode === 'full_section'
    ? [`mode: full_section`, `section_to_regenerate: ${target.sectionKey}`]
    : [
      `mode: single_decision`,
      `decision_to_regenerate: ${sanitize(JSON.stringify(target.decision))}`,
    ];

  const lines: (string | null)[] = [
    '<architecture_context>',
    `Project name: ${sanitize(project.name)}`,
    project.description ? `Description: ${sanitize(project.description)}` : null,
    project.project_type ? `Type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${sanitize(project.preferred_stack)}` : null,
    project.preferred_agent ? `Preferred AI tool: ${project.preferred_agent}` : null,
    '',
    'Approved project brief:',
    briefMarkdown ? sanitize(briefMarkdown) : '(no brief on file)',
    '',
    'Approved PRD:',
    prdMarkdown ? sanitize(prdMarkdown) : '(no PRD on file)',
    '',
    'Current architecture (structured JSON):',
    sanitize(JSON.stringify(archContent)),
    '',
    ...targetLines,
    '</architecture_context>',
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

    const parsedRequest = RegenerateArchitectureSectionInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const input = parsedRequest.data;
    const { projectId } = input;
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // RLS scopes all four reads to the signed-in user. The architecture must exist; brief and PRD are
    // helpful context.
    const [projectRes, briefRes, prdRes, archRes] = await Promise.all([
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
        .select('content')
        .eq('project_id', projectId)
        .eq('type', PRD_TYPE)
        .maybeSingle(),
      supabase
        .from('project_documents')
        .select('content_json')
        .eq('project_id', projectId)
        .eq('type', DOCUMENT_TYPE)
        .maybeSingle(),
    ]);

    if (projectRes.error) {
      logger.error('architecture_section_project_lookup_failed', { userId, projectId });
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
      logger.error('architecture_section_project_invalid', {
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

    if (archRes.error) {
      logger.error('architecture_section_arch_lookup_failed', {
        userId,
        projectId,
        code: archRes.error.code,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    // An architecture must exist before one of its sections can be regenerated.
    if (!archRes.data) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    const parsedArch = ArchitectureRowSchema.safeParse(archRes.data);

    if (!parsedArch.success) {
      logger.error('architecture_section_arch_invalid', {
        userId,
        projectId,
        issueCount: parsedArch.error.issues.length,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const archContent = parsedArch.data.content_json;

    // Resolve the regeneration target. For single_decision, the id must exist in the current
    // architecture before any AI call.
    let target: RegenTarget;

    if (input.mode === 'full_section') {
      target = { mode: 'full_section', sectionKey: input.sectionKey };
    } else {
      const decision = archContent.decisions.find((item) => item.id === input.decisionId);

      if (!decision) {
        return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
      }

      target = { mode: 'single_decision', decision };
    }

    const briefMarkdown = typeof briefRes.data?.content === 'string' ? briefRes.data.content : '';
    const prdMarkdown = typeof prdRes.data?.content === 'string' ? prdRes.data.content : '';

    const result = await generate(
      'architecture_section_regeneration',
      buildUserMessage(parsedProject.data, briefMarkdown, prdMarkdown, archContent, target),
      RegenerateArchitectureSectionOutputSchema,
    );

    // The discriminated schema accepts any valid target; ensure the model returned the requested one.
    if (input.mode === 'full_section') {
      if (result.data.mode !== 'full_section' || result.data.sectionKey !== input.sectionKey) {
        logger.error('architecture_section_mismatch', {
          userId,
          projectId,
          requestedMode: input.mode,
          requestedSection: input.sectionKey,
          returnedMode: result.data.mode,
        });
        return fail(
          ERROR_CODES.AI_INVALID_OUTPUT,
          ERROR_MESSAGES.AI_INVALID_OUTPUT,
          HTTP_STATUS.BAD_GATEWAY,
          req,
        );
      }
    } else if (
      result.data.mode !== 'single_decision' ||
      result.data.decisionId !== input.decisionId ||
      result.data.value.id !== input.decisionId
    ) {
      // The regenerated decision must keep its id, or the SPA cannot match it back into the array.
      logger.error('architecture_decision_mismatch', {
        userId,
        projectId,
        requestedMode: input.mode,
        returnedMode: result.data.mode,
      });
      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    await logGeneration(supabase, {
      userId: userId!,
      projectId: projectId ?? null,
      functionName: GENERATION_FUNCTION_NAMES.REGENERATE_ARCHITECTURE_SECTION,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens ?? null,
      outputTokens: result.meta.outputTokens ?? null,
      latencyMs: result.meta.latencyMs ?? null,
      success: true,
      errorCode: null,
      metadata: {
        mode: input.mode,
        target: input.mode === 'full_section' ? input.sectionKey : input.decisionId,
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
      logger.error('architecture_section_ai_invalid_output');
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.REGENERATE_ARCHITECTURE_SECTION,
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
      logger.error('architecture_section_ai_provider_error', {
        provider: error.provider,
        status: error.status,
      });
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.REGENERATE_ARCHITECTURE_SECTION,
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

    logger.error('architecture_section_unhandled_error');
    if (supabase && userId) {
      await logGeneration(supabase, {
        userId,
        projectId: projectId ?? null,
        functionName: GENERATION_FUNCTION_NAMES.REGENERATE_ARCHITECTURE_SECTION,
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
