import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AI_ERROR_MESSAGES } from '@/features/_shared/messages';
import { formatRetryAfter, getRateLimitDetails } from '@/lib/rate-limit';

type AiErrorStateProps = {
  error: unknown;
  onRetry: () => void;
  fallbackTitle?: string;
  fallbackBody?: string;
  retryLabel?: string;
};

export function AiErrorState({
  error,
  onRetry,
  fallbackTitle,
  fallbackBody,
  retryLabel,
}: AiErrorStateProps) {
  const rateLimitDetails = getRateLimitDetails(error);

  if (rateLimitDetails) {
    const reason = rateLimitDetails.reason;
    const reasonCopy =
      reason === 'global'
        ? AI_ERROR_MESSAGES.RATE_LIMIT_GLOBAL
        : AI_ERROR_MESSAGES.RATE_LIMIT_FUNCTION;

    return (
      <section
        className="flex flex-col items-center rounded-lg border border-amber-600/30 bg-amber-500/10 px-6 py-12 text-center"
        role="alert"
      >
        <div className="mb-4 rounded-full bg-amber-500/15 p-3 text-amber-700 dark:text-amber-500">
          <AlertTriangle aria-hidden="true" className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">{AI_ERROR_MESSAGES.RATE_LIMIT_TITLE}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{reasonCopy}</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {AI_ERROR_MESSAGES.RATE_LIMIT_RETRY_AFTER(
            formatRetryAfter(rateLimitDetails.retryAfterSeconds),
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center py-16 text-center" role="alert">
      <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
        <AlertTriangle aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold">{fallbackTitle ?? AI_ERROR_MESSAGES.GENERIC_TITLE}</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        {fallbackBody ?? AI_ERROR_MESSAGES.GENERIC_BODY}
      </p>
      <div className="mt-6">
        <Button onClick={onRetry}>{retryLabel ?? AI_ERROR_MESSAGES.GENERIC_RETRY}</Button>
      </div>
    </section>
  );
}
