import { createClient } from '@supabase/supabase-js';

import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';
import { DeleteAccountInputSchema } from '@shared/schemas/user-profile.ts';

Deno.serve(async (req) => {
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
    const { userId } = await requireAuth(req);

    const body = await req.json().catch(() => null);
    const parsed = DeleteAccountInputSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    // === EXCEPTION: this is the only Edge Function that uses the service role key. ===
    //
    // `auth.admin.deleteUser(userId)` cannot be called with the user's JWT-scoped client.
    // The target user id always comes from the verified JWT — never from the request body.
    // The body is only validated for the confirmation phrase.
    //
    // Cascade chain (Chunk 04 FKs):
    //   auth.users -> public.users -> projects -> owned tables
    //   generation_logs.user_id ON DELETE CASCADE removes telemetry rows for the user.
    const adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      logger.error('account_delete_failed', { userId, code: deleteError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    logger.info('account_deleted', { userId });

    return ok({ deleted: true }, HTTP_STATUS.OK, req);
  } catch (err) {
    if (err instanceof AuthError) {
      return fail(
        ERROR_CODES.UNAUTHORIZED,
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        req,
      );
    }

    logger.error('delete_account_unhandled', {
      message: err instanceof Error ? err.message : 'unknown',
    });
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
});
