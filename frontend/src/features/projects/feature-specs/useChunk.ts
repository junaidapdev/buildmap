import { useQuery } from '@tanstack/react-query';

import { ChunkRowSchema, type ChunkRow } from '@/features/projects/chunks/useChunks';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const CHUNK_FETCH_ERROR = 'CHUNK_FETCH_FAILED';
const CHUNK_INVALID_SHAPE_ERROR = 'CHUNK_INVALID_SHAPE';
const CHUNK_COLUMNS =
  'id, project_id, ref, title, description, status, position, included_features, dependencies, estimated_effort, version, created_at, updated_at';

export const chunkQueryKey = (chunkId: string) => ['chunk', chunkId] as const;

/** Fetches a single chunk by id for the chunk detail page. Returns null when no such (owned) chunk. */
export function useChunk(chunkId: string) {
  return useQuery<ChunkRow | null>({
    queryKey: chunkQueryKey(chunkId),
    queryFn: async () => {
      // RLS scopes this direct SPA read to the signed-in user; the returned row stays untrusted.
      const { data, error } = await supabase
        .from('feature_chunks')
        .select(CHUNK_COLUMNS)
        .eq('id', chunkId)
        .maybeSingle();

      if (error) {
        logger.error('chunk_fetch_failed', { code: error.code });
        throw new Error(CHUNK_FETCH_ERROR);
      }

      // A null row is the signal that the chunk does not exist (or is not owned).
      if (!data) {
        return null;
      }

      const parsed = ChunkRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('chunk_invalid_shape', { issueCount: parsed.error.issues.length });
        throw new Error(CHUNK_INVALID_SHAPE_ERROR);
      }

      return parsed.data;
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    enabled: chunkId.length > 0,
  });
}
