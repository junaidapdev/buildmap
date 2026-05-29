import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { chunksQueryKey } from '@/features/projects/chunks/useChunks';
import { projectQueryKey } from '@/features/projects/layout/useProjectQuery';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

const GenerateChunksResultSchema = z.object({
  generated: z.literal(true),
  count: z.number().int(),
  statusAdvanced: z.boolean(),
});

export type GenerateChunksResult = z.infer<typeof GenerateChunksResultSchema>;

/**
 * Generates (or fully regenerates) the project's shippable chunks in one Edge Function call. The
 * function replaces all chunks atomically and reports whether the project's status advanced to
 * "ready to build" (true only on first-time generation). Used for both first generation and the
 * page-level "Regenerate all chunks". Invalidates the chunks list and the project (status may have
 * advanced) so both surfaces refetch.
 */
export function useGenerateChunks(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<GenerateChunksResult, Error>({
    mutationFn: async () => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.GENERATE_CHUNKS,
        { projectId },
        session.access_token,
      );

      const parsed = GenerateChunksResultSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('chunks_generate_response_invalid', { issueCount: parsed.error.issues.length });
        throw new Error('CHUNKS_RESPONSE_INVALID');
      }

      return parsed.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chunksQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
