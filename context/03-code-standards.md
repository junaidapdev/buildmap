# buildmap Code Standards

These rules govern implementation after the initial scaffold. They reflect the code currently
present in `frontend/` and `backend/`; where a requested convention is not yet implemented or
enforced, that gap is stated explicitly rather than presented as completed work.

## TypeScript Standards

- Strict mode is non-negotiable. The frontend enforces it through `frontend/tsconfig.json`; the
  backend is checked through `deno task check`.
- `any` is forbidden. Use `unknown` and narrow it with type guards or Zod parsing. Frontend ESLint
  enforces `@typescript-eslint/no-explicit-any: error`; backend Deno lint includes
  `no-explicit-any`.
- Prefer `type` for new object shapes unless an extendable public contract benefits from
  `interface`. The existing backend AI and auth scaffold uses interfaces for exported contracts and
  is not refactored in this documentation chunk.
- Use `as const` for literal lookup tables, as established by routes, error codes, HTTP statuses,
  and loggers.
- Avoid non-null assertions (`!`); narrow with conditionals or Zod instead. The Vite bootstrap
  currently contains one pre-existing root-element assertion in `frontend/src/main.tsx`; remove it
  when the app shell is revisited in Chunk 06.
- Avoid `@ts-ignore` and `@ts-expect-error`. An unavoidable suppression must include a one-line
  reason and pass the configured linter.
- Use discriminated unions for state with mutually exclusive shapes, for example
  `{ status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: Data }`.

## React / Frontend Component Standards

- Use functional components only.
- Use one exported component per component file and name it after the file. The current scaffold
  uses named exports (`App`, `HomePage`, and `Button`), so new frontend code follows named exports
  unless a later decision changes that convention.
- Co-locate component-specific types in the component file unless they are reused.
- Hook names start with `use`. Shared hooks live in `frontend/src/hooks/`; feature-specific hooks
  may live beside the feature using them.
- Avoid prop drilling more than two levels; use an appropriate context or React Query-managed server
  state instead.
- Put side effects in `useEffect`, never in render. Do not fetch server state directly in
  `useEffect`; use TanStack Query.
- Forms use Zod and reuse schemas from `backend/_shared/schemas/` once resource schemas exist. A
  frontend form and its Edge Function must not maintain separate versions of the same validation.
- Every major page or component explicitly handles four states: **Loading** (skeleton or spinner),
  **Empty** (description and a clear next action), **Error** (friendly message and recovery when
  relevant), and **Success / Default** (the actual content). The current scaffold home page is a
  static verification page; feature pages must satisfy this rule when introduced.
- **Layout-level data fetching.** When multiple subpages share a parent resource (for example, every
  `/projects/:id/*` page shares the project), fetch it once at the layout level and provide it through
  React context (the `useProject()` pattern). Subpages must not duplicate the fetch, and a mutation
  that changes the parent invalidates the parent query at the layout level.
- **Stub hook pattern.** When a screen needs data from a feature that is not built yet, add a stub
  hook (for example `src/features/projects/overview/stubs/useChunksState.ts`) that returns the
  empty/initial shape synchronously. The screen consumes the stub. When the feature lands in a later
  chunk, only the stub's body is replaced with a real query — the screen does not change. Mark every
  stub with a `// TODO(chunk-N)` comment.
- **Rendering AI-authored or user-authored Markdown.** Render untrusted Markdown with `react-markdown`
  using its safe defaults and **never** add `rehype-raw` — that plugin renders embedded raw HTML and
  reintroduces an XSS vector for model- or user-supplied content. This is the canonical Markdown
  renderer for the app (established by the Chunk 17 context files: `react-markdown` inside a
  `prose prose-sm max-w-none dark:prose-invert` container from `@tailwindcss/typography`). If a surface
  ever genuinely needs inline HTML, add `rehype-sanitize` (an allowlist sanitizer), never bare
  `rehype-raw`, and record the exception in `context/decisions.md` first. Documents that are Markdown
  natively (context files) store the Markdown as the source of truth with no `content_json` and no
  server-side renderer; structured documents (brief, PRD, architecture) keep `content_json` plus a
  deterministic server-side renderer instead — choose by whether the artifact is structured or
  Markdown-native.

## Backend / Edge Function Standards

- Every Edge Function is a single `index.ts` under `backend/functions/<function-name>/`, with any
  function-local Deno configuration beside it when runtime imports require it.
- Every Edge Function handles CORS preflight through `_shared/http/cors.ts`.
- Every request body, parameter set, or AI/provider response that crosses a boundary is validated
  with Zod. A payload-free public health read has no input body to validate.
- Every user-data path authenticates through `verifyAuth` or `requireAuth` from
  `_shared/auth/verify.ts`. The public `GET /health` readiness endpoint is the explicit
  infrastructure exception; disabled `ai-test` returns its feature-gate response before access to
  data or providers.
