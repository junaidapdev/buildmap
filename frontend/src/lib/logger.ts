import { IS_PRODUCTION } from '@/config/env';

/**
 * Sensitive data (tokens, passwords, full user objects, API responses with secrets)
 * must never be passed to the logger.
 */
export const logger = {
  debug: (...args: unknown[]): void => {
    if (!IS_PRODUCTION) {
      console.debug(...args);
    }
  },
  info: (...args: unknown[]): void => {
    if (!IS_PRODUCTION) {
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
