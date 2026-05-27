# buildmap Progress Tracker

## Current Phase

Phase 1 — Database & Authentication

## Completed Chunks

- [x] Chunk 00 — Repository Structure & Architecture Lock-in
- [x] Chunk 01 — Frontend Scaffold
- [x] Chunk 02 — Backend Scaffold
- [x] Chunk 03 — Code Standards & AI Workflow Rules
- [x] Chunk 04 — Database Schema & Row-Level Security
- [x] Chunk 05 — Supabase Auth Integration on the Frontend

## In Progress

None.

## Next Up

- [ ] Chunk 06 — App Shell and Protected Navigation

## Blocked

None.

## Recent Decisions

See `decisions.md`. Frontend authentication now uses enforced email confirmation, exact
callback/confirmation redirect allow-lists, Supabase-managed browser sessions, and friendly
application-owned error messages.

## Known Issues

- `02-architecture.md` says AI providers use SDKs, while Chunk 02 implemented typed HTTP adapters
  after Supabase Edge runtime verification. Do not copy the SDK statement into implementation;
  reconcile the canonical architecture wording in an approved architecture update.
- Root `AGENTS.md` and `CLAUDE.md` remain minimal headings. `context/agents.md` now contains the
  operative master instructions for subsequent chunk prompts.
- The scaffold predates some standards: Chunk 06 should remove the root-element non-null
  assertion and add the application error boundary; a later API-design chunk must decide whether
  safe Zod issue details belong in validation responses.
- Google OAuth is implemented in the frontend but cannot be round-trip verified until real Google
  client credentials are configured in Supabase.
- The frontend production build succeeds but currently reports a bundle-size warning above 500 kB;
  evaluate route-based splitting once the app shell and feature routes are established.

## Notes for Next Agent

- Standards and workflow rules are documented. Read `03-code-standards.md` and
  `04-ai-workflow-rules.md` carefully — they govern every chunk from here on.
- Phase 0 is complete. Schema, RLS, and authentication are in place. Phase 1 continues with
  Chunk 06 (app shell and protected navigation).
- The `handle_new_auth_user` trigger was verified in Chunk 05; the frontend must not insert into
  `public.users` after sign-up because Supabase does it automatically.
- Auth is wired. `useAuth()` is the standard way to get session/user. The placeholder
  `/dashboard` route inside a `RequireAuth` wrapper exists in `App.tsx` — Chunk 06 will replace
  it with the real app shell. Do not duplicate auth logic — extend the existing context.
- Architecture is locked. Read `02-architecture.md` and the SDK/HTTP-adapter known issue before
  implementing further backend integrations.
- Do not deviate from the stack without updating `decisions.md` first.
- Backend infra is in place. AI abstraction is wired but unused — first real consumer is Chunk 09. Provider mapping is set; revisit if costs or quality require swaps.
