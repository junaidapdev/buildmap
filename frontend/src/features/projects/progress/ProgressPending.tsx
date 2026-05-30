import { Skeleton } from '@/components/ui/skeleton';
import { PROGRESS_MESSAGES } from '@/features/projects/progress/messages';

export function ProgressPending() {
  return (
    <section aria-label={PROGRESS_MESSAGES.PENDING_TITLE} className="space-y-6" role="status">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </section>
  );
}
