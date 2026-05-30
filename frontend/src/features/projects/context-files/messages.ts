export const CONTEXT_FILES_MESSAGES = {
  PAGE_TITLE: 'Context files',
  PAGE_SUBTITLE: 'Seven docs that brief your AI tools on this project.',

  PENDING_TITLE: 'Generating your context files…',
  PENDING_BODY: 'All seven docs are written in one pass. This usually takes 60–120 seconds.',

  ERROR_TITLE: 'We could not generate your context files',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  GATING_TITLE: 'Approve your architecture first',
  GATING_BODY:
    'Context files are generated from your architecture. Approve the architecture, then come back.',
  GATING_OPEN_ARCHITECTURE: 'Open architecture',

  // Page-level actions (regenerate the whole set)
  APPROVAL_PROGRESS: (approved: number, total: number) => `${approved} of ${total} approved`,
  REGENERATE_ALL_BUTTON: 'Regenerate all',
  REGENERATE_ALL_BUSY: 'Regenerating…',
  REGENERATE_ALL_CONFIRM_TITLE: 'Regenerate all context files?',
  REGENERATE_ALL_CONFIRM_BODY:
    'This replaces all seven docs and resets every approval. Any manual edits will be lost.',
  REGENERATE_ALL_CONFIRM_CONFIRM: 'Yes, regenerate all',
  REGENERATE_ALL_CONFIRM_CANCEL: 'Cancel',

  // Per-doc actions
  TAB_APPROVED_LABEL: 'Approved',
  EDIT_BUTTON: 'Edit',
  REGENERATE_BUTTON: 'Regenerate',
  REGENERATE_BUSY: 'Regenerating…',
  REGENERATE_CONFIRM_TITLE: 'Regenerate this doc?',
  REGENERATE_CONFIRM_BODY:
    'This replaces the current content and resets its approval. Any manual edits to this doc will be lost.',
  REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_CONFIRM_CANCEL: 'Cancel',
  REGENERATE_FAILED: 'We could not regenerate this doc. Try again.',
  DOWNLOAD_BUTTON: 'Download',

  APPROVE_BUTTON: 'Approve',
  APPROVE_BUSY: 'Approving…',
  APPROVE_FAILED: 'We could not approve this doc. Try again.',
  APPROVED_BANNER_TITLE: 'Approved.',

  // Per-doc editor
  EDITOR_LABEL: 'Markdown content',
  EDITOR_HINT: 'Edit the raw markdown. Saving creates a new version and resets approval.',
  SAVE_BUTTON: 'Save',
  SAVE_BUSY: 'Saving…',
  SAVE_FAILED: 'We could not save your changes. Try again.',
  CANCEL_BUTTON: 'Cancel',

  // Tab-switch guard while a doc has unsaved edits
  SWITCH_CONFIRM_TITLE: 'Discard unsaved changes?',
  SWITCH_CONFIRM_BODY: 'You have unsaved edits to this doc. Switching tabs will discard them.',
  SWITCH_CONFIRM_CONFIRM: 'Discard and switch',
  SWITCH_CONFIRM_CANCEL: 'Keep editing',

  VERSION_LABEL: (version: number) => `v${version}`,
  LAST_UPDATED_PREFIX: 'Updated',
  UPDATED_JUST_NOW: 'just now',
} as const;
