import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { contextFilesQueryKey } from '@/features/projects/context-files/useAllContextFiles';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

const GenerateResponseSchema = z.object({ generated: z.literal(true) });

/**
 * Generates (or regenerates) the full set of seven context files in one Edge Function call. The
 * function writes all seven rows atomically, so on success the context-files query is refetched to
 * pull the new set. Used both for the first generation and the page-level "Regenerate all".
 */
export function useGenerateContextFiles(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.GENERATE_CONTEXT_FILES,
        { projectId },
        session.access_token,
      );

      const parsed = GenerateResponseSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('context_files_generate_response_invalid', {
          issueCount: parsed.error.issues.length,
        });
        throw new Error('CONTEXT_FILES_RESPONSE_INVALID');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contextFilesQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
