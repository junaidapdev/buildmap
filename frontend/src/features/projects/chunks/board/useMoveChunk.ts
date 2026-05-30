import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import type { ChunkStatus } from '@shared/schemas/chunks';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import {
  predictProjectStatusAdvance,
  type ProjectStatusAdvance,
} from '@/features/projects/chunks/board/predictProjectStatusAdvance';
import { chunksQueryKey, type ChunkRow } from '@/features/projects/chunks/useChunks';
import { projectQueryKey } from '@/features/projects/layout/useProjectQuery';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/project';

const CHUNK_MOVE_ERROR = 'CHUNK_MOVE_FAILED';
const ADVANCEMENT_AUTO_DISMISS_MS = 6000;

export type MoveChunkInput = {
  chunkId: string;
  newStatus: ChunkStatus;
  newPosition: number;
};

type MoveContext = {
  previous: ChunkRow[] | undefined;
  /** Captured at onMutate so the success path can surface advancement without a refetch. */
  predictedAdvancement: ProjectStatusAdvance;
};

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
 *
 * Chunk 22 addition: the server-side move_chunk procedure can now advance projects.status forward
 * (ready_to_build -> building when any chunk reaches in_progress; building -> completed when every
 * chunk is completed). The hook predicts the same advancement locally in onMutate so the UI can
 * surface an inline notification without waiting for a refetch. The notification auto-dismisses
 * after a few seconds and resets on the next move; callers can dismiss it manually too.
 */
export function useMoveChunk(projectId: string) {
  const queryClient = useQueryClient();
  const [lastAdvancement, setLastAdvancement] = useState<ProjectStatusAdvance>(null);

  // Auto-dismiss the advancement banner so it doesn't linger forever.
  useEffect(() => {
    if (lastAdvancement === null) {
      return;
    }
    const timer = window.setTimeout(() => {
      setLastAdvancement(null);
    }, ADVANCEMENT_AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [lastAdvancement]);

  const mutation = useMutation<void, Error, MoveChunkInput, MoveContext>({
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
      const previousProject = queryClient.getQueryData<Project | null>(projectQueryKey(projectId));

      // Predict advancement BEFORE the optimistic write so the rule sees the pre-move state, which
      // matches what the server's procedure does (it captures projects.status before updating).
      const predictedAdvancement =
        previous && previousProject
          ? predictProjectStatusAdvance(previousProject.status, previous, input)
          : null;

      if (previous) {
        const next = applyMoveLocally(previous, input);
        queryClient.setQueryData<ChunkRow[]>(chunksQueryKey(projectId), next);
      }

      // Clear any stale advancement notice from a prior move before this one settles.
      setLastAdvancement(null);

      return { previous, predictedAdvancement };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData<ChunkRow[]>(chunksQueryKey(projectId), context.previous);
      }
    },
    onSuccess: (_data, _input, context) => {
      if (context.predictedAdvancement !== null) {
        setLastAdvancement(context.predictedAdvancement);
      }
    },
    onSettled: () => {
      // Refetch chunks and project so the status badge / progress page see the advancement.
      queryClient.invalidateQueries({ queryKey: chunksQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });

  const dismissAdvancement = useCallback(() => {
    setLastAdvancement(null);
  }, []);

  return Object.assign(mutation, { lastAdvancement, dismissAdvancement });
}
