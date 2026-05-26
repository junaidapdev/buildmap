export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  AI_INVALID_OUTPUT: 'AI_INVALID_OUTPUT',
  INTERNAL: 'INTERNAL',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  FEATURE_DISABLED: 'FEATURE_DISABLED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  BAD_REQUEST: 'The request could not be read.',
  UNAUTHORIZED: 'Authentication required.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_FAILED: 'The request payload is invalid.',
  RATE_LIMITED: 'Too many requests. Please slow down.',
  AI_PROVIDER_ERROR: 'The AI provider returned an error.',
  AI_INVALID_OUTPUT: 'The AI returned a response that could not be parsed.',
  INTERNAL: 'An unexpected error occurred.',
  METHOD_NOT_ALLOWED: 'This HTTP method is not allowed on this endpoint.',
  FEATURE_DISABLED: 'This feature is currently disabled.',
};
