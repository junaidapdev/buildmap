-- Fix - move_chunk unique-constraint violation on cross-row drag-and-drop
-- Date: 2026-06-04
-- Bug: A drag-and-drop move that lands a chunk on a slot already held by another chunk produced a
-- 23505 unique_violation on `feature_chunks_project_id_order_key` (the index that now backs the
-- (project_id, position) uniqueness — it kept the original constraint name when `"order"` was
-- renamed to `position` in 20260529170000). The previous procedure (Chunks 19 + 22) updated the
-- moved chunk's position to `p_new_position` in its FIRST statement; if another row already held
-- that position the post-statement state was non-unique, so Postgres tripped the constraint before
-- the renumber statement that would have fixed it could run. The inline-status dropdown happened to
-- pass the chunk's CURRENT position so it never collided — which is why only drag-and-drop failed.
--
-- Fix: park the moved row at a sentinel position (-1, guaranteed not to collide with any value in
-- the 0..N-1 renumber range), then a SINGLE window-function-driven UPDATE renumbers every row in
-- the project so the moved row lands exactly at p_new_position and the rest fill 0..N-1 around it.
-- A single multi-row UPDATE statement whose post-state is unique succeeds without DEFERRABLE
-- constraints. Status advancement logic (Chunk 22) is preserved verbatim below the renumber.
--
-- SECURITY: same as Chunks 19/22 — security invoker keeps RLS in force; the explicit ownership join
-- is defense in depth; the status whitelist mirrors the feature_chunks CHECK.

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

  -- Phase 1: park the moved row at a sentinel position (-1). All valid positions are 0..N-1, so
  -- -1 cannot collide. Status updates immediately; updated_at bumps so the moved row sorts last in
  -- the renumber's tie-break (matching the prior procedure's "settles just after any chunk that
  -- already held the target slot" semantics).
  update public.feature_chunks
  set status = p_new_status, position = -1, updated_at = now()
  where id = p_chunk_id;

  -- Phase 2: single-statement renumber that lands the moved row at p_new_position. Non-moved rows
  -- rank by their current (position, updated_at). For each non-moved row at rank r, the new
  -- position is r if r < p_new_position (it stays before the insertion point) or r + 1 otherwise
  -- (it shifts down by one to make room). The moved row gets p_new_position directly. The CTE
  -- assembles the full target mapping; the UPDATE applies it in one statement, so the post-state
  -- is unique even though intermediate row states inside the executor may not be.
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

-- Signature unchanged; the existing grant covers this redefinition, but re-issuing keeps the
-- migration self-contained if applied to a fresh database.
grant execute on function public.move_chunk(uuid, text, integer) to authenticated;
