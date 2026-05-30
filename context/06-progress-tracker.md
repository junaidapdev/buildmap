# buildmap Progress Tracker

## Current Phase

Phase 4 — Build (complete). Phases 1–3 complete. The chunk generator (Chunk 18) slices the approved
PRD + architecture into shippable chunks and advances the project from `planning` to `ready_to_build`
on first generation. The chunk board (Chunk 19) visualizes those chunks as a drag-and-drop Kanban
with a column per status and persists moves via the `move_chunk` stored procedure. Feature specs
(Chunk 20) and per-target agent prompts (Chunk 21) close the artifact loop: every chunk has a
seven-section spec and copy-pasteable prompts for Claude Code / Cursor / Generic. Chunk 22 closes
the workflow loop: `move_chunk` now advances `projects.status` forward atomically
(`ready_to_build` → `building` on the first `in_progress`; `building` → `completed` when every chunk
is `completed`), the SPA surfaces those advancements inline on the board, and the new Progress page
at `/projects/{id}/progress` shows live counts, per-status groups, recent activity, and a one-click
"Sync to markdown" that rewrites the Progress Tracker context file from live state. Next is
Phase 5, opening with Chunk 23 — the issue-to-spec converter.

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
- [x] Chunk 16 — Architecture Editor
- [x] Chunk 17 — Context Files Generator
- [x] Chunk 18 — Shippable Chunk Generator
- [x] Chunk 19 — Chunk Board (Kanban)
- [x] Chunk 20 — Feature Spec Generator
- [x] Chunk 21 — Coding-Agent Prompt Generator

## In Progress

None.

## Next Up

- [ ] Chunk 22 — Interactive Progress Tracker

## Blocked

None.

## Recent Decisions

See `decisions.md`. The chunk generator (Chunk 18) breaks the approved PRD + architecture into an
ordered set of shippable chunks in one AI call (`generate-chunks`), gated on the EXISTENCE (not
approval) of the PRD, architecture, and all seven context files (412 `PRD_NOT_FOUND` /
`ARCHITECTURE_NOT_FOUND` / `CONTEXT_FILES_MISSING`). Each chunk is a `feature_chunks` row: a stable
kebab-case `ref`, title, description, `included_features` (PRD feature ids), `dependencies` (refs of
sibling chunks), `estimated_effort`, status (always `backlog` on generation), and `position`. The
Chunk 04 placeholder table was aligned to this model in a migration (dropped `chunk_number`/`summary`/
`goal`, renamed `"order"`→`position`, `dependencies` jsonb→text[], added `description`/
`included_features`/`estimated_effort`/`version`/`ref`). Writes go through `replace_project_chunks`
(security invoker), which deletes-and-reinserts atomically — cascading to `feature_specs` — and
advances `projects.status` `planning`→`ready_to_build` ONLY on first generation, returning whether it
advanced. The six canonical chunk statuses from `05-ui-context.md` are kept (the spec's 4-status
proposal was NOT adopted; a canonical doc supersedes the spec). All AI generation still uses OpenAI
(`gpt-4o-mini`) per the standing override (the spec's Anthropic suggestion was NOT adopted); the
Anthropic adapter is dormant.

The seven canonical context files (project_overview, code_standards, ai_workflow_rules, ui_context,
agents_md, claude_md, progress_tracker) are now generated in a single AI call (gated 412
`ARCHITECTURE_NOT_APPROVED`), each persisted as its own `project_documents` row, and surfaced in one
tabbed view where each doc can be viewed, edited, regenerated, and approved independently. These docs
DIVERGE from the brief/PRD/architecture pattern: markdown is the source of truth, `content_json` stays
null, and there is NO server-side renderer — edits save the raw markdown directly via
`supabase.rpc('update_context_file_content', ...)`. Generated markdown is rendered with `react-markdown`
WITHOUT `rehype-raw`, so embedded HTML is escaped (XSS-safe). Chunk gating now waits for all seven
context files to be approved before recommending chunk generation.

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
- The overview's Recent decisions panel now reads real data from the architecture document (its
  `useDecisionsState` stub body was swapped in Chunk 15), and its "view all" link deep-links to the
  architecture decision log via `#decisions` (Chunk 16). The Chunks panel's `useChunksState` now reads
  real chunk data (Chunk 18), but `ChunksProgressPanel` still renders an empty body when chunks exist —
  its Total/Completed/In-progress display stays a `TODO(chunk-18+)`. Chunk 19 built the board but
  deliberately scoped itself to the board only (per its spec) and did NOT fill this panel; it remains an
  open follow-up (the data is already in `useChunksState`). The Open issues panel is still backed by a
  stub until Chunk 23. The Export panel is a disabled shortcut until Chunk 25.
