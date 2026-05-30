export const EXPORT_MESSAGES = {
  CARD_TITLE: 'Export project',
  CARD_BODY:
    'Download every artifact in this project as a ZIP, ready to drop into your codebase.',
  CARD_BUTTON: 'Export as ZIP',
  CARD_BUTTON_BUSY: 'Preparing export…',

  CONFIRM_TITLE: 'Export this project?',
  CONFIRM_BODY:
    'A ZIP containing every document, chunk spec, prompt, issue, and learning will download. This may take a few seconds.',
  CONFIRM_CONFIRM: 'Yes, export',
  CONFIRM_CANCEL: 'Cancel',

  ERROR_GENERIC: 'We could not prepare the export. Try again.',
  ERROR_TOO_LARGE: 'This export exceeds the 50 MB limit. Reduce content size and try again.',
} as const;
