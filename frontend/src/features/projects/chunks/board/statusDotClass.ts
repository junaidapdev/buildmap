import type { ChunkStatus } from '@shared/schemas/chunks';

/**
 * Map each canonical chunk status to a Tailwind background-color class that matches the design
 * system's status palette (Phase A tokens). Used on the chunk-board column headers and on the
 * chunk card eyebrows so a glance at the board reads each column's purpose immediately.
 */
export const STATUS_DOT_CLASS: Record<ChunkStatus, string> = {
  backlog: 'bg-status-backlog-fg',
  ready: 'bg-status-review-fg',
  in_progress: 'bg-status-progress-fg',
  needs_review: 'bg-status-review-fg',
  completed: 'bg-status-done-fg',
  blocked: 'bg-status-blocked-fg',
};
