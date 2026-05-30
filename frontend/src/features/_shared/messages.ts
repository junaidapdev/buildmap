export const AI_ERROR_MESSAGES = {
  RATE_LIMIT_TITLE: "You've hit your usage limit",
  RATE_LIMIT_GLOBAL: "You've made a lot of AI requests recently. Please wait before trying again.",
  RATE_LIMIT_FUNCTION:
    "You've regenerated this kind of content too many times in a short window. Take a short break.",
  RATE_LIMIT_RETRY_AFTER: (formatted: string) => `Try again in about ${formatted}.`,
  RATE_LIMIT_INLINE: (formatted: string) =>
    `You've hit your usage limit. Try again in about ${formatted}.`,

  GENERIC_TITLE: 'Something went wrong',
  GENERIC_BODY: 'We could not complete that request. Try again.',
  GENERIC_RETRY: 'Try again',
} as const;