- Return the standard envelope using `ok`, `created`, and `fail` from `_shared/http/response.ts`.
- Use HTTP status constants from `_shared/constants/http.ts`; do not use magic HTTP numbers in
  function code.
- Use error codes and generic backend error messages from `_shared/constants/errors.ts`; do not
  introduce endpoint-specific magic error strings.
- Wrap handlers in a top-level `try/catch` and map caught errors to standard envelopes without
  exposing internal details.
- Log only through `_shared/logger.ts`. Never call `console.*` from function or shared runtime code,
  and never log sensitive data.
- Queries for user data use the user's JWT-scoped Supabase client and RLS. The service role key is
  never used for user-data queries. A future system-level use, such as controlled usage logging or
  cleanup, must include an inline comment explaining why elevated access is required.
- Multi-row writes use a Postgres transaction or an atomic `supabase.rpc` stored procedure. No
  data-writing feature exists yet; this requirement applies beginning with the schema and feature
  chunks.
- **AI feature error handling.** Edge Functions that call `generate(...)` handle `AiProviderError`
  and `AiInvalidOutputError` distinctly, returning HTTP `502` with the corresponding shared error
  code. Frontend AI features surface these failures as a retryable error state and never silently
  fall back.
- **Generation logging.** Every AI Edge Function must write a telemetry record to `generation_logs`
  via the `logGeneration` helper. The write must cover both the success path and the AI error paths
  (`AiProviderError` and `AiInvalidOutputError`), while validation and auth failures are deliberately
  excluded. The `logGeneration` helper handles its own internal errors so telemetry issues never
  fail the user-facing generation. Log payloads must never include user-provided prompts or
  AI-generated body text.

## REST Conventions

- Conceptual resource paths are plural nouns, such as `/projects` and `/projects/:id/chunks`.
  Supabase Edge Function URLs are flat, so a function such as `projects-list` represents
  `GET /projects`; describe this mapping in that function's header comment or local documentation.
- Use `GET` for reads, `POST` for creates, `PATCH` for partial updates, `PUT` only for genuine
  replacements, and `DELETE` for deletes.
- Use `200` for successful reads or updates and `201` for creates. Use `400`, `401`, `403`, `404`,
  `422`, `429`, and `500` appropriately, with additional configured constants such as `405` and
  `503` for method and service/gate responses.
- Every current endpoint returns the standard envelope. A future `204 No Content` deletion
  convention must be decided before implementation because a `204` response cannot contain the JSON
  envelope.

## Validation Standards

- Zod is the only validation library.
- Shared resource schemas belong in `backend/_shared/schemas/<resource>.ts`.
- Export both the Zod schema and the inferred input type, for example `ProjectCreateSchema` and
  `ProjectCreateInput`.
- **Cross-folder imports via `@shared`.** The frontend imports from `backend/_shared/` through the
  `@shared` Vite/TypeScript alias. Allowed paths: `schemas/*` (Zod schemas and inferred types),
  `markdown/*` (shared render helpers where applicable), and `export/*` (filename helpers and export
  templates shared with Edge Functions). This is the only sanctioned cross-folder import. Other
  runtime code, helpers, or types must not be imported across the boundary.
- Backend functions validate input at the request boundary. Invalid input returns `422` with
  `ERROR_CODES.VALIDATION_FAILED` through the standard envelope.
- Frontend forms validate on submit with that same schema and display inline field errors.
- Structured AI output is untrusted until `generate(...)` parses it and validates it against a
  supplied Zod schema.
- The current diagnostic `ai-test` function returns a generic validation envelope rather than
  exposing `ZodError.issues`; adding safe issue details for resource endpoints is a later API design
  decision, not existing scaffold behavior.

## Constants & Configuration

- All frontend environment access goes through `frontend/src/config/env.ts`; all backend environment
  access goes through `backend/_shared/env.ts`. Do not read `import.meta.env` or call `Deno.env.get`
  anywhere else.
- Recurring route paths, error messages, error codes, and HTTP status codes belong in dedicated
  `constants/` modules. Feature code must not repeat magic strings or status numbers.
- API keys, service keys, database credentials, and JWT secrets are never committed to source
  control. Local values belong in ignored environment files and deployed values belong in managed
  secrets.

## Error Handling

- Edge Function errors are caught at the handler boundary and converted to standard envelopes.
- Server-call failures in the frontend surface through TanStack Query error state. Async work not
  owned by a query handles errors at the closest useful component or service boundary.
- A global React error boundary for render-time errors is required when the application shell is
  implemented in Chunk 06; it is not present in the Chunk 01 placeholder application.
- User-facing messages come from `frontend/src/constants/errors.ts`; backend error codes map to
  friendly UI text.
- Never display raw error objects, stack traces, provider responses, or backend diagnostic codes to
  users.
