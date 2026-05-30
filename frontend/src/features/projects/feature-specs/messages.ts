export const FEATURE_SPEC_MESSAGES = {
  TAB_SPEC: 'Spec',
  TAB_PROMPT: 'Prompt',
  TAB_NOTES: 'Notes',

  BACK_TO_BOARD: 'Back to chunks',

  PENDING_TITLE: 'Drafting your feature spec…',
  PENDING_BODY: 'This usually takes 30–60 seconds.',

  ERROR_TITLE: 'We could not generate this spec',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  PAGE_LOAD_ERROR_TITLE: 'We could not load this chunk',
  PAGE_LOAD_ERROR_BODY: 'It may not exist, or you may not have access. Try again.',

  REGENERATE_BUTTON: 'Regenerate spec',
  REGENERATE_BUSY: 'Regenerating…',
  REGENERATE_CONFIRM_TITLE: 'Regenerate this feature spec?',
  REGENERATE_CONFIRM_BODY:
    'This replaces every section and resets the approved state. To change one section, use its own Edit or Regenerate instead.',
  REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_CONFIRM_CANCEL: 'Cancel',
  REGENERATE_HINT: 'Edit or regenerate any section above, or regenerate the whole spec.',
  DOWNLOAD_BUTTON: 'Download',

  APPROVE_BUTTON: 'Approve spec',
  APPROVE_BUTTON_BUSY: 'Approving…',
  APPROVED_BANNER: 'Spec approved.',
  APPROVE_FAILED: 'We could not approve this spec. Try again.',

  SECTION_GOAL: 'Goal',
  SECTION_SCOPE: 'Scope',
  SECTION_OUT_OF_SCOPE: 'Out of Scope',
  SECTION_TECHNICAL: 'Technical Requirements',
  SECTION_UI: 'UI Requirements',
  SECTION_SECURITY: 'Security Requirements',
  SECTION_ACCEPTANCE: 'Acceptance Criteria',

  CHUNK_HEADER_INCLUDES: 'Includes features',
  CHUNK_HEADER_DEPENDS: 'Depends on',
  CHUNK_HEADER_EMPTY: '—',

  PROMPT_TAB_PLACEHOLDER:
    'The prompt generator is coming next. Once it ships, you’ll be able to copy a Claude Code or Cursor-ready prompt from this tab.',
  NOTES_TAB_PLACEHOLDER: 'Notes will live here in a future update.',

  VERSION_LABEL: (version: number) => `v${version}`,
  LAST_UPDATED_PREFIX: 'Updated',
  UPDATED_JUST_NOW: 'just now',
} as const;
