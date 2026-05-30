import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { LearningType } from '@shared/schemas/learning';
import { learningsQueryKey } from '@/features/projects/knowledge/useLearnings';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const UPDATE_LEARNING_ERROR = 'UPDATE_LEARNING_FAILED';

export type UpdateLearningVars = {
  title?: string;
  content?: string;
  type?: LearningType;
};

/**
 * Direct supabase.rpc to the update_learning procedure. The procedure verifies ownership and
 * whitelists the type enum. Invalidates the project's learnings cache so the list re-renders with
 * the edited row.
 */
export function useUpdateLearning(projectId: string, learningId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateLearningVars>({
    mutationFn: async ({ title, content, type }) => {
      const { error } = await supabase.rpc('update_learning', {
        p_learning_id: learningId,
        p_title: title ?? null,
        p_content: content ?? null,
        p_type: type ?? null,
      });

      if (error) {
        logger.error('learning_update_failed', { code: error.code });
        throw new Error(UPDATE_LEARNING_ERROR);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningsQueryKey(projectId) });
    },
  });
}
