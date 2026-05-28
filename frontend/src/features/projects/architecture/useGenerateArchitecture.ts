import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import {
  ArchitectureRowSchema,
  architectureQueryKey,
} from '@/features/projects/architecture/useExistingArchitecture';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

export function useGenerateArchitecture(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      // projectId comes from the hook scope so it always matches the cache key invalidated below.
      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.GENERATE_ARCHITECTURE,
        { projectId },
        session.access_token,
      );

      // Defense in depth: re-validate the Edge Function response against the shared schema even
      // though the function already validated it. The rendered copy is re-read by
      // useExistingArchitecture.
      const parsed = ArchitectureRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('architecture_response_invalid_shape', {
          issueCount: parsed.error.issues.length,
        });
        throw new Error('ARCHITECTURE_RESPONSE_INVALID');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: architectureQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
