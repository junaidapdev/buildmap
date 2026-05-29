// Reads the project's chunk progress for the overview recommendation engine and chunks panel. This
// replaced the Chunk 12 stub once the chunk generator landed (Chunk 18); the `{ data }` shape stays
// compatible with both consumers (the recommendation engine and ChunksProgressPanel), so neither had
// to change. Counts use the six canonical statuses: "completed" is done, "open" is everything not
// completed or in progress (backlog, ready, needs_review, blocked).
import { useChunks } from '@/features/projects/chunks/useChunks';

export type ChunksState = {
  exists: boolean;
  hasInProgress: boolean;
  hasIncomplete: boolean;
  allDone: boolean;
  total: number;
  completed: number;
  inProgress: number;
  open: number;
};

export function useChunksState(projectId: string): { data: ChunksState } {
  const query = useChunks(projectId);
  const chunks = query.data ?? [];

  const total = chunks.length;
  const completed = chunks.filter((chunk) => chunk.status === 'completed').length;
  const inProgress = chunks.filter((chunk) => chunk.status === 'in_progress').length;
  const open = total - completed - inProgress;

  return {
    data: {
      exists: total > 0,
      hasInProgress: inProgress > 0,
      hasIncomplete: total > 0 && completed < total,
      allDone: total > 0 && completed === total,
      total,
      completed,
      inProgress,
      open,
    },
  };
}
