import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import type { IssueSeverity } from '@shared/schemas/issue';
import { issuesQueryKey } from '@/features/projects/issues/useIssues';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const CREATE_ISSUE_ERROR = 'CREATE_ISSUE_FAILED';
const CREATE_ISSUE_INVALID = 'CREATE_ISSUE_INVALID';

const CreateIssueResultSchema = z.object({ id: z.string().uuid() });

export type CreateIssueVars = {
  title: string;
  description: string;
  severity: IssueSeverity;
  /** null when no chunk was selected; the procedure stores it as a NULL chunk_id. */
  chunkId: string | null;
};

/**
 * Direct supabase.rpc to the create_issue procedure. The procedure verifies ownership and that the
 * named chunk belongs to the project before inserting. Returns the new issue's id so the caller can
 * navigate to its detail page and auto-fire prompt generation.
 */
export function useCreateIssue(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, CreateIssueVars>({
    mutationFn: async ({ title, description, severity, chunkId }) => {
      const { data, error } = await supabase.rpc('create_issue', {
        p_project_id: projectId,
        p_title: title,
        p_description: description,
        p_severity: severity,
        p_chunk_id: chunkId,
      });

      if (error) {
        logger.error('issue_create_failed', { code: error.code });
        throw new Error(CREATE_ISSUE_ERROR);
      }

      const parsed = CreateIssueResultSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('issue_create_invalid_response', { issueCount: parsed.error.issues.length });
        throw new Error(CREATE_ISSUE_INVALID);
      }

      return parsed.data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issuesQueryKey(projectId) });
    },
  });
}
