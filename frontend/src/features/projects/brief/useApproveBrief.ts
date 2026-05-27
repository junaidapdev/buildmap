import { useMutation, useQueryClient } from '@tanstack/react-query';

import { briefQueryKey } from '@/features/projects/brief/useExistingBrief';
import { projectQueryKey } from '@/features/projects/layout/useProjectQuery';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const BRIEF_APPROVE_ERROR = 'BRIEF_APPROVE_FAILED';

export function useApproveBrief(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      // The stored procedure runs as security invoker, so RLS plus its explicit ownership check
      // enforce that only the project owner can approve. It atomically advances idea -> planning.
      const { error } = await supabase.rpc('approve_project_brief', {
        p_project_id: projectId,
      });

      if (error) {
        logger.error('brief_approve_failed', { code: error.code });
        throw new Error(BRIEF_APPROVE_ERROR);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: briefQueryKey(projectId) });
      // Approval advances projects.status, so refresh the layout's project and the dashboard list.
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
