import type { ChunkStatus } from '@shared/schemas/chunks';

import type { ProjectStatus } from '@/types/project';

export const PROGRESS_MESSAGES = {
  PAGE_TITLE: 'Progress',
  PAGE_SUBTITLE: 'Live state of the build.',

  PENDING_TITLE: 'Loading progress…',

  ERROR_TITLE: 'We could not load progress',
  ERROR_BODY: 'Something went wrong. Try again.',
  ERROR_RETRY: 'Try again',

  EMPTY_TITLE: 'No chunks yet',
  EMPTY_BODY: 'Generate chunks first, then come back to track progress.',
  EMPTY_OPEN_CHUNKS: 'Open chunks',

  OVERVIEW_TITLE: 'Overview',
  STAT_TOTAL: 'Total',
  STAT_COMPLETED: 'Completed',
  STAT_IN_PROGRESS: 'In progress',
  STAT_NEEDS_REVIEW: 'Needs review',
  STAT_READY: 'Ready',
  STAT_BACKLOG: 'Backlog',
  STAT_BLOCKED: 'Blocked',

  PROJECT_STATUS_LABEL: 'Project status',
  PROJECT_STATUS: {
    idea: 'Idea',
    planning: 'Planning',
    ready_to_build: 'Ready to build',
    building: 'Building',
    paused: 'Paused',
    completed: 'Completed',
  } as const satisfies Record<ProjectStatus, string>,

  // Section headers in the per-status list. All six canonical statuses are surfaced.
  STATUS_SECTION_LABELS: {
    in_progress: 'In progress',
    needs_review: 'Needs review',
    blocked: 'Blocked',
    ready: 'Ready',
    backlog: 'Backlog',
    completed: 'Completed',
  } as const satisfies Record<ChunkStatus, string>,

  EFFORT_LABELS: {
    xs: 'XS',
    s: 'S',
    m: 'M',
    l: 'L',
    xl: 'XL',
  } as const,

  RECENT_ACTIVITY_TITLE: 'Recent activity',
  RECENT_ACTIVITY_EMPTY: 'No activity yet.',
  RECENT_PREFIX: (statusLabel: string) => `In ${statusLabel.toLowerCase()}`,
  UPDATED_JUST_NOW: 'just now',

  SYNC_BUTTON: 'Sync to markdown',
  SYNC_BUTTON_BUSY: 'Syncing…',
  SYNC_BUTTON_DONE: 'Synced',
  SYNC_CONFIRM_TITLE: 'Sync progress to markdown?',
  SYNC_CONFIRM_BODY:
    'This rewrites the Progress Tracker context file from the current chunk state. Any manual edits to the markdown will be replaced.',
  SYNC_CONFIRM_CONFIRM: 'Yes, sync',
  SYNC_CONFIRM_CANCEL: 'Cancel',
  SYNC_SUCCESS: 'Progress synced. The Progress Tracker context file has been updated.',
  SYNC_FAILED: 'Sync failed. Try again.',
} as const;
