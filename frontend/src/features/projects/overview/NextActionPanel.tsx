import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import { useNextAction } from '@/features/projects/overview/useNextAction';

/**
 * Next-recommended hero. Lives outside the standard PanelCard chrome because it's the page's
 * primary CTA — it gets a softer inset background and tighter horizontal layout so the eyebrow,
 * action label, and CTA all read as one row of guidance.
 *
 * No PanelCard wrapper on purpose: the inset look (subtle bg, no card border) helps it feel like
 * a guidance banner rather than another section card.
 */
export function NextActionPanel({ projectId }: { projectId: string }) {
  const { nextAction, isPending } = useNextAction(projectId);

  return (
    <section
      aria-labelledby="next-action-heading"
      className="rounded-lg border border-border-subtle bg-subtle/60 px-5 py-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-card text-muted-foreground">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p
              className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
              id="next-action-heading"
            >
              {OVERVIEW_MESSAGES.NEXT_ACTION_TITLE}
            </p>
            {isPending ? (
              <Skeleton className="mt-1.5 h-5 w-64" />
            ) : (
              <p className="mt-1 text-[16px] font-semibold tracking-tight text-foreground">
                {nextAction.label}
              </p>
            )}
          </div>
        </div>
        {!isPending && nextAction.to && (
          <Button asChild className="shrink-0" size="sm">
            <Link to={nextAction.to}>
              {OVERVIEW_MESSAGES.NEXT_ACTION_CTA_LABEL}
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
