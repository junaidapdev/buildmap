-- Chunk 29 - User settings: default preferred agent + update_user_profile
-- Date: 2026-06-07
-- Purpose: display_name already exists on public.users from Chunk 04. This migration adds the
-- user-level default for new project creation (agent prompt targets: claude_code, cursor, generic).

alter table public.users
  add column if not exists default_preferred_agent text;

alter table public.users
  drop constraint if exists users_default_preferred_agent_check;

alter table public.users
  add constraint users_default_preferred_agent_check
  check (
    default_preferred_agent is null
    or default_preferred_agent in ('claude_code', 'cursor', 'generic')
  );

create or replace function public.update_user_profile(
  p_display_name text,
  p_default_preferred_agent text
) returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if p_default_preferred_agent is not null
     and p_default_preferred_agent not in ('claude_code', 'cursor', 'generic') then
    raise exception 'invalid default_preferred_agent: %', p_default_preferred_agent;
  end if;

  update public.users
  set
    display_name = nullif(trim(p_display_name), ''),
    default_preferred_agent = p_default_preferred_agent,
    updated_at = now()
  where id = v_user_id;

  return (
    select jsonb_build_object(
      'id', id,
      'email', email,
      'display_name', display_name,
      'default_preferred_agent', default_preferred_agent,
      'updated_at', updated_at
    )
    from public.users
    where id = v_user_id
  );
end;
$$;

grant execute on function public.update_user_profile(text, text) to authenticated;
