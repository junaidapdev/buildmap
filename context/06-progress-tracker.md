# buildmap Progress Tracker

## Current Phase

Phase 3 — Planning Documents (In Progress). Phases 1–2 complete.

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

## In Progress

None.

## Next Up

- [ ] Chunk 16 — Architecture Editor

## Blocked

None.

## Recent Decisions

See `decisions.md`. The architecture generator is live: generated from the approved PRD (gated 412
`PRD_NOT_APPROVED`, brief optional), stored as a `project_documents` row of `type = 'architecture'`
with nine structured sections, including architectural decisions inline in `content_json.decisions`
(no separate table). Markdown is rendered server-side deterministically; the AI's `content_markdown`
is discarded. Approval (`approve_project_architecture`) marks the doc final without advancing status.
The architecture nav item is active and the overview's `useArchitectureState` and `useDecisionsState`
now read real data. Before this, the PRD became fully editable (per-section structured editing +
regenerate). All AI generation types use OpenAI (`gpt-4o-mini`) per the standing product-owner
override; the Anthropic adapter is dormant.

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
- The overview's Chunks, Open issues, and Recent decisions panels show empty states backed by stub
  hooks in `overview/stubs/`; they activate when Chunks 16/18/23 replace the stubs. The Export panel
  is a disabled shortcut until Chunk 25.
- The PRD's "Next: generate architecture" CTA and the next-action recommendations for architecture,
  context files, and chunks point at routes that 404 until their chunks land — expected.
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

## Notes for Next Agent

- Architecture generation works end-to-end. Decisions are part of `content_json.decisions`.
  Per-section editing and per-section regeneration come in Chunk 16, plus the dedicated decision log
  management UI (add/remove/edit individual decisions). Architecture nav item is active. The pattern
  from Chunk 14 (per-section editor + regen) applies here directly; the only new surface is the
  decision log. The generator (`generate-architecture`) gates on an approved PRD (412
  `PRD_NOT_APPROVED`) and treats the brief as optional context. Markdown is rendered server-side via
  `backend/_shared/markdown/architecture-markdown.ts`; the AI's `content_markdown` is discarded.
  `approve_project_architecture` (security invoker) marks the doc final without advancing status. The
  overview's `useArchitectureState` and `useDecisionsState` stubs were replaced with real queries
  reading the architecture document. Backend gates (migration apply, Edge Function behavior, stored
  procedure, end-to-end flow) are verified here only by static checks; exercising them needs a live
  Supabase project + `OPENAI_API_KEY`, and the migration still needs `supabase db push`.
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
