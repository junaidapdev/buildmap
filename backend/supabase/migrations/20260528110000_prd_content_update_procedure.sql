-- Chunk 14 - Project PRD Content Update Procedure
-- Date: 2026-05-28
-- Purpose: Persist an edited or per-section-regenerated PRD. The SPA sends the full new
-- content_json; the save Edge Function renders content_markdown deterministically and calls this
-- procedure, which bumps the version and resets is_final so the user must re-approve.
--
-- SECURITY: security invoker keeps RLS in force; the explicit ownership check is defense in depth.

create or replace function public.update_project_prd_content(
  p_project_id uuid,
  p_content_json jsonb,
  p_content_markdown text
) returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing_id uuid;
  v_existing_version int;
begin
  -- Verify ownership; relies on RLS but doubles up explicitly.
  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  -- A PRD must already exist; this procedure updates, it does not create.
  select id, version into v_existing_id, v_existing_version
  from public.project_documents
  where project_id = p_project_id and type = 'prd';

  if v_existing_id is null then
    raise exception 'prd does not exist for project %', p_project_id;
  end if;

  -- Any edit bumps the version and resets approval; the user must re-approve.
  update public.project_documents
  set
    content = p_content_markdown,
    content_json = p_content_json,
    version = v_existing_version + 1,
    is_final = false,
    updated_at = now()
  where id = v_existing_id;

  return (
    select jsonb_build_object(
      'id', id,
      'version', version,
      'is_final', is_final,
      'updated_at', updated_at
    )
    from public.project_documents
    where id = v_existing_id
  );
end;
$$;

-- Allow signed-in users to invoke the procedure through supabase.rpc; RLS still governs the write.
grant execute on function public.update_project_prd_content(uuid, jsonb, text) to authenticated;
