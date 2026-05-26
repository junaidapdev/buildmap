import type { ErrorCode } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { corsHeaders } from '@shared/http/cors.ts';

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiError = { ok: false; error: { code: ErrorCode; message: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

function jsonResponse<T>(body: ApiResponse<T>, status: number, req?: Request): Response {
  const headers = corsHeaders(req);
  headers.set('Content-Type', 'application/json');

  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

export function ok<T>(data: T, status: number = HTTP_STATUS.OK, req?: Request): Response {
  return jsonResponse({ ok: true, data }, status, req);
}

export function created<T>(data: T, req?: Request): Response {
  return ok(data, HTTP_STATUS.CREATED, req);
}

export function fail(code: ErrorCode, message: string, status: number, req?: Request): Response {
  return jsonResponse({ ok: false, error: { code, message } }, status, req);
}
