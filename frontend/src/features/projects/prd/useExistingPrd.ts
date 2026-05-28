import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { PrdContentSchema } from '@shared/schemas/prd';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const PRD_FETCH_ERROR = 'PRD_FETCH_FAILED';
const PRD_INVALID_SHAPE_ERROR = 'PRD_INVALID_SHAPE';
const PRD_COLUMNS =
  'id, project_id, type, title, content, content_json, version, is_final, created_at, updated_at';

export const PrdRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  type: z.literal('prd'),
  title: z.string(),
  content: z.string(),
  content_json: PrdContentSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type PrdRow = z.infer<typeof PrdRowSchema>;

export const prdQueryKey = (projectId: string) => ['prd', projectId] as const;

export function useExistingPrd(projectId: string) {
  return useQuery<PrdRow | null>({
    queryKey: prdQueryKey(projectId),
    queryFn: async () => {
      // RLS scopes this direct SPA read to the signed-in user; the returned row stays untrusted.
      const { data, error } = await supabase
        .from('project_documents')
        .select(PRD_COLUMNS)
        .eq('project_id', projectId)
        .eq('type', 'prd')
        .maybeSingle();

      if (error) {
        logger.error('prd_fetch_failed', { code: error.code });
        throw new Error(PRD_FETCH_ERROR);
      }

      // A null row is the signal that no PRD exists yet.
      if (!data) {
        return null;
      }

      const parsed = PrdRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('prd_invalid_shape', { issueCount: parsed.error.issues.length });
        throw new Error(PRD_INVALID_SHAPE_ERROR);
      }

      return parsed.data;
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    enabled: projectId.length > 0,
  });
}
