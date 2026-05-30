import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { logger } from '@shared/logger.ts';

const RateLimitRowSchema = z.object({
  allowed: z.boolean(),
  retry_after_seconds: z.number().int().nonnegative(),
  reason: z.enum(['global', 'function']).nullable(),
});

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  reason: 'global' | 'function' | null;
};

/**
 * Check whether a user is within the AI generation rate limits.
 *
 * The Postgres function does the indexed counting. This wrapper normalizes the response shape and
 * intentionally fails open: telemetry trouble should be visible in logs, but it should not block a
 * legitimate user from generating content.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  functionName: string,
): Promise<RateLimitResult> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_function_name: functionName,
    });

    if (error) {
      logger.error('rate_limit_check_failed', { code: error.code, functionName });
      return { allowed: true, retryAfterSeconds: 0, reason: null };
    }

    const row = Array.isArray(data) ? data[0] : data;
    const parsed = RateLimitRowSchema.safeParse(row);

    if (!parsed.success) {
      logger.error('rate_limit_check_invalid_shape', {
        functionName,
        issueCount: parsed.error.issues.length,
      });
      return { allowed: true, retryAfterSeconds: 0, reason: null };
    }

    return {
      allowed: parsed.data.allowed,
      retryAfterSeconds: parsed.data.retry_after_seconds,
      reason: parsed.data.reason,
    };
  } catch (error) {
    logger.error('rate_limit_check_unexpected', {
      message: error instanceof Error ? error.message : 'unknown',
      functionName,
    });
    return { allowed: true, retryAfterSeconds: 0, reason: null };
  }
}
