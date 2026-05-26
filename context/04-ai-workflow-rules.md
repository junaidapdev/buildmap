# buildmap AI Workflow Rules

These rules apply to any AI coding agent working in this repository. The root `AGENTS.md`
currently contains only a heading; Chunk 03 establishes the operative reading order here and in
`context/agents.md`.

## Required Reading Order

Read these files before writing code, in this order:

1. `AGENTS.md` at the repository root.
2. `CLAUDE.md` at the repository root.
3. `context/01-project-overview.md`.
4. `context/02-architecture.md`.
5. `context/03-code-standards.md`.
6. `context/04-ai-workflow-rules.md`.
7. `context/05-ui-context.md`.
8. `context/06-progress-tracker.md`.
9. `context/decisions.md`.
10. The active feature spec in `feature-specs/`, or the product-owner-provided active chunk
    prompt when no tracked spec exists yet.

Before writing code, inspect the modules the active chunk extends so that new work follows
implemented patterns rather than assumptions.

## One Feature at a Time

- Implement only the active feature spec.
- Do not refactor unrelated areas.
- Do not invent new architecture.
- Do not add features that were not requested.
- Do not silently change patterns established in earlier chunks.
- Use the current product name, `buildmap`; do not reintroduce the retired name into project
  documents or UI.

## Stop and Ask

Stop and ask the product owner instead of proceeding when:

- The feature spec conflicts with `context/02-architecture.md`.
- The feature spec conflicts with `context/03-code-standards.md`.
- An external dependency, model identifier, or API required by the spec is unavailable,
  deprecated, or incompatible with its target runtime.
- A security implication is not addressed by the spec.
- A required input or constant is undefined.

If implementation reality already conflicts with an older document, state the conflict, follow
the recorded decision or obtain direction, and never conceal it by copying stale text forward.

## Update the Progress Tracker

After completing a chunk, update `context/06-progress-tracker.md`:

- Move the completed chunk into **Completed Chunks**.
- Set **Next Up** to the next defined chunk only.
- Note open risks, known discrepancies, and follow-ups.
- Add concise instructions useful to the next agent.

## Update the Decision Log

Append to `context/decisions.md` before a chunk is considered complete when you:

- Substitute one library, model, or version for another.
- Fall back from an SDK to direct HTTP calls.
- Choose among multiple genuinely acceptable approaches where the spec is ambiguous.
- Defer an acceptance criterion to a later chunk, stating the reason and owning chunk.
- Establish a non-obvious security or deployment constraint.

## Self-Review Before Marking Complete

Before claiming an implementation chunk is complete, verify all applicable items:

- All acceptance criteria in the active spec are accounted for.
- Frontend changes pass `npm run typecheck`, `npm run lint`, and `npm run build` from
  `frontend/`.
- Backend changes pass `deno task check`, `deno task lint`, and `deno task fmt:check` from
  `backend/`.
- No `console.*` calls exist outside logger modules.
- No explicit `any` exists in committed TypeScript.
- No secrets are committed.
- Any new UI explicitly handles **Loading**, **Empty**, **Error**, and
  **Success / Default** states.
- Any new user-data path requires authentication and server-side authorization through RLS or an
  approved backend boundary.
- Any structured AI output is treated as untrusted until Zod-validated.
- The progress tracker and decision log have been updated where required.
- The final summary identifies files changed, checks run, risks, follow-ups, and any unmet
  criteria.

For documentation-only chunks, verify document consistency and confirm no code or dependency
files changed instead of running unrelated builds without cause.

## Anti-Patterns Forbidden

- Vibe coding: implementing from a vague request without an active spec or clarified scope.
- Scope creep: adding work adjacent to, but outside, the active feature.
- Silent refactoring of unrelated files.
- Magic numbers or magic strings in feature code.
- Catch-and-swallow error handling.
- Disabling lint rules simply to pass checks.
- Using `any` to bypass TypeScript safety.
- Calling `console.log` or other direct console methods instead of the logger.
- Using the service role key for user-data queries.
- Trusting AI output before Zod validation.
- Logging sensitive data or committing secrets.
