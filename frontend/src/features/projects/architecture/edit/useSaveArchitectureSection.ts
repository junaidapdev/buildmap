import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type ArchitectureContent, ArchitectureContentSchema } from '@shared/schemas/architecture';
import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { architectureQueryKey } from '@/features/projects/architecture/useExistingArchitecture';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

const ARCHITECTURE_SAVE_INVALID = 'ARCHITECTURE_SAVE_INVALID';

/**
 * Persists the full edited content_json. Conceptually a "save section" — the caller stitches the
 * edited section into the existing content and passes the whole object. The Edge Function renders
 * markdown server-side and bumps the version, resetting approval.
 */
export function useSaveArchitectureSection(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, ArchitectureContent>({
    mutationFn: async (nextContent) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      // Re-validate before sending (defense in depth; the Edge Function validates again).
      const parsed = ArchitectureContentSchema.safeParse(nextContent);

      if (!parsed.success) {
        logger.error('architecture_save_invalid_local', { issueCount: parsed.error.issues.length });
        throw new Error(ARCHITECTURE_SAVE_INVALID);
      }

      return await callEdgeFunction(
        EDGE_FUNCTIONS.SAVE_ARCHITECTURE_CONTENT,
        { projectId, contentJson: parsed.data },
        session.access_token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: architectureQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
