# Architecture

Technical reference for Lock-In. For a recruiter-friendly overview, see the [README](../README.md).

---

## System overview

Lock-In is a Next.js 16 App Router application deployed on Vercel, backed by Supabase Postgres with Row Level Security. AI extraction uses the user's own ChatGPT subscription via Codex device-code OAuth.

```
Browser
  ├── Server Components (RSC) ──► Supabase Postgres (RLS)
  ├── Client Components ──► fetch /api/* ──► Route Handlers
  └── Server Actions ──► Supabase Postgres (RLS)

Middleware ──► Supabase Auth (session refresh + route protection)
POST /api/extract ──► extraction_jobs + Inngest event (202)
Inngest worker ──► Codex SSE ──► update extraction_jobs
Vercel Cron ──► /api/cron/cleanup-extraction-usage
```

---

## Route map

### Pages

| Route | Component | Auth |
|-------|-----------|------|
| `/` | Landing page | Public |
| `/login` | Sign-in (email + Google) | Public |
| `/dashboard` | Applications table | Protected |
| `/applications/new` | New application form | Protected |
| `/applications/[id]` | Application detail | Protected |
| `/settings` | ChatGPT connection + preferences | Protected |
| `/guide` | In-app guide | Protected |
| `/admin` | User admin panel | Protected + admin email |
| `/manifesto` | Project manifesto | Public |
| `/legal/terms`, `/legal/privacy` | Legal pages | Public |

Protected paths are enforced in [`src/lib/auth/routes.ts`](../src/lib/auth/routes.ts) and [`src/lib/supabase/middleware.ts`](../src/lib/supabase/middleware.ts).

### API routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/extract` | Enqueue AI extraction (`202 { jobId }`) |
| GET | `/api/extract/[jobId]` | Poll extraction job status |
| GET/POST/PUT | `/api/inngest` | Inngest serve endpoint (workers) |
| POST | `/api/codex/auth/start` | Start Codex device-code OAuth |
| GET | `/api/codex/auth/poll` | Poll for OAuth completion |
| POST | `/api/codex/auth/logout` | Disconnect ChatGPT |
| GET | `/api/cron/cleanup-extraction-usage` | Delete stale rate-limit + job rows (cron) |
| GET | `/auth/callback` | Supabase OAuth callback |
| POST | `/auth/signout` | Sign out |

---

## Source layout

```
src/
├── app/                    # Next.js routes (pages, layouts, API)
├── components/
│   ├── applications/       # Form, detail view
│   ├── dashboard/          # Table, filters, pagination
│   ├── auth/               # Login, verification banner
│   ├── codex/              # ChatGPT connection UI
│   ├── layout/             # Shell, sidebar, header, nav
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── applications/       # Queries, actions, follow-up logic
│   ├── auth/               # Session, admin check, route guards
│   ├── codex/              # OAuth client, token session, SSE
│   ├── extraction/         # Prompt, schema, rate limiting, job poll helpers
│   ├── inngest/            # Inngest client + extraction worker
│   └── supabase/           # Client, server, admin, middleware
├── env.ts                  # Zod-validated environment (fail-closed)
└── middleware.ts           # Auth gate entry point
```

Startup hook: [`instrumentation.ts`](../instrumentation.ts) imports `@/env` so misconfiguration fails at build/boot.

---

## Database schema

Migrations live in [`supabase/migrations/`](../supabase/migrations/).

### `applications`

Primary user data. Columns include `company`, `job_title`, `status`, `work_mode`, `salary`, `skills`, `technologies`, `raw_description` (up to 32KB), `follow_up_date`, `applied_at`, and timestamps.

- **RLS:** `auth.uid() = user_id` on all operations
- **Index:** `(user_id, created_at DESC)` for dashboard list queries
- **Search:** `search_vector` tsvector column with GIN index (maintained by trigger; server-side search not yet implemented)

### `codex_connections`

Stores Codex OAuth tokens per user (`access_token`, `refresh_token`, expiry).

- **RLS:** `auth.uid() = user_id`
- **Note:** Tokens are stored as plaintext `text` columns (encryption planned — see [SECURITY.md](SECURITY.md))

### `extraction_usage`

Append-only rate-limit audit log. One row per extraction enqueue.

- **RLS:** `auth.uid() = user_id`
- **RPC:** `check_and_record_extraction(user_id, burst_limit, window_ms)` — atomic check-and-insert with advisory lock
- **Retention:** Vercel Cron deletes rows older than 24 hours

