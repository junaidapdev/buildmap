import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { LANDING_MESSAGES } from '@/features/landing/messages';

/**
 * Final CTA — single sign-up button, mirroring the hero pattern. Border-top separator from the
 * features section.
 */
export function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-2xl space-y-4 border-t px-6 py-20 text-center">
      <h2 className="text-2xl font-semibold">{LANDING_MESSAGES.FINAL_CTA_TITLE}</h2>
      <p className="text-muted-foreground">{LANDING_MESSAGES.FINAL_CTA_BODY}</p>
      <div className="pt-2">
        <Button asChild size="lg">
          <Link to={`${ROUTES.SIGN_IN}?mode=signup`}>{LANDING_MESSAGES.FINAL_CTA_PRIMARY}</Link>
        </Button>
      </div>
    </section>
  );
}
