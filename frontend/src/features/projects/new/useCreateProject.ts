import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import type { ProjectCreateInput } from '@shared/schemas/project';
import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const InsertedProjectSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  status: z.literal('idea'),
  created_at: z.string(),
});

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: ProjectCreateInput) => {
      if (!user) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description ?? null,
          project_type: input.project_type ?? null,
          preferred_stack: input.preferred_stack ?? null,
          preferred_agent: input.preferred_agent ?? null,
          status: 'idea',
        })
        .select('id, user_id, name, status, created_at')
        .single();

      if (error) {
        logger.error('project_create_failed', { code: error.code });
        throw new Error('PROJECT_CREATE_FAILED');
      }

      const parsed = InsertedProjectSchema.safeParse(data);
      if (!parsed.success) {
        logger.error('project_create_invalid_response', {
          issueCount: parsed.error.issues.length,
        });
        throw new Error('PROJECT_CREATE_INVALID_RESPONSE');
      }

      return parsed.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
