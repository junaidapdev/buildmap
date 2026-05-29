import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ContextFileType } from '@shared/schemas/context-files';
import { contextFilesQueryKey } from '@/features/projects/context-files/useAllContextFiles';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const CONTEXT_FILE_APPROVE_ERROR = 'CONTEXT_FILE_APPROVE_FAILED';

export type ApproveContextFileVars = { type: ContextFileType };

/**
 * Marks a single context doc approved. The stored procedure runs as security invoker, so RLS plus
 * its explicit ownership check enforce owner-only approval. Approval does not advance project status;
 * it only flips this doc's `is_final`.
 */
export function useApproveContextFile(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ApproveContextFileVars>({
    mutationFn: async ({ type }) => {
      const { error } = await supabase.rpc('approve_context_file', {
        p_project_id: projectId,
        p_type: type,
      });

      if (error) {
        logger.error('context_file_approve_failed', { code: error.code });
        throw new Error(CONTEXT_FILE_APPROVE_ERROR);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contextFilesQueryKey(projectId) });
    },
  });
}
