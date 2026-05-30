import { useQuery } from '@tanstack/react-query';

import { UserProfileRowSchema, type UserProfileRow } from '@shared/schemas/user-profile';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const USER_PROFILE_FETCH_ERROR = 'USER_PROFILE_FETCH_FAILED';
const USER_PROFILE_INVALID_ERROR = 'USER_PROFILE_INVALID';

export const userProfileQueryKey = ['user-profile'] as const;

export function useUserProfile(options?: { enabled?: boolean }) {
  return useQuery<UserProfileRow>({
    queryKey: userProfileQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, display_name, default_preferred_agent, created_at, updated_at')
        .single();

      if (error) {
        logger.error('user_profile_fetch_failed', { code: error.code });
        throw new Error(USER_PROFILE_FETCH_ERROR);
      }

      const parsed = UserProfileRowSchema.safeParse(data);
      if (!parsed.success) {
        logger.error('user_profile_invalid_shape', { issueCount: parsed.error.issues.length });
        throw new Error(USER_PROFILE_INVALID_ERROR);
      }

      return parsed.data;
    },
    staleTime: 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
