import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { PrdRowSchema, prdQueryKey } from '@/features/projects/prd/useExistingPrd';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

export function useGeneratePrd(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      // projectId comes from the hook scope so it always matches the cache key invalidated below.
      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.GENERATE_PRD,
        { projectId },
        session.access_token,
      );

      // Defense in depth: re-validate the Edge Function response against the shared schema even
      // though the function already validated it. The rendered copy is re-read by useExistingPrd.
      const parsed = PrdRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('prd_response_invalid_shape', { issueCount: parsed.error.issues.length });
        throw new Error('PRD_RESPONSE_INVALID');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prdQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
