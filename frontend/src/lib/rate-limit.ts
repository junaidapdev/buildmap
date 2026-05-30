import { EdgeFunctionError } from '@/lib/edge';

export const RATE_LIMIT_ERROR_CODE = 'RATE_LIMIT_EXCEEDED';

export type RateLimitReason = 'global' | 'function' | null;

export type RateLimitDetails = {
  retryAfterSeconds: number;
  reason: RateLimitReason;
};

export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`;
  }

  const minutes = Math.ceil(seconds / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

export function getRateLimitDetails(error: unknown): RateLimitDetails | null {
  if (!(error instanceof EdgeFunctionError) || error.code !== RATE_LIMIT_ERROR_CODE) {
    return null;
  }

  const rawSeconds = error.metadata?.retryAfterSeconds;
  const retryAfterSeconds =
    typeof rawSeconds === 'number' && Number.isFinite(rawSeconds) && rawSeconds > 0
      ? Math.ceil(rawSeconds)
      : 60;
  const rawReason = error.metadata?.reason;
  const reason = rawReason === 'global' || rawReason === 'function' ? rawReason : null;

  return { retryAfterSeconds, reason };
}
