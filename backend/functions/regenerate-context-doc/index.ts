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
  type ContextFileType,
  ContextFileTypeSchema,
  RegenerateContextDocInputSchema,
  RegenerateContextDocOutputSchema,
} from '@shared/schemas/context-files.ts';
import { PROJECT_AGENT_VALUES, PROJECT_TYPE_VALUES } from '@shared/schemas/project.ts';

const BRIEF_TYPE = 'project_brief' as const;
const PRD_TYPE = 'prd' as const;
const ARCHITECTURE_TYPE = 'architecture' as const;
const CONTEXT_TYPES = [...ContextFileTypeSchema.options];

// Canonical filename per context-file type so the prompt context labels each doc the way the
// generated docs cross-reference one another.
const CONTEXT_FILENAMES: Record<ContextFileType, string> = {
  project_overview: 'project-overview.md',
  code_standards: 'code-standards.md',
  ai_workflow_rules: 'ai-workflow-rules.md',
  ui_context: 'ui-context.md',
  agents_md: 'AGENTS.md',
  claude_md: 'CLAUDE.md',
  progress_tracker: 'progress-tracker.md',
};

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  project_type: z.enum(PROJECT_TYPE_VALUES).nullable(),
  preferred_stack: z.string().max(500).nullable(),
  preferred_agent: z.enum(PROJECT_AGENT_VALUES).nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

const DocContentSchema = z.object({
  content: z.string(),
});

const ContextFileRowSchema = z.object({
  type: ContextFileTypeSchema,
  content: z.string(),
});

type ContextFileRow = z.infer<typeof ContextFileRowSchema>;

// Strip the context delimiter from untrusted values so stored copy (or the user instruction) cannot
// break out of the <context_files> block and inject instructions. Enum fields are constrained.
function sanitize(value: string): string {
  return value.replace(/<\/?context_files>/gi, '');
}

function buildUserMessage(
  project: ProjectContext,
  briefMarkdown: string,
  prdMarkdown: string,
  architectureMarkdown: string,
  docs: ContextFileRow[],
  targetType: ContextFileType,
  userInstruction: string | undefined,
): string {
  const byType = new Map(docs.map((doc) => [doc.type, doc.content]));
  const currentDocs = CONTEXT_TYPES.flatMap((type) => {
    const content = byType.get(type);
    if (content === undefined) {
      return [];
    }
    return [`### ${type} (${CONTEXT_FILENAMES[type]})`, sanitize(content), ''];
  });

  const instruction = userInstruction?.trim() ? sanitize(userInstruction.trim()) : '(none)';

  const lines: (string | null)[] = [
    '<context_files>',
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
    architectureMarkdown ? sanitize(architectureMarkdown) : '(no architecture on file)',
    '',
    '--- CURRENT CONTEXT FILES ---',
    ...currentDocs,
    '--- DOCUMENT TO REGENERATE ---',
    `document_to_regenerate: ${targetType}`,
    `user_instruction: ${instruction}`,
    '</context_files>',
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

    const parsedRequest = RegenerateContextDocInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const { projectId: parsedProjectId, type: targetType, userInstruction } = parsedRequest.data;
    projectId = parsedProjectId;
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // RLS scopes all five reads to the signed-in user. The full context-file set is fetched so the
    // regenerated doc stays consistent with the other six.
    const [projectRes, briefRes, prdRes, archRes, ctxRes] = await Promise.all([
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
        .select('content')
        .eq('project_id', projectId)
        .eq('type', ARCHITECTURE_TYPE)
        .maybeSingle(),
      supabase
        .from('project_documents')
        .select('type, content')
        .eq('project_id', projectId)
        .in('type', CONTEXT_TYPES),
    ]);

    if (projectRes.error) {
      logger.error('regen_context_doc_project_lookup_failed', { userId, projectId });
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
      logger.error('regen_context_doc_project_invalid', {
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

    if (ctxRes.error) {
      logger.error('regen_context_doc_context_lookup_failed', {
        userId,
        projectId,
        code: ctxRes.error.code,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const docs: ContextFileRow[] = [];
    for (const row of ctxRes.data ?? []) {
      const parsed = ContextFileRowSchema.safeParse(row);
      if (parsed.success) {
        docs.push(parsed.data);
      }
    }

    // The target doc must already exist for the project before it can be regenerated.
    if (!docs.some((doc) => doc.type === targetType)) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    // Brief, PRD, and architecture are context: a missing or malformed one is absent, not fatal.
    const parsedBrief = briefRes.data ? DocContentSchema.safeParse(briefRes.data) : null;
    const briefMarkdown = parsedBrief?.success ? parsedBrief.data.content : '';
    const parsedPrd = prdRes.data ? DocContentSchema.safeParse(prdRes.data) : null;
    const prdMarkdown = parsedPrd?.success ? parsedPrd.data.content : '';
    const parsedArch = archRes.data ? DocContentSchema.safeParse(archRes.data) : null;
    const architectureMarkdown = parsedArch?.success ? parsedArch.data.content : '';

    const result = await generate(
      'context_doc_regenerate',
      buildUserMessage(
        parsedProject.data,
        briefMarkdown,
        prdMarkdown,
        architectureMarkdown,
        docs,
        targetType,
        userInstruction,
      ),
      RegenerateContextDocOutputSchema,
    );

    // The model must regenerate the requested doc, not a different one. A mismatch is a contract
    // violation: treat it as invalid AI output rather than silently saving the wrong content.
    if (result.data.type !== targetType) {
      logger.error('regen_context_doc_type_mismatch', {
        userId,
        projectId,
        requested: targetType,
        returned: result.data.type,
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
      functionName: GENERATION_FUNCTION_NAMES.REGENERATE_CONTEXT_DOC,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens ?? null,
      outputTokens: result.meta.outputTokens ?? null,
      latencyMs: result.meta.latencyMs ?? null,
      success: true,
      errorCode: null,
      metadata: {
        type: targetType,
      },
    });

    // This function does NOT write. The SPA applies the new content via update_context_file_content,
    // keeping the contract simple (mirrors the per-section regenerate pattern from Chunks 14/16).
    return ok({ type: result.data.type, content: result.data.content }, HTTP_STATUS.OK, req);
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
      logger.error('regen_context_doc_ai_invalid_output');
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.REGENERATE_CONTEXT_DOC,
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
      logger.error('regen_context_doc_ai_provider_error', {
        provider: error.provider,
        status: error.status,
      });
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.REGENERATE_CONTEXT_DOC,
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

    logger.error('regen_context_doc_unhandled_error');
    if (supabase && userId) {
      await logGeneration(supabase, {
        userId,
        projectId: projectId ?? null,
        functionName: GENERATION_FUNCTION_NAMES.REGENERATE_CONTEXT_DOC,
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
