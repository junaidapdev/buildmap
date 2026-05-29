import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { ChunkEffortSchema, ChunkStatusSchema } from '@shared/schemas/chunks';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const CHUNKS_FETCH_ERROR = 'CHUNKS_FETCH_FAILED';
const CHUNK_COLUMNS =
  'id, project_id, ref, title, description, status, position, included_features, dependencies, estimated_effort, version, created_at, updated_at';

// A chunk row as stored by the generator. `ref` is nullable in the schema for legacy safety but is
// always written by replace_project_chunks. The row stays untrusted: it is validated here, and all
// rendering uses React's default JSX escaping.
export const ChunkRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  ref: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  status: ChunkStatusSchema,
  position: z.number().int(),
  included_features: z.array(z.string()),
  dependencies: z.array(z.string()),
  estimated_effort: ChunkEffortSchema,
  version: z.number().int().min(1),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ChunkRow = z.infer<typeof ChunkRowSchema>;

export const chunksQueryKey = (projectId: string) => ['chunks', projectId] as const;

export function useChunks(projectId: string) {
  return useQuery<ChunkRow[]>({
    queryKey: chunksQueryKey(projectId),
    queryFn: async () => {
      // RLS scopes this direct SPA read to the signed-in user; rows are ordered for the list view.
      const { data, error } = await supabase
        .from('feature_chunks')
        .select(CHUNK_COLUMNS)
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (error) {
        logger.error('chunks_fetch_failed', { code: error.code });
        throw new Error(CHUNKS_FETCH_ERROR);
      }

      const chunks: ChunkRow[] = [];
      for (const row of data ?? []) {
        const parsed = ChunkRowSchema.safeParse(row);
        if (parsed.success) {
          chunks.push(parsed.data);
        } else {
          // A malformed row is skipped, not fatal: the rest of the set still renders.
          logger.error('chunk_invalid_shape', { issueCount: parsed.error.issues.length });
        }
      }

      return chunks;
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    enabled: projectId.length > 0,
  });
}
