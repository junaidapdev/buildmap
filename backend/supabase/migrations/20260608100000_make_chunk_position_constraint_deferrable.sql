-- Fix - make feature_chunks.(project_id, position) uniqueness DEFERRABLE so move_chunk's
-- multi-row position renumber can transit through intermediate non-unique states without
-- tripping a 23505.
-- Date: 2026-06-08
-- Bug: The 2026-06-04 "fix" for move_chunk still produced 23505 intermittently. Postgres
-- IMMEDIATE unique constraints are checked PER ROW as each index entry is inserted during an
-- UPDATE, not at statement end. The procedure's single-statement renumber updates several
-- rows in one go, and Postgres processes those row updates in an indeterminate order — when
-- the chosen order assigns a row to a position that another row hasn't yet been moved off
-- of, the per-row check fails. The exact failure depends on the join plan, which is why the
-- bug presented as "sometimes works, sometimes doesn't".
--
-- Fix: drop and re-add the constraint as DEFERRABLE INITIALLY IMMEDIATE, then have move_chunk
-- SET CONSTRAINTS … DEFERRED inside its transaction. INITIALLY IMMEDIATE preserves the
-- current behaviour for normal inserts (the constraint still fires immediately); DEFERRED is
-- only requested inside move_chunk for the duration of the renumber, after which the commit
-- re-checks the post-state (which is guaranteed unique by construction).
--
-- The constraint is also renamed from feature_chunks_project_id_order_key (the legacy name
-- carried over from when the column was "order") to feature_chunks_project_id_position_key
-- so the schema reads truthfully.
--
-- SECURITY: same as Chunks 19/22/2026-06-04 fix — security invoker keeps RLS in force; the
-- explicit ownership join is defense in depth; the status whitelist mirrors the CHECK.

alter table public.feature_chunks
  drop constraint feature_chunks_project_id_order_key;

alter table public.feature_chunks
  add constraint feature_chunks_project_id_position_key
  unique (project_id, position)
  deferrable initially immediate;

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
  -- Verify ownership and capture the project's CURRENT status (before any update) so the
  -- advancement rules fire exactly once on the transition, not on every later move.
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

  -- DEFER the (project_id, position) uniqueness check until commit so the multi-row renumber
  -- below can transit through intermediate non-unique states. The constraint still fires on
  -- transaction commit, so the final state is guaranteed unique.
  set constraints feature_chunks_project_id_position_key deferred;

  -- Phase 1: park the moved row at sentinel position -1. Status updates immediately; updated_at
  -- bumps so the moved row sorts last in the renumber's tie-break (matching the prior
  -- procedure's "settles just after any chunk that already held the target slot" semantics).
  update public.feature_chunks
  set status = p_new_status, position = -1, updated_at = now()
  where id = p_chunk_id;

  -- Phase 2: single-statement renumber that lands the moved row at p_new_position. Non-moved
  -- rows rank by their current (position, updated_at). For each non-moved row at rank r, the
  -- new position is r if r < p_new_position (it stays before the insertion point) or r + 1
  -- otherwise (it shifts down by one to make room). The moved row gets p_new_position
  -- directly. With the constraint deferred, intermediate per-row duplicates inside the
  -- executor are tolerated; the post-commit state is unique.
  with non_moved_ranks as (
    select id, row_number() over (order by position, updated_at) - 1 as rank
    from public.feature_chunks
    where project_id = v_project_id and id <> p_chunk_id
  ),
  target as (
    select id,
      case when rank < p_new_position then rank else rank + 1 end as new_pos
    from non_moved_ranks
    union all
    select p_chunk_id as id, p_new_position as new_pos
  )
  update public.feature_chunks fc
  set position = target.new_pos
  from target
  where fc.id = target.id and fc.position <> target.new_pos;

  -- Status advancement (Chunk 22). Count chunk statuses AFTER the update so rules see new state.
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

grant execute on function public.move_chunk(uuid, text, integer) to authenticated;
