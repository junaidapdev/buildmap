import { Skeleton } from '@/components/ui/skeleton';
import { ISSUE_MESSAGES } from '@/features/projects/issues/messages';

export function IssuesPending() {
  return (
    <section aria-label={ISSUE_MESSAGES.PENDING_TITLE} className="space-y-3" role="status">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </section>
  );
}
