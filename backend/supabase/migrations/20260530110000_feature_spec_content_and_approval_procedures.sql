-- Chunk 20 - Feature spec content update + approval stored procedures
-- Date: 2026-05-30
-- Purpose: Persist edits/per-section regenerations of a feature spec, and approve a spec. These
-- mirror the PRD procedures (Chunk 14/13) but key on the chunk and verify ownership through the
-- chunk -> project chain, since feature_specs hang off feature_chunks.
--
-- SECURITY: security invoker keeps RLS in force; the explicit ownership check via the chunk's owning
-- project is defense in depth and gives a clear error instead of a silent no-op for a non-owner.

create or replace function public.update_feature_spec_content(
  p_chunk_id uuid,
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
  -- Verify ownership via the chunk's owning project; relies on RLS but doubles up explicitly.
  if not exists (
    select 1
    from public.feature_chunks fc
    inner join public.projects p on p.id = fc.project_id
    where fc.id = p_chunk_id and p.user_id = v_user_id
  ) then
    raise exception 'chunk not found or not owned by current user';
  end if;

  -- A spec must already exist; this procedure updates, it does not create (generation does that).
  select id, version into v_existing_id, v_existing_version
  from public.feature_specs
  where chunk_id = p_chunk_id;

  if v_existing_id is null then
    raise exception 'feature spec does not exist for chunk %', p_chunk_id;
  end if;

  -- Any edit bumps the version and resets approval; the user must re-approve.
  update public.feature_specs
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
    from public.feature_specs
    where id = v_existing_id
  );
end;
$$;

create or replace function public.approve_feature_spec(p_chunk_id uuid)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_finalized integer;
begin
  -- Verify ownership via the chunk's owning project; relies on RLS but doubles up explicitly.
  if not exists (
    select 1
    from public.feature_chunks fc
    inner join public.projects p on p.id = fc.project_id
    where fc.id = p_chunk_id and p.user_id = v_user_id
  ) then
    raise exception 'chunk not found or not owned by current user';
  end if;

  -- Mark the spec final. Deliberately does NOT touch public.projects.status (Chunk 22 owns chunk
  -- status transitions and the next project status advancement).
  update public.feature_specs
  set is_final = true, updated_at = now()
  where chunk_id = p_chunk_id;

  -- A chunk must have a spec to approve; never silently succeed without one.
  get diagnostics v_finalized = row_count;

  if v_finalized = 0 then
    raise exception 'feature spec not found for chunk %', p_chunk_id;
  end if;
end;
$$;

-- Allow signed-in users to invoke the procedures through supabase.rpc; RLS still governs the writes.
grant execute on function public.update_feature_spec_content(uuid, jsonb, text) to authenticated;
grant execute on function public.approve_feature_spec(uuid) to authenticated;
