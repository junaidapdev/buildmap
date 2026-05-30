import { AiErrorState } from '@/features/_shared/AiErrorState';
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';

type ContextFilesErrorProps = {
  error: unknown;
  onRetry: () => void;
};

export function ContextFilesError({ error, onRetry }: ContextFilesErrorProps) {
  return (
    <AiErrorState
      error={error}
      fallbackBody={CONTEXT_FILES_MESSAGES.ERROR_BODY}
      fallbackTitle={CONTEXT_FILES_MESSAGES.ERROR_TITLE}
      onRetry={onRetry}
      retryLabel={CONTEXT_FILES_MESSAGES.ERROR_RETRY}
    />
  );
}
