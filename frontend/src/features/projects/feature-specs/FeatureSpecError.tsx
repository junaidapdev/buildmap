import { AiErrorState } from '@/features/_shared/AiErrorState';
import { FEATURE_SPEC_MESSAGES } from '@/features/projects/feature-specs/messages';

type FeatureSpecErrorProps = {
  error: unknown;
  onRetry: () => void;
};

export function FeatureSpecError({ error, onRetry }: FeatureSpecErrorProps) {
  return (
    <AiErrorState
      error={error}
      fallbackBody={FEATURE_SPEC_MESSAGES.ERROR_BODY}
      fallbackTitle={FEATURE_SPEC_MESSAGES.ERROR_TITLE}
      onRetry={onRetry}
      retryLabel={FEATURE_SPEC_MESSAGES.ERROR_RETRY}
    />
  );
}
