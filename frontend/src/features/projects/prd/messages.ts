export const PRD_MESSAGES = {
  PAGE_EYEBROW: 'PRD · LIVING DOCUMENT',
  PAGE_TITLE: 'Product requirements',
  PAGE_SUBTITLE: 'Edit, regenerate, or approve the whole PRD. Each section can be regenerated on its own.',

  PENDING_TITLE: 'Drafting your PRD…',
  PENDING_BODY: 'This usually takes 30–60 seconds.',

  ERROR_TITLE: 'We could not generate your PRD',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  GATING_TITLE: 'Approve your brief first',
  GATING_BODY:
    'The PRD is generated from your project brief. Approve the brief, then come back to generate the PRD.',
  GATING_OPEN_BRIEF: 'Open brief',

  REGENERATE_BUTTON: 'Regenerate full PRD',
  REGENERATE_BUSY: 'Regenerating…',
  REGENERATE_CONFIRM_TITLE: 'Regenerate the whole PRD?',
  REGENERATE_CONFIRM_BODY:
    'This replaces every section and resets the approved state. To change one section, use its own Edit or Regenerate instead.',
  REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_CONFIRM_CANCEL: 'Cancel',
  REGENERATE_HINT:
    'Edit or regenerate any section above, or regenerate the whole PRD. Either resets approval.',
  DOWNLOAD_BUTTON: 'Download',

  APPROVE_BUTTON: 'Approve PRD',
  APPROVE_BUTTON_BUSY: 'Approving…',
  APPROVED_BANNER: 'PRD approved.',

  NEXT_CTA: 'Next: generate architecture',

  SECTION_GOAL: 'Goal',
  SECTION_TARGET_USERS: 'Target users',
  SECTION_PROBLEM: 'Problem statement',
  SECTION_SUCCESS_CRITERIA: 'Success criteria',
  SECTION_FEATURES: 'Features',
  SECTION_USER_STORIES: 'User stories',
  SECTION_OUT_OF_SCOPE: 'Out of scope',
  SECTION_OPEN_QUESTIONS: 'Open questions',
  ACCEPTANCE_CRITERIA: 'Acceptance criteria',

  PRIORITY_LABELS: {
    must_have: 'Must have',
    should_have: 'Should have',
    nice_to_have: 'Nice to have',
  },

  EMPTY_LIST: '(none yet)',
  UPDATED_JUST_NOW: 'just now',
  VERSION_LABEL: (version: number) => `v${version}`,
  LAST_UPDATED_PREFIX: 'Updated',
} as const;
