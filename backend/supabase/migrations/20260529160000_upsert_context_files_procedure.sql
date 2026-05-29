-- Chunk 17 - Atomic Bulk Upsert for the Seven Context Files
-- Date: 2026-05-29
-- Purpose: The generate-context-files Edge Function receives seven markdown strings from one AI call.
-- Writing them as seven sequential upserts in the Edge Function would expose a partial-failure
-- window (some written, some not). Wrapping the seven writes in a stored procedure makes them atomic:
-- a function body runs in a single implicit transaction, so if any one write fails the whole batch
-- rolls back. Each upsert bumps the version and resets is_final, mirroring document regeneration.
--
-- SECURITY: both functions are security invoker (RLS stays in force). upsert_context_files does the
-- single ownership check; the _upsert_context_doc helper is internal (underscore-prefixed) and only
-- ever called from upsert_context_files, but is also security invoker so RLS still applies if it is
-- ever invoked directly.

create or replace function public._upsert_context_doc(
  p_project_id uuid,
  p_type text,
  p_title text,
  p_content text
) returns void
language plpgsql
security invoker
as $$
declare
  v_existing_id uuid;
  v_existing_version int;
begin
  select id, version into v_existing_id, v_existing_version
  from public.project_documents
  where project_id = p_project_id and type = p_type;

  if v_existing_id is null then
    insert into public.project_documents
      (project_id, type, title, content, content_json, version, is_final)
    values
      (p_project_id, p_type, p_title, p_content, null, 1, false);
  else
    update public.project_documents
    set
      content = p_content,
      content_json = null,
      version = v_existing_version + 1,
      is_final = false,
      updated_at = now()
    where id = v_existing_id;
  end if;
end;
$$;

create or replace function public.upsert_context_files(
  p_project_id uuid,
  p_project_overview text,
  p_code_standards text,
  p_ai_workflow_rules text,
  p_ui_context text,
  p_agents_md text,
  p_claude_md text,
  p_progress_tracker text
) returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
begin
  -- Verify ownership once; relies on RLS but doubles up explicitly.
  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  -- Upsert each. The helper handles version bump + is_final reset. All run in one transaction, so a
  -- failure anywhere rolls back the whole batch — no partial context-file set is ever persisted.
  perform public._upsert_context_doc(p_project_id, 'project_overview', 'Project overview', p_project_overview);
  perform public._upsert_context_doc(p_project_id, 'code_standards', 'Code standards', p_code_standards);
  perform public._upsert_context_doc(p_project_id, 'ai_workflow_rules', 'AI workflow rules', p_ai_workflow_rules);
  perform public._upsert_context_doc(p_project_id, 'ui_context', 'UI context', p_ui_context);
  perform public._upsert_context_doc(p_project_id, 'agents_md', 'AGENTS.md', p_agents_md);
  perform public._upsert_context_doc(p_project_id, 'claude_md', 'CLAUDE.md', p_claude_md);
  perform public._upsert_context_doc(p_project_id, 'progress_tracker', 'Progress tracker', p_progress_tracker);
end;
$$;

-- Allow signed-in users to invoke the bulk procedure through supabase.rpc; RLS still governs the
-- writes. The helper is granted too because a security-invoker call resolves EXECUTE against the
-- caller's role, so upsert_context_files (running as the authenticated user) must be able to call it.
grant execute on function public._upsert_context_doc(uuid, text, text, text) to authenticated;
grant execute on function public.upsert_context_files(uuid, text, text, text, text, text, text, text) to authenticated;
