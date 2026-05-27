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
  GenerateProjectBriefInputSchema,
  ProjectBriefContentSchema,
  ProjectBriefModelOutputSchema,
} from '@shared/schemas/brief.ts';
import { PROJECT_AGENT_VALUES, PROJECT_TYPE_VALUES } from '@shared/schemas/project.ts';

const DOCUMENT_TYPE = 'project_brief' as const;

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  project_type: z.enum(PROJECT_TYPE_VALUES).nullable(),
  preferred_stack: z.string().max(500).nullable(),
  preferred_agent: z.enum(PROJECT_AGENT_VALUES).nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;
type ClarificationAnswer = z.infer<typeof GenerateProjectBriefInputSchema>['answers'];

// Validates the row returned by the upsert before it is trusted or returned to the SPA.
const BriefRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  type: z.literal(DOCUMENT_TYPE),
  title: z.string(),
  content: z.string(),
  content_json: ProjectBriefContentSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

const ExistingBriefSchema = z.object({ version: z.number().int().min(1) });

function buildUserMessage(project: ProjectContext, answers: ClarificationAnswer): string {
  const lines: string[] = [
    '<project_context>',
    `Project name: ${project.name}`,
    project.description ? `Description: ${project.description}` : null,
    project.project_type ? `Type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${project.preferred_stack}` : null,
    project.preferred_agent ? `Preferred AI tool: ${project.preferred_agent}` : null,
  ].filter((line): line is string => line !== null);

  if (answers && answers.length > 0) {
    lines.push('', 'Clarification answers:');

    for (const answer of answers) {
      lines.push(`Q: ${answer.questionText}`, `A: ${answer.answer}`);
    }
  }

  lines.push('</project_context>');

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

    const parsedRequest = GenerateProjectBriefInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const { projectId, answers } = parsedRequest.data;
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, description, project_type, preferred_stack, preferred_agent')
      .eq('id', projectId)
      .maybeSingle();

    if (projectError) {
      logger.error('project_brief_project_lookup_failed', { userId, projectId });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    if (!project) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    const parsedProject = ProjectContextSchema.safeParse(project);

    if (!parsedProject.success) {
      logger.error('project_brief_project_invalid', {
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
      'project_brief',
      buildUserMessage(parsedProject.data, answers),
      ProjectBriefModelOutputSchema,
    );

    // Read-modify-write the version; the unique (project_id, type) constraint keeps a single brief.
    const { data: existing, error: existingError } = await supabase
      .from('project_documents')
      .select('version')
      .eq('project_id', projectId)
      .eq('type', DOCUMENT_TYPE)
      .maybeSingle();

    if (existingError) {
      logger.error('project_brief_existing_lookup_failed', {
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

    let nextVersion = 1;

    if (existing) {
      const parsedExisting = ExistingBriefSchema.safeParse(existing);

      if (!parsedExisting.success) {
        logger.error('project_brief_existing_invalid', { userId, projectId });
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
          title: `Brief — ${parsedProject.data.name}`,
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
      logger.error('project_brief_write_failed', { userId, projectId, code: writeError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const parsedRow = BriefRowSchema.safeParse(writtenRow);

    if (!parsedRow.success) {
      logger.error('project_brief_row_invalid', {
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
    logger.info('project_brief_generated', {
      userId,
      projectId,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens,
      outputTokens: result.meta.outputTokens,
      latencyMs: result.meta.latencyMs,
      version: parsedRow.data.version,
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
      logger.error('project_brief_ai_invalid_output');
      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('project_brief_ai_provider_error', {
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

    logger.error('project_brief_unhandled_error');
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
}

Deno.serve(handler);
