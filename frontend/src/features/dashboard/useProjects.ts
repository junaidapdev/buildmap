import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/project';

const PROJECTS_FETCH_ERROR = 'PROJECTS_FETCH_FAILED';
const PROJECTS_INVALID_SHAPE_ERROR = 'PROJECTS_INVALID_SHAPE';
const PROJECT_COLUMNS =
  'id,user_id,name,description,status,project_type,preferred_stack,preferred_agent,created_at,updated_at';

const ProjectRowSchema: z.ZodType<Project> = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  status: z.enum(['idea', 'planning', 'ready_to_build', 'building', 'paused', 'completed']),
  project_type: z.enum(['side_project', 'company', 'client', 'saas', 'other']).nullable(),
  preferred_stack: z.string().nullable(),
  preferred_agent: z.enum(['claude_code', 'cursor', 'codex', 'windsurf', 'other']).nullable(),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
});

const ProjectListSchema = z.array(ProjectRowSchema);

export const projectsQueryKey = ['projects'] as const;

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: projectsQueryKey,
    queryFn: async () => {
      // RLS scopes this direct SPA read to the signed-in user; returned rows remain untrusted data.
      const { data, error } = await supabase
        .from('projects')
        .select(PROJECT_COLUMNS)
        .order('updated_at', { ascending: false });

      if (error) {
        logger.error('projects_fetch_failed', { code: error.code });
        throw new Error(PROJECTS_FETCH_ERROR);
      }

      const parsedProjects = ProjectListSchema.safeParse(data);

      if (!parsedProjects.success) {
        logger.error('projects_invalid_shape', { issueCount: parsedProjects.error.issues.length });
        throw new Error(PROJECTS_INVALID_SHAPE_ERROR);
      }

      return parsedProjects.data;
    },
    staleTime: 30 * 1000,
    // Project mutations will invalidate this cache; focus changes should not create noisy reads.
    refetchOnWindowFocus: false,
  });
}
