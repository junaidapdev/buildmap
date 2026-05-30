import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/constants/routes';
import { AUTH_MESSAGES } from '@/features/auth/messages';
import { SignInForm } from '@/features/auth/SignInForm';
import { SignUpForm } from '@/features/auth/SignUpForm';
import { useAuth } from '@/features/auth/useAuth';

type AuthMode = 'signin' | 'signup';

const SIGNUP_MODE_PARAM = 'signup';

function initialModeFromSearch(value: string | null): AuthMode {
  // Only the exact literal 'signup' opts into the sign-up tab. Any other value (including
  // 'signin', garbage, or empty) defaults to sign-in. Treats the query param as untrusted.
  return value === SIGNUP_MODE_PARAM ? 'signup' : 'signin';
}

/**
 * Single auth surface mounted at `/sign-in`. Chunk 30 collapsed the previous /sign-up route into a
 * tabbed UI here so the public surface has one entry point. The `?mode=signup` query param
 * pre-selects the sign-up tab on the initial load (Chunk 30 spec); tab switching after mount is
 * purely local state — the URL doesn't update on tab change.
 *
 * Authenticated visitors hit this page only briefly (a returning user clicking the sign-in CTA
 * on the landing page); the synchronous `<Navigate>` redirect to /dashboard kicks in once the
 * session has loaded.
 */
export function SignInPage() {
  const { loading, session } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(() =>
    initialModeFromSearch(searchParams.get('mode')),
  );

  if (!loading && session) {
    return <Navigate replace to={ROUTES.DASHBOARD} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2 text-center">
          <CardTitle>
            {mode === 'signin' ? AUTH_MESSAGES.SIGN_IN_TITLE : AUTH_MESSAGES.SIGN_UP_TITLE}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs onValueChange={(value) => setMode(value as AuthMode)} value={mode}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{AUTH_MESSAGES.SIGN_IN_BUTTON}</TabsTrigger>
              <TabsTrigger value="signup">{AUTH_MESSAGES.HOME_SIGN_UP_BUTTON}</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-6" value="signin">
              <SignInForm onRequestSignUp={() => setMode('signup')} />
            </TabsContent>
            <TabsContent className="mt-6" value="signup">
              <SignUpForm onRequestSignIn={() => setMode('signin')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
