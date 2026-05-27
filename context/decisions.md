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

## 2026-05-26 - Standards Follow Verified Provider Adapter Implementation

**Decision:** Document the verified Chunk 02 provider implementation as typed HTTP adapters in
the Chunk 03 standards and workflow guidance. Leave the older SDK wording in
`context/02-architecture.md` unchanged during this documentation-owned chunk and flag it for an
approved architecture correction.

**Reason:** Chunk 02 runtime validation established that direct documented HTTP adapters operate in
the Supabase Edge runtime, while the OpenAI SDK path failed at runtime and the Anthropic SDK did
not document Deno support. Chunk 03 must describe existing practice without silently modifying the
canonical architecture document outside its scope.

**Alternatives considered:** Repeat the stale SDK wording in new standards, or modify
`context/02-architecture.md` outside the active chunk's ownership.

**Reversibility:** Easy.

## 2026-05-26 - UUID Ownership Model and Profile Creation Trigger

**Decision:** Use UUID primary keys generated by `gen_random_uuid()` for application records,
while `public.users.id` is the corresponding `auth.users.id`. An `auth.users` insertion trigger
creates the application profile row, and reusable `set_updated_at` triggers maintain mutable-row
timestamps.

**Reason:** The one-to-one user identifier aligns RLS identity directly with `auth.uid()` and
removes any frontend responsibility to create a profile after signup. Timestamp triggers provide
consistent modification tracking at the database boundary.

**Alternatives considered:** Separate application user identifiers or frontend-managed profile
inserts after authentication.

**Reversibility:** Hard.

## 2026-05-26 - Hard Deletes, Cascading Project Content, and Retained Usage Logs

**Decision:** Use hard deletes for the MVP. Deleting a project cascades its documents, chunks,
specs, issues, and learnings; `generation_logs.project_id` uses `ON DELETE SET NULL` so immutable
usage records remain without a deleted project association. Deleting an auth user cascades
through its profile, projects, and user-owned logs.

**Reason:** Hard deletion keeps policies and user expectations straightforward. The detailed
`generation_logs` column specification identifies logs as retention/accounting records, so they
remain when a project alone is removed while user deletion still removes that user's records.

**Alternatives considered:** Soft deletion, versioned archival tables, or deleting usage logs
when an individual project is deleted.

**Reversibility:** Hard.

## 2026-05-26 - Bounded Values Use Text CHECK Constraints

**Decision:** Represent MVP bounded values, including statuses, document types, agent choices,
generation types, and provider names, as `text` columns with explicit `CHECK` constraints.

**Reason:** The table-by-table schema contract specifies `text` plus exact allowed-value checks.
This preserves clear database enforcement while making future additions less disruptive than
Postgres enum alteration.

**Alternatives considered:** PostgreSQL enum types for the smaller stable status sets.

**Reversibility:** Medium.

## 2026-05-26 - Same-Project Relational Integrity Hardening

**Decision:** Add composite same-project foreign keys for `feature_specs.chunk_id` and
`project_issues.chunk_id`, and require a non-null `generation_logs.project_id` to be owned by the
logged-in user in the insert policy. Keep `public.users` without user-facing insert or delete
policies because its lifecycle belongs to the auth trigger and auth administration.

**Reason:** Project-ownership RLS alone would permit an owned row to reference another user's
chunk or project UUID in these cross-reference fields. The product owner approved closing this
silent cross-project association path before the schema is committed.

**Alternatives considered:** Rely only on row-level project ownership checks or defer relational
integrity checks to future Edge Functions.

**Reversibility:** Medium.

## 2026-05-27 - Email Confirmation and Explicit Auth Redirects

**Decision:** Keep Supabase email confirmation enabled for sign-up and allow only the exact local
SPA auth landing routes `/auth/confirm` and `/auth/callback` in addition to the local application
roots on Vite's configured `5173` port. Updating `backend/supabase/config.toml` is an approved
Chunk 05 exception because that file controls whether the required frontend flow can run locally.

**Reason:** A confirmation page cannot be exercised when local auth auto-confirms new accounts,
and OAuth/email redirect destinations must be permitted by Supabase before the SPA can complete
the flow.

**Alternatives considered:** Leave confirmation disabled for development or allow wildcard
redirect destinations.

**Reversibility:** Easy.

## 2026-05-27 - Browser Auth Session and Friendly Error Boundary

