import { Skeleton } from '@/components/ui/skeleton';
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';

export function ContextFilesPending() {
  return (
    <section
      aria-label={CONTEXT_FILES_MESSAGES.PENDING_TITLE}
      className="space-y-8"
      role="status"
    >
      <div className="text-center">
        <h2 className="text-lg font-semibold">{CONTEXT_FILES_MESSAGES.PENDING_TITLE}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{CONTEXT_FILES_MESSAGES.PENDING_BODY}</p>
      </div>
      <div aria-hidden="true" className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton className="h-4 w-full" key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
