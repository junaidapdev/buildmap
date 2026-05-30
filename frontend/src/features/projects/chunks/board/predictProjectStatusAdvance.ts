import type { ChunkStatus } from '@shared/schemas/chunks';
import type { MoveChunkInput } from '@/features/projects/chunks/board/useMoveChunk';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import type { Project } from '@/types/project';

/** Forward-only project status advancements driven by chunk transitions; null = no advance. */
export type ProjectStatusAdvance = 'building' | 'completed' | null;

/**
 * Mirrors the rules inside the move_chunk stored procedure (Chunk 22). Pure — no React, no async.
 * The SPA uses this to predict whether a move will advance projects.status, so the move hook can
 * surface an inline notification without waiting for a refetch round-trip. The server is still the
 * source of truth (the procedure runs the same rules transactionally), but matching the
 * computation locally lets the UI react immediately.
 *
 * Rules (forward-only, must match the SQL):
 *  - ready_to_build -> building when the resulting state has any chunk in `in_progress`.
 *  - building       -> completed when every chunk in the resulting state is `completed`
 *                      (and there is at least one chunk).
 */
export function predictProjectStatusAdvance(
  previousProjectStatus: Project['status'],
  previousChunks: ChunkRow[],
  input: MoveChunkInput,
): ProjectStatusAdvance {
  const nextStatusFor = (chunk: ChunkRow): ChunkStatus =>
    chunk.id === input.chunkId ? input.newStatus : chunk.status;

  let inProgressCount = 0;
  let completedCount = 0;
  for (const chunk of previousChunks) {
    const status = nextStatusFor(chunk);
    if (status === 'in_progress') {
      inProgressCount += 1;
    } else if (status === 'completed') {
      completedCount += 1;
    }
  }

  const total = previousChunks.length;

  if (previousProjectStatus === 'ready_to_build' && inProgressCount > 0) {
    return 'building';
  }
  if (previousProjectStatus === 'building' && total > 0 && completedCount === total) {
    return 'completed';
  }
  return null;
}
