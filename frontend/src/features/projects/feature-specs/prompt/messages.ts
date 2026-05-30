import type { TargetAgent } from '@shared/schemas/agent-prompt';

export const AGENT_PROMPT_MESSAGES = {
  PENDING_TITLE: 'Drafting your prompt…',
  PENDING_BODY: 'This usually takes 15–30 seconds.',

  ERROR_TITLE: 'We could not generate the prompt',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  EMPTY_TITLE: 'No prompt for this agent yet',
  EMPTY_BODY: 'Generate a prompt to copy into your AI coding tool.',
  EMPTY_GENERATE: 'Generate prompt',
  EMPTY_GENERATE_BUSY: 'Generating…',

  TARGET_LABEL: 'Target agent',
  TARGET_OPTIONS: {
    claude_code: 'Claude Code',
    cursor: 'Cursor',
    generic: 'Generic',
  } as const satisfies Record<TargetAgent, string>,

  COPY_BUTTON: 'Copy to clipboard',
  COPY_BUTTON_BUSY: 'Copying…',
  COPY_BUTTON_DONE: 'Copied!',
  COPY_BUTTON_ERROR: 'Copy failed',

  REGENERATE_BUTTON: 'Regenerate',
  REGENERATE_BUSY: 'Regenerating…',
  REGENERATE_CONFIRM_TITLE: 'Regenerate this prompt?',
  REGENERATE_CONFIRM_BODY: 'This replaces the current prompt for this agent target.',
  REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_CONFIRM_CANCEL: 'Cancel',

  SPEC_REQUIRED_TITLE: 'Generate the feature spec first',
  SPEC_REQUIRED_BODY:
    'The prompt is built from the feature spec. Generate the spec, then come back.',
  SPEC_REQUIRED_OPEN: 'Open spec tab',

  VERSION_LABEL: (version: number) => `v${version}`,
  LAST_UPDATED_PREFIX: 'Updated',
  UPDATED_JUST_NOW: 'just now',
} as const;
