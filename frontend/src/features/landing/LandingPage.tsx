import { Link, Navigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/useAuth';
import { FeaturesSection } from '@/features/landing/FeaturesSection';
import { FinalCtaSection } from '@/features/landing/FinalCtaSection';
import { HeroSection } from '@/features/landing/HeroSection';
import { LANDING_MESSAGES } from '@/features/landing/messages';
import { useDocumentTitle } from '@/lib/document-title';

/**
 * Public landing page mounted at `/`. Authenticated visitors are redirected to `/dashboard`
 * synchronously via `<Navigate>` (not `useEffect`) so there's no flash of marketing content. The
 * brief blank phase below covers the moment `useAuth` is still resolving the session.
 *
 * Brand wordmark is "buildmap" — the canonical product name used everywhere else in the SPA.
 */
export function LandingPage() {
  useDocumentTitle(LANDING_MESSAGES.PAGE_TITLE);
  const { loading, session } = useAuth();

  if (loading) {
    // Brief blank state while the session restores. Intentionally invisible so the redirect path
    // below doesn't flash marketing content for authenticated users.
    return <div className="min-h-screen" aria-hidden="true" />;
  }

  if (session) {
    return <Navigate replace to={ROUTES.DASHBOARD} />;
  }

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link className="font-semibold tracking-tight" to={ROUTES.HOME}>
          {LANDING_MESSAGES.WORDMARK}
        </Link>
        <Button asChild variant="ghost">
          <Link to={ROUTES.SIGN_IN}>{LANDING_MESSAGES.HEADER_SIGN_IN_LINK}</Link>
        </Button>
      </header>
      <HeroSection />
      <FeaturesSection />
      <FinalCtaSection />
    </main>
  );
}
