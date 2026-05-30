import { AI_ERROR_MESSAGES } from '@/features/_shared/messages';
import { formatRetryAfter, getRateLimitDetails } from '@/lib/rate-limit';

export function getAiErrorCopy(error: unknown, fallback: string): string {
  const rateLimitDetails = getRateLimitDetails(error);

  if (!rateLimitDetails) {
    return fallback;
  }

  return AI_ERROR_MESSAGES.RATE_LIMIT_INLINE(formatRetryAfter(rateLimitDetails.retryAfterSeconds));
}
