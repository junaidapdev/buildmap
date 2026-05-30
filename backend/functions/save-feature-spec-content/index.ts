import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';
import { renderFeatureSpecMarkdown } from '@shared/markdown/feature-spec-markdown.ts';
import { SaveFeatureSpecContentInputSchema } from '@shared/schemas/feature-spec.ts';

const ChunkTitleSchema = z.object({ title: z.string().min(1) });

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

    const parsedRequest = SaveFeatureSpecContentInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const { chunkId, contentJson } = parsedRequest.data;
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // The chunk title is part of the rendered markdown header. RLS scopes this read to the owner.
    const { data: chunk, error: chunkError } = await supabase
      .from('feature_chunks')
      .select('title')
      .eq('id', chunkId)
      .maybeSingle();

    if (chunkError) {
      logger.error('feature_spec_save_chunk_lookup_failed', { userId, code: chunkError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const parsedChunk = chunk ? ChunkTitleSchema.safeParse(chunk) : null;

    if (!parsedChunk || !parsedChunk.success) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    // Markdown is always rendered server-side from content_json so the two stay in sync.
    const contentMarkdown = renderFeatureSpecMarkdown(contentJson, parsedChunk.data.title);

    const { data: updateMeta, error: rpcError } = await supabase.rpc(
      'update_feature_spec_content',
      {
        p_chunk_id: chunkId,
        p_content_json: contentJson,
        p_content_markdown: contentMarkdown,
      },
    );

    if (rpcError) {
      logger.error('feature_spec_save_failed', { userId, code: rpcError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const parsedMeta = UpdateMetaSchema.safeParse(updateMeta);

    if (!parsedMeta.success) {
      logger.error('feature_spec_save_meta_invalid', { userId });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    logger.info('feature_spec_content_saved', {
      userId,
      chunkId,
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

    logger.error('feature_spec_save_unhandled_error');
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
}

Deno.serve(handler);
