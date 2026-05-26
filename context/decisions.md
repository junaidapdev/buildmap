# buildmap Decision Log

## 2026-05-25 - Single Repository with Frontend and Backend Folders

**Decision:** Use one repository with two top-level application folders: `frontend/` and `backend/`.

**Reason:** This deliberately deviates from code review item #5, which recommended two separate repositories. A single repository provides faster solo-developer iteration, atomic end-to-end feature changes, and one documentation and decision history.

**Alternatives considered:** Separate frontend and backend repositories, as recommended by the code review.

**Reversibility:** Hard.

## 2026-05-25 - Vite and React SPA

**Decision:** The frontend is a Vite + React + TypeScript SPA with no Next.js and no SSR.

**Reason:** The current product requires a client-side workspace and direct Supabase integration rather than a server-rendered application layer.

**Alternatives considered:** Next.js with server-side rendering.

**Reversibility:** Hard.

## 2026-05-25 - Supabase Edge Functions Backend

**Decision:** Use Supabase Edge Functions on the Deno runtime. There is no separate Node backend, Express server, Fastify server, or custom server.

**Reason:** Edge Functions provide the secured boundary for secret-bearing work while keeping backend deployment with the Supabase platform.

**Alternatives considered:** A separately deployed Node API server.

**Reversibility:** Hard.

## 2026-05-25 - Supabase Postgres with RLS

**Decision:** Use Supabase Postgres as the database and enforce authorization through Row Level Security (RLS).

**Reason:** Database-level enforcement protects user-owned rows regardless of whether a query originates in the SPA or an Edge Function.

**Alternatives considered:** Application-only authorization checks or a separate managed Postgres service.

**Reversibility:** Hard.

## 2026-05-25 - Supabase Authentication Methods

**Decision:** Use Supabase Auth with email/password and Google OAuth enabled. Do not use Clerk.

**Reason:** Supabase Auth integrates sessions and RLS identity with the chosen database and backend boundary.

**Alternatives considered:** Clerk or additional authentication providers.

**Reversibility:** Hard.

## 2026-05-25 - Dual AI Providers Behind One Abstraction

**Decision:** Use both OpenAI and Anthropic through `backend/_shared/ai/`, exposing `generate(type, input)` and configuring the provider per generation type in one file.

**Reason:** Features should not depend on a provider client, and generation types can be reassigned without feature-code changes.

**Alternatives considered:** One provider only or direct provider invocation within each feature.

**Reversibility:** Easy.

## 2026-05-25 - Shared Zod Validation

**Decision:** Use Zod for validation, with shared schemas in `backend/_shared/schemas/` imported by `frontend/` through relative paths.

**Reason:** One schema at both boundaries prevents client-side forms and Edge Function validation from drifting.

**Alternatives considered:** Duplicated frontend and backend schemas or a different schema validation library.

**Reversibility:** Hard.

## 2026-05-25 - Tailwind CSS and shadcn/ui

**Decision:** Use Tailwind CSS and shadcn/ui for styling and UI primitives.

**Reason:** The combination supports fast SPA composition with locally controlled components and consistent styling.

**Alternatives considered:** A bespoke component library or other CSS/UI frameworks.

**Reversibility:** Hard.

## 2026-05-25 - Custom Logging Wrapper

**Decision:** Use a tiny custom logger wrapper mirrored at `frontend/src/lib/logger.ts` and `backend/_shared/logger.ts`; `console.log` is forbidden in committed code and ESLint enforces the boundary.

**Reason:** Minimal logging behavior is sufficient while providing explicit production filtering and a reviewable rule against accidental sensitive logging.

**Alternatives considered:** Direct console calls or a third-party logging dependency.

**Reversibility:** Easy.

## 2026-05-25 - Separate Frontend and Backend Deployments

**Decision:** Deploy the SPA to Vercel or Netlify and deploy Edge Functions to Supabase as two separate deploys.

**Reason:** Each artifact is deployed to the platform aligned with its runtime, with the final SPA host to be selected in Chunk 31.

**Alternatives considered:** Hosting a custom backend with the frontend or selecting an SPA platform before deployment planning.

**Reversibility:** Easy.

## 2026-05-25 - Frontend Toolchain Baseline

**Decision:** Scaffold `buildmap-frontend` with Node.js `>=20.19.0`, React 19, Vite 8, TypeScript 6, ESLint 9 flat configuration, and Tailwind CSS 3.4; install `class-variance-authority` and `@radix-ui/react-slot` only as dependencies of the required shadcn/ui Button.

