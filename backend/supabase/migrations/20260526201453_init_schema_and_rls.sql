-- Chunk 04 - Database Schema & Row-Level Security
-- Date: 2026-05-26
-- Purpose: Create the buildmap MVP schema, ownership policies, and lifecycle triggers.
--
-- SECURITY: The service role bypasses RLS and must never be used for user-data queries.
-- Application and Edge Function user-data access must execute with the user's JWT.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  default_coding_agent text
    check (default_coding_agent in ('claude_code', 'cursor', 'codex', 'windsurf', 'other')),
  default_stack text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  description text,
  status text not null default 'idea'
    check (status in ('idea', 'planning', 'ready_to_build', 'building', 'paused', 'completed')),
  project_type text
    check (project_type in ('side_project', 'company', 'client', 'saas', 'other')),
  preferred_stack text,
  preferred_agent text
    check (preferred_agent in ('claude_code', 'cursor', 'codex', 'windsurf', 'other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  type text not null
    check (
      type in (
        'project_brief',
        'prd',
        'architecture',
        'project_overview',
        'code_standards',
        'ai_workflow_rules',
        'ui_context',
        'progress_tracker',
        'agents'
      )
    ),
  title text not null,
  content text not null,
  content_json jsonb,
  version integer not null default 1,
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_documents_project_id_type_key unique (project_id, type)
);

create table public.feature_chunks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  chunk_number integer not null,
  title text not null,
  summary text,
  goal text,
  dependencies jsonb not null default '[]'::jsonb,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  "order" integer not null,
  status text not null default 'backlog'
    check (status in ('backlog', 'ready', 'in_progress', 'needs_review', 'completed', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feature_chunks_project_id_chunk_number_key unique (project_id, chunk_number),
  constraint feature_chunks_project_id_order_key unique (project_id, "order"),
  -- Supports same-project composite references from specs and issues.
  constraint feature_chunks_project_id_id_key unique (project_id, id)
);

create table public.feature_specs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  chunk_id uuid not null,
  content text not null,
  agent_prompts jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feature_specs_chunk_id_key unique (chunk_id),
  constraint feature_specs_project_chunk_fkey
    foreign key (project_id, chunk_id)
    references public.feature_chunks(project_id, id)
    on delete cascade
);

create table public.project_issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  chunk_id uuid,
  title text not null,
  description text not null,
  error_text text,
  expected_behavior text,
  actual_behavior text,
  corrective_prompt text,
  regression_checklist jsonb not null default '[]'::jsonb,
  status text not null default 'open'
    check (status in ('open', 'investigating', 'fixed', 'wont_fix')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_issues_project_chunk_fkey
    foreign key (project_id, chunk_id)
    references public.feature_chunks(project_id, id)
    on delete set null (chunk_id)
);

create table public.project_learnings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  source_type text not null check (source_type in ('transcript', 'article', 'notes', 'other')),
  raw_text text not null,
  extracted_insights jsonb not null default '[]'::jsonb,
  suggested_rules jsonb not null default '[]'::jsonb,
  suggested_chunks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.generation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  -- Logs survive project deletion for usage history, with the removed project detached.
  project_id uuid references public.projects(id) on delete set null,
  generation_type text not null
    check (
      generation_type in (
        'idea_clarification',
        'project_brief',
        'prd_generation',
        'prd_section_regenerate',
        'architecture_generation',
        'context_files_generation',
        'chunk_generation',
        'feature_spec_generation',
        'agent_prompt_generation',
        'issue_to_spec',
        'knowledge_extraction'
      )
    ),
  provider text not null check (provider in ('openai', 'anthropic')),
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  estimated_cost_usd numeric(10, 6) not null default 0,
  latency_ms integer not null default 0,
  success boolean not null default true,
  error_code text,
  created_at timestamptz not null default now()
);

create index projects_user_id_idx on public.projects (user_id);
create index projects_user_id_status_idx on public.projects (user_id, status);
create index projects_user_id_updated_at_idx on public.projects (user_id, updated_at desc);

