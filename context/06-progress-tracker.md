# buildmap Progress Tracker

## Current Phase

Phase 1 — Database & Authentication

## Completed Chunks

- [x] Chunk 00 — Repository Structure & Architecture Lock-in
- [x] Chunk 01 — Frontend Scaffold
- [x] Chunk 02 — Backend Scaffold
- [x] Chunk 03 — Code Standards & AI Workflow Rules
- [x] Chunk 04 — Database Schema & Row-Level Security

## In Progress

None.

## Next Up

- [ ] Chunk 05 — Supabase Auth Integration on the Frontend

## Blocked

None.

## Recent Decisions

See `decisions.md`. The MVP schema uses UUID ownership, hard-delete content cascades with
retained/detached usage logs, text `CHECK` constraints, and same-project relation hardening.

## Known Issues

- `02-architecture.md` says AI providers use SDKs, while Chunk 02 implemented typed HTTP adapters
  after Supabase Edge runtime verification. Do not copy the SDK statement into implementation;
  reconcile the canonical architecture wording in an approved architecture update.
- Root `AGENTS.md` and `CLAUDE.md` remain minimal headings. `context/agents.md` now contains the
  operative master instructions for subsequent chunk prompts.
- The scaffold predates some standards: Chunk 06 should remove the root-element non-null
  assertion and add the application error boundary; a later API-design chunk must decide whether
  safe Zod issue details belong in validation responses.

## Notes for Next Agent

- Standards and workflow rules are documented. Read `03-code-standards.md` and
  `04-ai-workflow-rules.md` carefully — they govern every chunk from here on.
- Phase 0 is complete. Schema and RLS are in place. Phase 1 continues with Chunk 05 (Supabase
  Auth integration on the frontend).
- The `handle_new_auth_user` trigger means the frontend does NOT need to insert into
  `public.users` after sign-up — Supabase does it automatically. Verify this in Chunk 05.
- Architecture is locked. Read `02-architecture.md` and the SDK/HTTP-adapter known issue before
  implementing further backend integrations.
- Do not deviate from the stack without updating `decisions.md` first.
- Backend infra is in place. AI abstraction is wired but unused — first real consumer is Chunk 09. Provider mapping is set; revisit if costs or quality require swaps.
