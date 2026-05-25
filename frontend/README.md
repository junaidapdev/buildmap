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
values will be available after the Supabase backend is created in Chunk 02. The browser-safe
anonymous key relies on Row Level Security for authorization.

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
