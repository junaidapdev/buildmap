import type { ChunkStatus } from '@shared/schemas/chunks';

/**
 * Left-to-right board column order — one column per canonical status (see decisions.md, Chunk 19).
 * `satisfies` guards against a typo'd status while keeping the narrow tuple type for mapping.
 */
export const CHUNK_STATUS_ORDER = [
  'backlog',
  'ready',
  'in_progress',
  'needs_review',
  'completed',
  'blocked',
] as const satisfies readonly ChunkStatus[];

const COLUMN_DROPPABLE_PREFIX = 'column:';

/** dnd-kit droppable id for a column. Distinct from card ids, which are chunk UUIDs. */
export function columnDroppableId(status: ChunkStatus): string {
  return `${COLUMN_DROPPABLE_PREFIX}${status}`;
}

/** Returns the status when `id` is a column droppable id, else null (meaning it is a card id). */
export function parseColumnDroppableId(id: string): ChunkStatus | null {
  if (!id.startsWith(COLUMN_DROPPABLE_PREFIX)) {
    return null;
  }
  return id.slice(COLUMN_DROPPABLE_PREFIX.length) as ChunkStatus;
}
