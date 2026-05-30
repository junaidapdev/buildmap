import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { issueQueryKey } from '@/features/projects/issues/useIssue';
import { IssueRowSchema } from '@/features/projects/issues/useIssues';
import { issuesQueryKey } from '@/features/projects/issues/useIssues';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

const ISSUE_PROMPT_RESPONSE_INVALID = 'ISSUE_PROMPT_RESPONSE_INVALID';

/**
 * Fires generate-issue-prompt and re-validates the returned row before invalidating the caches that
 * back the detail page and the issues list. The Edge Function returns the FULL row (corrective_prompt
 * + version bumped + timestamps), so the SPA's defense-in-depth re-validation matches exactly.
 */
export function useGenerateIssuePrompt(projectId: string, issueId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.GENERATE_ISSUE_PROMPT,
        { issueId },
        session.access_token,
      );

      const parsed = IssueRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('issue_prompt_response_invalid_shape', {
          issueCount: parsed.error.issues.length,
        });
        throw new Error(ISSUE_PROMPT_RESPONSE_INVALID);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueQueryKey(issueId) });
      queryClient.invalidateQueries({ queryKey: issuesQueryKey(projectId) });
    },
  });
}
