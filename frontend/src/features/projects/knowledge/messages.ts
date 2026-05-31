import type { LearningType } from '@shared/schemas/learning';

export const KNOWLEDGE_MESSAGES = {
  PAGE_EYEBROW: 'KNOWLEDGE · INSTITUTIONAL MEMORY',
  PAGE_TITLE: 'Knowledge',
  PAGE_SUBTITLE: 'Lessons, decisions, gotchas, and open questions from your build.',

  PENDING_TITLE: 'Loading knowledge…',

  ERROR_TITLE: 'We could not load knowledge',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  EMPTY_TITLE: 'No knowledge captured yet',
  EMPTY_BODY: "Paste a transcript or notes and we'll extract structured learnings.",
  ADD_NOTES_BUTTON: 'Add notes',

  ADD_NOTES_DIALOG_TITLE: 'Add notes',
  ADD_NOTES_DIALOG_BODY:
    "Paste a transcript, meeting notes, or any project content. We'll extract lessons, decisions, gotchas, and open questions.",
  FIELD_SOURCE_LABEL: 'Source label (optional)',
  FIELD_SOURCE_PLACEHOLDER: 'e.g., "Standup notes — Apr 12"',
  FIELD_CONTENT_LABEL: 'Content',
  FIELD_CONTENT_PLACEHOLDER: 'Paste here…',

  FIELD_SOURCE_TOO_LONG: 'Source label must be at most 200 characters.',
  FIELD_CONTENT_TOO_SHORT: 'Content must be at least 20 characters.',
  FIELD_CONTENT_TOO_LONG: 'Content must be at most 50000 characters.',

  EXTRACT_BUTTON: 'Extract learnings',
  EXTRACT_BUTTON_BUSY: 'Extracting…',
  EXTRACT_PENDING_TITLE: 'Extracting learnings…',
  EXTRACT_PENDING_BODY: 'This usually takes 30–60 seconds.',
  CANCEL_BUTTON: 'Cancel',
  EXTRACT_FAILED: 'We could not extract learnings. Try again.',

  EXTRACTION_EMPTY:
    'No learnings found in this content. Try pasting something with more engineering detail.',
  EXTRACTION_SUCCESS: (n: number) => `Extracted ${n} learning${n === 1 ? '' : 's'}.`,

  TYPE_SECTION_LABELS: {
    lesson: 'Lessons',
    decision: 'Decisions',
    gotcha: 'Gotchas',
    open_question: 'Open questions',
  } as const satisfies Record<LearningType, string>,

  TYPE_BADGE_LABELS: {
    lesson: 'Lesson',
    decision: 'Decision',
    gotcha: 'Gotcha',
    open_question: 'Open',
  } as const satisfies Record<LearningType, string>,

  EDIT_BUTTON: 'Edit',
  DELETE_BUTTON: 'Delete',
  DELETE_CONFIRM_TITLE: 'Delete this learning?',
  DELETE_CONFIRM_BODY: 'This cannot be undone.',
  DELETE_CONFIRM_CONFIRM: 'Delete',
  DELETE_CONFIRM_CANCEL: 'Cancel',
  DELETE_FAILED: 'We could not delete this learning. Try again.',

  EDIT_DIALOG_TITLE: 'Edit learning',
  EDIT_DIALOG_BODY: 'Refine the title or content. Type stays the same.',
  EDIT_SAVE_BUTTON: 'Save',
  EDIT_SAVE_BUTTON_BUSY: 'Saving…',
  EDIT_FAILED: 'We could not save this learning. Try again.',
  FIELD_TITLE_LABEL: 'Title',
  FIELD_TITLE_TOO_SHORT: 'Title must be at least 3 characters.',
  FIELD_TITLE_TOO_LONG: 'Title must be at most 200 characters.',
  FIELD_LEARNING_CONTENT_LABEL: 'Content',
  FIELD_LEARNING_CONTENT_TOO_SHORT: 'Content must be at least 10 characters.',
  FIELD_LEARNING_CONTENT_TOO_LONG: 'Content must be at most 2000 characters.',

  SOURCE_LABEL_PREFIX: 'From',
  SOURCE_RAW_TOGGLE: 'View original',
  SOURCE_RAW_HIDE: 'Hide original',

  // Overview integration
  OVERVIEW_PANEL_TITLE: 'Recent learnings',
  OVERVIEW_EMPTY_TITLE: 'No learnings yet',
  OVERVIEW_EMPTY_BODY:
    "Paste notes or a transcript and we'll extract reusable engineering knowledge.",
  OVERVIEW_OPEN_ALL_LINK: 'View all',
} as const;
