// deno-lint-ignore-file no-console
import { env } from '@shared/env.ts';

/**
 * Sensitive data (tokens, API keys, full request bodies, full user objects)
 * must never be passed to the logger.
 */
export const logger = {
  debug: (...args: unknown[]): void => {
    if (env.ENVIRONMENT !== 'production') {
      console.debug(...args);
    }
  },
  info: (...args: unknown[]): void => {
    if (env.ENVIRONMENT !== 'production') {
      console.info(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    console.warn(...args);
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
} as const;
