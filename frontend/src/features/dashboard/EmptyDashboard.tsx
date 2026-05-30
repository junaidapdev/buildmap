import { FolderPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { DASHBOARD_MESSAGES } from '@/features/dashboard/messages';

/**
 * Empty dashboard — design's icon-tile pattern: a 44px rounded subtle tile with the icon,
 * compact heading, single-line body, and a single primary CTA. Surface uses bg-card so it reads
 * as a deliberate card rather than a dashed-border empty zone.
 */
export function EmptyDashboard() {
  return (
    <section
      aria-labelledby="empty-dashboard-title"
      className="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-16 text-center"
    >
      <div className="mb-3.5 grid size-11 place-items-center rounded-xl border bg-subtle text-muted-foreground">
        <FolderPlus aria-hidden="true" className="size-5" />
      </div>
      <h2
        className="text-[15px] font-semibold tracking-tight"
        id="empty-dashboard-title"
      >
        {DASHBOARD_MESSAGES.EMPTY_TITLE}
      </h2>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
        {DASHBOARD_MESSAGES.EMPTY_BODY}
      </p>
      <Button asChild className="mt-5">
        <Link to={ROUTES.PROJECT_NEW}>{DASHBOARD_MESSAGES.EMPTY_CTA}</Link>
      </Button>
    </section>
  );
}
