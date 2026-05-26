# buildmap Progress Tracker

## Current Phase

Phase 0 — Foundation & Standards (Complete)

Phase 1 begins with Chunk 04 — Database Schema & RLS.

## Completed Chunks

- [x] Chunk 00 — Repository Structure & Architecture Lock-in
- [x] Chunk 01 — Frontend Scaffold
- [x] Chunk 02 — Backend Scaffold
- [x] Chunk 03 — Code Standards & AI Workflow Rules

## In Progress

None.

## Next Up

- [ ] Chunk 04 — Database Schema & RLS

## Blocked

None.

## Recent Decisions

See `decisions.md`. Standards follow the verified typed HTTP provider adapters while the stale
SDK wording in `02-architecture.md` remains flagged for an architecture-owned correction.

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
- Phase 0 is complete; Phase 1 begins with Chunk 04 (database schema and RLS).
- Architecture is locked. Read `02-architecture.md` and the SDK/HTTP-adapter known issue before
  starting Chunk 04.
- Do not deviate from the stack without updating `decisions.md` first.
- Backend infra is in place. AI abstraction is wired but unused — first real consumer is Chunk 09. Provider mapping is set; revisit if costs or quality require swaps.
