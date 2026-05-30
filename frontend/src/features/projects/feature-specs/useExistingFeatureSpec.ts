import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { FeatureSpecContentSchema } from '@shared/schemas/feature-spec';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const FEATURE_SPEC_FETCH_ERROR = 'FEATURE_SPEC_FETCH_FAILED';
const FEATURE_SPEC_INVALID_SHAPE_ERROR = 'FEATURE_SPEC_INVALID_SHAPE';
const FEATURE_SPEC_COLUMNS =
  'id, chunk_id, title, content, content_json, version, is_final, created_at, updated_at';

export const FeatureSpecRowSchema = z.object({
  id: z.string().uuid(),
  chunk_id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  content_json: FeatureSpecContentSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type FeatureSpecRow = z.infer<typeof FeatureSpecRowSchema>;

export const featureSpecQueryKey = (chunkId: string) => ['feature-spec', chunkId] as const;

export function useExistingFeatureSpec(chunkId: string) {
  return useQuery<FeatureSpecRow | null>({
    queryKey: featureSpecQueryKey(chunkId),
    queryFn: async () => {
      // RLS scopes this direct SPA read to the signed-in user; the returned row stays untrusted.
      const { data, error } = await supabase
        .from('feature_specs')
        .select(FEATURE_SPEC_COLUMNS)
        .eq('chunk_id', chunkId)
        .maybeSingle();

      if (error) {
        logger.error('feature_spec_fetch_failed', { code: error.code });
        throw new Error(FEATURE_SPEC_FETCH_ERROR);
      }

      // A null row is the signal that no spec exists yet for this chunk.
      if (!data) {
        return null;
      }

      const parsed = FeatureSpecRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('feature_spec_invalid_shape', { issueCount: parsed.error.issues.length });
        throw new Error(FEATURE_SPEC_INVALID_SHAPE_ERROR);
      }

      return parsed.data;
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    enabled: chunkId.length > 0,
  });
}
