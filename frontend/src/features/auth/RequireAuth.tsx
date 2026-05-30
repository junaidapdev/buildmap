import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { AUTH_MESSAGES } from '@/features/auth/messages';
import { useAuth } from '@/features/auth/useAuth';

export function RequireAuth({ children }: PropsWithChildren) {
  const { loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-3" aria-label={AUTH_MESSAGES.AUTH_LOADING}>
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded bg-muted" />
        </div>
      </main>
    );
  }

  if (!session) {
    // Chunk 30: unauthenticated visitors hitting a protected route land on the public landing
    // page, not the sign-in form. The `from` state is preserved so a subsequent sign-in still
    // returns the user to the originally requested path.
    return <Navigate to={ROUTES.HOME} replace state={{ from: location.pathname }} />;
  }

  return children;
}
