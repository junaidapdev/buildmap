# buildmap Progress Tracker

## Current Phase

Phase 2 — Project Workspace (In Progress)

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

## In Progress

None.

## Next Up

- [ ] Chunk 12 — Project Overview

## Blocked

None.

## Recent Decisions

See `decisions.md`. Project subpages now render inside a nested `<ProjectLayout>` that fetches the
project once (UUID-validated), handles loading/error/not-found, and exposes it via `useProject()`;
subpages no longer fetch the project themselves, and mutations invalidate the layout's
`['project', id]` query. The brief remains the first persistent AI artifact, and all generation types
temporarily use OpenAI per a product-owner override of the Anthropic long-form default.

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
- Project subpages now render inside a nested `<ProjectLayout>`; the temporary `/projects/:id/*`
  stub from Chunk 06 is removed. The default subroute is `brief` until Chunk 12 switches it to
  `overview`.
- Dashboard project cards link to `/projects/{id}/overview`, which has no route yet and 404s
  (within the project layout) until Chunk 12 builds the overview page.
- Regenerating a brief runs without the original clarification answers, which are ephemeral, so it
  rebuilds from the project's basic details only. Persisting answers is a possible follow-up.
- Chunk 10's database and AI paths (migration apply, Edge Function behavior, stored-procedure
  approval, and the end-to-end brief flow) are verified here only by static gates; exercising them
  needs a live Supabase project and an `OPENAI_API_KEY` Edge Function secret.

## Notes for Next Agent

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
  default subroute is `brief`; Chunk 12 should switch it to `overview`. The sidebar reads the id from
  `useParams` (it lives in `AppShell`, outside the provider) — do not call `useProject()` there.
  Subpage mutations that change the project (e.g. brief approval) must invalidate
  `projectQueryKey(id)`.
- Architecture is locked. Read `02-architecture.md` and the SDK/HTTP-adapter known issue before
  implementing further backend integrations.
- Do not deviate from the stack without updating `decisions.md` first.
- Backend infra is in place. AI abstraction is wired but unused — first real consumer is Chunk 09.
  Provider mapping is set; revisit if costs or quality require swaps.
