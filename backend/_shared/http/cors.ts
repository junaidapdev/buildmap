import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';

const allowedOrigins = env.ALLOWED_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

export function corsHeaders(req?: Request): Headers {
  const headers = new Headers({
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, x-client-info, apikey',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });

  if (allowedOrigins.includes('*')) {
    headers.set('Access-Control-Allow-Origin', '*');
    return headers;
  }

  const requestOrigin = req?.headers.get('Origin');

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    headers.set('Access-Control-Allow-Origin', requestOrigin);
    headers.set('Vary', 'Origin');
  }

  return headers;
}

export function handleCorsPreflight(req: Request): Response | null {
  if (req.method !== 'OPTIONS') {
    return null;
  }

  return new Response(null, {
    status: HTTP_STATUS.OK,
    headers: corsHeaders(req),
  });
}
