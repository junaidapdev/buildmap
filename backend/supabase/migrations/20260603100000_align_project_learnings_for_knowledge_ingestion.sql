-- Chunk 24 - Align project_learnings for knowledge ingestion
-- Date: 2026-06-03
-- Purpose: The init schema (Chunk 04) created project_learnings under an earlier model where one row
-- represented a whole ingest with nested arrays (extracted_insights, suggested_rules,
-- suggested_chunks) for each derived item. The knowledge ingestion converter (this chunk) flips that
-- model: each EXTRACTED LEARNING is its own row (type, title, content) and rows extracted from one
-- paste share an ingest_id. The old per-ingest columns are kept but their NOT NULL constraints are
-- dropped so the new write path can succeed without supplying them; new code does not read them.
--
-- SAFETY: No learnings have ever been generated, so the table is empty and the structural changes
-- are safe. Following the Chunk 23 precedent (project_issues), legacy columns are left in place to
-- avoid a destructive drop that a stale client could trip over.

alter table public.project_learnings
  add column if not exists type text not null default 'lesson'
    check (type in ('lesson', 'decision', 'gotcha', 'open_question')),
  add column if not exists content text not null default '',
  add column if not exists source_label text,
  add column if not exists source_raw text,
  add column if not exists ingest_id uuid;

-- Drop the NOT NULL constraints on the legacy per-ingest columns. The columns themselves stay so an
-- existing SQL-aware client cannot break on a missing column; new code ignores them.
alter table public.project_learnings
  alter column source_type drop not null,
  alter column raw_text drop not null;

-- An index on ingest_id supports the "group by ingest" path the UI uses to show source provenance.
create index if not exists project_learnings_ingest_id_idx
  on public.project_learnings (ingest_id);
