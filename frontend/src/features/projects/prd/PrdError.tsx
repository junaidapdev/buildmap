import { AiErrorState } from '@/features/_shared/AiErrorState';
import { PRD_MESSAGES } from '@/features/projects/prd/messages';

type PrdErrorProps = {
  error: unknown;
  onRetry: () => void;
};

export function PrdError({ error, onRetry }: PrdErrorProps) {
  return (
    <AiErrorState
      error={error}
      fallbackBody={PRD_MESSAGES.ERROR_BODY}
      fallbackTitle={PRD_MESSAGES.ERROR_TITLE}
      onRetry={onRetry}
      retryLabel={PRD_MESSAGES.ERROR_RETRY}
    />
  );
}
