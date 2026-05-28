import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type PrdContent, PrdContentSchema } from '@shared/schemas/prd';
import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { prdQueryKey } from '@/features/projects/prd/useExistingPrd';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

const PRD_SAVE_INVALID = 'PRD_SAVE_INVALID';

/**
 * Persists the full edited content_json. Conceptually a "save section" — the caller stitches the
 * edited section into the existing content and passes the whole object. The Edge Function renders
 * markdown server-side and bumps the version, resetting approval.
 */
export function useSavePrdSection(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, PrdContent>({
    mutationFn: async (nextContent) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      // Re-validate before sending (defense in depth; the Edge Function validates again).
      const parsed = PrdContentSchema.safeParse(nextContent);

      if (!parsed.success) {
        logger.error('prd_save_invalid_local', { issueCount: parsed.error.issues.length });
        throw new Error(PRD_SAVE_INVALID);
      }

      return await callEdgeFunction(
        EDGE_FUNCTIONS.SAVE_PRD_CONTENT,
        { projectId, contentJson: parsed.data },
        session.access_token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prdQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
