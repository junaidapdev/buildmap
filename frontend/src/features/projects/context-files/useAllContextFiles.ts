import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { ContextFileTypeSchema, type ContextFileType } from '@shared/schemas/context-files';
import { CONTEXT_DOC_TOTAL } from '@/features/projects/context-files/doc-config';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const CONTEXT_FILES_FETCH_ERROR = 'CONTEXT_FILES_FETCH_FAILED';
const CONTEXT_FILE_TYPES = [...ContextFileTypeSchema.options];
const CONTEXT_FILE_COLUMNS = 'id, type, title, content, version, is_final, updated_at';

// Context files are markdown natively (no content_json), so the row schema validates the markdown
// string directly. The returned row stays untrusted: react-markdown renders it without raw HTML.
export const ContextFileRowSchema = z.object({
  id: z.string().uuid(),
  type: ContextFileTypeSchema,
  title: z.string(),
  content: z.string(),
  version: z.number().int().min(1),
  is_final: z.boolean(),
  updated_at: z.string(),
});

export type ContextFileRow = z.infer<typeof ContextFileRowSchema>;

export type ContextFilesState = {
  docs: ContextFileRow[];
  byType: Partial<Record<ContextFileType, ContextFileRow>>;
  /** True only when the full canonical set is present (generation writes all seven atomically). */
  exists: boolean;
  approvedCount: number;
  total: number;
  allApproved: boolean;
};

export const contextFilesQueryKey = (projectId: string) => ['context-files', projectId] as const;

export function useAllContextFiles(projectId: string) {
  return useQuery<ContextFilesState>({
    queryKey: contextFilesQueryKey(projectId),
    queryFn: async () => {
      // RLS scopes this direct SPA read to the signed-in user. One round trip fetches all seven docs.
      const { data, error } = await supabase
        .from('project_documents')
        .select(CONTEXT_FILE_COLUMNS)
        .eq('project_id', projectId)
        .in('type', CONTEXT_FILE_TYPES);

      if (error) {
        logger.error('context_files_fetch_failed', { code: error.code });
        throw new Error(CONTEXT_FILES_FETCH_ERROR);
      }

      const docs: ContextFileRow[] = [];
      for (const row of data ?? []) {
        const parsed = ContextFileRowSchema.safeParse(row);
        if (parsed.success) {
          docs.push(parsed.data);
        } else {
          // A malformed row is skipped, not fatal: the rest of the set still renders.
          logger.error('context_file_invalid_shape', { issueCount: parsed.error.issues.length });
        }
      }

      const byType: Partial<Record<ContextFileType, ContextFileRow>> = {};
      for (const doc of docs) {
        byType[doc.type] = doc;
      }

      const approvedCount = docs.filter((doc) => doc.is_final).length;
      const exists = docs.length === CONTEXT_DOC_TOTAL;
      const allApproved = exists && approvedCount === CONTEXT_DOC_TOTAL;

      return { docs, byType, exists, approvedCount, total: CONTEXT_DOC_TOTAL, allApproved };
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    enabled: projectId.length > 0,
  });
}
