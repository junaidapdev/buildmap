import { useMutation } from '@tanstack/react-query';

import {
  ClarifyingQuestionsResponseSchema,
  type ClarifyingQuestion,
} from '@shared/schemas/clarification';
import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

export function useClarifyingQuestions(projectId: string) {
  const { session } = useAuth();

  return useMutation<ClarifyingQuestion[], Error>({
    mutationFn: async () => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.GENERATE_CLARIFYING_QUESTIONS,
        { projectId },
        session.access_token,
      );
      const parsed = ClarifyingQuestionsResponseSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('clarification_invalid_shape', {
          issueCount: parsed.error.issues.length,
        });
        throw new Error('CLARIFICATION_INVALID_SHAPE');
      }

      return parsed.data.questions;
    },
  });
}
