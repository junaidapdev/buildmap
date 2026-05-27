import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { ProjectBriefContentSchema } from '@shared/schemas/brief';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const BRIEF_FETCH_ERROR = 'BRIEF_FETCH_FAILED';
const BRIEF_INVALID_SHAPE_ERROR = 'BRIEF_INVALID_SHAPE';
const BRIEF_COLUMNS =
  'id, project_id, type, title, content, content_json, version, is_final, created_at, updated_at';

const BriefRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  type: z.literal('project_brief'),
  title: z.string(),
  content: z.string(),
  content_json: ProjectBriefContentSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type BriefRow = z.infer<typeof BriefRowSchema>;

export const briefQueryKey = (projectId: string) => ['brief', projectId] as const;

export function useExistingBrief(projectId: string) {
  return useQuery<BriefRow | null>({
    queryKey: briefQueryKey(projectId),
    queryFn: async () => {
      // RLS scopes this direct SPA read to the signed-in user; the returned row stays untrusted.
      const { data, error } = await supabase
        .from('project_documents')
        .select(BRIEF_COLUMNS)
        .eq('project_id', projectId)
        .eq('type', 'project_brief')
        .maybeSingle();

      if (error) {
        logger.error('brief_fetch_failed', { code: error.code });
        throw new Error(BRIEF_FETCH_ERROR);
      }

      // A null row is the signal that no brief exists yet and one must be generated.
      if (!data) {
        return null;
      }

      const parsed = BriefRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('brief_invalid_shape', { issueCount: parsed.error.issues.length });
        throw new Error(BRIEF_INVALID_SHAPE_ERROR);
      }

      return parsed.data;
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
  });
}
