import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { IssueSeveritySchema, IssueStatusSchema } from '@shared/schemas/issue';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const ISSUES_FETCH_ERROR = 'ISSUES_FETCH_FAILED';
const ISSUE_COLUMNS =
  'id, project_id, chunk_id, title, description, severity, status, corrective_prompt, version, created_at, updated_at, resolved_at';

/**
 * Issue row schema — the canonical Chunk 04 column names. The chunk spec referred to chunk_id as
 * "related_chunk_id" and corrective_prompt as "generated_prompt"; both are the same fields here. The
 * row stays untrusted: it is Zod-validated here, and corrective_prompt is rendered with the safe
 * react-markdown setup (no rehype-raw).
 */
export const IssueRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  chunk_id: z.string().uuid().nullable(),
  title: z.string(),
  description: z.string(),
  severity: IssueSeveritySchema,
  status: IssueStatusSchema,
  corrective_prompt: z.string().nullable(),
  version: z.number().int().min(1),
  created_at: z.string(),
  updated_at: z.string(),
  resolved_at: z.string().nullable(),
});

export type IssueRow = z.infer<typeof IssueRowSchema>;

export const issuesQueryKey = (projectId: string) => ['issues', projectId] as const;

export function useIssues(projectId: string) {
  return useQuery<IssueRow[]>({
    queryKey: issuesQueryKey(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_issues')
        .select(ISSUE_COLUMNS)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('issues_fetch_failed', { code: error.code });
        throw new Error(ISSUES_FETCH_ERROR);
      }

      const issues: IssueRow[] = [];
      for (const row of data ?? []) {
        const parsed = IssueRowSchema.safeParse(row);
        if (parsed.success) {
          issues.push(parsed.data);
        } else {
          // A malformed row is skipped, not fatal: the rest of the set still renders.
          logger.error('issue_invalid_shape', { issueCount: parsed.error.issues.length });
        }
      }

      return issues;
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    enabled: projectId.length > 0,
  });
}
