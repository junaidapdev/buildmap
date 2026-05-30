import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { LANDING_MESSAGES } from '@/features/landing/messages';

/**
 * Final CTA — inverted dark block matching the design's "You already have the idea." closer. A
 * subtle grid backdrop sits over the dark surface. The button reverses the global primary palette
 * so it reads as a light pill on dark.
 */
export function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
      <div className="relative overflow-hidden rounded-2xl border border-foreground bg-foreground px-8 py-16 text-background sm:px-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-[clamp(1.875rem,4vw,2.5rem)] font-semibold leading-tight tracking-tight">
            {LANDING_MESSAGES.FINAL_CTA_TITLE}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-balance text-[15px] text-background/70">
            {LANDING_MESSAGES.FINAL_CTA_BODY}
          </p>
          <Button
            asChild
            className="mt-7 bg-background text-foreground hover:bg-background/90"
            size="lg"
          >
            <Link to={`${ROUTES.SIGN_IN}?mode=signup`}>
              {LANDING_MESSAGES.FINAL_CTA_PRIMARY}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
