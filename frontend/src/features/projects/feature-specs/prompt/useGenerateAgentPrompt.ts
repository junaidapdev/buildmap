import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TargetAgent } from '@shared/schemas/agent-prompt';
import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import {
  AgentPromptRowSchema,
  agentPromptsForChunkQueryKey,
} from '@/features/projects/feature-specs/prompt/useAgentPromptsForChunk';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

const AGENT_PROMPT_RESPONSE_INVALID = 'AGENT_PROMPT_RESPONSE_INVALID';

export type GenerateAgentPromptVars = { targetAgent: TargetAgent };

/**
 * Generates (or regenerates) a wrapped prompt for the given target agent via the Edge Function. The
 * function upserts the row server-side; this hook re-validates the returned row and then invalidates
 * the per-chunk query so the view re-reads the persisted copy.
 */
export function useGenerateAgentPrompt(chunkId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, GenerateAgentPromptVars>({
    mutationFn: async ({ targetAgent }) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.GENERATE_AGENT_PROMPT,
        { chunkId, targetAgent },
        session.access_token,
      );

      // Defense in depth: re-validate the Edge Function response against the shared row schema.
      const parsed = AgentPromptRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('agent_prompt_response_invalid_shape', {
          issueCount: parsed.error.issues.length,
        });
        throw new Error(AGENT_PROMPT_RESPONSE_INVALID);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentPromptsForChunkQueryKey(chunkId) });
    },
  });
}
