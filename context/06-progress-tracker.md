# buildmap Progress Tracker

## Current Phase

Phase 3 — Planning Documents (Complete). Phases 1–2 complete. With the brief, PRD, architecture, and
the seven context files all generated, viewable, editable, and approvable, the planning phase is done.
The build phase begins with Chunk 18 (chunk generator), which owns the `planning -> ready_to_build`
status transition.

## Completed Chunks

- [x] Chunk 00 — Repository Structure & Architecture Lock-in
- [x] Chunk 01 — Frontend Scaffold
- [x] Chunk 02 — Backend Scaffold
- [x] Chunk 03 — Code Standards & AI Workflow Rules
- [x] Chunk 04 — Database Schema & Row-Level Security
- [x] Chunk 05 — Supabase Auth Integration on the Frontend
- [x] Chunk 06 — App Shell & Protected Routing
- [x] Chunk 07 — Dashboard Project List
- [x] Chunk 08 — New Project Basic Details
- [x] Chunk 09 — Idea Clarifier
- [x] Chunk 10 — Project Brief Generator
- [x] Chunk 11 — Project Detail Layout
- [x] Chunk 12 — Project Overview Page
- [x] Chunk 13 — PRD Generator
- [x] Chunk 14 — PRD Editor
- [x] Chunk 15 — Architecture Generator
- [x] Chunk 16 — Architecture Editor
- [x] Chunk 17 — Context Files Generator

## In Progress

None.

## Next Up

- [ ] Chunk 18 — Chunk Generator

## Blocked

None.

## Recent Decisions

See `decisions.md`. The architecture is now fully editable, mirroring the PRD editor: per-section
in-place editing (prose textareas, string-list editors, and structured cards for components, external
services, and decisions), per-section AI regeneration (`full_section` mode), and per-decision AI
regeneration (`single_decision` mode) inside a decision-log management UI that adds, removes,
reorders, and re-statuses decisions. Saving sends the full `content_json` to `save-architecture-content`,
which re-validates, renders markdown deterministically via the existing renderer, and persists through
the `update_project_architecture_content` stored procedure (bumps version, resets `is_final`).
Per-section regenerate is `regenerate-architecture-section`, returning only the section value; the SPA
stitches and saves through the same path. Per-decision regenerate updates the edit-mode draft (not an
auto-save) and works only on already-saved decisions, since the Edge Function looks the decision up by
id in stored `content_json`. The architecture generator (live since Chunk 15) is generated from the
approved PRD (gated 412 `PRD_NOT_APPROVED`, brief optional), stored as a `project_documents` row of
`type = 'architecture'` with nine structured sections, decisions inline in `content_json.decisions`
(no separate table). Before this, the PRD became fully editable the same way. All AI generation types
use OpenAI (`gpt-4o-mini`) per the standing product-owner override; the Anthropic adapter is dormant.

The seven canonical context files (project_overview, code_standards, ai_workflow_rules, ui_context,
agents_md, claude_md, progress_tracker) are now generated in a single AI call (gated 412
`ARCHITECTURE_NOT_APPROVED`), each persisted as its own `project_documents` row, and surfaced in one
tabbed view where each doc can be viewed, edited, regenerated, and approved independently. These docs
DIVERGE from the brief/PRD/architecture pattern: markdown is the source of truth, `content_json` stays
null, and there is NO server-side renderer — edits save the raw markdown directly via
`supabase.rpc('update_context_file_content', ...)`. Generated markdown is rendered with `react-markdown`
WITHOUT `rehype-raw`, so embedded HTML is escaped (XSS-safe). Chunk gating now waits for all seven
context files to be approved before recommending chunk generation.

## Known Issues

- `02-architecture.md` says AI providers use SDKs, while Chunk 02 implemented typed HTTP adapters
  after Supabase Edge runtime verification. Do not copy the SDK statement into implementation;
  reconcile the canonical architecture wording in an approved architecture update.
