import { SHARED_EDIT_MESSAGES } from '@/features/projects/_shared/edit/messages';

/**
 * Copy for the architecture in-place editor (Chunk 16). Spreads the shared list-control copy and
 * adds architecture-specific labels. Decision status labels are NOT redefined here — the canonical
 * map lives in ARCHITECTURE_MESSAGES.DECISION_STATUS_LABELS and is reused at the call site.
 */
export const ARCHITECTURE_EDIT_MESSAGES = {
  ...SHARED_EDIT_MESSAGES,
  EDIT_BUTTON: 'Edit',
  CANCEL_BUTTON: 'Cancel',
  SAVE_BUTTON: 'Save',
  SAVE_BUTTON_BUSY: 'Saving…',
  REGENERATE_SECTION_BUTTON: 'Regenerate',
  REGENERATE_SECTION_BUSY: 'Regenerating…',
  REGENERATE_CONFIRM_TITLE: 'Regenerate this section?',
  REGENERATE_CONFIRM_BODY:
    'The current content of this section will be replaced. Other sections are unchanged, and the architecture’s approved state will be reset.',
  REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_CONFIRM_CANCEL: 'Cancel',

  COMPONENT_NAME_LABEL: 'Name',
  COMPONENT_DESCRIPTION_LABEL: 'Description',
  COMPONENT_RESPONSIBILITIES_LABEL: 'Responsibilities',
  ADD_COMPONENT_BUTTON: 'Add component',

  SERVICE_NAME_LABEL: 'Name',
  SERVICE_PURPOSE_LABEL: 'Purpose',
  SERVICE_NOTES_LABEL: 'Notes (optional)',
  ADD_SERVICE_BUTTON: 'Add service',

  DECISION_TITLE_LABEL: 'Title',
  DECISION_STATUS_LABEL: 'Status',
  DECISION_CONTEXT_LABEL: 'Context',
  DECISION_DECISION_LABEL: 'Decision',
  DECISION_CONSEQUENCES_LABEL: 'Consequences',
  ADD_DECISION_BUTTON: 'Add decision',
  DECISION_REGENERATE_LABEL: 'Regenerate decision',
  DECISION_REGENERATE_CONFIRM_TITLE: 'Regenerate this decision?',
  DECISION_REGENERATE_CONFIRM_BODY:
    'This decision is rewritten from scratch based on the saved architecture; its title and the other decisions are unchanged. Save the section to keep the result.',
  DECISION_REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  DECISION_REGENERATE_CONFIRM_CANCEL: 'Cancel',
  DECISION_REGENERATE_FAILED: 'We could not regenerate this decision. Try again.',

  SAVE_FAILED: 'We could not save your changes. Try again.',
  REGENERATE_FAILED: 'We could not regenerate this section. Try again.',
} as const;
