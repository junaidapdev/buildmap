import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { AUTH_MESSAGES } from '@/features/auth/messages';
import { useAuth } from '@/features/auth/useAuth';
import { useDocumentTitle } from '@/lib/document-title';

export function EmailConfirmPage() {
  useDocumentTitle('Confirming email — buildmap');
  const { loading, session } = useAuth();
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTimedOut(true);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, session]);

  if (session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>{AUTH_MESSAGES.CONFIRM_SUCCESS}</CardTitle>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (!loading && timedOut) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>{AUTH_MESSAGES.CONFIRM_FAILED}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to={ROUTES.SIGN_IN}>{AUTH_MESSAGES.TO_SIGN_IN_LINK}</Link>
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
        {AUTH_MESSAGES.CONFIRM_PROCESSING}
      </div>
    </main>
  );
}
