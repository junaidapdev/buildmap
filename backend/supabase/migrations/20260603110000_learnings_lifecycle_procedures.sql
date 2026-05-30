-- Chunk 24 - Knowledge ingestion lifecycle stored procedures
-- Date: 2026-06-03
-- Purpose: create_learnings_batch, update_learning, and delete_learning are the three writes the
-- SPA performs for the knowledge ingestion converter. Everything goes through these procedures so
-- the ownership check, the type whitelist, and the batch ingest_id grouping all live in one place.
--
-- SECURITY: security invoker keeps RLS in force; the explicit ownership join via the project chain
-- is defense in depth and surfaces a clear error for a non-owner instead of a silent no-op.

create or replace function public.create_learnings_batch(
  p_project_id uuid,
  p_source_label text,
  p_source_raw text,
  p_learnings jsonb
) returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_ingest_id uuid := gen_random_uuid();
  v_learning jsonb;
  v_type text;
  v_title text;
  v_content text;
  v_inserted_count integer := 0;
begin
  -- Verify ownership of the project; relies on RLS but doubles up explicitly.
  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  if jsonb_typeof(p_learnings) <> 'array' then
    raise exception 'p_learnings must be a JSON array';
  end if;

  for v_learning in select * from jsonb_array_elements(p_learnings) loop
    v_type := v_learning->>'type';
    v_title := v_learning->>'title';
    v_content := v_learning->>'content';

    if v_type is null or v_type not in ('lesson', 'decision', 'gotcha', 'open_question') then
      raise exception 'invalid learning type: %', v_type;
    end if;
    if v_title is null or length(v_title) = 0 then
      raise exception 'learning title is required';
    end if;
    if v_content is null or length(v_content) = 0 then
      raise exception 'learning content is required';
    end if;

    insert into public.project_learnings (
      project_id, type, title, content, source_label, source_raw, ingest_id
    ) values (
      p_project_id, v_type, v_title, v_content, p_source_label, p_source_raw, v_ingest_id
    );
    v_inserted_count := v_inserted_count + 1;
  end loop;

  return jsonb_build_object('ingest_id', v_ingest_id, 'count', v_inserted_count);
end;
$$;

create or replace function public.update_learning(
  p_learning_id uuid,
  p_title text default null,
  p_content text default null,
  p_type text default null
) returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_project_id uuid;
begin
  -- Verify ownership via the learning's owning project; coalesce yields null for non-owned rows.
  select pl.project_id into v_project_id
  from public.project_learnings pl
  inner join public.projects p on p.id = pl.project_id
  where pl.id = p_learning_id and p.user_id = v_user_id;

  if v_project_id is null then
    raise exception 'learning not found or not owned by current user';
  end if;

  if p_type is not null and p_type not in ('lesson', 'decision', 'gotcha', 'open_question') then
    raise exception 'invalid learning type: %', p_type;
  end if;

  update public.project_learnings
  set
    title = coalesce(p_title, title),
    content = coalesce(p_content, content),
    type = coalesce(p_type, type),
    updated_at = now()
  where id = p_learning_id;
end;
$$;

create or replace function public.delete_learning(p_learning_id uuid)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
begin
  -- Verify ownership via the learning's owning project; relies on RLS but doubles up explicitly.
  if not exists (
    select 1
    from public.project_learnings pl
    inner join public.projects p on p.id = pl.project_id
    where pl.id = p_learning_id and p.user_id = v_user_id
  ) then
    raise exception 'learning not found or not owned by current user';
  end if;

  delete from public.project_learnings where id = p_learning_id;
end;
$$;

-- Allow signed-in users to invoke the procedures through supabase.rpc; RLS still governs writes.
grant execute on function public.create_learnings_batch(uuid, text, text, jsonb) to authenticated;
grant execute on function public.update_learning(uuid, text, text, text) to authenticated;
grant execute on function public.delete_learning(uuid) to authenticated;
