import { AiErrorState } from '@/features/_shared/AiErrorState';
import { BRIEF_MESSAGES } from '@/features/projects/brief/messages';

type BriefErrorProps = {
  error: unknown;
  onRetry: () => void;
};

export function BriefError({ error, onRetry }: BriefErrorProps) {
  return (
    <AiErrorState
      error={error}
      fallbackBody={BRIEF_MESSAGES.ERROR_BODY}
      fallbackTitle={BRIEF_MESSAGES.ERROR_TITLE}
      onRetry={onRetry}
      retryLabel={BRIEF_MESSAGES.ERROR_RETRY}
    />
  );
}
