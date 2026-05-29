import { Skeleton } from '@/components/ui/skeleton';
import { ARCHITECTURE_MESSAGES } from '@/features/projects/architecture/messages';

export function ArchitecturePending() {
  return (
    <section aria-label={ARCHITECTURE_MESSAGES.PENDING_TITLE} className="space-y-8" role="status">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{ARCHITECTURE_MESSAGES.PENDING_TITLE}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{ARCHITECTURE_MESSAGES.PENDING_BODY}</p>
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
