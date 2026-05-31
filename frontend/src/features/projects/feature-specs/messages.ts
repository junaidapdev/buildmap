export const FEATURE_SPEC_MESSAGES = {
  TAB_SPEC: 'Spec',
  TAB_PROMPT: 'Prompt',
  TAB_NOTES: 'Notes',

  BACK_TO_BOARD: 'All chunks',
  VIEW_PROMPT_BUTTON: 'View prompt',
  STATUS_SELECT_LABEL: 'Status',
  CARD_FILES_LABEL: (n: number) => `${n} file${n === 1 ? '' : 's'}`,
  CARD_EFFORT_LABEL: (effort: string) => `Effort ${effort}`,
  CARD_AGENT_FALLBACK: 'No agent',
  CARD_AGENT_LABELS: {
    claude_code: 'Claude Code',
    cursor: 'Cursor',
    codex: 'Codex',
    windsurf: 'Windsurf',
    other: 'Custom',
  } as const,

  PENDING_TITLE: 'Drafting your feature spec…',
  PENDING_BODY: 'This usually takes 30–60 seconds.',

  ERROR_TITLE: 'We could not generate this spec',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  PAGE_LOAD_ERROR_TITLE: 'We could not load this chunk',
  PAGE_LOAD_ERROR_BODY: 'It may not exist, or you may not have access. Try again.',

  REGENERATE_BUTTON: 'Regenerate spec',
  REGENERATE_HEADER_BUTTON: 'Regenerate all',
  REGENERATE_BUSY: 'Regenerating…',
  REGENERATE_CONFIRM_TITLE: 'Regenerate this feature spec?',
  REGENERATE_CONFIRM_BODY:
    'This replaces every section and resets the approved state. To change one section, use its own Edit or Regenerate instead.',
  REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_CONFIRM_CANCEL: 'Cancel',
  REGENERATE_HINT: 'Edit or regenerate any section above, or regenerate the whole spec.',
  DOWNLOAD_BUTTON: 'Download',
  EXPORT_HEADER_BUTTON: 'Export',

  APPROVE_BUTTON: 'Approve spec',
  APPROVE_BUTTON_BUSY: 'Approving…',
  APPROVED_BANNER: 'Spec approved.',
  APPROVED_BADGE: 'Approved',
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
