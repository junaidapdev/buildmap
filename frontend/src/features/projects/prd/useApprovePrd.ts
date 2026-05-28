import { useMutation, useQueryClient } from '@tanstack/react-query';

import { prdQueryKey } from '@/features/projects/prd/useExistingPrd';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const PRD_APPROVE_ERROR = 'PRD_APPROVE_FAILED';

export function useApprovePrd(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      // The stored procedure runs as security invoker, so RLS plus its explicit ownership check
      // enforce that only the owner can approve. It marks the PRD final without advancing status.
      const { error } = await supabase.rpc('approve_project_prd', {
        p_project_id: projectId,
      });

      if (error) {
        logger.error('prd_approve_failed', { code: error.code });
        throw new Error(PRD_APPROVE_ERROR);
      }
    },
    onSuccess: () => {
      // PRD approval changes only the PRD row, so the project query does not need invalidation.
      queryClient.invalidateQueries({ queryKey: prdQueryKey(projectId) });
    },
  });
}
