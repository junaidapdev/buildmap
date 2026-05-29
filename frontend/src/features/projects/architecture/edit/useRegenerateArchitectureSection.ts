import { useMutation } from '@tanstack/react-query';

import {
  type ArchitectureSectionKey,
  type RegenerateArchitectureSectionOutput,
  RegenerateArchitectureSectionOutputSchema,
} from '@shared/schemas/architecture';
import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

const ARCHITECTURE_SECTION_REGEN_INVALID = 'ARCHITECTURE_SECTION_REGEN_INVALID';

/**
 * Regenerates a whole section (`full_section` mode). Returns the new section value only; the caller
 * stitches it into content_json and persists via useSaveArchitectureSection. This separation keeps
 * the regenerate cost small and lets the caller decide whether/when to apply the result.
 */
export function useRegenerateArchitectureSection(projectId: string) {
  const { session } = useAuth();

  return useMutation<RegenerateArchitectureSectionOutput, Error, ArchitectureSectionKey>({
    mutationFn: async (sectionKey) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.REGENERATE_ARCHITECTURE_SECTION,
        { mode: 'full_section', projectId, sectionKey },
        session.access_token,
      );
      const parsed = RegenerateArchitectureSectionOutputSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('architecture_section_regen_invalid_local', {
          issueCount: parsed.error.issues.length,
        });
        throw new Error(ARCHITECTURE_SECTION_REGEN_INVALID);
      }

      return parsed.data;
    },
  });
}
