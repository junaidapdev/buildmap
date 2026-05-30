/**
 * Per-user rate limits for AI Edge Functions.
 *
 * Changing these requires deliberate review:
 * - GLOBAL_CALLS_PER_DAY covers heavy real-world usage (several full project generation cycles
 *   per day). Higher values invite abuse; lower values block legitimate iteration.
 * - FUNCTION_CALLS_PER_HOUR protects against burst loops on one endpoint, such as a regenerate
 *   section call inside a render-loop bug. It should comfortably exceed a focused editing session.
 *
 * If either value changes, update the Postgres function `check_rate_limit` in the matching
 * migration/follow-up migration. The values are duplicated intentionally: Postgres is authoritative
 * at runtime, while TypeScript keeps the policy discoverable in code review.
 */
export const RATE_LIMITS = {
  GLOBAL_CALLS_PER_DAY: 200,
  FUNCTION_CALLS_PER_HOUR: 20,
} as const;
