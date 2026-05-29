import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ContextFileType } from '@shared/schemas/context-files';
import { contextFilesQueryKey } from '@/features/projects/context-files/useAllContextFiles';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const CONTEXT_FILE_SAVE_ERROR = 'CONTEXT_FILE_SAVE_FAILED';

export type SaveContextFileVars = { type: ContextFileType; content: string };

/**
 * Saves a manually edited context doc directly from the SPA. The stored procedure runs as security
 * invoker, so RLS plus its explicit ownership check enforce that only the owner can write. It bumps
 * the version and resets `is_final`, so an edited doc returns to the unapproved state.
 */
export function useSaveContextFile(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, SaveContextFileVars>({
    mutationFn: async ({ type, content }) => {
      const { error } = await supabase.rpc('update_context_file_content', {
        p_project_id: projectId,
        p_type: type,
        p_content: content,
      });

      if (error) {
        logger.error('context_file_save_failed', { code: error.code });
        throw new Error(CONTEXT_FILE_SAVE_ERROR);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contextFilesQueryKey(projectId) });
    },
  });
}
