-- Chunk 17 - Context File Content Update + Approval Procedures
-- Date: 2026-05-29
-- Purpose: Per-doc save and per-doc approval for the seven canonical context files. Context files
-- are markdown natively (no content_json), so the SPA sends the new markdown straight to
-- update_context_file_content via supabase.rpc — there is no save Edge Function rendering step like
-- PRD/architecture. approve_context_file mirrors approve_project_architecture but is type-scoped.
--
-- SECURITY: both are security invoker (RLS stays in force); the explicit ownership check is defense
-- in depth, and the type whitelist prevents these procedures from touching project_brief/prd/
-- architecture rows even if a caller passes one of those types.

create or replace function public.update_context_file_content(
  p_project_id uuid,
  p_type text,
  p_content text
) returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing_id uuid;
  v_existing_version int;
  v_allowed_types text[] := array[
    'project_overview',
    'code_standards',
    'ai_workflow_rules',
    'ui_context',
    'agents_md',
    'claude_md',
    'progress_tracker'
  ];
begin
  -- Validate the type is a context-file type (defense; the SPA also restricts).
  if not (p_type = any(v_allowed_types)) then
    raise exception 'invalid context file type: %', p_type;
  end if;

  -- Verify ownership; relies on RLS but doubles up explicitly.
  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  -- The doc must already exist; this procedure updates, it does not create.
  select id, version into v_existing_id, v_existing_version
  from public.project_documents
  where project_id = p_project_id and type = p_type;

  if v_existing_id is null then
    raise exception 'context file does not exist for project: type=%', p_type;
  end if;

  -- Any edit bumps the version and resets approval; the user must re-approve.
  update public.project_documents
  set
    content = p_content,
    content_json = null,
    version = v_existing_version + 1,
    is_final = false,
    updated_at = now()
  where id = v_existing_id;

  return (
    select jsonb_build_object(
      'id', id,
      'type', type,
      'version', version,
      'is_final', is_final,
      'updated_at', updated_at
    )
    from public.project_documents
    where id = v_existing_id
  );
end;
$$;

create or replace function public.approve_context_file(
  p_project_id uuid,
  p_type text
) returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_finalized integer;
  v_allowed_types text[] := array[
    'project_overview',
    'code_standards',
    'ai_workflow_rules',
    'ui_context',
    'agents_md',
    'claude_md',
    'progress_tracker'
  ];
begin
  if not (p_type = any(v_allowed_types)) then
    raise exception 'invalid context file type: %', p_type;
  end if;

  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  -- Mark the doc as final. Deliberately does NOT touch public.projects.status.
  update public.project_documents
  set is_final = true, updated_at = now()
  where project_id = p_project_id and type = p_type;

  -- The doc must exist to approve; never silently succeed without one.
  get diagnostics v_finalized = row_count;

  if v_finalized = 0 then
    raise exception 'context file not found for project %: type=%', p_project_id, p_type;
  end if;
end;
$$;

-- Allow signed-in users to invoke the procedures through supabase.rpc; RLS still governs the writes.
grant execute on function public.update_context_file_content(uuid, text, text) to authenticated;
grant execute on function public.approve_context_file(uuid, text) to authenticated;
