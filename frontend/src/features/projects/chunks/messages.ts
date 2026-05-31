export const CHUNKS_MESSAGES = {
  PAGE_EYEBROW: 'CHUNKS · SHIPPABLE UNITS OF WORK',
  PAGE_TITLE: 'Chunks',
  PAGE_SUBTITLE:
    'The project, sliced. Drag a card to change its column. Click a card for the spec + agent prompt.',

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
  RESLICE_BUTTON: 'Re-slice',
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

  // Stats meta row: "5 done · 2 in progress · 4 backlog · 1 blocked · 42% shipped"
  STATS_DONE: (n: number) => `${n} done`,
  STATS_IN_PROGRESS: (n: number) => `${n} in progress`,
  STATS_BACKLOG: (n: number) => `${n} backlog`,
  STATS_BLOCKED: (n: number) => `${n} blocked`,
  STATS_SHIPPED_PERCENT: (n: number) => `${n}% shipped`,

  // View toggle (Board / List)
  VIEW_BOARD: 'Board',
  VIEW_LIST: 'List',
  VIEW_TOGGLE_LABEL: 'View',

  STATUS_ADVANCED_TITLE: 'Ready to build',
  STATUS_ADVANCED_BODY: 'This project moved from planning to "Ready to build".',

  // Per-card extras (overflow menu, agent label, blocked chip).
  CARD_NUMBER_PREFIX: '#',
  CARD_FILES_LABEL: (n: number) => `${n} file${n === 1 ? '' : 's'}`,
  CARD_AGENT_FALLBACK: 'No agent',
  CARD_AGENT_LABELS: {
    claude_code: 'Claude Code',
    cursor: 'Cursor',
    codex: 'Codex',
    windsurf: 'Windsurf',
    other: 'Custom',
  } as const,
  CARD_BLOCKED_HINT: 'Blocked — see chunk for details.',
  CARD_OVERFLOW_LABEL: 'Card actions',

  INCLUDED_FEATURES_LABEL: 'Includes features',
  DEPENDENCIES_LABEL: 'Depends on',
  /** Shown when an id/ref cannot be resolved to a PRD feature name or sibling chunk. */
  UNKNOWN_REFERENCE: (raw: string) => `${raw} (unknown)`,

  // Board column copy. Headers reuse STATUS_LABELS; these add the muted subtitle and the empty-state
  // line shown per column. Keyed by the six canonical statuses (one column each).
  COLUMN_DESCRIPTIONS: {
    backlog: 'Not started',
    ready: 'Ready to start',
    in_progress: 'Being worked on',
    needs_review: 'Awaiting review',
    completed: 'Shipped',
    blocked: 'Stuck or waiting',
  } as const,

  EMPTY_COLUMN: {
    backlog: 'Nothing in the backlog.',
    ready: 'Nothing ready yet.',
    in_progress: 'Pick a chunk to start.',
    needs_review: 'Nothing awaiting review.',
    completed: 'Nothing shipped yet.',
    blocked: 'Nothing blocked.',
  } as const,

  // Mid-drag drop affordance shown inside any column the dragged card is currently over.
  COLUMN_DROP_HINT: 'Drop to move here',

  CARD_OPEN_BUTTON: 'Open',
  CARD_STATUS_LABEL: 'Status',
  CARD_DRAG_HANDLE_LABEL: 'Drag to reorder',

  MOVE_FAILED: 'Could not move chunk. Reverting.',

  // Inline alert shown when a chunk move advances the project's status (Chunk 22).
  ADVANCE_BUILDING_TITLE: 'Building started',
  ADVANCE_BUILDING_BODY: 'This project moved from "Ready to build" to "Building".',
  ADVANCE_COMPLETED_TITLE: 'Project complete',
  ADVANCE_COMPLETED_BODY: 'All chunks are done — this project moved to "Completed".',
  ADVANCE_DISMISS_LABEL: 'Dismiss',
} as const;
