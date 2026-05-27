import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { briefQueryKey } from '@/features/projects/brief/useExistingBrief';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { callEdgeFunction } from '@/lib/edge';

export type GenerateBriefAnswer = {
  questionId: string;
  questionText: string;
  answer: string;
};

export type GenerateBriefInput = {
  projectId: string;
  answers?: GenerateBriefAnswer[];
};

export function useGenerateBrief(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, GenerateBriefInput>({
    mutationFn: async (input) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      // The Edge Function validates the AI output and persists the row. The copy that is rendered
      // is re-read and Zod-validated by useExistingBrief once this mutation invalidates its cache.
      return await callEdgeFunction(
        EDGE_FUNCTIONS.GENERATE_PROJECT_BRIEF,
        input,
        session.access_token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: briefQueryKey(projectId) });
      // The brief write advances projects.updated_at, which reorders the dashboard list.
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
