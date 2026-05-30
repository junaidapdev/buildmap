import { ArrowRight, Check, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { LANDING_MESSAGES } from '@/features/landing/messages';
import { ProductPreview } from '@/features/landing/ProductPreview';

/**
 * Hero per design handoff §6.2. Single h1 with a muted second clause for typographic depth, a NEW
 * pill linking to the latest feature, twin CTAs (primary "Start a project" → sign-up tab on the
 * auth surface; secondary "Open a demo" → /dashboard, which redirects to /sign-in for visitors
 * without a session), three reassurance ticks, and the `ProductPreview` faux-window below.
 *
 * The grid backdrop is rendered behind the hero copy with a radial fade-out mask so it tapers off
 * before reaching the ProductPreview shadow.
 */
export function HeroSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] opacity-40"
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
            <Link to={ROUTES.DASHBOARD}>
              <LayoutGrid aria-hidden="true" className="size-4" />
              {LANDING_MESSAGES.HERO_SECONDARY_CTA}
            </Link>
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

      <div className="relative mt-14">
        <ProductPreview />
      </div>
    </section>
  );
}