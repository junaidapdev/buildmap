import { createClient } from '@supabase/supabase-js';

import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { env } from '@shared/env.ts';

export interface AuthContext {
  userId: string;
  jwt: string;
}

export class AuthError extends Error {
  readonly code = ERROR_CODES.UNAUTHORIZED;

  constructor() {
    super(ERROR_MESSAGES.UNAUTHORIZED);
    this.name = 'AuthError';
  }
}

function extractBearerToken(req: Request): string | null {
  const authorization = req.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const jwt = authorization.slice('Bearer '.length).trim();
  return jwt.length > 0 ? jwt : null;
}

export async function verifyAuth(req: Request): Promise<AuthContext | null> {
  const jwt = extractBearerToken(req);

  if (!jwt) {
    return null;
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const { data, error } = await supabase.auth.getUser(jwt);

    if (error || !data.user) {
      return null;
    }

    return { userId: data.user.id, jwt };
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request): Promise<AuthContext> {
  const auth = await verifyAuth(req);

  if (!auth) {
    throw new AuthError();
  }

  return auth;
}