**Decision:** Use the Supabase JS default browser session persistence and automatic redirect-token
processing, with OAuth completing at `<origin>/auth/callback`. The frontend maps stable Supabase
auth error codes to application-controlled messages and does not display provider error strings.

**Reason:** This follows the locked authentication model while preventing raw provider diagnostics
from leaking into UI copy or forcing custom token handling in the browser.

**Alternatives considered:** Custom token storage, manual callback token parsing, or displaying
raw Supabase error text.

**Reversibility:** Easy.

## 2026-05-27 - Auth UI Primitives and Direct Zod Form Validation

**Decision:** Add the shadcn/ui `input`, `label`, `card`, `alert`, and `separator` primitives
required by the auth pages, introducing their Radix label and separator dependencies. Validate
the two simple auth forms directly with Zod on submit rather than add an unrequested form-state
dependency.

**Reason:** These primitives are explicitly required by Chunk 05. Direct Zod parsing provides the
required shared validation boundary and inline issues for two small forms while keeping the
dependency surface within the approved scope.

**Alternatives considered:** Hand-built UI controls or introducing React Hook Form and a resolver
package that the feature spec did not authorize.

**Reversibility:** Easy.

## 2026-05-27 - Responsive Shell Navigation and Pending Destinations

**Decision:** Compose authenticated pages inside `AppShell`, persist desktop sidebar collapse in
`localStorage` under `buildmap.sidebar.collapsed`, and use the shadcn/ui `Sheet` component for
the mobile navigation drawer. Navigation entries for future chunks are rendered from
`nav-config.ts` as inert, keyboard-focusable buttons with an activation-chunk tooltip.

**Reason:** One responsive chrome component keeps later authenticated features consistent, while
visible pending destinations communicate the planned workspace without allowing navigation into
unfinished features. The storage key uses the current product name rather than reintroducing the
retired name contained in the original prompt.

**Alternatives considered:** Per-page chrome, a non-persistent collapse toggle, hidden future
destinations, or preserving the retired-name storage key.

**Reversibility:** Easy.

## 2026-05-27 - Render Error Boundary Diagnostic Limit

**Decision:** Add a global React error boundary whose user-facing fallback offers recovery and
whose logger payload contains only `error.message` and `error.stack`.

**Reason:** Rendering failures need a dependable recovery surface, but full error objects can
carry application context that should not be emitted through client logging.

**Alternatives considered:** Relying on a blank crashed render tree or logging complete caught
error objects.

**Reversibility:** Easy.

## 2026-05-27 - Development-Only Route Map

**Decision:** Expose `/dev/routes` only in development and load its route-map page lazily through
the environment module's development-only loader.

**Reason:** The route map helps inspect planned navigation activation while developing the shell,
without creating a user-facing production surface for internal roadmap state.

**Alternatives considered:** Shipping the route map in production or omitting a route sanity
surface altogether.

**Reversibility:** Easy.

## 2026-05-27 - Dashboard Project Ordering and Deferred Metrics

**Decision:** Read projects directly from Supabase under RLS and order them by `updated_at`
descending. Show an em-dash placeholder with an owning-chunk tooltip for chunk count, completion
percentage, and open issues until Chunks 18, 22, and 23 implement those data paths. Use the
existing accessible Tailwind palette for project-status dots until dedicated status tokens are
introduced with the later board styling work.

**Reason:** Recent activity is the useful default ordering and matches the existing database
index. Placeholders communicate unavailable metrics honestly instead of presenting misleading
zeros. Existing palette roles provide readable state distinctions without expanding theme scope
during the first project-list surface.

**Alternatives considered:** Alphabetical ordering, rendering zero-valued metrics, querying
unimplemented aggregate data, or introducing new status-theme tokens in this chunk.

**Reversibility:** Easy.

## 2026-05-27 - Focused Dashboard Query Scope and Session Cache Clearing

**Decision:** Fetch the complete project list without pagination, client-side filtering, or
search for the MVP. Keep project query data fresh for 30 seconds with
`refetchOnWindowFocus: false`, relying on mutation invalidation in later owning chunks. Clear the
React Query cache on successful sign-out and on observed signed-out auth events.

**Reason:** The MVP targets users with a manageable project collection, so list controls and
focus-triggered traffic do not yet justify additional UI or query complexity. Removing
session-scoped cached data on sign-out prevents one user's project cards from remaining available
to a subsequent session in the same browser.

**Alternatives considered:** Immediate pagination/search controls, refetching on every focus
change, or retaining query cache data after logout.

**Reversibility:** Easy.
