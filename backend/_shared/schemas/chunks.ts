import { z } from 'zod';

/**
 * The six canonical chunk statuses. These mirror context/05-ui-context.md and the feature_chunks
 * CHECK constraint (Chunk 04). The generator only ever writes 'backlog'; status transitions are
 * owned by a later chunk. Shared so the SPA's chunk-row schema and status labels stay in sync.
 */
export const ChunkStatusSchema = z.enum([
  'backlog',
  'ready',
  'in_progress',
  'needs_review',
  'completed',
  'blocked',
]);
export type ChunkStatus = z.infer<typeof ChunkStatusSchema>;

/** Advisory t-shirt size: xs (<2h), s (half-day), m (full day), l (2-3 days), xl (a week+). */
export const ChunkEffortSchema = z.enum(['xs', 's', 'm', 'l', 'xl']);
export type ChunkEffort = z.infer<typeof ChunkEffortSchema>;

/**
 * A single chunk as produced by the AI — no DB-managed fields (id, status, position, version,
 * timestamps). `ref` is a stable kebab-case id the AI assigns so chunks can reference one another
 * before UUIDs exist: `dependencies` holds the refs of chunks that should ship first, and the SPA
 * resolves them to rows by (project_id, ref). `included_features` holds PRD feature ids (the
 * kebab-case ids from the PRD's content_json.features), capped at 40 chars to match the PRD schema.
 */
export const GeneratedChunkSchema = z.object({
  ref: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'ref must be lowercase kebab-case'),
  title: z.string().min(3).max(200),
  description: z.string().min(20).max(2000),
  included_features: z.array(z.string().min(1).max(40)).max(15),
  dependencies: z.array(z.string().min(1).max(60)).max(10),
  estimated_effort: ChunkEffortSchema,
});
export type GeneratedChunk = z.infer<typeof GeneratedChunkSchema>;

/**
 * Full model output: an ordered set of chunks. The cap of 30 catches a runaway generation; the
 * prompt targets 5-25. Cross-field checks (ref uniqueness, dependency resolvability) live in the
 * Edge Function because they need the whole set.
 */
export const ChunkModelOutputSchema = z.object({
  chunks: z.array(GeneratedChunkSchema).min(1).max(30),
});
export type ChunkModelOutput = z.infer<typeof ChunkModelOutputSchema>;

/** Edge Function input for full generation (and bulk regenerate-all). */
export const GenerateChunksInputSchema = z.object({
  projectId: z.string().uuid(),
});
export type GenerateChunksInput = z.infer<typeof GenerateChunksInputSchema>;