- The chunks route is now live (Chunk 18), so no next-action recommendation points at an unbuilt route
  anymore. Note the divergence: the recommendation engine still gates "Generate chunks" on context
  files being APPROVED, while the chunks page itself gates only on context files EXISTENCE (per the
  locked "approval doesn't gate downstream" rule) — a user who skipped approving context files can
  still generate chunks from the page.
- The chunks page now renders the Chunk 19 Kanban board (the Chunk 18 list view was deleted). Each card's
  "Open" link points at `/projects/{id}/chunks/{chunkId}`, which has no route yet and resolves to the
  in-shell `NotFoundPage` catch-all until Chunk 20 adds the feature-spec route. This is expected, not a
  bug. The board reuses the four shared badge variants for status colors; the distinct per-status color
  tokens `05-ui-context.md` calls for are still not introduced in `tailwind.config.ts` (open follow-up).
- Chunk 19 live paths (the `move_chunk` and `reorder_chunks` stored procedures) are verified here only by
  static gates (backend `deno check`/`lint`/`fmt:check`, frontend `typecheck`/`lint`/`build`); exercising
  drag-and-drop persistence needs a live Supabase project. The two Chunk 19 migrations
  (`20260529190000_chunk_board_move_chunk.sql`, `20260529200000_chunk_board_reorder_chunks.sql`) apply
  out-of-band post-merge — do NOT run `supabase db push`. `reorder_chunks` has no frontend caller in the
  MVP; it is a backend primitive for a future bulk-column-reorder UI.
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
- Chunk 15/16 live paths (architecture generation, per-section regenerate, per-decision regenerate,
  save + server-side markdown render, `update_project_architecture_content` stored procedure) are
  likewise verified here only by static gates; exercising them needs a live Supabase project and an
  `OPENAI_API_KEY` secret. The Chunk 16 migration
  (`20260529130000_architecture_content_update_procedure.sql`) and the two new Edge Functions
  (`save-architecture-content`, `regenerate-architecture-section`) deploy out-of-band post-merge.
- Chunk 17 live paths (single-call generation of all seven context files, per-doc save, per-doc
  regenerate, and the `update_context_file_content`/`approve_context_file`/`upsert_context_files`
  stored procedures) are verified here only by static gates; exercising them needs a live Supabase
  project and an `OPENAI_API_KEY` secret. The three Chunk 17 migrations
  (`20260529140000_extend_project_documents_type_check.sql`,
  `20260529150000_context_file_update_and_approval_procedures.sql`,
  `20260529160000_upsert_context_files_procedure.sql`) and the two new Edge Functions
  (`generate-context-files`, `regenerate-context-doc`) apply/deploy out-of-band post-merge — do NOT
  run `supabase db push`.
- Chunk 18 live paths (chunk generation via `generate-chunks`, ref-uniqueness + dependency-resolvability
  validation, unresolvable `included_features` dropping, the `replace_project_chunks` stored procedure,
  `planning`→`ready_to_build` advancement, and the `feature_specs` cascade on regeneration) are verified
  here only by static gates (backend `deno check`/`lint`/`fmt:check`, frontend `typecheck`/`lint`/
  `build`); exercising them needs a live Supabase project and an `OPENAI_API_KEY` secret. The two Chunk
  18 migrations (`20260529170000_align_feature_chunks_for_generator.sql`,
  `20260529180000_replace_project_chunks_procedure.sql`) and the new Edge Function (`generate-chunks`)
  apply/deploy out-of-band post-merge — do NOT run `supabase db push`.
- `react-markdown` is configured WITHOUT `rehype-raw`, so any literal HTML an AI puts in a context
  file is shown as escaped text rather than rendered. This is the intended XSS-safe default; if a
  future doc genuinely needs sanitized inline HTML, add `rehype-sanitize` (never bare `rehype-raw`)
  and record it in `decisions.md` first.

## Notes for Next Agent

