import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type FeatureSpecContent, FeatureSpecContentSchema } from '@shared/schemas/feature-spec';
import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { featureSpecQueryKey } from '@/features/projects/feature-specs/useExistingFeatureSpec';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

const FEATURE_SPEC_SAVE_INVALID = 'FEATURE_SPEC_SAVE_INVALID';

/**
 * Persists the full edited content_json. Conceptually a "save section" — the caller stitches the
 * edited section into the existing content and passes the whole object. The Edge Function renders
 * markdown server-side and bumps the version, resetting approval.
 */
export function useSaveFeatureSpecSection(chunkId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, FeatureSpecContent>({
    mutationFn: async (nextContent) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      // Re-validate before sending (defense in depth; the Edge Function validates again).
      const parsed = FeatureSpecContentSchema.safeParse(nextContent);

      if (!parsed.success) {
        logger.error('feature_spec_save_invalid_local', { issueCount: parsed.error.issues.length });
        throw new Error(FEATURE_SPEC_SAVE_INVALID);
      }

      return await callEdgeFunction(
        EDGE_FUNCTIONS.SAVE_FEATURE_SPEC_CONTENT,
        { chunkId, contentJson: parsed.data },
        session.access_token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureSpecQueryKey(chunkId) });
    },
  });
}
