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
  ContextFilesModelOutputSchema,
  GenerateContextFilesInputSchema,
} from '@shared/schemas/context-files.ts';
import { PROJECT_AGENT_VALUES, PROJECT_TYPE_VALUES } from '@shared/schemas/project.ts';

const BRIEF_TYPE = 'project_brief' as const;
const PRD_TYPE = 'prd' as const;
const ARCHITECTURE_TYPE = 'architecture' as const;

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  project_type: z.enum(PROJECT_TYPE_VALUES).nullable(),
  preferred_stack: z.string().max(500).nullable(),
  preferred_agent: z.enum(PROJECT_AGENT_VALUES).nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

// The architecture must exist and be approved before context files can be generated.
const ArchitectureGateSchema = z.object({
  content: z.string(),
  is_final: z.boolean(),
});

// Brief and PRD are helpful context; a missing or malformed one is absent context, not fatal.
const DocContentSchema = z.object({
  content: z.string(),
});

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
): string {
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
    prdMarkdown ? sanitize(prdMarkdown) : '(no PRD on file)',
    '',
    '--- APPROVED ARCHITECTURE ---',
    sanitize(architectureMarkdown),
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

    const parsedRequest = GenerateContextFilesInputSchema.safeParse(body);

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
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // RLS scopes all four reads to the signed-in user. The architecture read gates generation; the
    // brief and PRD are context.
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
        .select('content, is_final')
        .eq('project_id', projectId)
        .eq('type', ARCHITECTURE_TYPE)
        .maybeSingle(),
    ]);

    if (projectRes.error) {
      logger.error('context_files_project_lookup_failed', { userId, projectId });
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
      logger.error('context_files_project_invalid', {
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
      logger.error('context_files_architecture_lookup_failed', {
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

    const parsedArch = archRes.data ? ArchitectureGateSchema.safeParse(archRes.data) : null;

    // No architecture, a malformed architecture, or an unapproved architecture all block generation.
    if (!parsedArch || !parsedArch.success || !parsedArch.data.is_final) {
      return fail(
        ERROR_CODES.ARCHITECTURE_NOT_APPROVED,
        ERROR_MESSAGES.ARCHITECTURE_NOT_APPROVED,
        HTTP_STATUS.PRECONDITION_FAILED,
        req,
      );
    }

    if (briefRes.error) {
      logger.error('context_files_brief_lookup_failed', {
        userId,
        projectId,
        code: briefRes.error.code,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    if (prdRes.error) {
      logger.error('context_files_prd_lookup_failed', {
        userId,
        projectId,
        code: prdRes.error.code,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    // Brief and PRD are optional context: a missing or malformed one is not fatal, just absent.
    const parsedBrief = briefRes.data ? DocContentSchema.safeParse(briefRes.data) : null;
    const briefMarkdown = parsedBrief?.success ? parsedBrief.data.content : '';
    const parsedPrd = prdRes.data ? DocContentSchema.safeParse(prdRes.data) : null;
    const prdMarkdown = parsedPrd?.success ? parsedPrd.data.content : '';

    const result = await generate(
      'context_files_generation',
      buildUserMessage(parsedProject.data, briefMarkdown, prdMarkdown, parsedArch.data.content),
      ContextFilesModelOutputSchema,
    );

    // One atomic write of all seven rows: the stored procedure runs in a single transaction, so a
    // partial context-file set can never be persisted (version bump + is_final reset per doc).
    const { error: rpcError } = await supabase.rpc('upsert_context_files', {
      p_project_id: projectId,
      p_project_overview: result.data.project_overview,
      p_code_standards: result.data.code_standards,
      p_ai_workflow_rules: result.data.ai_workflow_rules,
      p_ui_context: result.data.ui_context,
      p_agents_md: result.data.agents_md,
      p_claude_md: result.data.claude_md,
      p_progress_tracker: result.data.progress_tracker,
    });

    if (rpcError) {
      logger.error('context_files_upsert_failed', { userId, projectId, code: rpcError.code });
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
      functionName: GENERATION_FUNCTION_NAMES.GENERATE_CONTEXT_FILES,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens ?? null,
      outputTokens: result.meta.outputTokens ?? null,
      latencyMs: result.meta.latencyMs ?? null,
      success: true,
      errorCode: null,
      metadata: {
        lengths: {
          project_overview: result.data.project_overview.length,
          code_standards: result.data.code_standards.length,
          ai_workflow_rules: result.data.ai_workflow_rules.length,
          ui_context: result.data.ui_context.length,
          agents_md: result.data.agents_md.length,
          claude_md: result.data.claude_md.length,
          progress_tracker: result.data.progress_tracker.length,
        },
      },
    });

    return ok({ generated: true }, HTTP_STATUS.OK, req);
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
      logger.error('context_files_ai_invalid_output');
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.GENERATE_CONTEXT_FILES,
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
      logger.error('context_files_ai_provider_error', {
        provider: error.provider,
        status: error.status,
      });
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.GENERATE_CONTEXT_FILES,
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

    logger.error('context_files_unhandled_error');
    if (supabase && userId) {
      await logGeneration(supabase, {
        userId,
        projectId: projectId ?? null,
        functionName: GENERATION_FUNCTION_NAMES.GENERATE_CONTEXT_FILES,
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