- AI-backed frontend features invoke Supabase Edge Functions only through
  `frontend/src/lib/edge.ts`, then validate returned feature data with the corresponding shared Zod
  schema.

## Logging

- `console.log`, `console.debug`, `console.info`, `console.warn`, and `console.error` are forbidden
  outside logger files. Frontend ESLint enforces `no-console: error` with an override for
  `frontend/src/lib/logger.ts`; backend Deno lint includes `no-console`, and
  `backend/_shared/logger.ts` carries the narrow file exemption.
- `logger.warn` and `logger.error` always emit. `logger.debug` and `logger.info` are no-ops in
  production.
- Never log tokens, passwords, full user objects, full request bodies, full AI responses,
  environment values, or API keys.
- Prefer a stable first argument and only non-sensitive structured context when useful:
  `logger.info('project_created', { projectId })`.

## Folder Structure

The frontend layout established by Chunk 01 is:

```text
frontend/src/
  components/
    ui/
  features/
  lib/
    logger.ts
    supabase.ts
    utils.ts
  config/
    env.ts
  constants/
    errors.ts
    routes.ts
  hooks/
  types/
  pages/
  App.tsx
  main.tsx
  index.css
```

The backend layout established by Chunk 02 is:

```text
backend/
  _shared/
    ai/
    auth/
    constants/
    http/
    schemas/
    env.ts
    logger.ts
  functions/
    <function-name>/
      deno.json
      index.ts
  supabase/
    migrations/
    config.toml
    seed.sql
  deno.json
  import_map.json
```

Only shared Zod schemas may cross from `backend/_shared/schemas/` into `frontend/` by relative
import. Any structural deviation must be recorded in `context/decisions.md` before it is adopted.

## Naming Conventions

- Non-component files use `kebab-case`, such as `project-list.ts`.
- Component files and components use `PascalCase`, such as `ProjectList.tsx`.
- Hooks use `useCamelCase`.
- Constants use `SCREAMING_SNAKE_CASE`.
- Functions and variables use `camelCase`.
- Types and interfaces use `PascalCase` with no `I` prefix.
- Edge Function names use `kebab-case`, preferring a clear verb-noun form where useful, such as
  `generate-prd` or `chunks-list`.

## Dependency Standards

- A new package requires product-owner approval and a justification in `context/decisions.md`.
- Prefer platform APIs and small focused packages over large frameworks.
- Pin major versions and upgrade deliberately, not opportunistically.
- Verify backend dependency compatibility in Supabase's Deno Edge runtime before adopting it. Chunk
  02 used typed HTTP provider adapters after runtime compatibility testing.

## Code Review Items

The developer-review checklist is tracked honestly: a check means an implemented mechanism exists;
an open box means the requirement is locked but awaits a feature that needs it.

1. ✅ Scratch `.md` files (`CrossFix.md`, `DeploymentFix.md`, etc.) - ignored in root `.gitignore`.
2. ✅ `.cursor/` folder - ignored in root `.gitignore`.
3. ✅ Modular interfaces - code is separated under `frontend/src/` domains and `backend/_shared/`;
   shared resource schemas have a dedicated location.
4. ✅ Env vars via constants files - only `frontend/src/config/env.ts` and `backend/_shared/env.ts`
   read runtime environment variables.
5. ⚠️ Backend and frontend in separate repos - deviation: this is one repository with `frontend/`
   and `backend/`, recorded in `context/decisions.md`.
6. ✅ Frontend in React.js - implemented as a Vite + React + TypeScript SPA.
7. ✅ No `console.log` in production - logger wrappers exist and lint blocks direct console use
   outside them.
8. ✅ Common API response structure - `_shared/http/response.ts` supplies `{ ok, data | error }`
   helpers used by current Edge Functions.
9. ✅ Error messages from constants file - provided by backend and frontend `constants/errors.ts`.
10. ☐ Database transactions - required for future multi-row writes; no database mutation exists
    before schema work begins.
11. ✅ Consistent HTTP status codes - `_shared/constants/http.ts` is used by current functions.
12. ✅ No `any` - frontend ESLint and backend Deno recommended lint enforce explicit-`any`
    prohibition.
13. ✅ REST conventions - documented in this standards file and followed by the health reference
    surface where applicable.
14. ✅ Single validation library - Zod is installed and used for boundaries already implemented.
15. ✅ Constants in dedicated files - route, error, and HTTP lookup tables are established.

## Enforced Versus Pending

Enforced today: strict TypeScript checks, frontend explicit-`any` and console lint rules, backend
Deno lint rules including explicit-`any` and console use, Zod-validated environment/provider
boundaries, response helpers, HTTP/error constants, and authenticated reference paths.

Required but implemented only when their owning chunks arrive: RLS policies and data transactions
(Chunk 04), global frontend error boundary and protected shell (Chunk 06), form validation and full
UI state handling on feature pages, and safe field-level validation issue exposure if that API
contract is approved.
