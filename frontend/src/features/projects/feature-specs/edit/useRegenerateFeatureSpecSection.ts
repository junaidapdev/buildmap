import { useMutation } from '@tanstack/react-query';

import {
  type FeatureSpecSectionKey,
  type RegenerateFeatureSpecSectionOutput,
  RegenerateFeatureSpecSectionOutputSchema,
} from '@shared/schemas/feature-spec';
import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

const FEATURE_SPEC_SECTION_REGEN_INVALID = 'FEATURE_SPEC_SECTION_REGEN_INVALID';

export type RegenerateFeatureSpecSectionVars = {
  sectionKey: FeatureSpecSectionKey;
  userInstruction?: string;
};

/**
 * Asks the Edge Function to regenerate a single spec section. Returns the new section markdown only;
 * the caller stitches it into content_json and persists via useSaveFeatureSpecSection. Mirrors the
 * per-section regenerate pattern from Chunks 14/16.
 */
export function useRegenerateFeatureSpecSection(chunkId: string) {
  const { session } = useAuth();

  return useMutation<RegenerateFeatureSpecSectionOutput, Error, RegenerateFeatureSpecSectionVars>({
    mutationFn: async ({ sectionKey, userInstruction }) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.REGENERATE_FEATURE_SPEC_SECTION,
        { chunkId, sectionKey, userInstruction },
        session.access_token,
      );
      const parsed = RegenerateFeatureSpecSectionOutputSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('feature_spec_section_regen_invalid_local', {
          issueCount: parsed.error.issues.length,
        });
        throw new Error(FEATURE_SPEC_SECTION_REGEN_INVALID);
      }

      return parsed.data;
    },
  });
}
