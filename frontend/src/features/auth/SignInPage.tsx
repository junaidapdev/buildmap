import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';

import { BrandMark } from '@/components/layout/BrandMark';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/constants/routes';
import { AUTH_MESSAGES } from '@/features/auth/messages';
import { SignInForm } from '@/features/auth/SignInForm';
import { SignUpForm } from '@/features/auth/SignUpForm';
import { useAuth } from '@/features/auth/useAuth';
import { useDocumentTitle } from '@/lib/document-title';

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
 * pre-selects the sign-up tab on the initial load; tab switching after mount is purely local
 * state — the URL doesn't update on tab change.
 *
 * Authenticated visitors hit this page only briefly (a returning user clicking the sign-in CTA
 * on the landing page); the synchronous `<Navigate>` redirect to /dashboard kicks in once the
 * session has loaded.
 *
 * The redesign adds a BrandMark wordmark above the card so the auth surface visually belongs to
 * the landing page rather than reading as an unbranded form. The card itself drops its header and
 * lets the tab list communicate the active mode.
 */
export function SignInPage() {
  const { loading, session } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(() =>
    initialModeFromSearch(searchParams.get('mode')),
  );
  // Title reflects the active tab so the browser tab matches what's on screen.
  useDocumentTitle(mode === 'signup' ? 'Sign up — buildmap' : 'Sign in — buildmap');

  if (!loading && session) {
    return <Navigate replace to={ROUTES.DASHBOARD} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 bg-subtle px-4 py-12">
      <Link
        aria-label="buildmap"
        className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        to={ROUTES.HOME}
      >
        <BrandMark size={32} />
        <span className="text-[18px] font-semibold tracking-tight">buildmap</span>
      </Link>
      <Card className="w-full max-w-md shadow-soft">
        <CardContent className="p-6">
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
      <p className="text-[12px] text-faint">
        {mode === 'signin' ? AUTH_MESSAGES.SIGN_IN_SUBTITLE : AUTH_MESSAGES.SIGN_UP_SUBTITLE}
      </p>
    </main>
  );
}