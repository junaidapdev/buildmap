import { Skeleton } from '@/components/ui/skeleton';
import { BRIEF_MESSAGES } from '@/features/projects/brief/messages';

export function BriefPending() {
  return (
    <section aria-label={BRIEF_MESSAGES.PENDING_TITLE} className="space-y-8" role="status">
      <div>
        <h2 className="text-lg font-semibold">{BRIEF_MESSAGES.PENDING_TITLE}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{BRIEF_MESSAGES.PENDING_BODY}</p>
      </div>
      <div aria-hidden="true" className="space-y-8">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="space-y-3" key={index}>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </section>
  );
}
