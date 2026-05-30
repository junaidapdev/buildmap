import { useQuery } from '@tanstack/react-query';

import { IssueRowSchema, type IssueRow } from '@/features/projects/issues/useIssues';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const ISSUE_FETCH_ERROR = 'ISSUE_FETCH_FAILED';
const ISSUE_INVALID_SHAPE_ERROR = 'ISSUE_INVALID_SHAPE';
const ISSUE_COLUMNS =
  'id, project_id, chunk_id, title, description, severity, status, corrective_prompt, version, created_at, updated_at, resolved_at';

export const issueQueryKey = (issueId: string) => ['issue', issueId] as const;

export function useIssue(issueId: string) {
  return useQuery<IssueRow | null>({
    queryKey: issueQueryKey(issueId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_issues')
        .select(ISSUE_COLUMNS)
        .eq('id', issueId)
        .maybeSingle();

      if (error) {
        logger.error('issue_fetch_failed', { code: error.code });
        throw new Error(ISSUE_FETCH_ERROR);
      }

      if (!data) {
        return null;
      }

      const parsed = IssueRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('issue_invalid_shape', { issueCount: parsed.error.issues.length });
        throw new Error(ISSUE_INVALID_SHAPE_ERROR);
      }

      return parsed.data;
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    enabled: issueId.length > 0,
  });
}
