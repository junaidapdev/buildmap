-- Chunk 27 - Align generation_logs for telemetry
-- Date: 2026-06-05
-- Purpose: Redefine the generation_logs table to support the new logging telemetry helper.

-- 1. Drop the constraints and columns we are replacing
ALTER TABLE public.generation_logs
  DROP COLUMN generation_type CASCADE,
  DROP COLUMN estimated_cost_usd CASCADE;

-- 2. Add the new columns
ALTER TABLE public.generation_logs
  ADD COLUMN function_name text not null default 'unknown',
  ADD COLUMN metadata jsonb not null default '{}'::jsonb;

-- Remove the default we just added so future inserts require it
ALTER TABLE public.generation_logs
  ALTER COLUMN function_name DROP DEFAULT;

-- 3. Update nullability constraints
ALTER TABLE public.generation_logs
  ALTER COLUMN input_tokens DROP NOT NULL,
  ALTER COLUMN output_tokens DROP NOT NULL,
  ALTER COLUMN latency_ms DROP NOT NULL,
  ALTER COLUMN input_tokens DROP DEFAULT,
  ALTER COLUMN output_tokens DROP DEFAULT,
  ALTER COLUMN latency_ms DROP DEFAULT;

-- 4. Update the indexes
DROP INDEX IF EXISTS public.generation_logs_generation_type_idx;
CREATE INDEX generation_logs_function_name_created_at_idx on public.generation_logs(function_name, created_at desc);

DROP INDEX IF EXISTS public.generation_logs_project_id_idx;
CREATE INDEX generation_logs_project_id_idx on public.generation_logs(project_id) where project_id is not null;

-- 5. Update the RLS insert policy
DROP POLICY IF EXISTS generation_logs_insert_own_project ON public.generation_logs;
CREATE POLICY "generation_logs_owner_insert"
  ON public.generation_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
