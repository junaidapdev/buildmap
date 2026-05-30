-- Chunk 20 - Align feature_specs for the feature spec generator
-- Date: 2026-05-30
-- Purpose: The init schema (Chunk 04) created feature_specs as a placeholder with only `content`
-- (markdown) and `agent_prompts` (reserved for Chunk 21). The feature spec generator (this chunk)
-- stores a structured 7-section spec (`content_json`), a per-spec `title`, and an approval flag
-- (`is_final`). Add those three columns so the generator and per-section editor have a real home.
--
-- Already in place and unchanged: the composite FK (project_id, chunk_id) -> feature_chunks
-- (project_id, id) ON DELETE CASCADE (so Chunk 18's bulk regeneration cleans up specs), the unique
-- (chunk_id) constraint (one spec per chunk), the updated_at trigger, and the RLS policies (owner via
-- the project_id -> projects.user_id chain).
--
-- SAFETY: No feature specs have ever been generated, so the table is empty. The required columns are
-- added with stop-gap defaults so the statement is safe even if a row existed, then the placeholder
-- defaults are dropped so future inserts must supply real values. is_final keeps its default (false)
-- by design.

alter table public.feature_specs
  add column if not exists title text not null default 'Feature Spec',
  add column if not exists content_json jsonb not null default '{}'::jsonb,
  add column if not exists is_final boolean not null default false;

alter table public.feature_specs
  alter column title drop default,
  alter column content_json drop default;
