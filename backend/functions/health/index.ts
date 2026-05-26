import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';

function isPublicHealthRequest(req: Request): boolean {
  return req.method === 'GET' && new URL(req.url).pathname.endsWith('/health');
}

function isAuthenticatedHealthRequest(req: Request): boolean {
  return req.method === 'POST' && new URL(req.url).pathname.endsWith('/health/auth');
}

export async function handler(req: Request): Promise<Response> {
  const preflight = handleCorsPreflight(req);

  if (preflight) {
    return preflight;
  }

  try {
    if (isPublicHealthRequest(req)) {
      logger.info('Public health check completed.');
      return ok({ status: 'ok', timestamp: new Date().toISOString() }, HTTP_STATUS.OK, req);
    }

    if (isAuthenticatedHealthRequest(req)) {
      const auth = await requireAuth(req);
      logger.info('Authenticated health check completed.');
      return ok({ userId: auth.userId, status: 'authenticated' }, HTTP_STATUS.OK, req);
    }

    return fail(
      ERROR_CODES.METHOD_NOT_ALLOWED,
      ERROR_MESSAGES.METHOD_NOT_ALLOWED,
      HTTP_STATUS.METHOD_NOT_ALLOWED,
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

    logger.error('Unhandled health function error.');
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
}

Deno.serve(handler);
