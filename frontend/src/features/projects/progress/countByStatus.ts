import type { ChunkStatus } from '@shared/schemas/chunks';

import type { ChunkRow } from '@/features/projects/chunks/useChunks';

export type ChunkStatusCounts = Record<ChunkStatus, number>;

/** Pure helper: tally chunks by status. Used by the overview card and the markdown renderer. */
export function countChunksByStatus(chunks: ChunkRow[]): ChunkStatusCounts {
  const counts: ChunkStatusCounts = {
    backlog: 0,
    ready: 0,
    in_progress: 0,
    needs_review: 0,
    completed: 0,
    blocked: 0,
  };
  for (const chunk of chunks) {
    counts[chunk.status] += 1;
  }
  return counts;
}
