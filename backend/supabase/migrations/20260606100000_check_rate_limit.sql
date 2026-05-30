-- Chunk 28 - Rate limiting
-- Date: 2026-06-06
-- Purpose: Add a rolling-window rate-limit check over generation_logs.
--
-- This function is called through the user's JWT-scoped Supabase client. RLS on
-- generation_logs ensures a caller can only count their own telemetry rows, even
-- though p_user_id is an explicit parameter.

create or replace function public.check_rate_limit(
  p_user_id uuid,
  p_function_name text
) returns table (
  allowed boolean,
  retry_after_seconds integer,
  reason text
)
language plpgsql
stable
as $$
declare
  v_global_count integer;
  v_function_count integer;
  v_oldest_in_window timestamptz;
  v_oldest_function_in_window timestamptz;
  v_global_limit constant integer := 200;
  v_function_limit constant integer := 20;
  v_global_window constant interval := interval '24 hours';
  v_function_window constant interval := interval '1 hour';
begin
  select count(*) into v_global_count
  from public.generation_logs
  where user_id = p_user_id
    and created_at > now() - v_global_window;

  if v_global_count >= v_global_limit then
    select min(created_at) into v_oldest_in_window
    from public.generation_logs
    where user_id = p_user_id
      and created_at > now() - v_global_window;

    return query select
      false,
      greatest(1, ceil(extract(epoch from (v_oldest_in_window + v_global_window - now())))::integer),
      'global'::text;
    return;
  end if;

  select count(*) into v_function_count
  from public.generation_logs
  where user_id = p_user_id
    and function_name = p_function_name
    and created_at > now() - v_function_window;

  if v_function_count >= v_function_limit then
    select min(created_at) into v_oldest_function_in_window
    from public.generation_logs
    where user_id = p_user_id
      and function_name = p_function_name
      and created_at > now() - v_function_window;

    return query select
      false,
      greatest(1, ceil(extract(epoch from (v_oldest_function_in_window + v_function_window - now())))::integer),
      'function'::text;
    return;
  end if;

  return query select true, 0, null::text;
end;
$$;
