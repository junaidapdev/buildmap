import { ArrowRight } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { BrandMark } from '@/components/layout/BrandMark';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/useAuth';
import { FeaturesSection } from '@/features/landing/FeaturesSection';
import { FinalCtaSection } from '@/features/landing/FinalCtaSection';
import { ForWhoSection } from '@/features/landing/ForWhoSection';
import { HeroSection } from '@/features/landing/HeroSection';
import { HowItWorksSection } from '@/features/landing/HowItWorksSection';
import { LANDING_MESSAGES } from '@/features/landing/messages';
import { useDocumentTitle } from '@/lib/document-title';

/**
 * Public landing page mounted at `/`. Authenticated visitors are redirected to `/dashboard`
 * synchronously via `<Navigate>` (not `useEffect`) so there's no flash of marketing content. The
 * brief blank phase below covers the moment `useAuth` is still resolving the session.
 *
 * The page is a stack of focused sections, each owning its own padding + max-width:
 *   1. Sticky blurred nav with brand mark + anchor links + auth CTAs.
 *   2. Hero with NEW pill, twin headlines, twin CTAs, reassurance chips.
 *   3. "How it works" 4-step row.
 *   4. "What you get" 6-card grid.
 *   5. "For who" two-column split.
 *   6. Inverted dark final CTA.
 *   7. Thin footer.
 *
 * Brand wordmark is "buildmap" — the canonical product name used everywhere else in the SPA.
 */
export function LandingPage() {
  useDocumentTitle(LANDING_MESSAGES.PAGE_TITLE);
  const { loading, session } = useAuth();

  if (loading) {
    return <div aria-hidden="true" className="min-h-screen" />;
  }

  if (session) {
    return <Navigate replace to={ROUTES.DASHBOARD} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3.5">
          <Link
            aria-label={LANDING_MESSAGES.WORDMARK}
            className="flex items-center gap-2.5"
            to={ROUTES.HOME}
          >
            <BrandMark size={28} />
            <span className="text-[16px] font-semibold tracking-tight">
              {LANDING_MESSAGES.WORDMARK}
            </span>
            <span className="rounded-full border bg-subtle px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {LANDING_MESSAGES.BETA_PILL}
            </span>
          </Link>
          <nav className="ml-4 hidden gap-1 md:flex">
            {LANDING_MESSAGES.HEADER_NAV.map((item) => (
              <a
                className="rounded-md px-3 py-1.5 text-[13px] text-secondaryText transition-colors hover:bg-hover hover:text-foreground"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link to={ROUTES.SIGN_IN}>{LANDING_MESSAGES.HEADER_SIGN_IN_LINK}</Link>
            </Button>
            <Button asChild size="sm">
              <Link to={`${ROUTES.SIGN_IN}?mode=signup`}>
                {LANDING_MESSAGES.HEADER_PRIMARY_CTA}
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ForWhoSection />
        <FinalCtaSection />
      </main>

      <footer className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-7 text-[12px] text-muted-foreground">
          <BrandMark size={20} />
          <span>{LANDING_MESSAGES.WORDMARK}</span>
          <span className="text-faint">·</span>
          <span>{LANDING_MESSAGES.FOOTER_TAGLINE}</span>
          <span className="ml-auto text-faint">{LANDING_MESSAGES.FOOTER_VERSION}</span>
        </div>
      </footer>
    </div>
  );
}