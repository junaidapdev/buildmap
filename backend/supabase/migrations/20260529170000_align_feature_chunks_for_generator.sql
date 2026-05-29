-- Chunk 18 - Align feature_chunks with the shippable-chunk generator model
-- Date: 2026-05-29
-- Purpose: The init schema (Chunk 04) created a placeholder feature_chunks table before the chunk
-- generator was designed. This migration aligns the table with what the generator actually persists
-- (see decisions.md, Chunk 18). The status CHECK is left untouched: the six canonical chunk statuses
-- (backlog, ready, in_progress, needs_review, completed, blocked) match context/05-ui-context.md and
-- are kept as the source of truth; the generator only ever writes 'backlog'.
--
-- SAFETY: No chunks have ever been generated (the generator ships in this chunk), so the table is
-- empty. Dropping the unused placeholder columns, renaming "order", and changing the dependencies
-- type are therefore non-destructive. The composite unique (project_id, id) is preserved because the
-- feature_specs and project_issues foreign keys depend on it.

-- 1. Drop unused placeholder columns and their constraints. `chunk_number` is superseded by
--    `position`; `summary`/`goal` are superseded by `description`.
alter table public.feature_chunks
  drop constraint if exists feature_chunks_project_id_chunk_number_key;

alter table public.feature_chunks drop column if exists chunk_number;
alter table public.feature_chunks drop column if exists summary;
alter table public.feature_chunks drop column if exists goal;

-- 2. Rename "order" (a reserved word that required quoting) to `position`. The implicit unique index
--    behind feature_chunks_project_id_order_key carries over and now covers (project_id, position),
--    which also serves the ordered-listing query.
alter table public.feature_chunks rename column "order" to position;

-- 3. Dependencies hold AI-assigned chunk refs (kebab-case strings), not ids, so a text[] is the
--    natural representation and matches the new included_features column. The table is empty, so the
--    USING conversion is a formality.
alter table public.feature_chunks alter column dependencies drop default;
alter table public.feature_chunks
  alter column dependencies type text[]
  using (array(select jsonb_array_elements_text(dependencies)));
alter table public.feature_chunks alter column dependencies set default '{}'::text[];
alter table public.feature_chunks alter column dependencies set not null;

-- 4. Add the columns the generator writes.
--    description: 2-4 sentence summary of what shipping the chunk delivers.
--    included_features: PRD feature ids the chunk covers (text[] of kebab-case ids).
--    estimated_effort: advisory t-shirt size.
--    version: bumped if a chunk is ever edited in place (per the document-versioning convention).
--    ref: stable kebab-case id the AI assigns so chunks can reference each other before UUIDs exist;
--    dependencies store these refs and the SPA resolves them to rows by (project_id, ref).
alter table public.feature_chunks add column if not exists description text not null default '';
alter table public.feature_chunks
  add column if not exists included_features text[] not null default '{}';
alter table public.feature_chunks
  add column if not exists estimated_effort text not null default 'm'
  check (estimated_effort in ('xs', 's', 'm', 'l', 'xl'));
alter table public.feature_chunks add column if not exists version integer not null default 1;
alter table public.feature_chunks add column if not exists ref text;

-- A chunk ref is unique within a project. Partial index tolerates legacy null refs (there are none).
create unique index if not exists feature_chunks_project_id_ref_key
  on public.feature_chunks (project_id, ref)
  where ref is not null;
