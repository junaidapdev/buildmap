import { useMutation, useQueryClient } from '@tanstack/react-query';

import { featureSpecQueryKey } from '@/features/projects/feature-specs/useExistingFeatureSpec';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const FEATURE_SPEC_APPROVE_ERROR = 'FEATURE_SPEC_APPROVE_FAILED';

export function useApproveFeatureSpec(chunkId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      // The stored procedure runs as security invoker, so RLS plus its explicit ownership check
      // enforce that only the owner can approve. It marks the spec final without advancing status.
      const { error } = await supabase.rpc('approve_feature_spec', {
        p_chunk_id: chunkId,
      });

      if (error) {
        logger.error('feature_spec_approve_failed', { code: error.code });
        throw new Error(FEATURE_SPEC_APPROVE_ERROR);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureSpecQueryKey(chunkId) });
    },
  });
}
