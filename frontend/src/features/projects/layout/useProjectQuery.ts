import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/project';

const PROJECT_FETCH_ERROR = 'PROJECT_FETCH_FAILED';
const PROJECT_INVALID_SHAPE_ERROR = 'PROJECT_INVALID_SHAPE';
const PROJECT_COLUMNS =
  'id, user_id, name, description, status, project_type, preferred_stack, preferred_agent, created_at, updated_at';

const ProjectRowSchema: z.ZodType<Project> = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.enum(['idea', 'planning', 'ready_to_build', 'building', 'paused', 'completed']),
  project_type: z.enum(['side_project', 'company', 'client', 'saas', 'other']).nullable(),
  preferred_stack: z.string().nullable(),
  preferred_agent: z.enum(['claude_code', 'cursor', 'codex', 'windsurf', 'other']).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const projectQueryKey = (id: string) => ['project', id] as const;

export function useProjectQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery<Project | null>({
    queryKey: projectQueryKey(id),
    queryFn: async () => {
      // RLS scopes this read to the signed-in user; a missing or out-of-scope project returns null.
      const { data, error } = await supabase
        .from('projects')
        .select(PROJECT_COLUMNS)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        logger.error('project_fetch_failed', { code: error.code });
        throw new Error(PROJECT_FETCH_ERROR);
      }

      if (!data) {
        return null;
      }

      const parsed = ProjectRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('project_invalid_shape', { issueCount: parsed.error.issues.length });
        throw new Error(PROJECT_INVALID_SHAPE_ERROR);
      }

      return parsed.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
