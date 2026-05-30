import { useMutation, useQueryClient } from '@tanstack/react-query';

import { issueQueryKey } from '@/features/projects/issues/useIssue';
import { issuesQueryKey } from '@/features/projects/issues/useIssues';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const RESOLVE_ISSUE_ERROR = 'RESOLVE_ISSUE_FAILED';

export type ResolveIssueVars = { resolved: boolean };

/**
 * Toggle an issue's status between open and resolved. The procedure stamps resolved_at on resolve
 * and clears it on reopen. Invalidates both the per-issue and per-project caches so the detail page
 * and the list see the updated badge.
 */
export function useResolveIssue(projectId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ResolveIssueVars>({
    mutationFn: async ({ resolved }) => {
      const { error } = await supabase.rpc('resolve_issue', {
        p_issue_id: issueId,
        p_resolved: resolved,
      });

      if (error) {
        logger.error('issue_resolve_failed', { code: error.code });
        throw new Error(RESOLVE_ISSUE_ERROR);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueQueryKey(issueId) });
      queryClient.invalidateQueries({ queryKey: issuesQueryKey(projectId) });
    },
  });
}
