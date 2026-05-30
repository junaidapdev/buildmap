import { useMutation } from '@tanstack/react-query';

import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { supabase } from '@/lib/supabase';

export function useDeleteAccount() {
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (confirmation: 'delete my account') => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      await callEdgeFunction(
        EDGE_FUNCTIONS.DELETE_ACCOUNT,
        { confirmation },
        session.access_token,
      );

      await supabase.auth.signOut();
    },
  });
}
