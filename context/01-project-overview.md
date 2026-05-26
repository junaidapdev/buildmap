# buildmap Project Overview

## What buildmap Is

buildmap is a project planning and memory workspace for AI-assisted software builders. It helps users move from raw ideas to PRDs, architecture docs, context files, shippable feature specs, coding-agent prompts, build tracking, issue prompts, knowledge insights, and exportable markdown packs.

## Who It's For

buildmap is for solo developers and small-team builders using Claude Code, Cursor, Codex, or similar AI coding tools who lose project context across multiple chats, notes, prompts, and half-finished planning documents.

## Core User Journey

1. User signs up.
2. User signs in with email/password or Google OAuth.
3. User lands on the dashboard.
4. User creates a new private project.
5. User enters a rough project idea.
6. buildmap asks clarifying questions.
7. User answers the questions and tightens the idea.
8. buildmap generates a project brief.
9. User reviews and edits the project brief.
10. buildmap generates a PRD.
11. User reviews and edits the PRD.
12. buildmap generates an architecture document.
13. User reviews and edits the architecture.
14. buildmap generates project context files.
15. buildmap breaks the work into shippable chunks.
16. User reviews chunks on the chunk board.
17. buildmap generates a feature spec for the selected chunk.
18. buildmap generates a Claude Code/Cursor/Codex-ready agent prompt.
19. User tracks progress, converts issues into corrective specs, and captures lessons from notes or transcripts.
20. User exports project pack and starts coding in Claude Code/Cursor.

## MVP Scope

- [ ] Auth - sign up, sign in, sign out, and protected app access.
- [ ] Dashboard - project list and entry point into the workspace.
- [ ] Project creation - create private projects from raw ideas.
- [ ] Idea clarifier - collect answers that improve generated planning docs.
- [ ] PRD generator/editor - generate, edit, and preserve product requirements.
- [ ] Architecture generator/editor - generate, edit, and preserve technical architecture.
- [ ] Context files generator - produce context files that coding agents can read.
- [ ] Shippable chunk generator - break projects into sequential build chunks.
- [ ] Chunk board - track chunks across build states.
- [ ] Feature spec generator - turn a chunk into an implementation-ready spec.
- [ ] Agent prompt generator - produce Claude Code/Cursor/Codex-ready prompts.
- [ ] Progress tracker - keep the project build state current.
- [ ] Issue-to-spec converter - turn bugs and review feedback into corrective specs.
- [ ] Knowledge/transcript ingestion - extract reusable engineering lessons from notes.
- [ ] Markdown/ZIP export - export project packs that travel outside the app.
- [ ] Usage logging - record generation and usage metadata for product limits.
- [ ] Basic rate limits - protect AI and backend endpoints from abuse.
- [ ] SPA deployment - deploy to Vercel or Netlify once the hosting decision is made in Chunk 31.

## Out of Scope (MVP)

Do not build unless explicitly requested:

- Team collaboration
- Payments
- GitHub integration
- Cursor extension
- Browser extension
- Real-time multiplayer
- Template marketplace
- Admin dashboard
- Enterprise roles
- Full RAG system
- Direct AI code execution inside the app

## Tech Stack at a Glance

See `context/02-architecture.md` for the canonical architecture. Short version:

- Repo: single repository with `frontend/` and `backend/`.
- Frontend: Vite, React, TypeScript strict mode, React Router, TanStack Query, Tailwind CSS, shadcn/ui.
- Backend: Supabase Postgres, Supabase Auth, Supabase Storage, Supabase Edge Functions on Deno.
- Database authorization: Postgres Row Level Security on every user-data table.
- Auth: Supabase Auth with email/password and Google OAuth.
- AI: OpenAI and Anthropic behind `generate(...)` exported from `backend/_shared/ai/index.ts`.
- Validation: Zod, with shared schemas in `backend/_shared/schemas/`.
- Deployment: SPA to Vercel or Netlify, Edge Functions and migrations to Supabase.

## Key Differentiators

- Continuity across the full lifecycle: idea -> PRD -> architecture -> context -> chunks -> specs -> prompts -> tracker -> issues -> export.
- Tool-agnostic outputs for Claude Code, Cursor, Codex, or a generic coding-agent workflow.
- Built-in issue-to-spec converter and knowledge-to-rules ingestion.
- Exportable markdown packs so the project can travel outside the app.
- Project memory is treated as the core product, not as a side effect of chat history.

## Where to Read Next

- `context/02-architecture.md` - canonical technical architecture.
- `context/03-code-standards.md` - coding, validation, logging, API, and dependency rules.
- `context/04-ai-workflow-rules.md` - rules for AI agents working on this repository.
- `context/05-ui-context.md` - visual and UX rules.
- `context/06-progress-tracker.md` - current build state.
- `feature-specs/` - active and upcoming implementation specs.
