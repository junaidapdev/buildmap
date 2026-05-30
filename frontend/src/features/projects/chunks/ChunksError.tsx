import { AiErrorState } from '@/features/_shared/AiErrorState';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';

type ChunksErrorProps = {
  error: unknown;
  onRetry: () => void;
};

export function ChunksError({ error, onRetry }: ChunksErrorProps) {
  return (
    <AiErrorState
      error={error}
      fallbackBody={CHUNKS_MESSAGES.ERROR_BODY}
      fallbackTitle={CHUNKS_MESSAGES.ERROR_TITLE}
      onRetry={onRetry}
      retryLabel={CHUNKS_MESSAGES.ERROR_RETRY}
    />
  );
}
