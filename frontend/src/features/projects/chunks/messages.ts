export const CHUNKS_MESSAGES = {
  PAGE_TITLE: 'Chunks',
  PAGE_SUBTITLE: 'Shippable units of work, ready to hand to an AI coding agent.',

  PENDING_TITLE: 'Slicing your project into chunks…',
  PENDING_BODY: 'This usually takes 45–90 seconds.',

  ERROR_TITLE: 'We could not generate chunks',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  GATING_TITLE: 'Generate context files first',
  GATING_BODY:
    'Chunks are built on your context files. Generate the context files, then come back.',
  GATING_OPEN_CONTEXT: 'Open context files',

  REGENERATE_ALL_BUTTON: 'Regenerate all chunks',
  REGENERATE_ALL_BUSY: 'Regenerating…',
  REGENERATE_ALL_CONFIRM_TITLE: 'Regenerate all chunks?',
  REGENERATE_ALL_CONFIRM_BODY:
    'This deletes all existing chunks and their feature specs. Any progress data is preserved but disconnected. Manual edits to chunk titles, descriptions, or order will be lost.',
  REGENERATE_ALL_CONFIRM_CONFIRM: 'Yes, regenerate everything',
  REGENERATE_ALL_CONFIRM_CANCEL: 'Cancel',

  // Six canonical chunk statuses (context/05-ui-context.md). The generator only writes 'backlog';
  // the rest are surfaced once status transitions land in a later chunk.
  STATUS_LABELS: {
    backlog: 'Backlog',
    ready: 'Ready',
    in_progress: 'In progress',
    needs_review: 'Needs review',
    completed: 'Completed',
    blocked: 'Blocked',
  } as const,

  EFFORT_LABELS: {
    xs: 'XS',
    s: 'S',
    m: 'M',
    l: 'L',
    xl: 'XL',
  } as const,

  EFFORT_TOOLTIPS: {
    xs: 'Under 2 hours',
    s: 'About half a day',
    m: 'About a day',
    l: '2–3 days',
    xl: 'A week or more',
  } as const,

  COUNT_LABEL: (n: number) => `${n} chunk${n === 1 ? '' : 's'}`,
  STATUS_ADVANCED_TITLE: 'Ready to build',
  STATUS_ADVANCED_BODY: 'This project moved from planning to "Ready to build".',

  INCLUDED_FEATURES_LABEL: 'Includes features',
  DEPENDENCIES_LABEL: 'Depends on',
  /** Shown when an id/ref cannot be resolved to a PRD feature name or sibling chunk. */
  UNKNOWN_REFERENCE: (raw: string) => `${raw} (unknown)`,

  BOARD_VIEW_PLACEHOLDER: 'A drag-and-drop board view is coming in the next update.',
} as const;
