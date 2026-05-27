import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { AUTH_MESSAGES } from '@/features/auth/messages';
import { useAuth } from '@/features/auth/useAuth';

export function OAuthCallbackPage() {
  const { loading, session } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTimedOut(true);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (session) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  if (!loading && timedOut) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>{AUTH_MESSAGES.OAUTH_FAILED}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to={ROUTES.SIGN_IN}>{AUTH_MESSAGES.TRY_AGAIN_LINK}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <LoaderCircle className="animate-spin" aria-hidden="true" />
        {AUTH_MESSAGES.OAUTH_PROCESSING}
      </div>
    </main>
  );
}
