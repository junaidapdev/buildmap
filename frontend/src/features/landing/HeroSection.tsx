import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { LANDING_MESSAGES } from '@/features/landing/messages';

/**
 * Hero — single h1 with a muted second line for typographic depth, a NEW pill linking out to the
 * latest feature, two CTAs (primary signup → tabbed auth surface; secondary signin → same surface
 * with the sign-in tab pre-selected), and three reassurance chips below. The subtle grid backdrop
 * is rendered behind the hero with a radial mask so it fades out toward the edges.
 */
export function HeroSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pb-24 sm:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <Link
          className="mb-8 inline-flex items-center gap-2 rounded-full border bg-card py-[5px] pl-[6px] pr-3 text-[12px] text-secondaryText shadow-soft transition-colors hover:bg-hover"
          to={ROUTES.SIGN_IN}
        >
          <span className="inline-flex items-center rounded-full border border-brand-soft-border bg-brand-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-text">
            {LANDING_MESSAGES.NEW_PILL}
          </span>
          <span>{LANDING_MESSAGES.NEW_PILL_MESSAGE}</span>
          <ArrowRight aria-hidden="true" className="size-3 opacity-50" />
        </Link>

        <h1 className="text-balance text-[clamp(2.5rem,6vw,4.25rem)] font-semibold leading-[1.02] tracking-tight">
          {LANDING_MESSAGES.HERO_HEADLINE_PRIMARY}
          <br />
          <span className="text-muted-foreground">
            {LANDING_MESSAGES.HERO_HEADLINE_SECONDARY}
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-[17px] leading-relaxed text-secondaryText">
          {LANDING_MESSAGES.HERO_SUBHEAD}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to={`${ROUTES.SIGN_IN}?mode=signup`}>
              {LANDING_MESSAGES.HERO_PRIMARY_CTA}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to={ROUTES.SIGN_IN}>{LANDING_MESSAGES.HERO_SECONDARY_CTA}</Link>
          </Button>
        </div>

        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[12px] text-faint">
          {LANDING_MESSAGES.HERO_CHECKS.map((check) => (
            <li className="inline-flex items-center gap-1.5" key={check}>
              <Check aria-hidden="true" className="size-3" />
              {check}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}