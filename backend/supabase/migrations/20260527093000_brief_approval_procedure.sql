-- Chunk 10 - Project Brief Approval Procedure
-- Date: 2026-05-27
-- Purpose: Transactionally approve a project brief and advance the owning project's lifecycle.
--
-- SECURITY: security invoker keeps RLS in force for both writes, so the function can only mutate
-- rows the calling user already owns. The explicit ownership check is defense in depth on top of RLS
-- and produces a clear error instead of a silent no-op when a non-owner calls the procedure.

create or replace function public.approve_project_brief(p_project_id uuid)
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

  update public.project_documents
  set is_final = true, updated_at = now()
  where project_id = p_project_id and type = 'project_brief';

  -- A project must have a brief to approve; never advance the lifecycle without finalizing one.
  get diagnostics v_finalized = row_count;

  if v_finalized = 0 then
    raise exception 'project brief not found for project %', p_project_id;
  end if;

  -- Gated on 'idea' so re-approving an already-advanced project never rewinds the lifecycle.
  update public.projects
  set status = 'planning', updated_at = now()
  where id = p_project_id and status = 'idea';
end;
$$;

-- Allow signed-in users to invoke the procedure through supabase.rpc; RLS still governs the writes.
grant execute on function public.approve_project_brief(uuid) to authenticated;
