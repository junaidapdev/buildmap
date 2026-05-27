import { Skeleton } from '@/components/ui/skeleton';
import { PROJECT_LAYOUT_MESSAGES } from '@/features/projects/layout/messages';

export function ProjectLayoutPending() {
  return (
    <section aria-label={PROJECT_LAYOUT_MESSAGES.PENDING_TITLE} className="space-y-8" role="status">
      <Skeleton className="h-4 w-40" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </section>
  );
}
