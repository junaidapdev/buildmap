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