create index project_documents_project_id_idx on public.project_documents (project_id);

create index feature_chunks_project_id_idx on public.feature_chunks (project_id);
create index feature_chunks_project_id_status_idx on public.feature_chunks (project_id, status);

create index feature_specs_project_id_idx on public.feature_specs (project_id);

create index project_issues_project_id_idx on public.project_issues (project_id);
create index project_issues_chunk_id_idx on public.project_issues (chunk_id);
create index project_issues_project_id_status_idx on public.project_issues (project_id, status);

create index project_learnings_project_id_idx on public.project_learnings (project_id);
create index project_learnings_project_id_created_at_idx
  on public.project_learnings (project_id, created_at desc);

create index generation_logs_user_id_idx on public.generation_logs (user_id);
create index generation_logs_user_id_created_at_idx
  on public.generation_logs (user_id, created_at desc);
create index generation_logs_project_id_idx on public.generation_logs (project_id);
create index generation_logs_generation_type_idx on public.generation_logs (generation_type);

create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

create trigger project_documents_set_updated_at
  before update on public.project_documents
  for each row
  execute function public.set_updated_at();

create trigger feature_chunks_set_updated_at
  before update on public.feature_chunks
  for each row
  execute function public.set_updated_at();

create trigger feature_specs_set_updated_at
  before update on public.feature_specs
  for each row
  execute function public.set_updated_at();

create trigger project_issues_set_updated_at
  before update on public.project_issues
  for each row
  execute function public.set_updated_at();

create trigger project_learnings_set_updated_at
  before update on public.project_learnings
  for each row
  execute function public.set_updated_at();

-- SECURITY DEFINER is limited to this auth trigger so sign-up can create the app profile before
-- the new user has a session. The function names its public table explicitly.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', null)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.project_documents enable row level security;
alter table public.feature_chunks enable row level security;
alter table public.feature_specs enable row level security;
alter table public.project_issues enable row level security;
alter table public.project_learnings enable row level security;
alter table public.generation_logs enable row level security;

create policy users_select_own
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

create policy users_update_own
  on public.users
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No public.users insert/delete policies: auth creation and auth deletion own that lifecycle.

create policy projects_select_own
  on public.projects
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy projects_insert_own
  on public.projects
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy projects_update_own
  on public.projects
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy projects_delete_own
  on public.projects
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy project_documents_select_owned_project
  on public.project_documents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy project_documents_insert_owned_project
  on public.project_documents
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy project_documents_update_owned_project
  on public.project_documents
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy project_documents_delete_owned_project
  on public.project_documents
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy feature_chunks_select_owned_project
  on public.feature_chunks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy feature_chunks_insert_owned_project
  on public.feature_chunks
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy feature_chunks_update_owned_project
  on public.feature_chunks
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy feature_chunks_delete_owned_project
  on public.feature_chunks
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy feature_specs_select_owned_project
  on public.feature_specs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy feature_specs_insert_owned_project
  on public.feature_specs
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy feature_specs_update_owned_project
  on public.feature_specs
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy feature_specs_delete_owned_project
  on public.feature_specs
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy project_issues_select_owned_project
  on public.project_issues
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy project_issues_insert_owned_project
  on public.project_issues
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy project_issues_update_owned_project
  on public.project_issues
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy project_issues_delete_owned_project
  on public.project_issues
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy project_learnings_select_owned_project
  on public.project_learnings
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy project_learnings_insert_owned_project
  on public.project_learnings
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy project_learnings_update_owned_project
  on public.project_learnings
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy project_learnings_delete_owned_project
  on public.project_learnings
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.user_id = auth.uid()
    )
  );

create policy generation_logs_select_own
  on public.generation_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy generation_logs_insert_own_project
  on public.generation_logs
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1
        from public.projects p
        where p.id = project_id
          and p.user_id = auth.uid()
      )
    )
  );

-- No generation_logs update/delete policies: generation records are immutable and retained.
