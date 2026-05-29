-- Chunk 19 - reorder_chunks stored procedure for the chunk board
-- Date: 2026-05-29
-- Purpose: Batch reorder — take an explicit ordering of chunk ids and renumber position to match.
-- The board's single-card moves go through move_chunk; this procedure exists for "the user reordered
-- a whole column at once" style operations. The MVP board does not call it, but it is available so a
-- later bulk-reorder UI does not need a new backend round.
--
-- SECURITY: security invoker keeps RLS in force; the explicit ownership check plus the "all ids
-- belong to this project" guard are defense in depth and reject cross-project id smuggling.

create or replace function public.reorder_chunks(
  p_project_id uuid,
  p_ordered_ids uuid[]
) returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_id uuid;
  v_position integer := 0;
begin
  -- Verify ownership; relies on RLS but doubles up explicitly.
  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  -- Every id must belong to this project; a mismatch means a malformed or hostile request.
  if (
    select count(*) from public.feature_chunks
    where id = any(p_ordered_ids) and project_id = p_project_id
  ) <> coalesce(array_length(p_ordered_ids, 1), 0) then
    raise exception 'one or more chunks do not belong to project';
  end if;

  -- Walk the ordered list assigning consecutive positions.
  foreach v_id in array p_ordered_ids loop
    update public.feature_chunks
    set position = v_position, updated_at = now()
    where id = v_id;
    v_position := v_position + 1;
  end loop;
end;
$$;

-- Allow signed-in users to invoke the procedure through supabase.rpc; RLS still governs the writes.
grant execute on function public.reorder_chunks(uuid, uuid[]) to authenticated;
