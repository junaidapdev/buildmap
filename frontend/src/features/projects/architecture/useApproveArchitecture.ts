import { useMutation, useQueryClient } from '@tanstack/react-query';

import { architectureQueryKey } from '@/features/projects/architecture/useExistingArchitecture';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const ARCHITECTURE_APPROVE_ERROR = 'ARCHITECTURE_APPROVE_FAILED';

export function useApproveArchitecture(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      // The stored procedure runs as security invoker, so RLS plus its explicit ownership check
      // enforce that only the owner can approve. It marks the architecture final without advancing
      // project status.
      const { error } = await supabase.rpc('approve_project_architecture', {
        p_project_id: projectId,
      });

      if (error) {
        logger.error('architecture_approve_failed', { code: error.code });
        throw new Error(ARCHITECTURE_APPROVE_ERROR);
      }
    },
    onSuccess: () => {
      // Architecture approval changes only the architecture row; the project query is untouched.
      queryClient.invalidateQueries({ queryKey: architectureQueryKey(projectId) });
    },
  });
}
