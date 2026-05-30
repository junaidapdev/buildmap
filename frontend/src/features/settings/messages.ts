export const SETTINGS_MESSAGES = {
  PAGE_TITLE: 'Settings',
  PAGE_SUBTITLE: 'Manage your account and preferences.',

  PENDING_TITLE: 'Loading settings',
  ERROR_TITLE: 'Could not load settings',
  ERROR_BODY: 'We could not load your profile. Try again.',
  ERROR_RETRY: 'Try again',

  ACCOUNT_TITLE: 'Account',
  EMAIL_LABEL: 'Email',
  EMAIL_HELP: "Your email is set at sign-up and can't be changed yet.",
  DISPLAY_NAME_LABEL: 'Display name',
  DISPLAY_NAME_PLACEHOLDER: 'How should we address you?',
  DISPLAY_NAME_HELP: 'Optional. Shown in the app where your name appears.',

  PREFERENCES_TITLE: 'Preferences',
  PREFERRED_AGENT_LABEL: 'Default AI coding tool',
  PREFERRED_AGENT_HELP:
    'New projects start with this preference selected. You can change it per-project.',
  PREFERRED_AGENT_OPTIONS: {
    claude_code: 'Claude Code',
    cursor: 'Cursor',
    generic: 'Generic',
  } as const,
  PREFERRED_AGENT_NONE: 'No default',
  PREFERRED_AGENT_PLACEHOLDER: 'Select a default',

  SAVE_BUTTON: 'Save changes',
  SAVE_BUTTON_BUSY: 'Saving…',
  SAVE_SUCCESS: 'Settings saved.',
  SAVE_FAILED: 'We could not save your changes. Try again.',

  DANGER_TITLE: 'Danger zone',

  SIGN_OUT_TITLE: 'Sign out',
  SIGN_OUT_BODY: 'Sign out of this browser. Your data is preserved.',
  SIGN_OUT_BUTTON: 'Sign out',

  DELETE_ACCOUNT_TITLE: 'Delete account',
  DELETE_ACCOUNT_BODY:
    'Permanently delete your account and every project, chunk, spec, prompt, issue, and learning. This action cannot be undone.',
  DELETE_ACCOUNT_BUTTON: 'Delete account…',

  DELETE_DIALOG_TITLE: 'Are you absolutely sure?',
  DELETE_DIALOG_BODY:
    'This permanently deletes your account and every project. There is no recovery. To confirm, type the phrase below.',
  DELETE_DIALOG_PHRASE_LABEL: 'Type "delete my account" to confirm:',
  DELETE_DIALOG_PHRASE_EXPECTED: 'delete my account',
  DELETE_DIALOG_CONFIRM: 'Permanently delete my account',
  DELETE_DIALOG_CONFIRM_BUSY: 'Deleting…',
  DELETE_DIALOG_CANCEL: 'Cancel',
  DELETE_FAILED: 'We could not delete your account. Try again or contact support.',
} as const;
