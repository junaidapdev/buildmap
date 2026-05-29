import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  RegenerateContextDocOutputSchema,
  type ContextFileType,
} from '@shared/schemas/context-files';
import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { contextFilesQueryKey } from '@/features/projects/context-files/useAllContextFiles';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

export type RegenerateContextDocVars = { type: ContextFileType; userInstruction?: string };

/**
 * Regenerates a single context doc. The Edge Function returns new markdown but does NOT persist it
 * (mirroring the per-section regenerate pattern from Chunks 14/16); this hook then writes the result
 * through the same `update_context_file_content` RPC as a manual save, which bumps the version and
 * resets approval. Two awaited steps live in one mutation so the UI sees a single pending state.
 */
export function useRegenerateContextDoc(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RegenerateContextDocVars>({
    mutationFn: async ({ type, userInstruction }) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction(
        EDGE_FUNCTIONS.REGENERATE_CONTEXT_DOC,
        { projectId, type, userInstruction },
        session.access_token,
      );

      const parsed = RegenerateContextDocOutputSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('context_doc_regenerate_response_invalid', {
          issueCount: parsed.error.issues.length,
        });
        throw new Error('CONTEXT_DOC_REGENERATE_RESPONSE_INVALID');
      }

      // Defense in depth: the Edge Function already enforces the echoed type matches the request.
      if (parsed.data.type !== type) {
        logger.error('context_doc_regenerate_type_mismatch');
        throw new Error('CONTEXT_DOC_REGENERATE_TYPE_MISMATCH');
      }

      const { error } = await supabase.rpc('update_context_file_content', {
        p_project_id: projectId,
        p_type: type,
        p_content: parsed.data.content,
      });

      if (error) {
        logger.error('context_doc_regenerate_persist_failed', { code: error.code });
        throw new Error('CONTEXT_DOC_REGENERATE_PERSIST_FAILED');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contextFilesQueryKey(projectId) });
    },
  });
}
