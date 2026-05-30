import { AiErrorState } from '@/features/_shared/AiErrorState';
import { AGENT_PROMPT_MESSAGES } from '@/features/projects/feature-specs/prompt/messages';

type PromptErrorProps = {
  error: unknown;
  onRetry: () => void;
};

export function PromptError({ error, onRetry }: PromptErrorProps) {
  return (
    <AiErrorState
      error={error}
      fallbackBody={AGENT_PROMPT_MESSAGES.ERROR_BODY}
      fallbackTitle={AGENT_PROMPT_MESSAGES.ERROR_TITLE}
      onRetry={onRetry}
      retryLabel={AGENT_PROMPT_MESSAGES.ERROR_RETRY}
    />
  );
}
