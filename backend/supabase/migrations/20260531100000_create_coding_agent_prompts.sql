-- Chunk 21 - coding_agent_prompts table
-- Date: 2026-05-31
-- Purpose: One-per-target-agent storage for the wrapped prompts the user copies into Claude Code,
-- Cursor, or a generic AI agent. Each row is N:1 with feature_chunks (different from feature_specs,
-- which are 1:1 with chunks) so a chunk can hold up to three prompts — one per target_agent value.
-- The Chunk 04 placeholder `feature_specs.agent_prompts jsonb` column is intentionally NOT touched in
-- this chunk: leaving it in place is cheap, and the new table supersedes its role.
--
-- SECURITY: RLS is enabled and policies traverse the chunk -> project chain since this table FKs to
-- feature_chunks (no direct project_id column). The stored procedure (upsert_agent_prompt) runs
-- security invoker with its own ownership check; both layers enforce ownership for defense in depth.

create table public.coding_agent_prompts (
  id uuid primary key default gen_random_uuid(),
  chunk_id uuid not null references public.feature_chunks(id) on delete cascade,
  target_agent text not null check (target_agent in ('claude_code', 'cursor', 'generic')),
  content text not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coding_agent_prompts_chunk_id_target_agent_key unique (chunk_id, target_agent)
);

create index coding_agent_prompts_chunk_target_idx
  on public.coding_agent_prompts (chunk_id, target_agent);

create trigger coding_agent_prompts_set_updated_at
  before update on public.coding_agent_prompts
  for each row
  execute function public.set_updated_at();

alter table public.coding_agent_prompts enable row level security;

create policy coding_agent_prompts_select_owned_project
  on public.coding_agent_prompts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.feature_chunks fc
      inner join public.projects p on p.id = fc.project_id
      where fc.id = chunk_id
        and p.user_id = auth.uid()
    )
  );

create policy coding_agent_prompts_insert_owned_project
  on public.coding_agent_prompts
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.feature_chunks fc
      inner join public.projects p on p.id = fc.project_id
      where fc.id = chunk_id
        and p.user_id = auth.uid()
    )
  );

create policy coding_agent_prompts_update_owned_project
  on public.coding_agent_prompts
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.feature_chunks fc
      inner join public.projects p on p.id = fc.project_id
      where fc.id = chunk_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.feature_chunks fc
      inner join public.projects p on p.id = fc.project_id
      where fc.id = chunk_id
        and p.user_id = auth.uid()
    )
  );

create policy coding_agent_prompts_delete_owned_project
  on public.coding_agent_prompts
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.feature_chunks fc
      inner join public.projects p on p.id = fc.project_id
      where fc.id = chunk_id
        and p.user_id = auth.uid()
    )
  );
