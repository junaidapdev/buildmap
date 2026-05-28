import { useMutation } from '@tanstack/react-query';

import {
  type PrdSectionKey,
  type RegeneratePrdSectionOutput,
  RegeneratePrdSectionOutputSchema,
} from '@shared/schemas/prd';
import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

const PRD_SECTION_REGEN_INVALID = 'PRD_SECTION_REGEN_INVALID';

/**
 * Asks the Edge Function to regenerate a single section. Returns the new section value only; the
 * caller stitches it into content_json and persists via useSavePrdSection. This separation lets the
 * caller decide whether/when to apply the result, and keeps the regenerate cost small.
 */
export function useRegeneratePrdSection(projectId: string) {
  const { session } = useAuth();

  return useMutation<RegeneratePrdSectionOutput, Error, PrdSectionKey>({
    mutationFn: async (sectionKey) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.REGENERATE_PRD_SECTION,
        { projectId, sectionKey },
        session.access_token,
      );
      const parsed = RegeneratePrdSectionOutputSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('prd_section_regen_invalid_local', { issueCount: parsed.error.issues.length });
        throw new Error(PRD_SECTION_REGEN_INVALID);
      }

      return parsed.data;
    },
  });
}
