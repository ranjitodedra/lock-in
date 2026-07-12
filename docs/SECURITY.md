# Security

Security practices **actually implemented** in this codebase. This document is written for engineering reviewers, not as a public vulnerability-disclosure policy.

---

## Configuration and startup

### Fail-closed environment validation

[`src/env.ts`](../src/env.ts) validates all environment variables with Zod at startup (loaded via [`instrumentation.ts`](../instrumentation.ts)). Missing required configuration causes the build or server boot to fail — the app does not serve requests with auth disabled due to missing Supabase credentials.

Production-only requirements (enforced when `NODE_ENV=production` and `VERCEL=1`):

- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

### Secrets handling

- `.env.local` and all `.env.*.local` files are gitignored
- [`.env.example`](../.env.example) documents every variable with placeholders — no real credentials
- Service-role key is used only in server-side code ([`src/lib/supabase/admin.ts`](../src/lib/supabase/admin.ts), cron route)
- Admin email is a server-side env var (`ADMIN_EMAIL`), not hardcoded in source

---

## Authentication and authorization

### Supabase Auth

- Email magic link and Google OAuth
- Session managed via `@supabase/ssr` with httpOnly cookies
- Middleware refreshes session and redirects unauthenticated users from protected paths
- Server Components and Server Actions call `requireUser()` / `getAuthUser()` for server-side auth checks

### Row Level Security (RLS)

All user data tables enforce `auth.uid() = user_id`:

| Table | Policy |
|-------|--------|
| `applications` | Users can only read/write their own rows |
| `codex_connections` | Users can only read/write their own tokens |
| `extraction_usage` | Users can only read/write their own usage records |

Server Actions never trust client-supplied `user_id` — it is always derived from the authenticated session.

### Admin access

- Admin panel (`/admin`) requires `requireAdmin()` which checks the signed-in user's email against `ADMIN_EMAIL`
- Admin nav link visibility is computed server-side in `DashboardShell` and passed as a prop — the admin email is not bundled into client JavaScript
- Admin queries use the Supabase service-role client (bypasses RLS) — only available when `SUPABASE_SERVICE_ROLE_KEY` is configured

---

## Input validation

### AI extraction

- Raw description length capped at 32,000 characters (`MAX_RAW_DESCRIPTION`)
- Extraction output validated against a strict Zod schema ([`src/lib/extraction/schema.ts`](../src/lib/extraction/schema.ts))
- Non-job input returns a structured error (`not_a_job_posting`)
- Invalid JSON from Codex is rejected server-side

### Route handlers

- Auth checked before processing (`401` if unauthenticated)
- Request body parsed with try/catch; malformed JSON returns `400`
- Rate limit exceeded returns `429` with a clear message

---

## Rate limiting

Extraction is limited to **20 requests per minute per user** (`BURST_EXTRACTIONS_PER_MINUTE`).

Implementation:

- Postgres RPC `check_and_record_extraction` with per-user advisory locks
- Atomic check-and-insert — no check-then-insert race under concurrent serverless invocations
- `extraction_usage` table retains ~24 hours of data; Vercel Cron purges older rows

---

## Cron endpoint protection

`GET /api/cron/cleanup-extraction-usage` requires:

```
Authorization: Bearer <CRON_SECRET>
```

Requests without a valid secret receive `401`. The cron secret is required in Vercel production via env validation.

---

## Codex token storage

**Current state:** OAuth tokens (`access_token`, `refresh_token`) are stored as plaintext `text` columns in `codex_connections`.

**Mitigations in place:**

- RLS prevents cross-user token access
- Tokens are never logged
- Tokens are never sent to the client bundle
- Service-role key access is server-only

**Known gap:** A database breach, service-role key leak, or Supabase dashboard access would expose tokens. Token encryption at rest (`TOKEN_ENCRYPTION_KEY`) is planned but not yet implemented.

> Note: [`docs/PROJECT_DECISIONS.md`](PROJECT_DECISIONS.md) originally stated tokens are "never in Supabase plaintext columns." The actual schema stores them in plaintext — this document reflects the implemented state.

---

## Transport and cookies

- Supabase session cookies are httpOnly and secure in production
- Codex OAuth uses HTTPS endpoints exclusively
- Codex fetch has a 30-second timeout to prevent hung serverless functions

---

## Error reporting

[`src/lib/monitoring.ts`](../src/lib/monitoring.ts) provides a `reportError()` stub:

- Development: logs to `console.error`
- Production: fire-and-forget POST to Sentry envelope endpoint (if `NEXT_PUBLIC_SENTRY_DSN` is set)
- Full `@sentry/nextjs` SDK integration is not yet wired

---

## CI and dependency hygiene

- GitHub Actions runs lint, typecheck, and build on every push/PR
- CI uses placeholder env vars (no real credentials in workflow files)
- Dependencies are pinned in `package-lock.json`

---

## Recommendations before going public

1. Enable GitHub secret scanning and push protection
2. Rotate Supabase service-role key and Google OAuth secret if the repo was ever shared with `.env.local` present
3. Implement token encryption at rest before scaling user count
4. Add `@sentry/nextjs` for production error monitoring with PII scrubbing
