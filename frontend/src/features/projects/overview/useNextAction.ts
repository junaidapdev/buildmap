import { useExistingBrief } from '@/features/projects/brief/useExistingBrief';
import { useProject } from '@/features/projects/layout/useProject';
import {
  recommendNextAction,
  type NextAction,
} from '@/features/projects/overview/recommend-next-action';
import { useArchitectureState } from '@/features/projects/overview/stubs/useArchitectureState';
import { useChunksState } from '@/features/projects/overview/stubs/useChunksState';
import { useContextFilesState } from '@/features/projects/overview/stubs/useContextFilesState';
import { usePrdState } from '@/features/projects/overview/stubs/usePrdState';

export type NextActionResult = {
  nextAction: NextAction;
  isPending: boolean;
};

/**
 * Composes the recommendation inputs from the project plus per-artifact queries. The brief query is
 * real (Chunk 10); the rest are stubs until their owning chunks land. Only the brief contributes a
 * pending state today.
 */
export function useNextAction(projectId: string): NextActionResult {
  const { project } = useProject();
  const brief = useExistingBrief(projectId);
  const prd = usePrdState(projectId);
  const architecture = useArchitectureState(projectId);
  const contextFiles = useContextFilesState(projectId);
  const chunks = useChunksState(projectId);

  const nextAction = recommendNextAction({
    project,
    briefExists: Boolean(brief.data),
    briefApproved: Boolean(brief.data?.is_final),
    prdExists: prd.data.exists,
    prdApproved: prd.data.approved,
    architectureExists: architecture.data.exists,
    architectureApproved: architecture.data.approved,
    contextFilesExist: contextFiles.data.exists,
    contextFilesApproved: contextFiles.data.allApproved,
    chunksExist: chunks.data.exists,
    hasInProgressChunk: chunks.data.hasInProgress,
    hasIncompleteChunk: chunks.data.hasIncomplete,
    allChunksDone: chunks.data.allDone,
  });

  return {
    nextAction,
    isPending:
      brief.isPending || prd.isPending || architecture.isPending || contextFiles.isPending,
  };
}
