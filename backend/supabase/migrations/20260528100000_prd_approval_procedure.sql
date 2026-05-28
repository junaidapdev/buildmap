-- Chunk 13 - Project PRD Approval Procedure
-- Date: 2026-05-28
-- Purpose: Mark a project's PRD as final. Unlike brief approval, this does NOT advance the project
-- lifecycle — brief approval already moved the project to 'planning', and Chunk 18 (chunk
-- generation) owns the 'planning' -> 'ready_to_build' transition.
--
-- SECURITY: security invoker keeps RLS in force, so the function can only mutate rows the calling
-- user already owns. The explicit ownership check is defense in depth and gives a clear error.

create or replace function public.approve_project_prd(p_project_id uuid)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_finalized integer;
begin
  -- Verify ownership; relies on RLS but doubles up explicitly.
  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  -- Mark the PRD as final. Deliberately does NOT touch public.projects.status.
  update public.project_documents
  set is_final = true, updated_at = now()
  where project_id = p_project_id and type = 'prd';

  -- A project must have a PRD to approve; never silently succeed without one.
  get diagnostics v_finalized = row_count;

  if v_finalized = 0 then
    raise exception 'project prd not found for project %', p_project_id;
  end if;
end;
$$;

-- Allow signed-in users to invoke the procedure through supabase.rpc; RLS still governs the write.
grant execute on function public.approve_project_prd(uuid) to authenticated;
