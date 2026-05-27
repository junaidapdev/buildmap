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

## In Progress

None.

## Next Up

- [ ] Chunk 08 — New Project Flow

## Blocked

None.

## Recent Decisions

See `decisions.md`. The dashboard now reads RLS-scoped projects directly through Supabase, sorts
by recent activity, uses deliberate metric placeholders, and clears cached server state on sign
out.

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

## Notes for Next Agent

- Standards and workflow rules are documented. Read `03-code-standards.md` and
  `04-ai-workflow-rules.md` carefully — they govern every chunk from here on.
- Phase 1 is complete. Schema, RLS, authentication, and protected application chrome are in
  place. The dashboard is the first real RLS-backed content surface.
- The `handle_new_auth_user` trigger was verified in Chunk 05; the frontend must not insert into
  `public.users` after sign-up because Supabase does it automatically.
- Auth is wired. `useAuth()` is the standard way to get session/user. Do not duplicate auth
  logic — extend the existing context.
- App shell is the chrome: every authenticated page renders inside `<AppShell>`. Sidebar items
  are configured in `nav-config.ts`; activate an inert item by removing its `pendingChunk` field
  when the owning feature route is implemented.
- Dashboard reads `projects` directly from Supabase through the JS client; RLS scopes results.
  The dashboard nav item activates correctly through `nav-config.ts`.
- Card placeholders for chunks, completion, and issues stay in place until Chunks 18, 22, and 23
  land. The `/projects/new` destination is Chunk 08's responsibility.
- The project-mode sidebar stub at `/projects/:id/*` is temporary until Chunk 11, which also
  replaces the breadcrumb id placeholder with a fetched project name.
- Architecture is locked. Read `02-architecture.md` and the SDK/HTTP-adapter known issue before
  implementing further backend integrations.
- Do not deviate from the stack without updating `decisions.md` first.
- Backend infra is in place. AI abstraction is wired but unused — first real consumer is Chunk 09. Provider mapping is set; revisit if costs or quality require swaps.
