import { Skeleton } from '@/components/ui/skeleton';
import { KNOWLEDGE_MESSAGES } from '@/features/projects/knowledge/messages';

export function KnowledgePending() {
  return (
    <section aria-label={KNOWLEDGE_MESSAGES.PENDING_TITLE} className="space-y-3" role="status">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </section>
  );
}
