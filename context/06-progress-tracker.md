# buildmap Progress Tracker

## Current Phase

Phase 1 — Database & Authentication (Complete)

## Completed Chunks

- [x] Chunk 00 — Repository Structure & Architecture Lock-in
- [x] Chunk 01 — Frontend Scaffold
- [x] Chunk 02 — Backend Scaffold
- [x] Chunk 03 — Code Standards & AI Workflow Rules
- [x] Chunk 04 — Database Schema & Row-Level Security
- [x] Chunk 05 — Supabase Auth Integration on the Frontend
- [x] Chunk 06 — App Shell & Protected Routing

## In Progress

None.

## Next Up

- [ ] Chunk 07 — Dashboard Project List

## Blocked

None.

## Recent Decisions

See `decisions.md`. Authenticated pages now share a responsive `AppShell`; sidebar activation is
centralized in `nav-config.ts`; and render failures are handled by a privacy-limited global error
boundary.

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

## Notes for Next Agent

- Standards and workflow rules are documented. Read `03-code-standards.md` and
  `04-ai-workflow-rules.md` carefully — they govern every chunk from here on.
- Phase 1 is complete. Schema, RLS, authentication, and protected application chrome are in
  place. Chunk 07 replaces the dashboard placeholder with the real project list.
- The `handle_new_auth_user` trigger was verified in Chunk 05; the frontend must not insert into
  `public.users` after sign-up because Supabase does it automatically.
- Auth is wired. `useAuth()` is the standard way to get session/user. Do not duplicate auth
  logic — extend the existing context.
- App shell is the chrome: every authenticated page renders inside `<AppShell>`. Sidebar items
  are configured in `nav-config.ts`; activate an inert item by removing its `pendingChunk` field
  when the owning feature route is implemented.
- The dashboard placeholder becomes the real project list in Chunk 07. The project-mode sidebar
  stub at `/projects/:id/*` is temporary until Chunk 11, which also replaces the breadcrumb id
  placeholder with a fetched project name.
- Architecture is locked. Read `02-architecture.md` and the SDK/HTTP-adapter known issue before
  implementing further backend integrations.
- Do not deviate from the stack without updating `decisions.md` first.
- Backend infra is in place. AI abstraction is wired but unused — first real consumer is Chunk 09. Provider mapping is set; revisit if costs or quality require swaps.
