import type { IssueSeverity, IssueStatus } from '@shared/schemas/issue';

export const ISSUE_MESSAGES = {
  PAGE_EYEBROW: 'ISSUES · BUGS TO CORRECTIVE PROMPTS',
  PAGE_TITLE: 'Issues',
  PAGE_SUBTITLE: 'Log a bug; we draft a corrective prompt your AI tool can act on.',

  PENDING_TITLE: 'Loading issues…',

  ERROR_TITLE: 'We could not load issues',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  EMPTY_TITLE: 'No issues logged',
  EMPTY_BODY: "Log a bug and we'll draft a corrective prompt for your AI tool.",
  EMPTY_NEW_ISSUE: 'New issue',

  NEW_ISSUE_BUTTON: 'New issue',
  NEW_ISSUE_DIALOG_TITLE: 'New issue',
  NEW_ISSUE_DIALOG_BODY: 'Describe the bug. The more specific you are, the better the prompt.',

  FIELD_TITLE_LABEL: 'Title',
  FIELD_TITLE_PLACEHOLDER: 'Short summary',
  FIELD_DESCRIPTION_LABEL: 'Description',
  FIELD_DESCRIPTION_PLACEHOLDER: "What's broken? What did you expect? Steps to reproduce?",
  FIELD_SEVERITY_LABEL: 'Severity',
  FIELD_RELATED_CHUNK_LABEL: 'Related chunk (optional)',
  FIELD_RELATED_CHUNK_NONE: '— None —',

  FIELD_TITLE_TOO_SHORT: 'Title must be at least 3 characters.',
  FIELD_TITLE_TOO_LONG: 'Title must be at most 200 characters.',
  FIELD_DESCRIPTION_TOO_SHORT: 'Description must be at least 20 characters.',
  FIELD_DESCRIPTION_TOO_LONG: 'Description must be at most 8000 characters.',

  SEVERITY_LABELS: {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  } as const satisfies Record<IssueSeverity, string>,

  STATUS_LABELS: {
    open: 'Open',
    resolved: 'Resolved',
  } as const satisfies Record<IssueStatus, string>,

  CREATE_BUTTON: 'Create issue',
  CREATE_BUTTON_BUSY: 'Creating…',
  CANCEL_BUTTON: 'Cancel',
  CREATE_FAILED: 'We could not create the issue. Try again.',

  RELATED_CHUNK_HEADER: 'Related chunk',
  RELATED_CHUNK_NONE: 'No chunk linked',
  ORIGINAL_REPORT_HEADER: 'Original report',
  PROMPT_HEADER: 'Corrective prompt',

  GENERATE_PROMPT_BUTTON: 'Generate prompt',
  REGENERATE_PROMPT_BUTTON: 'Regenerate prompt',
  PROMPT_BUSY: 'Generating…',
  PROMPT_PENDING_TITLE: 'Drafting prompt…',
  PROMPT_PENDING_BODY: 'This usually takes 15–30 seconds.',
  PROMPT_FAILED: 'We could not generate the prompt. Try again.',

  COPY_BUTTON: 'Copy to clipboard',
  COPY_BUTTON_BUSY: 'Copying…',
  COPY_BUTTON_DONE: 'Copied!',
  COPY_BUTTON_ERROR: 'Copy failed',
  DOWNLOAD_BUTTON: 'Download',

  REGENERATE_CONFIRM_TITLE: 'Regenerate this prompt?',
  REGENERATE_CONFIRM_BODY: 'This replaces the current prompt for this issue.',
  REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_CONFIRM_CANCEL: 'Cancel',

  PROMPT_EMPTY_TITLE: 'No prompt yet',
  PROMPT_EMPTY_BODY: 'Generate a corrective prompt for this issue.',

  MARK_RESOLVED_BUTTON: 'Mark resolved',
  MARK_OPEN_BUTTON: 'Reopen',
  RESOLVED_BANNER: 'Issue resolved.',
  RESOLVE_FAILED: 'We could not update this issue. Try again.',

  BACK_TO_ISSUES: 'Back to issues',

  VERSION_LABEL: (version: number) => `v${version}`,
  CREATED_PREFIX: 'Created',
  LAST_UPDATED_PREFIX: 'Updated',
  UPDATED_JUST_NOW: 'just now',
} as const;
