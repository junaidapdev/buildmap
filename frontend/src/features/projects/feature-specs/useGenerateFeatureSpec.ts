import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import {
  FeatureSpecRowSchema,
  featureSpecQueryKey,
} from '@/features/projects/feature-specs/useExistingFeatureSpec';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

/**
 * Generates (or regenerates) a chunk's feature spec via the Edge Function. The function upserts the
 * row server-side; this hook re-validates the returned row and then invalidates the query so the
 * view re-reads the persisted copy.
 */
export function useGenerateFeatureSpec(chunkId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.GENERATE_FEATURE_SPEC,
        { chunkId },
        session.access_token,
      );

      // Defense in depth: re-validate the Edge Function response against the shared schema.
      const parsed = FeatureSpecRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('feature_spec_response_invalid_shape', {
          issueCount: parsed.error.issues.length,
        });
        throw new Error('FEATURE_SPEC_RESPONSE_INVALID');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureSpecQueryKey(chunkId) });
    },
  });
}
