import { Skeleton } from '@/components/ui/skeleton';
import { AGENT_PROMPT_MESSAGES } from '@/features/projects/feature-specs/prompt/messages';

export function PromptPending() {
  return (
    <section aria-label={AGENT_PROMPT_MESSAGES.PENDING_TITLE} className="space-y-8" role="status">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{AGENT_PROMPT_MESSAGES.PENDING_TITLE}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {AGENT_PROMPT_MESSAGES.PENDING_BODY}
        </p>
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
