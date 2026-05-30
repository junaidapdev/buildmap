-- Chunk 22 - Extend move_chunk to advance project status atomically
-- Date: 2026-06-01
-- Purpose: Wrap the existing chunk-move logic (Chunk 19) with project-status advancement. Same
-- signature so callers don't change. Inside the same transaction as the chunk update, the
-- procedure now also advances projects.status forward according to two rules:
--   - ready_to_build -> building when any chunk reaches in_progress
--   - building -> completed when EVERY chunk has reached completed (and there is at least one)
-- Forward-only: a chunk moving backward from completed never reverses the project's status.
--
-- SECURITY: security invoker keeps RLS in force; the explicit ownership join is defense in depth
-- and produces a clear error instead of a silent no-op when a non-owner calls it. The status
-- whitelist mirrors the feature_chunks CHECK constraint (the six canonical statuses) — the chunk
-- spec's four-status proposal (`done`) is rejected; the board's Completed column maps to
-- `completed`. See decisions.md, Chunk 22.

create or replace function public.move_chunk(
  p_chunk_id uuid,
  p_new_status text,
  p_new_position integer
) returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_project_id uuid;
  v_current_project_status text;
  v_in_progress_count int;
  v_completed_count int;
  v_total_count int;
begin
  -- Verify ownership and capture the project's CURRENT status (before any update) so the rule
  -- conditions below fire exactly once on the transition, not on every later move.
  select fc.project_id, p.status
  into v_project_id, v_current_project_status
  from public.feature_chunks fc
  inner join public.projects p on p.id = fc.project_id
  where fc.id = p_chunk_id and p.user_id = v_user_id;

  if v_project_id is null then
    raise exception 'chunk not found or not owned by current user';
  end if;

  if p_new_status not in ('backlog', 'ready', 'in_progress', 'needs_review', 'completed', 'blocked')
  then
    raise exception 'invalid status: %', p_new_status;
  end if;

  -- Apply the move. The moved row gets the newest updated_at, which breaks position ties below so it
  -- settles just after any chunk that already held the target slot.
  update public.feature_chunks
  set status = p_new_status, position = p_new_position, updated_at = now()
  where id = p_chunk_id;

  -- Renumber the project's chunks to consecutive 0..N-1 positions. Ties broken by updated_at keep
  -- moves stable; only rows whose position actually changes are written.
  with ordered as (
    select id, row_number() over (order by position, updated_at) - 1 as new_pos
    from public.feature_chunks
    where project_id = v_project_id
  )
  update public.feature_chunks fc
  set position = ordered.new_pos
  from ordered
  where fc.id = ordered.id and fc.position <> ordered.new_pos;

  -- Count chunk statuses AFTER the update so the rules see the new state.
  select
    count(*) filter (where status = 'in_progress'),
    count(*) filter (where status = 'completed'),
    count(*)
  into v_in_progress_count, v_completed_count, v_total_count
  from public.feature_chunks
  where project_id = v_project_id;

  -- Rule 1: ready_to_build -> building when any chunk is now in_progress.
  if v_current_project_status = 'ready_to_build' and v_in_progress_count > 0 then
    update public.projects
    set status = 'building', updated_at = now()
    where id = v_project_id;
  end if;

  -- Rule 2: building -> completed when every chunk is now completed (and there is at least one).
  if
    v_current_project_status = 'building'
    and v_total_count > 0
    and v_completed_count = v_total_count
  then
    update public.projects
    set status = 'completed', updated_at = now()
    where id = v_project_id;
  end if;

  -- Forward-only: do NOT reverse status from completed/building back to earlier states. A user
  -- reopening a completed chunk has to manually reset the project status (settings; out of scope).
end;
$$;

-- Signature is unchanged; the existing grant from 20260529190000 still covers this redefinition,
-- but re-issuing keeps the migration self-contained if applied to a fresh database.
grant execute on function public.move_chunk(uuid, text, integer) to authenticated;
