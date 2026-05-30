import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { LANDING_MESSAGES } from '@/features/landing/messages';

/**
 * Hero — single h1, supporting copy, two CTAs. The primary CTA points at the sign-up tab via the
 * `?mode=signup` query param; the secondary CTA opens the default sign-in tab. CTAs stack on mobile
 * and run side-by-side on `sm+`.
 */
export function HeroSection() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 px-6 py-20 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {LANDING_MESSAGES.HERO_HEADLINE}
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
        {LANDING_MESSAGES.HERO_SUBHEAD}
      </p>
      <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
        <Button asChild size="lg">
          <Link to={`${ROUTES.SIGN_IN}?mode=signup`}>{LANDING_MESSAGES.HERO_PRIMARY_CTA}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to={ROUTES.SIGN_IN}>{LANDING_MESSAGES.HERO_SECONDARY_CTA}</Link>
        </Button>
      </div>
    </section>
  );
}