- Phase 4 is complete. The project status state machine is fully wired (Chunk 22). `move_chunk`
  (now redefined in `20260601100000_move_chunk_advance_project_status.sql`, same signature as the
  Chunk 19 version) advances `projects.status` forward in the same transaction as the chunk update:
  `ready_to_build` → `building` when any chunk reaches `in_progress`; `building` → `completed` when
  every chunk is `completed`. Forward-only — reopening a `completed` chunk does NOT reverse the
  project's status (that would require a manual settings action, out of scope). `paused` is
  manual-only; no chunk transition lands there. The SPA mirrors the rules in
  `predictProjectStatusAdvance` (pure helper at
  `frontend/src/features/projects/chunks/board/predictProjectStatusAdvance.ts`); `useMoveChunk`
  captures the pre-move project status from the React Query cache in `onMutate`, predicts the
  advancement locally, then surfaces it as a dismissible inline `<Alert>` on `<ChunkBoard>` after the
  server confirms (auto-dismiss after 6s; no toast library was added). `useMoveChunk` also
  invalidates `projectQueryKey(projectId)` and `projectsQueryKey` so the status badge on every
  surface updates. The whole progress feature lives in `frontend/src/features/projects/progress/`,
  with a new page at `/projects/{id}/progress` (sidebar item live; the `Progress` nav entry was
  added — the chunk spec wrongly described it as pre-existing). "Sync to markdown" rewrites the
  `progress_tracker` context-file row via the EXISTING `update_context_file_content` stored
  procedure (Chunk 17); no new Edge Function. Markdown is rendered deterministically by
  `renderProgressTrackerMarkdown` in `backend/_shared/markdown/progress-tracker-markdown.ts` (pure).
  The sync is one-way: the user can still edit the markdown manually via Chunk 17's editor, but Sync
  overwrites those edits — the confirm dialog warns about this. The recommendation engine in
  `recommend-next-action.ts` was NOT modified — its existing `first_chunk` / `continue` / `done`
  clauses already cover the Phase 4 cases the chunk spec asked for; pointing `done` at the not-yet-
  built export route would have produced dead UX.
