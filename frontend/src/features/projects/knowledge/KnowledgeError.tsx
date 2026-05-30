import { AiErrorState } from '@/features/_shared/AiErrorState';
import { KNOWLEDGE_MESSAGES } from '@/features/projects/knowledge/messages';

type KnowledgeErrorProps = {
  error: unknown;
  onRetry: () => void;
};

export function KnowledgeError({ error, onRetry }: KnowledgeErrorProps) {
  return (
    <AiErrorState
      error={error}
      fallbackBody={KNOWLEDGE_MESSAGES.ERROR_BODY}
      fallbackTitle={KNOWLEDGE_MESSAGES.ERROR_TITLE}
      onRetry={onRetry}
      retryLabel={KNOWLEDGE_MESSAGES.ERROR_RETRY}
    />
  );
}
