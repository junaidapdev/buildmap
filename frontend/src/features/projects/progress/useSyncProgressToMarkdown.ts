import { useMutation, useQueryClient } from '@tanstack/react-query';

import { renderProgressTrackerMarkdown } from '@shared/markdown/progress-tracker-markdown';
import { contextFilesQueryKey } from '@/features/projects/context-files/useAllContextFiles';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/project';

const PROGRESS_SYNC_ERROR = 'PROGRESS_SYNC_FAILED';
const PROGRESS_TRACKER_TYPE = 'progress_tracker' as const;

export type SyncProgressVars = {
  project: Pick<Project, 'name' | 'status'>;
  chunks: ChunkRow[];
  /** Caller-supplied so the renderer stays pure; the hook stamps it at call time. */
  generatedAt: string;
};

/**
 * Rewrites the project's progress_tracker context-file row from live feature_chunks state. The
 * markdown is rendered deterministically by renderProgressTrackerMarkdown (shared, pure), then
 * persisted through the existing update_context_file_content stored procedure (Chunk 17) — no new
 * Edge Function. RLS plus the procedure's ownership check govern the write.
 *
 * One-way sync: the user can still edit the markdown manually via the context-files page, but
 * clicking Sync overwrites those edits with the structured-derived markdown. The confirm dialog in
 * SyncToMarkdownButton warns about this before the mutation fires.
 */
export function useSyncProgressToMarkdown(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, SyncProgressVars>({
    mutationFn: async ({ project, chunks, generatedAt }) => {
      const markdown = renderProgressTrackerMarkdown({
        projectName: project.name,
        projectStatus: project.status,
        chunks: chunks.map((chunk) => ({
          ref: chunk.ref,
          title: chunk.title,
          description: chunk.description,
          status: chunk.status,
          estimated_effort: chunk.estimated_effort,
          position: chunk.position,
        })),
        generatedAt,
      });

      const { error } = await supabase.rpc('update_context_file_content', {
        p_project_id: projectId,
        p_type: PROGRESS_TRACKER_TYPE,
        p_content: markdown,
      });

      if (error) {
        logger.error('progress_sync_failed', { code: error.code });
        throw new Error(PROGRESS_SYNC_ERROR);
      }
    },
    onSuccess: () => {
      // The context-files query renders the updated doc; invalidate so the next visit shows it.
      queryClient.invalidateQueries({ queryKey: contextFilesQueryKey(projectId) });
    },
  });
}
