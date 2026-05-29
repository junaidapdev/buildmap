import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';
import { renderArchitectureMarkdown } from '@shared/markdown/architecture-markdown.ts';
import { SaveArchitectureContentInputSchema } from '@shared/schemas/architecture.ts';

const ProjectNameSchema = z.object({ name: z.string().min(1).max(200) });

// Metadata the stored procedure returns after the update.
const UpdateMetaSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().min(1),
  is_final: z.boolean(),
  updated_at: z.string(),
});

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

    const parsedRequest = SaveArchitectureContentInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const { projectId, contentJson } = parsedRequest.data;
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .maybeSingle();

    if (projectError) {
      logger.error('architecture_save_project_lookup_failed', {
        userId,
        projectId,
        code: projectError.code,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const parsedProject = project ? ProjectNameSchema.safeParse(project) : null;

    if (!parsedProject || !parsedProject.success) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    // Markdown is always rendered server-side from content_json so the two stay in sync.
    const contentMarkdown = renderArchitectureMarkdown(contentJson, parsedProject.data.name);

    const { data: updateMeta, error: rpcError } = await supabase.rpc(
      'update_project_architecture_content',
      {
        p_project_id: projectId,
        p_content_json: contentJson,
        p_content_markdown: contentMarkdown,
      },
    );

    if (rpcError) {
      logger.error('architecture_save_failed', { userId, projectId, code: rpcError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const parsedMeta = UpdateMetaSchema.safeParse(updateMeta);

    if (!parsedMeta.success) {
      logger.error('architecture_save_meta_invalid', { userId, projectId });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    logger.info('architecture_content_saved', {
      userId,
      projectId,
      version: parsedMeta.data.version,
    });

    return ok(parsedMeta.data, HTTP_STATUS.OK, req);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(
        ERROR_CODES.UNAUTHORIZED,
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        req,
      );
    }

    logger.error('architecture_save_unhandled_error');
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
}

Deno.serve(handler);
