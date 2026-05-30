import { useMutation, useQueryClient } from '@tanstack/react-query';

import { learningsQueryKey } from '@/features/projects/knowledge/useLearnings';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const DELETE_LEARNING_ERROR = 'DELETE_LEARNING_FAILED';

/**
 * Direct supabase.rpc to the delete_learning procedure. The procedure verifies ownership before
 * removing the row. Invalidates the project's learnings cache so the list collapses immediately.
 */
export function useDeleteLearning(projectId: string, learningId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const { error } = await supabase.rpc('delete_learning', { p_learning_id: learningId });

      if (error) {
        logger.error('learning_delete_failed', { code: error.code });
        throw new Error(DELETE_LEARNING_ERROR);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningsQueryKey(projectId) });
    },
  });
}
