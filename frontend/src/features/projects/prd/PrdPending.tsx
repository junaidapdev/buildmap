import { Skeleton } from '@/components/ui/skeleton';
import { PRD_MESSAGES } from '@/features/projects/prd/messages';

export function PrdPending() {
  return (
    <section aria-label={PRD_MESSAGES.PENDING_TITLE} className="space-y-8" role="status">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{PRD_MESSAGES.PENDING_TITLE}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{PRD_MESSAGES.PENDING_BODY}</p>
      </div>
      <div aria-hidden="true" className="space-y-8">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="space-y-3" key={index}>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </section>
  );
}
