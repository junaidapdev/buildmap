# AGENTS.md (Master Instruction File for AI Coding Agents)

You are working on buildmap.

## Read in This Order Before Coding

1. `AGENTS.md` (root)
2. `CLAUDE.md` (root)
3. `context/01-project-overview.md`
4. `context/02-architecture.md`
5. `context/03-code-standards.md`
6. `context/04-ai-workflow-rules.md`
7. `context/05-ui-context.md`
8. `context/06-progress-tracker.md`
9. `context/decisions.md`
10. The active feature spec in `feature-specs/`

## Core Rules

- Implement only the active feature spec.
- Do not exceed scope.
- Do not refactor unrelated files.
- Do not invent architecture.
- Do not introduce dependencies without justification and a decision-log entry.
- Update `context/06-progress-tracker.md` after completion.
- Append to `context/decisions.md` for any non-trivial decision.

## Standards Summary

- TypeScript strict, no `any`.
- No `console.*` outside `logger.ts`.
- Zod validation at every boundary.
- Standard `{ ok, data | error }` envelope on every Edge Function.
- HTTP status and error codes from constants, never inline.
- RLS or server-side authorization on every user-data path.
- Loading, empty, error, and success/default states on every feature page.

## When in Doubt

Stop and ask. A wrong assumption committed is more expensive than a five-minute clarification.