### `extraction_jobs`

Async extraction queue. Stores `raw_description`, `status` (`pending` | `processing` | `completed` | `failed`), `result` jsonb, and error fields.

- **RLS:** users may `INSERT`/`SELECT` own rows; workers update via service role
- **Worker:** Inngest function `process-extraction-job` calls Codex and writes terminal status
- **Retention:** same cron deletes rows older than 24 hours

### Removed tables

`subscriptions` was created then dropped in migrations — Stripe billing was removed from scope.

---

## Authentication flow

1. User visits `/login` and chooses email magic link or Google OAuth.
2. Supabase Auth handles the OAuth/magic-link flow.
3. `/auth/callback` exchanges the code for a session; cookies are set via `@supabase/ssr`.
4. Middleware on every matched request calls `supabase.auth.getUser()` to refresh the session.
5. Protected routes redirect unauthenticated users to `/login?next=<path>`.
6. Dashboard layout calls `requireUser()` for an additional server-side check.

Admin access is gated by the `ADMIN_EMAIL` environment variable, checked server-side in [`src/lib/auth/admin-check.ts`](../src/lib/auth/admin-check.ts).

---

## Codex OAuth flow

1. User clicks **Connect ChatGPT** in Settings.
2. `POST /api/codex/auth/start` initiates device-code flow; returns a user code and verification URL.
3. Client polls `GET /api/codex/auth/poll` until the user completes authorization.
4. Tokens are saved to `codex_connections` via [`src/lib/codex/session.ts`](../src/lib/codex/session.ts).
5. On extraction, an Inngest worker calls `ensureFreshTokens()` to refresh expired tokens silently.
6. `POST /api/codex/auth/logout` clears the connection.

Codex SSE calls go through [`src/lib/codex/client.ts`](../src/lib/codex/client.ts) with a 30-second timeout (invoked from the Inngest worker, not the HTTP enqueue handler).

---

## Server Actions

Defined in [`src/lib/applications/actions.ts`](../src/lib/applications/actions.ts):

| Action | Behavior |
|--------|----------|
| `createApplication` | Insert row; revalidate dashboard |
| `patchApplication` | Partial update; optimistic UI (no dashboard revalidation) |
| `deleteApplication` | Delete row; revalidate dashboard |

All actions derive `user_id` from the authenticated session — never from client input.

---

## Dashboard data loading

[`listApplicationsPage()`](../src/lib/applications/queries.ts) fetches paginated rows using:

- **Column projection** (`LIST_COLUMNS`) — omits `raw_description` and other blob fields from list loads
- **Keyset pagination** on `(created_at, id)` via [`queries-cursor.ts`](../src/lib/applications/queries-cursor.ts)
- **Default page size:** 50 rows

Detail pages use `getApplication(id)` with `select("*")` for the full row.

---

## Cron job

[`vercel.json`](../vercel.json) schedules `GET /api/cron/cleanup-extraction-usage` at 03:00 UTC daily.

The route validates `Authorization: Bearer <CRON_SECRET>` and deletes `extraction_usage` and `extraction_jobs` rows older than 24 hours using the Supabase service-role client.

---

## Environment validation

[`src/env.ts`](../src/env.ts) validates all required variables at startup via Zod:

- Client vars: Supabase URL, anon key, app URL
- Server vars: service role key and cron secret (required on Vercel production), Codex settings, admin email

Missing required vars cause build/startup to fail immediately.

---

## Scale review

For a detailed weakness analysis and phased remediation plan targeting 100k DAU, see [ARCHITECTURE_REVIEW_100K_DAU.md](ARCHITECTURE_REVIEW_100K_DAU.md).

For current capacity ceilings, a free-tier-first hyperscale target architecture, and the path toward ~1M concurrent users, see [blog/scaling-to-one-million-concurrent-users.md](blog/scaling-to-one-million-concurrent-users.md).

For the company-grade viral growth RFC (SLOs, load-shed, cells, resume narrative), see [SCALE_UP_PLAN.md](SCALE_UP_PLAN.md).

Phase 1 fixes (pagination, env validation, atomic rate limiting, Codex timeout, retention cron) and the async extraction job queue (Inngest + `extraction_jobs` + client poll) are implemented. Remaining Phase 2/3 items (token encryption, server-side search, pooler, Sentry) stay on the roadmap.
