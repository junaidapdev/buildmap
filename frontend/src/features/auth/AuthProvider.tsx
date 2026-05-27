import { AuthUnknownError, type AuthError, type Session, type User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useEffect, useState, type PropsWithChildren } from 'react';

import { ROUTES } from '@/constants/routes';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

export type AuthResult = { error: AuthError | null };

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signUpWithPassword: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

// This context is exported for the feature-owned useAuth hook.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function authRedirectUrl(path: string): string {
  return `${window.location.origin}${path}`;
}

function unexpectedAuthError(cause: unknown): AuthError {
  return new AuthUnknownError('Authentication request failed.', cause);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) {
          return;
        }

        if (error) {
          logger.warn('auth_initial_session_failed');
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        logger.error('auth_initial_session_failed');
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) {
        return;
      }

      if (event === 'SIGNED_OUT') {
        // Session-scoped server state must not survive logout or a sign-out from another tab.
        queryClient.clear();
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        logger.warn('auth_password_sign_in_failed');
      } else {
        logger.info('auth_password_sign_in_succeeded');
      }

      return { error };
    } catch (cause: unknown) {
      logger.error('auth_password_sign_in_failed');
      return { error: unexpectedAuthError(cause) };
    }
  }

  async function signUpWithPassword(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: displayName ? { full_name: displayName } : {},
          emailRedirectTo: authRedirectUrl(ROUTES.AUTH_CONFIRM),
        },
      });

      if (error) {
        logger.warn('auth_password_sign_up_failed');
      } else {
        logger.info('auth_password_sign_up_started');
      }

      return { error };
    } catch (cause: unknown) {
      logger.error('auth_password_sign_up_failed');
      return { error: unexpectedAuthError(cause) };
    }
  }

  async function signInWithGoogle(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: authRedirectUrl(ROUTES.AUTH_CALLBACK) },
      });

      if (error) {
        logger.warn('auth_google_sign_in_failed');
      } else {
        logger.info('auth_google_sign_in_started');
      }

      return { error };
    } catch (cause: unknown) {
      logger.error('auth_google_sign_in_failed');
      return { error: unexpectedAuthError(cause) };
    }
  }

  async function signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.warn('auth_sign_out_failed');
        return;
      }

      queryClient.clear();
      logger.info('auth_sign_out_succeeded');
    } catch {
      logger.error('auth_sign_out_failed');
    }
  }

  const value: AuthContextValue = {
    session,
    user,
    loading,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
