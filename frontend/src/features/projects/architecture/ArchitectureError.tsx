import { AiErrorState } from '@/features/_shared/AiErrorState';
import { ARCHITECTURE_MESSAGES } from '@/features/projects/architecture/messages';

type ArchitectureErrorProps = {
  error: unknown;
  onRetry: () => void;
};

export function ArchitectureError({ error, onRetry }: ArchitectureErrorProps) {
  return (
    <AiErrorState
      error={error}
      fallbackBody={ARCHITECTURE_MESSAGES.ERROR_BODY}
      fallbackTitle={ARCHITECTURE_MESSAGES.ERROR_TITLE}
      onRetry={onRetry}
      retryLabel={ARCHITECTURE_MESSAGES.ERROR_RETRY}
    />
  );
}
