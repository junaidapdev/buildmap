import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { LearningTypeSchema } from '@shared/schemas/learning';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const LEARNINGS_FETCH_ERROR = 'LEARNINGS_FETCH_FAILED';
const LEARNING_COLUMNS =
  'id, project_id, type, title, content, source_label, source_raw, ingest_id, created_at, updated_at';

/**
 * Learning row schema — the canonical Chunk 24 columns aligned in
 * 20260603100000_align_project_learnings_for_knowledge_ingestion.sql. The row stays untrusted: it is
 * Zod-validated here, and content / source_raw are rendered with React's JSX escaping (no
 * react-markdown, no rehype-raw) so any HTML the AI emits is shown as text.
 */
export const LearningRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  type: LearningTypeSchema,
  title: z.string(),
  content: z.string(),
  source_label: z.string().nullable(),
  source_raw: z.string().nullable(),
  ingest_id: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type LearningRow = z.infer<typeof LearningRowSchema>;

export const learningsQueryKey = (projectId: string) => ['learnings', projectId] as const;

export function useLearnings(projectId: string) {
  return useQuery<LearningRow[]>({
    queryKey: learningsQueryKey(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_learnings')
        .select(LEARNING_COLUMNS)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('learnings_fetch_failed', { code: error.code });
        throw new Error(LEARNINGS_FETCH_ERROR);
      }

      const learnings: LearningRow[] = [];
      for (const row of data ?? []) {
        const parsed = LearningRowSchema.safeParse(row);
        if (parsed.success) {
          learnings.push(parsed.data);
        } else {
          // A malformed row is skipped, not fatal: the rest of the set still renders.
          logger.error('learning_invalid_shape', { issueCount: parsed.error.issues.length });
        }
      }

      return learnings;
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    enabled: projectId.length > 0,
  });
}
