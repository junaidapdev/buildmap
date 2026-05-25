export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Check your connection and try again.',
  UNAUTHORIZED: 'You need to sign in to do that.',
  FORBIDDEN: 'You do not have permission to do that.',
  NOT_FOUND: 'We could not find what you were looking for.',
  VALIDATION: 'Some of the information you entered is invalid.',
  RATE_LIMITED: 'You are doing that too often. Try again in a moment.',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
