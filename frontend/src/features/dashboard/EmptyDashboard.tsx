import { FolderPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { DASHBOARD_MESSAGES } from '@/features/dashboard/messages';

export function EmptyDashboard() {
  return (
    <section
      className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center"
      aria-labelledby="empty-dashboard-title"
    >
      <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
        <FolderPlus className="size-8" aria-hidden="true" />
      </div>
      <h2 id="empty-dashboard-title" className="text-xl font-semibold tracking-tight">
        {DASHBOARD_MESSAGES.EMPTY_TITLE}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{DASHBOARD_MESSAGES.EMPTY_BODY}</p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.PROJECT_NEW}>{DASHBOARD_MESSAGES.EMPTY_CTA}</Link>
      </Button>
    </section>
  );
}
