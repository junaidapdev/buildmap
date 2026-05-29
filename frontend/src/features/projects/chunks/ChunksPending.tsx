import { Skeleton } from '@/components/ui/skeleton';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';

export function ChunksPending() {
  return (
    <section aria-label={CHUNKS_MESSAGES.PENDING_TITLE} className="space-y-8" role="status">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{CHUNKS_MESSAGES.PENDING_TITLE}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{CHUNKS_MESSAGES.PENDING_BODY}</p>
      </div>
      <div aria-hidden="true" className="space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton className="h-24 w-full rounded-lg" key={index} />
        ))}
      </div>
    </section>
  );
}
