-- Chunk 21 - upsert_agent_prompt stored procedure
-- Date: 2026-05-31
-- Purpose: Insert-or-update a coding_agent_prompts row keyed by (chunk_id, target_agent). Called by
-- the generate-agent-prompt Edge Function after the AI produces the framing and the assembler
-- stitches the final markdown. Returns the full persisted row as jsonb so the Edge Function can
-- echo it back to the SPA (which re-validates against the shared AgentPromptRowSchema) without a
-- separate follow-up SELECT.
--
-- SECURITY: security invoker keeps RLS in force; the explicit ownership check via the chunk's owning
-- project is defense in depth and gives a clear error instead of a silent no-op for a non-owner. The
-- target_agent whitelist mirrors the table CHECK constraint so a bad value fails here rather than at
-- write time.

create or replace function public.upsert_agent_prompt(
  p_chunk_id uuid,
  p_target_agent text,
  p_content text
) returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing_id uuid;
  v_existing_version integer;
begin
  if p_target_agent not in ('claude_code', 'cursor', 'generic') then
    raise exception 'invalid target_agent: %', p_target_agent;
  end if;

  -- Verify ownership via the chunk's owning project; relies on RLS but doubles up explicitly.
  if not exists (
    select 1
    from public.feature_chunks fc
    inner join public.projects p on p.id = fc.project_id
    where fc.id = p_chunk_id and p.user_id = v_user_id
  ) then
    raise exception 'chunk not found or not owned by current user';
  end if;

  select id, version into v_existing_id, v_existing_version
  from public.coding_agent_prompts
  where chunk_id = p_chunk_id and target_agent = p_target_agent;

  if v_existing_id is null then
    insert into public.coding_agent_prompts (chunk_id, target_agent, content, version)
    values (p_chunk_id, p_target_agent, p_content, 1)
    returning id into v_existing_id;
    v_existing_version := 1;
  else
    update public.coding_agent_prompts
    set content = p_content,
        version = v_existing_version + 1,
        updated_at = now()
    where id = v_existing_id;
    v_existing_version := v_existing_version + 1;
  end if;

  return (
    select jsonb_build_object(
      'id', id,
      'chunk_id', chunk_id,
      'target_agent', target_agent,
      'content', content,
      'version', version,
      'created_at', created_at,
      'updated_at', updated_at
    )
    from public.coding_agent_prompts
    where id = v_existing_id
  );
end;
$$;

-- Allow signed-in users to invoke the procedure through supabase.rpc; RLS still governs the writes.
grant execute on function public.upsert_agent_prompt(uuid, text, text) to authenticated;