- Root `AGENTS.md` and `CLAUDE.md` remain minimal headings. `context/agents.md` now contains the
  operative master instructions for subsequent chunk prompts.
- A later API-design chunk must decide whether safe Zod issue details belong in validation
  responses.
- Google OAuth is implemented in the frontend but cannot be round-trip verified until real Google
  client credentials are configured in Supabase.
- The frontend production build succeeds but currently reports a bundle-size warning above 500 kB;
  evaluate route-based splitting once the app shell and feature routes are established.
- Dashboard search, filtering, and pagination are intentionally omitted for the MVP; revisit if
  project volume makes the recent-activity grid insufficient.
- Dashboard chunk count, completion, and issue metrics remain unavailable placeholders until their
  owning feature chunks supply real data.
- The dedicated `/projects/{id}/clarify` route now replaces the creation-flow placeholder with the
  AI clarification experience.
- Project subpages render inside a nested `<ProjectLayout>`; the default subroute is now `overview`,
  and dashboard project cards resolve to it correctly.
- The overview's Recent decisions panel now reads real data from the architecture document (its
  `useDecisionsState` stub body was swapped in Chunk 15), and its "view all" link deep-links to the
  architecture decision log via `#decisions` (Chunk 16). The Chunks and Open issues panels still show
  empty states backed by stub hooks in `overview/stubs/`; they activate when Chunks 18/23 replace the
  stubs. The Export panel is a disabled shortcut until Chunk 25.
- The architecture and context-files routes are now live (Chunks 15–17). The only next-action
  recommendation still pointing at an unbuilt route is chunk generation, which 404s until Chunk 18
  lands — expected.
- Regenerating a brief runs without the original clarification answers, which are ephemeral, so it
  rebuilds from the project's basic details only. Persisting answers is a possible follow-up.
- Chunk 10's database and AI paths (migration apply, Edge Function behavior, stored-procedure
  approval, and the end-to-end brief flow) are verified here only by static gates; exercising them
  needs a live Supabase project and an `OPENAI_API_KEY` Edge Function secret.
- PRD edits warn before browser refresh/close (`beforeunload`) but do NOT yet block in-app
  navigation: `useBlocker` requires a data router and the app uses `<BrowserRouter>`. Migrating to
  `createBrowserRouter` would enable it (deferred follow-up).
- Chunk 13/14 live paths (PRD generation, per-section regenerate, save + server-side markdown
  render, stored-procedure approval/update) are verified here only by static gates; exercising them
  needs a live Supabase project and an `OPENAI_API_KEY` Edge Function secret.
- Chunk 15/16 live paths (architecture generation, per-section regenerate, per-decision regenerate,
  save + server-side markdown render, `update_project_architecture_content` stored procedure) are
  likewise verified here only by static gates; exercising them needs a live Supabase project and an
  `OPENAI_API_KEY` secret. The Chunk 16 migration
  (`20260529130000_architecture_content_update_procedure.sql`) and the two new Edge Functions
  (`save-architecture-content`, `regenerate-architecture-section`) deploy out-of-band post-merge.
- Chunk 17 live paths (single-call generation of all seven context files, per-doc save, per-doc
  regenerate, and the `update_context_file_content`/`approve_context_file`/`upsert_context_files`
  stored procedures) are verified here only by static gates; exercising them needs a live Supabase
  project and an `OPENAI_API_KEY` secret. The three Chunk 17 migrations
  (`20260529140000_extend_project_documents_type_check.sql`,
  `20260529150000_context_file_update_and_approval_procedures.sql`,
  `20260529160000_upsert_context_files_procedure.sql`) and the two new Edge Functions
  (`generate-context-files`, `regenerate-context-doc`) apply/deploy out-of-band post-merge — do NOT
  run `supabase db push`.
- `react-markdown` is configured WITHOUT `rehype-raw`, so any literal HTML an AI puts in a context
  file is shown as escaped text rather than rendered. This is the intended XSS-safe default; if a
  future doc genuinely needs sanitized inline HTML, add `rehype-sanitize` (never bare `rehype-raw`)
  and record it in `decisions.md` first.

