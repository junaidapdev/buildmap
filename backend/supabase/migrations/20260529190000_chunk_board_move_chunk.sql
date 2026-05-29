-- Chunk 19 - move_chunk stored procedure for the chunk board
-- Date: 2026-05-29
-- Purpose: One atomic operation that sets a chunk's status and position, used by every drag-and-drop
-- move and inline status change on the Kanban board. Kept as a single procedure (rather than separate
-- status + reorder calls) so a cross-column move is one round-trip with atomic semantics.
--
-- SECURITY: security invoker keeps RLS in force; the explicit ownership join is defense in depth and
-- produces a clear error instead of a silent no-op when a non-owner calls it. The status whitelist
-- mirrors the feature_chunks CHECK constraint (the six canonical statuses) — there is no 'done'
-- status here; the board's Completed column maps to 'completed'.
--
-- Project status advancement on chunk status transitions (ready_to_build -> building) is deferred to
-- Chunk 22, which wraps this procedure with that logic. Do not add it here.

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
begin
  -- Verify ownership via the owning project; RLS already scopes visibility, the join is explicit.
  select fc.project_id
  into v_project_id
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
end;
$$;

-- Allow signed-in users to invoke the procedure through supabase.rpc; RLS still governs the writes.
grant execute on function public.move_chunk(uuid, text, integer) to authenticated;
