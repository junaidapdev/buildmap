-- Chunk 23 - Issue lifecycle stored procedures
-- Date: 2026-06-02
-- Purpose: create_issue, update_issue, and resolve_issue are the three writes the SPA performs for
-- the issue-to-spec converter. Everything goes through these procedures (rather than direct upserts
-- from the SPA) so the ownership check, the (project, chunk) integrity check, the severity
-- whitelist, and the resolved_at side-effect all live in one place.
--
-- SECURITY: security invoker keeps RLS in force; the explicit ownership join via the project chain
-- is defense in depth and gives a clear error instead of a silent no-op for a non-owner. The
-- generated_prompt body is written by the Edge Function directly via update (the Edge Function uses
-- the user's JWT and RLS), not by a procedure, so the AI path isn't bottlenecked on a procedure
-- signature change every time the model output evolves.

create or replace function public.create_issue(
  p_project_id uuid,
  p_title text,
  p_description text,
  p_severity text default 'medium',
  p_chunk_id uuid default null
) returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_issue_id uuid;
begin
  -- Verify ownership of the project; relies on RLS but doubles up explicitly.
  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  -- If a chunk was named, ensure it belongs to the same project so the FK can't be smuggled across
  -- projects (RLS would also reject a cross-project read, but raising here is clearer).
  if p_chunk_id is not null and not exists (
    select 1 from public.feature_chunks
    where id = p_chunk_id and project_id = p_project_id
  ) then
    raise exception 'chunk does not belong to project';
  end if;

  if p_severity not in ('low', 'medium', 'high') then
    raise exception 'invalid severity: %', p_severity;
  end if;

  insert into public.project_issues (
    project_id, chunk_id, title, description, severity, status
  )
  values (
    p_project_id, p_chunk_id, p_title, p_description, p_severity, 'open'
  )
  returning id into v_issue_id;

  return jsonb_build_object('id', v_issue_id);
end;
$$;

create or replace function public.update_issue(
  p_issue_id uuid,
  p_title text default null,
  p_description text default null,
  p_severity text default null,
  p_chunk_id uuid default null,
  p_clear_chunk boolean default false
) returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_project_id uuid;
begin
  -- Verify ownership via the issue's owning project; coalesce yields null for non-owned rows.
  select pi.project_id into v_project_id
  from public.project_issues pi
  inner join public.projects p on p.id = pi.project_id
  where pi.id = p_issue_id and p.user_id = v_user_id;

  if v_project_id is null then
    raise exception 'issue not found or not owned by current user';
  end if;

  if p_severity is not null and p_severity not in ('low', 'medium', 'high') then
    raise exception 'invalid severity: %', p_severity;
  end if;

  -- If a chunk was named, it must belong to the same project. Distinguishing "no change" (null
  -- argument) from "explicitly unlink" requires the p_clear_chunk flag — coalesce alone cannot.
  if p_chunk_id is not null and not exists (
    select 1 from public.feature_chunks
    where id = p_chunk_id and project_id = v_project_id
  ) then
    raise exception 'chunk does not belong to project';
  end if;

  update public.project_issues
  set
    title = coalesce(p_title, title),
    description = coalesce(p_description, description),
    severity = coalesce(p_severity, severity),
    chunk_id = case
      when p_clear_chunk then null
      when p_chunk_id is not null then p_chunk_id
      else chunk_id
    end,
    updated_at = now()
  where id = p_issue_id;
end;
$$;

create or replace function public.resolve_issue(p_issue_id uuid, p_resolved boolean)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_project_id uuid;
begin
  -- Verify ownership via the issue's owning project; relies on RLS but doubles up explicitly.
  select pi.project_id into v_project_id
  from public.project_issues pi
  inner join public.projects p on p.id = pi.project_id
  where pi.id = p_issue_id and p.user_id = v_user_id;

  if v_project_id is null then
    raise exception 'issue not found or not owned by current user';
  end if;

  update public.project_issues
  set
    status = case when p_resolved then 'resolved' else 'open' end,
    resolved_at = case when p_resolved then now() else null end,
    updated_at = now()
  where id = p_issue_id;
end;
$$;

-- Allow signed-in users to invoke the procedures through supabase.rpc; RLS still governs writes.
grant execute on function public.create_issue(uuid, text, text, text, uuid) to authenticated;
grant execute on function public.update_issue(uuid, text, text, text, uuid, boolean) to authenticated;
grant execute on function public.resolve_issue(uuid, boolean) to authenticated;
