-- Chunk 17 - Extend project_documents.type check constraint for context files
-- Date: 2026-05-29
-- Purpose: The init schema (Chunk 04) listed an 'agents' placeholder and 'progress_tracker' but the
-- context-files feature (Chunk 17) standardizes on 'agents_md' and adds 'claude_md'. Recreate the
-- constraint to cover all seven canonical context-file types alongside the planning artifacts.
--
-- SAFETY: No rows of type 'agents' exist yet (context files have never been generated), so dropping
-- it from the whitelist is non-destructive. The seven context-file types are written for the first
-- time by upsert_context_files in this chunk.

alter table public.project_documents
  drop constraint if exists project_documents_type_check;

alter table public.project_documents
  add constraint project_documents_type_check
  check (
    type in (
      'project_brief',
      'prd',
      'architecture',
      'project_overview',
      'code_standards',
      'ai_workflow_rules',
      'ui_context',
      'agents_md',
      'claude_md',
      'progress_tracker'
    )
  );
