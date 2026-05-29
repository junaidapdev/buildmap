-- Chunk 18 - Atomic replacement of a project's shippable chunks
-- Date: 2026-05-29
-- Purpose: The generate-chunks Edge Function receives an ordered set of chunks from one AI call and
-- must replace the project's chunks atomically. Writing the delete + N inserts directly from the
-- Edge Function would expose a partial-failure window. Wrapping them in a function body runs the
-- whole batch in one implicit transaction, so any failure rolls back the entire replacement.
--
-- First-time generation (no chunks existed yet) advances projects.status from 'planning' to
-- 'ready_to_build' — the signal that the user has moved from planning to building. Regeneration of an
-- existing set does NOT re-advance status. The boolean return tells the caller whether the advance
-- happened so the SPA can surface the transition once.
--
-- Deleting feature_chunks cascades to feature_specs via the (project_id, chunk_id) FK declared
-- on delete cascade in Chunk 04, so regeneration cleanly discards specs tied to the old chunks.
--
-- SECURITY: security invoker (RLS stays in force); the explicit ownership check is defense in depth.
-- dependencies/included_features are stored verbatim as the AI produced them (the Edge Function has
-- already validated ref uniqueness and dependency resolvability); they are opaque references here.

create or replace function public.replace_project_chunks(
  p_project_id uuid,
  p_chunks jsonb
) returns boolean
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_chunk jsonb;
  v_position int := 0;
  v_was_first_generation boolean;
  v_current_status text;
  v_status_advanced boolean := false;
begin
  -- Verify ownership once; relies on RLS but doubles up explicitly.
  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  select status into v_current_status from public.projects where id = p_project_id;
  v_was_first_generation := not exists (
    select 1 from public.feature_chunks where project_id = p_project_id
  );

  -- Hard reset. Cascades to feature_specs per the Chunk 04 FK.
  delete from public.feature_chunks where project_id = p_project_id;

  -- Insert in the order the AI returned them; position is sequential 0..N-1. status is always
  -- 'backlog' on generation (status transitions are owned by a later chunk).
  for v_chunk in select * from jsonb_array_elements(p_chunks) loop
    insert into public.feature_chunks (
      project_id, ref, title, description, status, position,
      included_features, dependencies, estimated_effort
    ) values (
      p_project_id,
      v_chunk->>'ref',
      v_chunk->>'title',
      v_chunk->>'description',
      'backlog',
      v_position,
      coalesce(array(select jsonb_array_elements_text(v_chunk->'included_features')), '{}'),
      coalesce(array(select jsonb_array_elements_text(v_chunk->'dependencies')), '{}'),
      coalesce(v_chunk->>'estimated_effort', 'm')
    );
    v_position := v_position + 1;
  end loop;

  -- First-time generation advances status; regeneration leaves it where it is.
  if v_was_first_generation and v_current_status = 'planning' then
    update public.projects
    set status = 'ready_to_build', updated_at = now()
    where id = p_project_id;
    v_status_advanced := true;
  end if;

  return v_status_advanced;
end;
$$;

-- Allow signed-in users to invoke the procedure through supabase.rpc; RLS still governs the writes.
grant execute on function public.replace_project_chunks(uuid, jsonb) to authenticated;
