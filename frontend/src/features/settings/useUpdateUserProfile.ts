import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UserPreferredAgent } from '@shared/schemas/user-profile';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { userProfileQueryKey } from '@/features/settings/useUserProfile';

const USER_PROFILE_UPDATE_ERROR = 'USER_PROFILE_UPDATE_FAILED';

type Input = {
  displayName: string;
  defaultPreferredAgent: UserPreferredAgent | null;
};

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Input) => {
      const { data, error } = await supabase.rpc('update_user_profile', {
        p_display_name: input.displayName,
        p_default_preferred_agent: input.defaultPreferredAgent,
      });

      if (error) {
        logger.error('user_profile_update_failed', { code: error.code });
        throw new Error(USER_PROFILE_UPDATE_ERROR);
      }

      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userProfileQueryKey });
    },
  });
}
