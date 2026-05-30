import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { TargetAgentSchema, type TargetAgent } from '@shared/schemas/agent-prompt';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const AGENT_PROMPTS_FETCH_ERROR = 'AGENT_PROMPTS_FETCH_FAILED';
const AGENT_PROMPT_COLUMNS =
  'id, chunk_id, target_agent, content, version, created_at, updated_at';

export const AgentPromptRowSchema = z.object({
  id: z.string().uuid(),
  chunk_id: z.string().uuid(),
  target_agent: TargetAgentSchema,
  content: z.string(),
  version: z.number().int().min(1),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AgentPromptRow = z.infer<typeof AgentPromptRowSchema>;

/** Returns the prompts for a chunk keyed by target_agent, so the UI can show the right one. */
export type AgentPromptsByTarget = Partial<Record<TargetAgent, AgentPromptRow>>;

export const agentPromptsForChunkQueryKey = (chunkId: string) =>
  ['agent-prompts', chunkId] as const;

export function useAgentPromptsForChunk(chunkId: string) {
  return useQuery<AgentPromptsByTarget>({
    queryKey: agentPromptsForChunkQueryKey(chunkId),
    queryFn: async () => {
      // RLS scopes this direct SPA read to the signed-in user; rows stay untrusted until Zod-parsed.
      const { data, error } = await supabase
        .from('coding_agent_prompts')
        .select(AGENT_PROMPT_COLUMNS)
        .eq('chunk_id', chunkId);

      if (error) {
        logger.error('agent_prompts_fetch_failed', { code: error.code });
        throw new Error(AGENT_PROMPTS_FETCH_ERROR);
      }

      const result: AgentPromptsByTarget = {};
      for (const row of data ?? []) {
        const parsed = AgentPromptRowSchema.safeParse(row);
        if (parsed.success) {
          result[parsed.data.target_agent] = parsed.data;
        } else {
          // A malformed row is skipped, not fatal: the other targets still render.
          logger.error('agent_prompt_invalid_shape', { issueCount: parsed.error.issues.length });
        }
      }

      return result;
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    enabled: chunkId.length > 0,
  });
}
