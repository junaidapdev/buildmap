import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { learningsQueryKey } from '@/features/projects/knowledge/useLearnings';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

const EXTRACT_LEARNINGS_INVALID = 'EXTRACT_LEARNINGS_RESPONSE_INVALID';

const ExtractLearningsResponseSchema = z.object({
  ingest_id: z.string().uuid().nullable(),
  count: z.number().int().min(0),
});

export type ExtractLearningsVars = {
  sourceLabel?: string;
  sourceContent: string;
};

export type ExtractLearningsResult = z.infer<typeof ExtractLearningsResponseSchema>;

/**
 * Fires extract-learnings, re-validates the response envelope, and invalidates the project's
 * learnings cache. Returns { ingest_id, count } — count: 0 means the AI found no engineering
 * content in the paste; the SPA renders an empty-extraction message rather than treating that as an
 * error.
 */
export function useExtractLearnings(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ExtractLearningsResult, Error, ExtractLearningsVars>({
    mutationFn: async ({ sourceLabel, sourceContent }) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.EXTRACT_LEARNINGS,
        { projectId, sourceLabel, sourceContent },
        session.access_token,
      );

      const parsed = ExtractLearningsResponseSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('learnings_extract_response_invalid', {
          issueCount: parsed.error.issues.length,
        });
        throw new Error(EXTRACT_LEARNINGS_INVALID);
      }

      return parsed.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningsQueryKey(projectId) });
    },
  });
}