## Notes for Next Agent

- Phase 3 (Planning Documents) is complete. The seven canonical context files
  (project_overview, code_standards, ai_workflow_rules, ui_context, agents_md, claude_md,
  progress_tracker) are generated in ONE AI call by `generate-context-files`, which gates on an
  approved architecture (412 `ARCHITECTURE_NOT_APPROVED`), calls the `upsert_context_files` stored
  procedure to write all seven `project_documents` rows in one transaction, and returns
  `{ generated: true }` (it does not return the docs — the SPA refetches). The whole feature lives in
  `frontend/src/features/projects/context-files/`; `doc-config.ts` holds the canonical order, labels,
  and on-disk filenames (`CONTEXT_DOC_ORDER`, `CONTEXT_DOC_TOTAL = 7`) and is the single source for
  the tab order — add or reorder docs there, not in the components.
- Context files DIVERGE from the brief/PRD/architecture pattern — do NOT copy those conventions
  blindly. Markdown is the source of truth, `content_json` stays NULL, and there is NO server-side
  renderer. A per-doc edit saves the raw markdown straight to the DB via
  `supabase.rpc('update_context_file_content', ...)` (no Edge Function, no markdown rebuild). Approval
  is `supabase.rpc('approve_context_file', ...)`. Both are security-invoker, ownership-checked, and
  whitelist the seven types. Any edit, regenerate, or save bumps `version` and resets `is_final`
  (un-approves), exactly like the other docs.
- Per-doc regenerate is special: `regenerate-context-doc` is the ONE Edge Function in this feature
  that does NOT write — it returns `{ type, content }` only, and `useRegenerateContextDoc` then
  persists that content through `update_context_file_content` in the same mutation (two awaited steps,
  one pending state). The function validates that the echoed `type` matches the request (502 on
  mismatch). It accepts an optional `userInstruction` nudge. "Regenerate all" reuses
  `generate-context-files` (a full re-generation of the set), guarded by an `AlertDialog`.
- Rendering: context-file markdown is shown with `react-markdown` and `@tailwindcss/typography`
  (`prose prose-sm dark:prose-invert`) and deliberately WITHOUT `rehype-raw`, so any literal HTML the
  AI emits is escaped, not executed. This is the canonical XSS-safe markdown renderer for the app —
  reuse it for any future AI-authored markdown surface, and never add bare `rehype-raw` (use
  `rehype-sanitize` if inline HTML is ever truly required, and record it in `decisions.md` first).
- One fetch backs all seven panels: `useAllContextFiles` fetches every context row once (keyed
  `['context-files', projectId]`), and `useContextFile(projectId, type)` selects one doc from that
  cache. The tabbed UI is a controlled Radix `Tabs`; switching tabs while a doc is dirty pops a
  confirm dialog (`useDirtyGuard` also warns on browser unload, the same `beforeunload`-only
  limitation as the PRD/architecture editors — `useBlocker` still needs a data router).
- The overview recommendation engine now gates chunk generation on ALL SEVEN context files being
  approved: `recommend-next-action.ts` has a `contextFilesApproved` input and a `context_files_approve`
  action between `context_files_generate` and `chunks_generate`. The overview's `useContextFilesState`
  stub is now a real query delegating to `useAllContextFiles` (its `{ data }` shape is unchanged; the
  exported type was renamed `ContextFilesOverviewState` to avoid colliding with the feature's
  `ContextFilesState`).
