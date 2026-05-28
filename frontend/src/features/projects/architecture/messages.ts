export const ARCHITECTURE_MESSAGES = {
  PAGE_TITLE: 'Architecture',
  PAGE_SUBTITLE: 'How the system fits together.',

  PENDING_TITLE: 'Designing your architecture…',
  PENDING_BODY: 'This usually takes 45–75 seconds.',

  ERROR_TITLE: 'We could not generate your architecture',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  GATING_TITLE: 'Approve your PRD first',
  GATING_BODY: 'The architecture is generated from your PRD. Approve the PRD, then come back.',
  GATING_OPEN_PRD: 'Open PRD',

  REGENERATE_BUTTON: 'Regenerate',
  REGENERATE_BUSY: 'Regenerating…',
  REGENERATE_CONFIRM_TITLE: 'Regenerate architecture?',
  REGENERATE_CONFIRM_BODY: 'This will replace the current architecture and reset the approved state.',
  REGENERATE_CONFIRM_CONFIRM: 'Yes, regenerate',
  REGENERATE_CONFIRM_CANCEL: 'Cancel',

  APPROVE_BUTTON: 'Approve architecture',
  APPROVE_BUTTON_BUSY: 'Approving…',
  APPROVED_BANNER: 'Architecture approved.',

  NEXT_CTA: 'Next: generate context files',

  SECTION_STACK_OVERVIEW: 'Stack overview',
  SECTION_SYSTEM: 'System',
  SECTION_COMPONENTS: 'Components',
  SECTION_DATA_MODEL: 'Data model',
  SECTION_EXTERNAL_SERVICES: 'External services',
  SECTION_AUTH_SECURITY: 'Auth & security',
  SECTION_HOSTING: 'Hosting & deployment',
  SECTION_DECISIONS: 'Decisions',
  SECTION_OPEN_QUESTIONS: 'Open questions',

  COMPONENT_RESPONSIBILITIES: 'Responsibilities',

  DECISION_STATUS_LABELS: {
    proposed: 'Proposed',
    accepted: 'Accepted',
    superseded: 'Superseded',
    rejected: 'Rejected',
  },

  DECISION_CONTEXT: 'Context',
  DECISION_DECISION: 'Decision',
  DECISION_CONSEQUENCES: 'Consequences',

  EMPTY_LIST: '(none yet)',
  UPDATED_JUST_NOW: 'just now',
  VERSION_LABEL: (v: number) => `v${v}`,
  LAST_UPDATED_PREFIX: 'Updated',
} as const;
