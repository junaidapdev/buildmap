# buildmap Frontend

Vite + React single-page application for the buildmap planning and memory workspace.

## Prerequisites

- Node.js `>=20.19.0`
- npm `>=10`

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. Real project
values come from the local or hosted Supabase project. The browser-safe anonymous key relies on
Row Level Security for authorization.

## Auth Local Setup

Start the local Supabase stack from `backend/` before testing authentication:

```bash
cd ../backend
supabase start
```

Email/password sign-up requires confirmation. Local confirmation emails appear in the local
Inbucket interface at `http://127.0.0.1:55324`; open the confirmation link there to complete the
flow. The configured frontend landing path is `http://127.0.0.1:5173/auth/confirm`.

Google OAuth requires a Google OAuth 2.0 web client:

1. In Google Cloud Console, create an OAuth client for a web application.
2. Add `http://127.0.0.1:55321/auth/v1/callback` as an authorized redirect URI.
3. Export the local values referenced by `backend/supabase/config.toml`:

```bash
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="your-google-client-id"
export SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="your-google-client-secret"
cd ../backend
supabase stop
supabase start
```

The SPA redirect after Google completes is `http://127.0.0.1:5173/auth/callback`. For hosted
Supabase, configure the same Google provider credentials and the deployed SPA redirect URL in
the Supabase dashboard under Authentication -> Providers -> Google and URL Configuration. No
additional frontend environment variable is needed for Google sign-in.

Password recovery is intentionally deferred beyond the current authentication chunk.

## Shared Schemas and Forms

Frontend features import resource validation schemas from `backend/_shared/schemas/` through the
`@shared/schemas/*` Vite and TypeScript alias. This schema-only import is the single permitted
cross-folder dependency from the frontend into the backend tree; runtime helpers and unrelated
types must remain within their owning application.

The new-project form establishes the feature form pattern: shadcn/ui `Form` controls composed
with React Hook Form, a Zod resolver using the shared schema, and a TanStack Query mutation hook
for server writes and cache invalidation. Later typed forms should follow this pattern.

## AI-Driven Features

The SPA never calls model providers directly. AI-backed interactions call authenticated Supabase
Edge Functions through `src/lib/edge.ts`, which is the single frontend helper for the standard
Edge Function response envelope. Feature hooks re-validate successful data with shared Zod
schemas after it crosses the network boundary.

The idea clarifier establishes the AI feature pattern: a TanStack Query mutation exposes pending
skeletons, retryable provider or output-validation errors, and a validated success form. Later
generation features should follow this pending/error/validated-success composition and keep
provider prompts and credentials on the backend.

## App Shell and Navigation

Every authenticated page renders inside `src/components/layout/AppShell.tsx`, which provides the
persistent header, responsive sidebar, user menu, loading boundary, and consistent content
container. Pages that need a narrower reading layout can pass `containerClassName` to
`AppShell`.

Sidebar destinations are configured in `src/components/layout/nav-config.ts`. Pending
destinations are intentionally visible but inert and explain their activation chunk in a
tooltip. When a feature route is implemented, remove its `pendingChunk` field to activate its
navigation item.

## Scripts

```bash
npm run dev        # Start the Vite development server.
npm run build      # Type-check and build the production bundle.
npm run preview    # Preview the production bundle locally.
npm run lint       # Run ESLint with zero warnings allowed.
npm run lint:fix   # Fix automatically repairable lint issues.
npm run format     # Format files with Prettier.
npm run typecheck  # Type-check application and Vite configuration files.
```

## Structure

```text
src/
  components/       shadcn/ui primitives and composed UI
  config/           typed environment access
  constants/        shared frontend constants
  features/         feature-owned modules
  hooks/            reusable frontend hooks
  lib/              logger, Supabase client, and utilities
  pages/            route-level components
  types/            frontend-only types
  App.tsx           application routes
  main.tsx          application entry and providers
```

The logger in `src/lib/logger.ts` is the only frontend boundary where `console.*` calls are
permitted. Committed frontend TypeScript must not use `any`.