- Backend live paths are verified here only by static gates; exercising them needs a live Supabase
  project + `OPENAI_API_KEY`. The three Chunk 17 migrations
  (`20260529140000`, `20260529150000`, `20260529160000`) and the two Edge Functions
  (`generate-context-files`, `regenerate-context-doc`) apply/deploy OUT-OF-BAND post-merge — do NOT
  run `supabase db push`. This PR stacks on the Chunk 16 PR (#19); merge #19 first.
- `context_files_generation` is the single largest AI call in the product (seven docs in one pass).
  It runs on OpenAI `gpt-4o-mini`, whose output ceiling is 16384 tokens, so `maxOutputTokens` is set
  to that ceiling (the spec's suggested 32000 assumes a larger Anthropic model and is unreachable
  here); the prompt asks for ~200–700 words per doc to stay within budget. If a project's docs ever
  truncate, that ceiling — not the prompt — is the constraint to revisit (a stronger model or a
  multi-call split).
- Architecture is now fully editable end-to-end, mirroring the PRD editor (Chunk 14): per-section
  in-place edit, per-section regenerate (`regenerate-architecture-section`, `full_section` mode), and
  per-decision regenerate (`single_decision` mode) inside a decision-log management UI
  (add/remove/reorder/re-status/edit). Save goes through `save-architecture-content` →
  `update_project_architecture_content` (security invoker, bumps version, resets `is_final`), which
  re-renders markdown via `backend/_shared/markdown/architecture-markdown.ts` so `content` and
  `content_json` stay in sync. Shared edit utilities (`ProseEditor`, `StringListEditor`,
  `useDirtyGuard`, list-editor reorder buttons, `SHARED_EDIT_MESSAGES`) were lifted to
  `frontend/src/features/projects/_shared/edit/` and are reused by both the PRD and architecture
  editors — use them for any future structured-document editor. Per-decision regenerate updates the
  edit-mode draft (NOT auto-save) and only works on already-saved decisions, because the Edge Function
  looks the decision up by id in stored `content_json`; a freshly added decision must be saved before
  it can be regenerated. The generator (`generate-architecture`, live since Chunk 15) gates on an
  approved PRD (412 `PRD_NOT_APPROVED`), treats the brief as optional, and `approve_project_architecture`
  marks the doc final without advancing status. The overview's `useArchitectureState`/`useDecisionsState`
  read real data, and the Recent decisions "view all" link deep-links to `#decisions`. Backend gates
  are verified here only by static checks; exercising them needs a live Supabase project +
  `OPENAI_API_KEY`. The Chunk 16 migration and the two new Edge Functions apply/deploy out-of-band
  post-merge (do NOT `supabase db push`).
- Next is Chunk 18 — Chunk Generator, which owns the `planning -> ready_to_build` status transition.
  All four planning artifacts (brief, PRD, architecture, context files) are approved before it runs.
  Two generate-then-edit patterns now exist: (a) the brief/PRD/architecture pattern — a `generate-X`
  Edge Function (gated on the prior approved doc), dual storage in `project_documents`, a
  `save-X-content` + `regenerate-X-section` pair sharing one server-side markdown renderer, and the
  lifted `_shared/edit/` utilities; and (b) the lighter context-files pattern — markdown-only storage
  (no `content_json`, no renderer), direct `rpc` saves, and a regenerate function that returns content
  for the SPA to persist. Pick the pattern that matches whether the new artifact is structured
  (use a renderer) or markdown-native (skip it).
- The PRD is fully editable: per-section edit + per-section regenerate. Pattern: the SPA sends the
  full `content_json` to the `save-prd-content` Edge Function, which renders markdown via the
  deterministic template (`backend/_shared/markdown/prd-markdown.ts`) and calls the
  `update_project_prd_content` stored procedure. Per-section regenerate has its own Edge Function
  (`regenerate-prd-section`) returning just the section value; the SPA stitches and saves. Any edit
  or regenerate resets approval (the procedure sets `is_final = false`). Architecture (Chunk 15
  generator, Chunk 16 editor) follows the same generator-then-editor pattern with its own schemas.
  The `regenerate-X-section` split is canonical for any future per-section AI feature.
- Standards and workflow rules are documented. Read `03-code-standards.md` and
  `04-ai-workflow-rules.md` carefully — they govern every chunk from here on.
- Phase 1 is complete. Schema, RLS, authentication, and protected application chrome are in place.
  The dashboard is the first real RLS-backed content surface.
- The `handle_new_auth_user` trigger was verified in Chunk 05; the frontend must not insert into
  `public.users` after sign-up because Supabase does it automatically.
- Auth is wired. `useAuth()` is the standard way to get session/user. Do not duplicate auth logic —
  extend the existing context.
- App shell is the chrome: every authenticated page renders inside `<AppShell>`. Sidebar items are
  configured in `nav-config.ts`; activate an inert item by removing its `pendingChunk` field when
  the owning feature route is implemented.
- Dashboard reads `projects` directly from Supabase through the JS client; RLS scopes results. The
  dashboard nav item activates correctly through `nav-config.ts`.
- Card placeholders for chunks, completion, and issues stay in place until Chunks 18, 22, and 23
  land.
- Project creation works end-to-end. Submitting the new-project form lands on
  `/projects/{id}/clarify`, which is Chunk 09's responsibility.
- The shared `@shared/schemas/project.ts` Zod schema is established as the canonical pattern for
  frontend-to-backend shared resource validation schemas.
- The new-project persistence model is a project row at step 1, clarification answers held in
  component/route state in Chunk 09, and a persisted `project_brief` document written in Chunk 10.
- The first AI feature is live. Its canonical pattern is an authenticated Edge Function using
  `generate(...)`, the frontend `callEdgeFunction` helper, explicit pending/error/success UI, and
  Zod-validated input and output boundaries.
- The brief is the first persistent AI artifact. Pattern: structured + markdown dual storage in
  `project_documents`, upsert on regeneration with a version bump, and a transactional stored
  procedure (`approve_project_brief`) for state advancement, called directly from the SPA via
  `supabase.rpc`. PRD generation in Chunk 13/14 follows the same pattern but adds per-section
  regenerate. Project status now advances through approvals; the next stage is `'ready_to_build'`,
  owned by Chunk 18 (chunk generator).
- The generation metadata hook is marked `TODO(chunk-27)`; usage-log insertion remains owned by
  Chunk 27.
- Project subpages render inside `<ProjectLayout>` and read the project via `useProject()` (mirrors
  `useAuth()`); they never fetch the project themselves. Add a subpage by adding a child route under
  `/projects/:id` in `App.tsx` and a `PROJECT_NAV` entry (with `pendingChunk` until it lands). The
  default subroute is now `overview`. The sidebar reads the id from
  `useParams` (it lives in `AppShell`, outside the provider) — do not call `useProject()` there.
  Subpage mutations that change the project (e.g. brief approval) must invalidate
  `projectQueryKey(id)`.
- Architecture is locked. Read `02-architecture.md` and the SDK/HTTP-adapter known issue before
  implementing further backend integrations.
- Do not deviate from the stack without updating `decisions.md` first.
- Backend infra is in place. AI abstraction is wired but unused — first real consumer is Chunk 09.
  Provider mapping is set; revisit if costs or quality require swaps.
- Phase 2 is done. The overview page is the user's home base inside a project; most panels show
  empty states today. To activate a panel, replace its stub hook in
  `src/features/projects/overview/stubs/` with a real React Query call — the panel component does
  not change. The recommendation engine in `recommend-next-action.ts` walks a fixed milestone
  sequence; add a milestone by editing that file. Phase 3 begins with the PRD generator (Chunk 13),
  the first long-form structured document with a multi-section editor (Chunk 14).
- PRD generation works end-to-end: viewable, regeneratable, approvable, and gated on an approved
  brief (412 `BRIEF_NOT_APPROVED`). Per-section editing and per-section regeneration come in Chunk
  14 — that chunk extends `PrdView` (or an editable variant) and adds a `regenerate-prd-section`
  Edge Function that takes a section id; the persistence pattern is the same, the AI surface is
  per-section. PRD approval does not advance status; Chunk 18 owns `planning` -> `ready_to_build`.
  The PRD nav item is active and the overview's `usePrdState` is now a real query.
