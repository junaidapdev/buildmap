-- Chunk 23 - Align project_issues for the issue-to-spec converter
-- Date: 2026-06-02
-- Purpose: The init schema (Chunk 04) created project_issues with a four-status enum
-- ('open','investigating','fixed','wont_fix') and several placeholder columns (error_text,
-- expected_behavior, actual_behavior, regression_checklist) that were never wired into the product.
-- The issue-to-spec converter (this chunk) uses a simpler two-status model (open/resolved), adds a
-- severity label, an integer version (bumped on every prompt regeneration), and a resolved_at
-- timestamp. The corrective_prompt column from Chunk 04 is reused as the AI-rendered markdown body
-- (its name matches the purpose), and chunk_id keeps the existing canonical name (the chunk spec's
-- "related_chunk_id" is the same column).
--
-- SAFETY: No issues have ever been generated, so the table is empty and the destructive enum
-- replacement is safe. Existing placeholder columns are left in place — leaving them unused costs
-- nothing and avoids a destructive drop that an existing client could trip over.

alter table public.project_issues
  add column if not exists severity text not null default 'medium'
    check (severity in ('low', 'medium', 'high')),
  add column if not exists version integer not null default 1,
  add column if not exists resolved_at timestamptz;

-- Replace the four-status enum with the two-status model used by the converter UI. Drop with a
-- name-tolerant lookup so the constraint name from Chunk 04 doesn't have to match exactly.
do $$
declare
  v_constraint_name text;
begin
  select conname
  into v_constraint_name
  from pg_constraint
  where conrelid = 'public.project_issues'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%status%';
  if v_constraint_name is not null then
    execute format('alter table public.project_issues drop constraint %I', v_constraint_name);
  end if;
end;
$$;

alter table public.project_issues
  add constraint project_issues_status_check
    check (status in ('open', 'resolved'));