**Reason:** The installed current frontend tooling supports the Vite SPA architecture, while Tailwind CSS 3.4 retains the `tailwind.config.ts`, PostCSS, and slate CSS-variable shadcn setup specified for this chunk. The Button cannot compile without its variant and slot dependencies.

**Alternatives considered:** Tailwind CSS 4 with its changed setup, legacy ESLint configuration, or a hand-built button that would not validate the shadcn integration.

**Reversibility:** Easy.

## 2026-05-26 - Default AI Provider Mapping

**Decision:** Map `idea_clarification`, `agent_prompt_generation`, and `issue_to_spec` to OpenAI
`gpt-4o-mini`; map document, architecture, chunk, feature-specification, context-file, and
knowledge-extraction generations to Anthropic Claude Sonnet. The sole feature-facing entry point
is `backend/_shared/ai/index.ts` through `generate(type, input, outputSchema)`.

**Reason:** Short structured generations favor speed and cost, while longer planning documents
benefit from the long-form provider default. Centralized mapping allows a provider swap by editing
one config entry rather than feature code.

**Alternatives considered:** One provider for every generation type or direct provider calls from
individual feature functions.

**Reversibility:** Easy.

## 2026-05-26 - Claude Sonnet Model Identifier Update

**Decision:** Use `claude-sonnet-4-6` for Anthropic-mapped generation types and diagnostic calls
instead of the feature spec's listed `claude-sonnet-4-5`.

**Reason:** At implementation time, Anthropic's official current models documentation lists
Claude Sonnet 4.6 as the current Sonnet API model identifier. Chunk 02 requires the current stable
equivalent when a listed default is superseded.

**Alternatives considered:** Retaining the older `claude-sonnet-4-5` identifier.

**Reversibility:** Easy.

## 2026-05-26 - Provider Deno Adapters Use HTTP APIs

**Decision:** Implement both provider adapters with `fetch` against the official OpenAI Chat
Completions API and Anthropic Messages API rather than importing provider SDKs in served Edge
Functions.

**Reason:** The official Anthropic TypeScript SDK documents Node.js runtime support but does not
claim Deno support. The official OpenAI Deno package type-checks under local Deno, but runtime
verification showed that Supabase Edge Runtime could not load its transitive type graph. Small
typed HTTP adapters use the documented APIs without runtime-incompatible package resolution and
validate provider response boundaries with Zod.

**Alternatives considered:** Importing the Anthropic Node-targeted TypeScript SDK or the OpenAI
Deno/JSR package inside Supabase Edge Functions.

**Reversibility:** Easy.

## 2026-05-26 - Production CORS Requires Explicit Origins

**Decision:** Allow wildcard CORS origins only for local development; backend startup rejects
`ALLOWED_ORIGINS=*` in production, and Chunk 31 must configure explicit deployed SPA origins.

**Reason:** Development needs simple local access, while wildcard origins are too permissive for
a deployed API boundary.

**Alternatives considered:** Wildcard CORS in every environment or hardcoding an undeclared
deployment URL before the hosting decision is made.

**Reversibility:** Easy.

## 2026-05-26 - Isolated Local Supabase Ports

**Decision:** Configure the buildmap local Supabase stack on ports `55320` through `55329`, with
the API endpoint at `http://127.0.0.1:55321`, instead of the CLI default `5432x` range.

**Reason:** A separate existing local Supabase project already occupies the default database port.
An isolated range allows both projects to run without stopping or changing unrelated work.

**Alternatives considered:** Stop the unrelated local project or require manual port changes for
each development session.

**Reversibility:** Easy.

## 2026-05-26 - Per-Function Deno Configuration

**Decision:** Keep the root backend `deno.json` and `import_map.json` for repository-wide
validation and compatibility, and add a small `deno.json` beside each served function for its
runtime dependency aliases.

**Reason:** Current Supabase documentation recommends per-function `deno.json` configuration and
classifies global import maps as legacy. Local Edge Runtime boot confirmed that the root mapped
aliases were not applied to custom `backend/functions/` entrypoints without function-local
configuration.

**Alternatives considered:** Replace aliases with repeated direct URL imports or relocate functions
under `backend/supabase/functions/`, which would violate the locked repository layout.

**Reversibility:** Easy.
