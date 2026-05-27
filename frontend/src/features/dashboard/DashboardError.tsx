import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DASHBOARD_MESSAGES } from '@/features/dashboard/messages';

type DashboardErrorProps = {
  onRetry: () => void;
};

export function DashboardError({ onRetry }: DashboardErrorProps) {
  return (
    <section
      className="flex min-h-80 flex-col items-center justify-center rounded-lg border px-6 py-12 text-center"
      aria-labelledby="dashboard-error-title"
    >
      <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="size-8" aria-hidden="true" />
      </div>
      <h2 id="dashboard-error-title" className="text-xl font-semibold tracking-tight">
        {DASHBOARD_MESSAGES.ERROR_TITLE}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{DASHBOARD_MESSAGES.ERROR_BODY}</p>
      <Button type="button" variant="outline" className="mt-6" onClick={onRetry}>
        {DASHBOARD_MESSAGES.ERROR_RETRY}
      </Button>
    </section>
  );
}
