export const OVERVIEW_MESSAGES = {
  PAGE_TITLE: 'Overview',
  PAGE_SUBTITLE: 'Where you are, what is next, and what to look at.',

  // Project summary panel
  SUMMARY_NO_DESCRIPTION: 'No description yet.',
  SUMMARY_LAST_UPDATED_PREFIX: 'Updated',
  SUMMARY_CREATED_PREFIX: 'Created',
  SUMMARY_JUST_NOW: 'just now',

  // Next action panel
  NEXT_ACTION_TITLE: 'Recommended next action',
  NEXT_ACTION_BRIEF_GENERATE: 'Generate your project brief',
  NEXT_ACTION_BRIEF_APPROVE: 'Review and approve your brief',
  NEXT_ACTION_PRD: 'Generate the PRD',
  NEXT_ACTION_PRD_APPROVE: 'Review and approve the PRD',
  NEXT_ACTION_ARCHITECTURE: 'Generate the architecture',
  NEXT_ACTION_ARCHITECTURE_APPROVE: 'Review and approve the architecture',
  NEXT_ACTION_CONTEXT_FILES: 'Generate context files for your AI tools',
  NEXT_ACTION_CONTEXT_FILES_APPROVE: 'Review and approve your context files',
  NEXT_ACTION_CHUNKS: 'Break the work into shippable chunks',
  NEXT_ACTION_FIRST_CHUNK: 'Start your first chunk',
  NEXT_ACTION_CONTINUE: 'Continue building — pick up your next chunk',
  NEXT_ACTION_DONE: 'You are caught up. Nothing required right now.',
  NEXT_ACTION_CTA_LABEL: 'Open',

  // Chunks panel
  CHUNKS_TITLE: 'Chunks',
  CHUNKS_EMPTY_TITLE: 'No chunks yet',
  CHUNKS_EMPTY_BODY: 'Once you break the work into chunks, progress lives here.',
  CHUNKS_TOTAL_LABEL: 'Total',
  CHUNKS_DONE_LABEL: 'Completed',
  CHUNKS_IN_PROGRESS_LABEL: 'In progress',
  CHUNKS_OPEN_LABEL: 'Open',

  // Brief panel
  BRIEF_TITLE: 'Project brief',
  BRIEF_EMPTY_TITLE: 'No brief yet',
  BRIEF_EMPTY_BODY: 'Generate one to capture the problem, users, and scope.',
  BRIEF_EMPTY_CTA: 'Generate brief',
  BRIEF_DRAFT_BANNER: 'Draft — not yet approved.',
  BRIEF_APPROVED_BANNER: 'Approved.',
  BRIEF_OPEN_LINK: 'Open brief',
  BRIEF_LAST_UPDATED_PREFIX: 'Updated',
  BRIEF_ERROR_BODY: 'We could not load the brief. Try again.',
  BRIEF_ERROR_RETRY: 'Try again',

  // Issues panel
  ISSUES_TITLE: 'Open issues',
  ISSUES_EMPTY_TITLE: 'No open issues',
  ISSUES_EMPTY_BODY: 'When you hit something unexpected during a build, it shows up here.',
  ISSUES_OPEN_ALL_LINK: 'View all',

  // Decisions panel
  DECISIONS_TITLE: 'Recent decisions',
  DECISIONS_EMPTY_TITLE: 'No decisions logged',
  DECISIONS_EMPTY_BODY: 'Architectural and product decisions you make appear here as you work.',
  DECISIONS_OPEN_ALL_LINK: 'View architecture',

  // Export panel
  EXPORT_TITLE: 'Export',
  EXPORT_BODY: 'Download all your project artifacts as a markdown pack.',
  EXPORT_CTA: 'Open export',
  EXPORT_PENDING_TOOLTIP: 'Available once export is ready',
} as const;
