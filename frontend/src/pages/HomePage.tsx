import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { AUTH_MESSAGES } from '@/features/auth/messages';
import { useAuth } from '@/features/auth/useAuth';

export function HomePage() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <section className="w-full max-w-sm space-y-3 rounded-xl border bg-card p-8 shadow-sm">
          <div className="mx-auto h-9 w-36 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-10 animate-pulse rounded bg-muted" />
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-sm rounded-xl border bg-card p-8 text-center text-card-foreground shadow-sm">
        {session ? (
          <>
            <h1 className="text-3xl font-semibold tracking-tight">
              {AUTH_MESSAGES.HOME_SIGNED_IN_TITLE}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {AUTH_MESSAGES.HOME_SIGNED_IN_SUBTITLE}
            </p>
            <Button className="mt-8" asChild>
              <Link to={ROUTES.DASHBOARD}>{AUTH_MESSAGES.GO_TO_DASHBOARD}</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold tracking-tight">
              {AUTH_MESSAGES.HOME_SIGNED_OUT_TITLE}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {AUTH_MESSAGES.HOME_SIGNED_OUT_SUBTITLE}
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button asChild>
                <Link to={ROUTES.SIGN_IN}>{AUTH_MESSAGES.SIGN_IN_BUTTON}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={ROUTES.SIGN_UP}>{AUTH_MESSAGES.HOME_SIGN_UP_BUTTON}</Link>
              </Button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
