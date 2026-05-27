import type { ClarifyingQuestion } from '@shared/schemas/clarification';

export const CLARIFY_MESSAGES = {
  PAGE_TITLE: 'A few clarifying questions',
  PAGE_SUBTITLE:
    'Your answers help us generate a better project brief. Skip any you are not sure about.',
  PENDING_TITLE: 'Thinking through your project...',
  PENDING_BODY: 'This usually takes 5-15 seconds.',
  ERROR_TITLE: 'We could not generate questions',
  ERROR_BODY: 'Something went wrong. Try again, or skip ahead.',
  ERROR_RETRY: 'Try again',
  ERROR_SKIP: 'Skip clarifications',
  SUBMIT_BUTTON: 'Generate brief',
  SUBMIT_BUTTON_BUSY: 'Saving...',
  ANSWER_PLACEHOLDER: 'Your answer (optional)',
  ANSWER_TOO_LONG: 'Keep your answer under 1,000 characters.',
  SKIP_LINK: 'Skip clarifications and go straight to the brief',
  QUESTION_LABEL: (index: number) => `Question ${index}`,
  CHARACTER_COUNT: (length: number) => `${length} / 1,000 characters`,
} as const;

export const CLARIFY_CATEGORY_LABELS: Record<
  NonNullable<ClarifyingQuestion['category']>,
  string
> = {
  problem: 'Problem',
  users: 'Users',
  scope: 'Scope',
  features: 'Features',
  tech: 'Technology',
  success_criteria: 'Success criteria',
  other: 'Other',
};