- Coding-agent prompts are generated, copyable, and regeneratable per target (Chunk 21). The chunk
  detail page's Prompt tab is now live; the tab state in `ChunkDetailPage` was lifted from
  uncontrolled (`defaultValue="spec"`) to controlled (`value`/`onValueChange`) so the Prompt tab's
  SpecRequired state can deep-link back to the Spec tab via `onOpenSpec`. The whole feature lives in
  `frontend/src/features/projects/feature-specs/prompt/`. Prompts are stored in a NEW
  `coding_agent_prompts` table — N:1 with chunks (one row per target_agent value), not in
  `project_documents` or `feature_specs`. The table FKs to `feature_chunks(id) ON DELETE CASCADE`, has
  a unique `(chunk_id, target_agent)`, RLS via the chunk -> project chain (four separate policies),
  and the standard `set_updated_at` trigger. The Chunk 04 `feature_specs.agent_prompts jsonb` column
  is left unused on purpose — superseded by the new table; leaving it costs nothing and avoids a
  destructive migration. Three target agents in MVP: `claude_code`, `cursor`, `generic`; extending is
  a one-line change in the schema enum, the CHECK constraint, and the procedure whitelist. Prompt
  body is template + AI-framing + spec verbatim — the AI generates only `role_intro`, `how_to_work`,
  `philosophy`, and `agent_specific_notes` (small surface, low cost); `assembleAgentPrompt` in
  `_shared/markdown/agent-prompt-markdown.ts` deterministically stitches the spec sections in
  verbatim. The Edge Function `generate-agent-prompt` gates on the spec existing (412
  `FEATURE_SPEC_NOT_FOUND`) and writes via `upsert_agent_prompt` (security invoker, returns the full
  row jsonb so the SPA's strict `AgentPromptRowSchema` re-validation passes). No approval semantics on
  prompts (no `is_final`) — if a prompt doesn't work, regenerate. Three Chunk 21 artifacts apply
  out-of-band post-merge: `20260531100000_create_coding_agent_prompts.sql`,
  `20260531110000_upsert_agent_prompt_procedure.sql`, and the `generate-agent-prompt` Edge Function
  (already declared in `config.toml` with `verify_jwt = false` so the CORS preflight isn't blocked).
- Chunk 22 (Interactive Progress Tracker) is next: it closes the workflow loop by wiring chunk
  status transitions to project status advancement (`ready_to_build` -> `building` on first
  in_progress; -> `completed` when all chunks reach completed) and by syncing chunk progress into the
  Progress Tracker context file (`type = 'progress_tracker'`). Wrap `move_chunk` (Chunk 19) with the
  advancement logic — do NOT re-implement the move itself.
- Feature specs are generated and editable per section (Chunk 20). The chunk detail page lives at
  `/projects/{id}/chunks/{chunkId}` (the board's "Open" link now works) and has three tabs: Spec,
  Prompt, Notes. The Prompt tab is a placeholder until Chunk 21; the Notes tab is a placeholder for a
  future update. The whole feature is in `frontend/src/features/projects/feature-specs/`. The spec
  `content_json` is SEVEN markdown-string sections (goal, scope, out_of_scope, technical_requirements,
  ui_requirements, security_requirements, acceptance_criteria) — flat strings, NOT the deeply
  structured fields of the PRD/architecture, because spec content is dense prose. Per-section edit is a
  single textarea (mirrors the Chunk 17 context-file editor, NOT Chunk 14's structured editors); per-
  section regenerate returns new markdown for one section (with an optional user instruction), and the
  SPA stitches and saves the full `content_json`. Server renders combined markdown deterministically
  from `content_json` via `feature-spec-markdown.ts` (the AI's content_markdown is discarded). Specs
  gate on PRD + architecture EXISTENCE (412 PRD_NOT_FOUND / ARCHITECTURE_NOT_FOUND), auto-generate on
  first visit, and do NOT advance project status (Chunk 22 owns that). Approval is per-spec and
  optional (`is_final`). The `feature_specs` table was realigned from the Chunk 04 placeholder (added
  `title`, `content_json`, `is_final`; the existing composite FK, unique `chunk_id`, and RLS were
  reused). Three Edge Functions back it: `generate-feature-spec`, `regenerate-feature-spec-section`,
  `save-feature-spec-content`; two stored procedures: `update_feature_spec_content`,
  `approve_feature_spec`. The `feature_specs.agent_prompts` jsonb column is reserved for Chunk 21.
- Chunk 21 (Agent Prompt Generator) is next: it replaces the `PromptTab` placeholder body with a
  copy-paste, agent-ready prompt built by wrapping the (now-existing) feature spec. The spec is the
  source of truth; the prompt wraps it. Chunk 22 owns chunk status transitions and the next project
  status advancement (`ready_to_build`->`building`->`completed`) — wrap `move_chunk`, do not
  re-implement it. Backend live paths (the two procedures + three Edge Functions) are verified here
  only by static gates; exercising them needs a live Supabase project + `OPENAI_API_KEY`. The two
  Chunk 20 migrations (`20260530100000_align_feature_specs_for_generator.sql`,
  `20260530110000_feature_spec_content_and_approval_procedures.sql`) and the three Edge Functions
  apply/deploy OUT-OF-BAND post-merge — do NOT run `supabase db push`.
- The chunk board (Chunk 19) is the live chunks surface. It is a `@dnd-kit` Kanban with a column per
  canonical status (`backlog`/`ready`/`in_progress`/`needs_review`/`completed`/`blocked`, fixed order in
  `board/columns.ts`). All board code is in `frontend/src/features/projects/chunks/board/`;
  `ChunkBoard` (DnD context + column layout + drag overlay), `ChunkColumn` (droppable), `ChunkCard`
  (sortable, with a dedicated drag handle so the inline status `<Select>` and "Open" link stay
  clickable/keyboard-operable), `ChunkCardCompact` (pure presentation, reused by the drag overlay), and
  `useMoveChunk` (the optimistic mutation). A move — drag OR the inline status select — calls the
  `move_chunk(p_chunk_id, p_new_status, p_new_position)` stored procedure directly via `supabase.rpc`
  (NOT an Edge Function; moves are non-AI). Position is GLOBAL within the project (not per-column);
  `move_chunk` renumbers every chunk to `0..N-1` after each move, and `applyMoveLocally` mirrors that
  exactly for the optimistic cache write. The board shows feature/dependency COUNTS, not names — full
  detail belongs on the Chunk 20 page. `reorder_chunks` exists as a backend primitive but has no caller
  yet (do not add a `useReorderChunks` hook until a bulk-reorder UI needs it). The Chunk 18 list view
  (`ChunksListView.tsx`, `ChunkListItem.tsx`) was deleted.
- Chunk 20 (Feature Specs) is next, and it owns the `/projects/{id}/chunks/{chunkId}` route the board's
  "Open" link already points at (it 404s in-shell until then). A feature spec is 1:1 with a chunk (the
  `feature_specs.chunk_id` unique FK, `on delete cascade`). Chunk 22 owns chunk status transitions and
  the next project status advancement (`ready_to_build`->`building`->`completed`) — it should WRAP
  `move_chunk` with that logic rather than re-implementing the move; `move_chunk` deliberately does NOT
  touch project status. Two board-adjacent follow-ups stayed out of Chunk 19's scope and are still open:
  filling `ChunksProgressPanel`'s Total/Completed/In-progress body (data is in `useChunksState`) and
  adding per-status color tokens to `tailwind.config.ts` (the board reuses the four shared badge
  variants). The four shared-edit utilities and the generate-then-edit document pattern do NOT apply to
  chunks (chunks are DB rows, not a versioned markdown document).
- Chunks generation works end-to-end (Chunk 18). `generate-chunks` gates on the EXISTENCE of the PRD,
  architecture, and all seven context files (not approval), runs one AI call, validates ref uniqueness
  and dependency resolvability (502 on violation) and drops unresolvable `included_features` (warn),
  then persists via `replace_project_chunks`. Project status advances `planning`→`ready_to_build` on
  FIRST generation only; the procedure returns that boolean and the SPA surfaces it once via an inline
  `Alert`. Bulk regeneration deletes existing chunks AND their feature specs (FK cascade) and does NOT
  re-advance status. Each chunk has a stable kebab-case `ref` (AI-assigned); `dependencies` are stored
  as refs (the SPA resolves them to rows by `(project_id, ref)`), and `included_features` are PRD
  feature ids (the SPA resolves them to names via `useExistingPrd`). The whole feature lives in
  `frontend/src/features/projects/chunks/`. The `feature_chunks` table was realigned from the Chunk 04
  placeholder — see `decisions.md`.
- Phase 3 (Planning Documents) is complete. The seven canonical context files
  (project_overview, code_standards, ai_workflow_rules, ui_context, agents_md, claude_md,
  progress_tracker) are generated in ONE AI call by `generate-context-files`, which gates on an
  approved architecture (412 `ARCHITECTURE_NOT_APPROVED`), calls the `upsert_context_files` stored
  procedure to write all seven `project_documents` rows in one transaction, and returns
  `{ generated: true }` (it does not return the docs — the SPA refetches). The whole feature lives in
  `frontend/src/features/projects/context-files/`; `doc-config.ts` holds the canonical order, labels,
  and on-disk filenames (`CONTEXT_DOC_ORDER`, `CONTEXT_DOC_TOTAL = 7`) and is the single source for
  the tab order — add or reorder docs there, not in the components.
- Context files DIVERGE from the brief/PRD/architecture pattern — do NOT copy those conventions
  blindly. Markdown is the source of truth, `content_json` stays NULL, and there is NO server-side
  renderer. A per-doc edit saves the raw markdown straight to the DB via
  `supabase.rpc('update_context_file_content', ...)` (no Edge Function, no markdown rebuild). Approval
  is `supabase.rpc('approve_context_file', ...)`. Both are security-invoker, ownership-checked, and
  whitelist the seven types. Any edit, regenerate, or save bumps `version` and resets `is_final`
  (un-approves), exactly like the other docs.
- Per-doc regenerate is special: `regenerate-context-doc` is the ONE Edge Function in this feature
  that does NOT write — it returns `{ type, content }` only, and `useRegenerateContextDoc` then
  persists that content through `update_context_file_content` in the same mutation (two awaited steps,
  one pending state). The function validates that the echoed `type` matches the request (502 on
  mismatch). It accepts an optional `userInstruction` nudge. "Regenerate all" reuses
  `generate-context-files` (a full re-generation of the set), guarded by an `AlertDialog`.
- Rendering: context-file markdown is shown with `react-markdown` and `@tailwindcss/typography`
  (`prose prose-sm dark:prose-invert`) and deliberately WITHOUT `rehype-raw`, so any literal HTML the
  AI emits is escaped, not executed. This is the canonical XSS-safe markdown renderer for the app —
  reuse it for any future AI-authored markdown surface, and never add bare `rehype-raw` (use
  `rehype-sanitize` if inline HTML is ever truly required, and record it in `decisions.md` first).
- One fetch backs all seven panels: `useAllContextFiles` fetches every context row once (keyed
  `['context-files', projectId]`), and `useContextFile(projectId, type)` selects one doc from that
  cache. The tabbed UI is a controlled Radix `Tabs`; switching tabs while a doc is dirty pops a
  confirm dialog (`useDirtyGuard` also warns on browser unload, the same `beforeunload`-only
  limitation as the PRD/architecture editors — `useBlocker` still needs a data router).
- The overview recommendation engine now gates chunk generation on ALL SEVEN context files being
  approved: `recommend-next-action.ts` has a `contextFilesApproved` input and a `context_files_approve`
  action between `context_files_generate` and `chunks_generate`. The overview's `useContextFilesState`
  stub is now a real query delegating to `useAllContextFiles` (its `{ data }` shape is unchanged; the
  exported type was renamed `ContextFilesOverviewState` to avoid colliding with the feature's
  `ContextFilesState`).
- Backend live paths are verified here only by static gates; exercising them needs a live Supabase
  project + `OPENAI_API_KEY`. The three Chunk 17 migrations
  (`20260529140000`, `20260529150000`, `20260529160000`) and the two Edge Functions
  (`generate-context-files`, `regenerate-context-doc`) apply/deploy OUT-OF-BAND post-merge — do NOT
  run `supabase db push`. This PR stacks on the Chunk 16 PR (#19); merge #19 first.
- `context_files_generation` is the single largest AI call in the product (seven docs in one pass).
  It runs on OpenAI `gpt-4o-mini`, whose output ceiling is 16384 tokens, so `maxOutputTokens` is set
  to that ceiling (the spec's suggested 32000 assumes a larger Anthropic model and is unreachable
  here); the prompt asks for ~200–700 words per doc to stay within budget. If a project's docs ever
  truncate, that ceiling — not the prompt — is the constraint to revisit (a stronger model or a
  multi-call split).
- Architecture is now fully editable end-to-end, mirroring the PRD editor (Chunk 14): per-section
  in-place edit, per-section regenerate (`regenerate-architecture-section`, `full_section` mode), and
  per-decision regenerate (`single_decision` mode) inside a decision-log management UI
  (add/remove/reorder/re-status/edit). Save goes through `save-architecture-content` →
  `update_project_architecture_content` (security invoker, bumps version, resets `is_final`), which
  re-renders markdown via `backend/_shared/markdown/architecture-markdown.ts` so `content` and
  `content_json` stay in sync. Shared edit utilities (`ProseEditor`, `StringListEditor`,
  `useDirtyGuard`, list-editor reorder buttons, `SHARED_EDIT_MESSAGES`) were lifted to
  `frontend/src/features/projects/_shared/edit/` and are reused by both the PRD and architecture
  editors — use them for any future structured-document editor. Per-decision regenerate updates the
  edit-mode draft (NOT auto-save) and only works on already-saved decisions, because the Edge Function
  looks the decision up by id in stored `content_json`; a freshly added decision must be saved before
  it can be regenerated. The generator (`generate-architecture`, live since Chunk 15) gates on an
  approved PRD (412 `PRD_NOT_APPROVED`), treats the brief as optional, and `approve_project_architecture`
  marks the doc final without advancing status. The overview's `useArchitectureState`/`useDecisionsState`
  read real data, and the Recent decisions "view all" link deep-links to `#decisions`. Backend gates
  are verified here only by static checks; exercising them needs a live Supabase project +
  `OPENAI_API_KEY`. The Chunk 16 migration and the two new Edge Functions apply/deploy out-of-band
  post-merge (do NOT `supabase db push`).
- Next is Chunk 18 — Chunk Generator, which owns the `planning -> ready_to_build` status transition.
  All four planning artifacts (brief, PRD, architecture, context files) are approved before it runs.
  Two generate-then-edit patterns now exist: (a) the brief/PRD/architecture pattern — a `generate-X`
  Edge Function (gated on the prior approved doc), dual storage in `project_documents`, a
  `save-X-content` + `regenerate-X-section` pair sharing one server-side markdown renderer, and the
  lifted `_shared/edit/` utilities; and (b) the lighter context-files pattern — markdown-only storage
  (no `content_json`, no renderer), direct `rpc` saves, and a regenerate function that returns content
  for the SPA to persist. Pick the pattern that matches whether the new artifact is structured
  (use a renderer) or markdown-native (skip it).
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
