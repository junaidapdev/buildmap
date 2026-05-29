import { useMutation } from '@tanstack/react-query';

import {
  type RegenerateArchitectureSectionOutput,
  RegenerateArchitectureSectionOutputSchema,
} from '@shared/schemas/architecture';
import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

const ARCHITECTURE_DECISION_REGEN_INVALID = 'ARCHITECTURE_DECISION_REGEN_INVALID';

/**
 * Regenerates a single decision by id (`single_decision` mode). The Edge Function looks the decision
 * up in the *saved* architecture and preserves its id, so the caller can swap the returned value
 * into the draft decisions array in place. Only persisted decisions can be regenerated.
 */
export function useRegenerateSingleDecision(projectId: string) {
  const { session } = useAuth();

  return useMutation<RegenerateArchitectureSectionOutput, Error, string>({
    mutationFn: async (decisionId) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.REGENERATE_ARCHITECTURE_SECTION,
        { mode: 'single_decision', projectId, decisionId },
        session.access_token,
      );
      const parsed = RegenerateArchitectureSectionOutputSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('architecture_decision_regen_invalid_local', {
          issueCount: parsed.error.issues.length,
        });
        throw new Error(ARCHITECTURE_DECISION_REGEN_INVALID);
      }

      return parsed.data;
    },
  });
}
