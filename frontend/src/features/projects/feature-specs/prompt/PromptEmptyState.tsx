import { Button } from '@/components/ui/button';
import { AGENT_PROMPT_MESSAGES } from '@/features/projects/feature-specs/prompt/messages';

type PromptEmptyStateProps = {
  onGenerate: () => void;
  isPending: boolean;
};

export function PromptEmptyState({ onGenerate, isPending }: PromptEmptyStateProps) {
  return (
    <div className="space-y-4 rounded-lg border border-dashed p-12 text-center">
      <h3 className="text-lg font-semibold">{AGENT_PROMPT_MESSAGES.EMPTY_TITLE}</h3>
      <p className="text-muted-foreground">{AGENT_PROMPT_MESSAGES.EMPTY_BODY}</p>
      <Button aria-busy={isPending} disabled={isPending} onClick={onGenerate}>
        {isPending
          ? AGENT_PROMPT_MESSAGES.EMPTY_GENERATE_BUSY
          : AGENT_PROMPT_MESSAGES.EMPTY_GENERATE}
      </Button>
    </div>
  );
}
