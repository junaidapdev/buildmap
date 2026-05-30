import { SHARED_EDIT_MESSAGES } from '@/features/projects/_shared/edit/messages';

export const FEATURE_SPEC_EDIT_MESSAGES = {
  ...SHARED_EDIT_MESSAGES,
  EDIT_BUTTON: 'Edit',
  CANCEL_BUTTON: 'Cancel',
  SAVE_BUTTON: 'Save',
  SAVE_BUTTON_BUSY: 'Saving…',
  EDITOR_HINT: 'Edit the raw markdown for this section. Saving creates a new version and resets approval.',

  REGENERATE_SECTION_BUTTON: 'Regenerate',
  REGENERATE_SECTION_BUSY: 'Regenerating…',
  REGENERATE_CONFIRM_TITLE: 'Regenerate this section?',
  REGENERATE_CONFIRM_BODY:
    'The current content of this section will be replaced. Other sections are unchanged, and the spec’s approved state will be reset.',
  REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_CONFIRM_CANCEL: 'Cancel',
  REGENERATE_INSTRUCTION_LABEL: 'Optional guidance for this regeneration',
  REGENERATE_INSTRUCTION_PLACEHOLDER: 'e.g. add explicit RLS checks, or tighten the acceptance criteria.',

  SAVE_FAILED: 'We could not save your changes. Try again.',
  REGENERATE_FAILED: 'We could not regenerate this section. Try again.',
  VALIDATION_TOO_SHORT: (min: number) => `must be at least ${min} characters.`,
  VALIDATION_TOO_LONG: (max: number) => `must be at most ${max} characters.`,
  VALIDATION_INVALID: 'has an invalid value.',
} as const;
