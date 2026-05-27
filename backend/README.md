# buildmap Backend

Supabase Edge Functions and local Supabase configuration for the buildmap planning and memory
workspace.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Deno](https://docs.deno.com/runtime/getting_started/installation/) `2.x` for formatting, linting,
  and type checking
- Docker-compatible local runtime for `supabase start`

On macOS, install the Supabase CLI with Homebrew:

```bash
brew install supabase/tap/supabase
```

## Local Setup

```bash
cd backend
cp .env.example .env.local
supabase start
```

Populate `.env.local` with development-only provider keys when AI connectivity needs testing. The
Supabase Functions runtime automatically supplies its `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` built-ins; they remain in `.env.example` to document the complete
deployed environment contract. Do not commit `.env.local`.

Email/password authentication is enabled locally. Google OAuth is enabled through environment
configuration; set `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and
`SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` outside version control when testing that provider.

Set provider/configuration Edge Function secrets from a reviewed local env file; the CLI ignores
reserved `SUPABASE_*` built-ins because the platform injects them:

```bash
supabase secrets set --env-file .env.local
```

## Serve Functions

From `backend/`, serve the configured functions:

```bash
supabase functions serve --env-file .env.local
```

The local Supabase API listens on `http://127.0.0.1:55321`. This project uses the `5532x` local port
range so it can run alongside another Supabase workspace already using the default ports. Its
function routes include:

```text
GET  /functions/v1/health
POST /functions/v1/health/auth
POST /functions/v1/ai-test
```

`health` and `ai-test` perform authentication in shared function code rather than relying on gateway
JWT validation, because `health` has a public route and `ai-test` must return its disabled response
predictably. `POST /health/auth` and enabled `ai-test` requests still require and verify the user's
Supabase JWT.

`ai-test` is a diagnostic endpoint only. It remains disabled unless `AI_TEST_ENABLED=true`; leave
that setting unset or `false` in production.

## Validation

```bash
deno task fmt:check
deno task lint
deno task check
```

## Deploy

```bash
supabase functions deploy health
supabase functions deploy ai-test
```

Apply the schema and RLS migrations to a fresh local database with:

```bash
supabase db reset
```

Deploy reviewed migrations to a linked Supabase project with:

```bash
supabase db push
```

## Structure

```text
backend/
  _shared/
    ai/             provider mapping, adapters, and public generate() API
    auth/           JWT verification
    constants/      API error and HTTP status constants
    http/           CORS and response envelope helpers
    schemas/        shared Zod schemas added by feature chunks
    env.ts          validated Edge Function environment
    logger.ts       permitted logging boundary
  functions/
    ai-test/        disabled-by-default provider diagnostics and local Deno config
    health/         reference health/auth endpoint and local Deno config
  supabase/         local project configuration, schema migration, and RLS policies
```

## Backend Rules

- Every function handles CORS preflight and uses the standard
  `{ ok: true, data } | { ok: false, error: { code, message } }` response envelope.
- Request-bearing endpoints validate payloads with Zod at the boundary.
- User-scoped operations authenticate via the JWT and use the user's permissions; the service role
  key is reserved for future system-level work and is never used for user-data queries.
- `backend/_shared/logger.ts` is the only backend file allowed to call `console.*`.
- Tokens, API keys, request bodies, full users, and AI responses must never be logged.
- TypeScript must not use `any`.
- Feature AI work calls `generate(...)` from `_shared/ai/index.ts`; `ai-test` is the documented
  diagnostic exception.

## Adding A Function

1. Create `functions/<function-name>/index.ts`.
2. Add the function entrypoint and import map in `supabase/config.toml`.
3. Handle CORS preflight and wrap execution in top-level `try/catch`.
4. Use shared auth, error/status constants, logger, and response envelope helpers.
5. Add Zod input/output schemas at the boundary.
6. Run `deno task fmt:check`, `deno task lint`, and `deno task check`.

## Deployment Hardening

Development permits `ALLOWED_ORIGINS=*`. Production rejects wildcard CORS configuration at startup
and requires explicit origins. Chunk 31 must supply the final deployed SPA origin list and CI secret
configuration.
