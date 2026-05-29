import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ChunkStatus } from '@shared/schemas/chunks';
import { chunksQueryKey, type ChunkRow } from '@/features/projects/chunks/useChunks';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const CHUNK_MOVE_ERROR = 'CHUNK_MOVE_FAILED';

export type MoveChunkInput = {
  chunkId: string;
  newStatus: ChunkStatus;
  newPosition: number;
};

type MoveContext = { previous: ChunkRow[] | undefined };

/**
 * Pure helper: rewrites the cached chunk list to reflect a move, mirroring what move_chunk does on
 * the server so the optimistic state matches the post-settle refetch. The moved chunk is placed just
 * after any chunk already at its target position (the server breaks position ties by updated_at and
 * the moved row is the newest), then every position is renumbered to a consecutive 0..N-1 sequence.
 */
export function applyMoveLocally(chunks: ChunkRow[], input: MoveChunkInput): ChunkRow[] {
  const moved = chunks.find((chunk) => chunk.id === input.chunkId);
  if (!moved) {
    return chunks;
  }

  const updatedMoved: ChunkRow = {
    ...moved,
    status: input.newStatus,
    position: input.newPosition,
  };

  // Keep the other chunks in position order, preserving their relative order for any ties.
  const others = chunks
    .filter((chunk) => chunk.id !== input.chunkId)
    .sort((a, b) => a.position - b.position);

  // Insert the moved chunk after every chunk whose position is at or before its target slot.
  const reordered: ChunkRow[] = [];
  let inserted = false;
  for (const chunk of others) {
    if (!inserted && chunk.position > updatedMoved.position) {
      reordered.push(updatedMoved);
      inserted = true;
    }
    reordered.push(chunk);
  }
  if (!inserted) {
    reordered.push(updatedMoved);
  }

  // Renumber to consecutive positions; only rewrite rows whose position actually changed.
  return reordered.map((chunk, index) =>
    chunk.position === index ? chunk : { ...chunk, position: index },
  );
}

/**
 * Optimistic mutation behind every board move (drag-and-drop and the inline status select). The UI
 * updates immediately via applyMoveLocally, the RPC runs in parallel, and on failure the snapshot is
 * restored. onSettled always refetches so the server stays the source of truth.
 */
export function useMoveChunk(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MoveChunkInput, MoveContext>({
    mutationFn: async (input) => {
      const { error } = await supabase.rpc('move_chunk', {
        p_chunk_id: input.chunkId,
        p_new_status: input.newStatus,
        p_new_position: input.newPosition,
      });

      if (error) {
        logger.error('chunk_move_failed', { code: error.code });
        throw new Error(CHUNK_MOVE_ERROR);
      }
    },
    onMutate: async (input) => {
      // Cancel in-flight reads so a late refetch cannot clobber the optimistic write.
      await queryClient.cancelQueries({ queryKey: chunksQueryKey(projectId) });
      const previous = queryClient.getQueryData<ChunkRow[]>(chunksQueryKey(projectId));
      if (previous) {
        const next = applyMoveLocally(previous, input);
        queryClient.setQueryData<ChunkRow[]>(chunksQueryKey(projectId), next);
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData<ChunkRow[]>(chunksQueryKey(projectId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chunksQueryKey(projectId) });
    },
  });
}
