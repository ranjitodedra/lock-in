## 1. Fail-closed environment validation

**Context:** Misconfigured deploys silently skipped auth when Supabase env vars were missing — middleware returned `NextResponse.next()` and left protected routes unguarded at the app layer.

**Action:** Added Zod-validated `src/env.ts` loaded via `instrumentation.ts`, removed the middleware fail-open bypass, and added `.env.example` with all required variables documented.

**Result:** Build and startup fail fast on missing required config instead of serving requests with auth disabled (0 silent auth bypass paths in production).

**Learning:** Serverless apps should fail closed at startup, not at request time with a bypass.

## 2. Remove hot-path dashboard revalidation

**Context:** Every status dropdown click on the dashboard called `revalidatePath("/dashboard")`, invalidating the full page cache and triggering a complete applications re-fetch even though the client already applied optimistic updates.

**Action:** Removed `revalidatePath("/dashboard")` from `patchApplication`; kept revalidation on `createApplication` and `deleteApplication` only.

**Result:** Eliminated 1 full dashboard DB round-trip per inline edit (e.g. 20 status changes in a session = 20 avoided re-fetches).

**Learning:** Optimistic UI plus a returned entity makes path revalidation redundant for partial updates.

## 3. Paginated and projected dashboard queries

**Context:** The dashboard called `listApplications()` with `select("*")` on every load, pulling full rows including 32KB `raw_description` blobs into server memory and the RSC payload — the first failure point at scale per the 100k DAU architecture review.

**Action:** Replaced unbounded fetch with `listApplicationsPage` using column projection (`LIST_COLUMNS`), keyset pagination on `(created_at, id)`, and a Load more control loading 50 rows per request.

**Result:** Initial dashboard payload capped at 50 slim rows instead of the full history (e.g. 500 apps × ~35KB blobs → ~50 rows × ~2KB ≈ 99% payload reduction for power users); `raw_description` no longer ships on list loads.

**Learning:** List views should never fetch blob columns; paginate early before server-side search is worth adding.

## 4. Atomic extraction rate limit and retention cron

**Context:** Extraction rate limiting used a separate COUNT then INSERT, allowing concurrent requests to bypass the 20/min burst cap; `extraction_usage` grew append-only with no retention (projected ~500k rows/day at scale).

**Action:** Added a Postgres RPC `check_and_record_extraction` with per-user advisory locks for atomic check-and-insert, refactored `/api/extract` to use it before Codex calls, and added a Vercel Cron job to delete rows older than 24 hours.

**Result:** Closed the burst bypass race on concurrent extract requests; retention caps the working table to ~24 hours of usage data instead of unbounded growth.

**Learning:** Check-then-insert is never atomic in serverless — push concurrency control to the database or Redis.

## 5. Codex fetch timeout

**Context:** Codex SSE extraction held Vercel serverless functions open for 10–60 seconds with no timeout, risking concurrency exhaustion under load.

**Action:** Added `AbortSignal.timeout(30_000)` to the Codex fetch in `sendCodexMessage`, with a clear timeout error message on failure.

**Result:** Functions release within 30 seconds maximum instead of hanging until the platform kills them (~50% headroom vs a 60s Pro limit).

**Learning:** Every outbound call from serverless needs an explicit timeout, even before a full async queue migration.
