import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { ArchitectureContentSchema } from '@shared/schemas/architecture';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const ARCHITECTURE_FETCH_ERROR = 'ARCHITECTURE_FETCH_FAILED';
const ARCHITECTURE_INVALID_SHAPE_ERROR = 'ARCHITECTURE_INVALID_SHAPE';
const ARCHITECTURE_COLUMNS =
  'id, project_id, type, title, content, content_json, version, is_final, created_at, updated_at';

export const ArchitectureRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  type: z.literal('architecture'),
  title: z.string(),
  content: z.string(),
  content_json: ArchitectureContentSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ArchitectureRow = z.infer<typeof ArchitectureRowSchema>;

export const architectureQueryKey = (projectId: string) => ['architecture', projectId] as const;

export function useExistingArchitecture(projectId: string) {
  return useQuery<ArchitectureRow | null>({
    queryKey: architectureQueryKey(projectId),
    queryFn: async () => {
      // RLS scopes this direct SPA read to the signed-in user; the returned row stays untrusted.
      const { data, error } = await supabase
        .from('project_documents')
        .select(ARCHITECTURE_COLUMNS)
        .eq('project_id', projectId)
        .eq('type', 'architecture')
        .maybeSingle();

      if (error) {
        logger.error('architecture_fetch_failed', { code: error.code });
        throw new Error(ARCHITECTURE_FETCH_ERROR);
      }

      // A null row is the signal that no architecture exists yet.
      if (!data) {
        return null;
      }

      const parsed = ArchitectureRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('architecture_invalid_shape', { issueCount: parsed.error.issues.length });
        throw new Error(ARCHITECTURE_INVALID_SHAPE_ERROR);
      }

      return parsed.data;
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    enabled: projectId.length > 0,
  });
}
