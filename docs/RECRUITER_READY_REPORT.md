# Recruiter-Ready Preparation Report

**Branch:** `recruiter-ready` (local only — not pushed to remote)  
**Date:** 2026-07-11  
**Copyright holder:** Ranjit Odedra

---

## Summary

Lock-In Tracker is prepared for public portfolio review on the `recruiter-ready` branch. Work included cleanup, secrets externalization, comprehensive documentation, and a proprietary license — without changing application behavior.

---

## Files removed

| Path | Reason |
|------|--------|
| `.tmp-ponytail/` (168 files) | Accidental vendored ponytail benchmark repo, unrelated to Lock-In |
| `src/lib/auth/user.ts` | Unused `userInitials()` helper, zero imports |
| `src/components/ui/checkbox.tsx` | shadcn scaffold, never imported |
| `public/file.svg`, `window.svg`, `vercel.svg` | Default Next.js assets; only `openai.svg` is referenced |
| `src/app/(dashboard)/applications/[id]/edit/page.tsx` | Redirect-only stub; no routes or links pointed to `/edit` |

---

## Files renamed / moved

| From | To | Reason |
|------|-----|--------|
| `docs/challage_overcome.md` | `docs/ENGINEERING_HIGHLIGHTS.md` | Fix typo; recruiter-friendly name |
| `docs/FABLE_PROMPT.md` | `docs/dev/FABLE_PROMPT.md` | Dev-only AI build prompt, not skimmer material |

---

## Code changes (no behavior change when env is configured)

| Change | Files |
|--------|-------|
| Removed dead re-exports | `src/lib/applications/queries.ts`, `src/lib/auth/admin.ts` |
| `ADMIN_EMAIL` moved to env var | `src/env.ts`, `src/lib/auth/admin-check.ts` |
| Admin nav computed server-side | `dashboard-shell.tsx`, `app-sidebar.tsx`, `app-header.tsx`, `nav-links.tsx` |
| Supabase project ref from env URL | `scripts/setup-google-oauth.mjs`, `scripts/verify-google-oauth.mjs`, new `scripts/load-env-local.mjs` |
| Wired cursor self-check script | `package.json` → `check:queries-cursor` |
| CI placeholder env vars | `.github/workflows/ci.yml` |
| Follow-up copy aligned to code (14 calendar days) | `app-guide-content.tsx`, `PROJECT_DECISIONS.md` |
| Token storage doc corrected | `PROJECT_DECISIONS.md`, `SECURITY.md` |

---

## Uncommitted WIP included on branch

The following production code was uncommitted on `main` and is part of this branch:

- `instrumentation.ts`, `src/env.ts` — fail-closed env validation
- `src/lib/applications/queries-cursor.ts` — keyset pagination helpers
- `src/app/api/cron/cleanup-extraction-usage/route.ts` — retention cron
- `supabase/migrations/20260710120000_extraction_rate_limit.sql` — atomic rate limit RPC
- `vercel.json` — cron schedule
- Dashboard pagination, extraction rate limiting, Codex timeout, and related changes across `queries.ts`, `actions.ts`, `extract/route.ts`, dashboard components, etc.

---

## Documentation added / rewritten

| File | Action |
|------|--------|
| `README.md` | Full rewrite — overview, features, stack, architecture diagram, data flow, decisions, setup, deployment, capacity (Estimated), roadmap, license |
| `docs/ARCHITECTURE.md` | **New** — routes, schema, auth, Codex flow, server actions, cron |
| `docs/SECURITY.md` | **New** — implemented security practices |
| `docs/DEVELOPMENT.md` | **New** — local setup, scripts, conventions, agent tooling note |
| `LICENSE` | **New** — proprietary, all rights reserved |
| `.env.example` | Enhanced with all variables, placeholders, and comments (now committable) |

Preserved and cross-linked: `PROJECT_DECISIONS.md`, `ENGINEERING_HIGHLIGHTS.md`, `ARCHITECTURE_REVIEW_100K_DAU.md`, `docs/legal/`.

---

## Secrets and sensitive data

### Current files — remediated

| Finding | Action |
|---------|--------|
| Hardcoded admin email in `admin-check.ts` | Moved to `ADMIN_EMAIL` env var |
| Hardcoded Supabase project ref in OAuth scripts | Derived from `NEXT_PUBLIC_SUPABASE_URL` |
| `.env.example` blocked by `.env*` gitignore | Fixed gitignore; `.env.example` now committable |
| Real Codex client ID in README | Removed; points to `.env.example` |

### Not in git (local only)

| File | Contents | Status |
|------|----------|--------|
| `.env.local` | Live Supabase keys, Google OAuth secret | Gitignored — never commit |

### Git history audit

| Pattern | Result |
|---------|--------|
| JWT tokens (`eyJhbGci`) | Not found |
| Service role key assignments | Not found |
| Google secrets (`GOCSPX-`) | Not found |
| Supabase project ref (`qsdlrfwvlwgtxghqdkab`) | **Found in `initial commit`** — was hardcoded in OAuth setup scripts (removed from current files) |

**Rotation recommendations (precautionary):**

- Supabase **service-role key** — rotate if repo was ever shared with `.env.local` nearby
- Google OAuth **client secret** — same
- Supabase **anon key** — low priority (public client key, RLS-scoped)
- Project ref in git history is an identifier, not a credential — no rotation needed, but consider history rewrite only if you want zero infrastructure linkage (not done on this branch per plan)

### User data

No database dumps, seed files, fixture data, or test accounts with real PII found in the repository.

---

## Capacity estimates (all Estimated)

No load testing was performed.

| Metric | Estimate | Basis |
|--------|----------|-------|
| Comfortable DAU | ~5k–10k | Phase 1 fixes: keyset pagination, atomic rate limiting, Codex 30s timeout |
| Concurrent extractions before queueing | ~50–500 | Sync SSE holds Vercel functions 10–30s; no async job queue |
| Per-user extraction burst | 20/min | `BURST_EXTRACTIONS_PER_MINUTE` constant |
| Postgres direct connections | ~60–200 | Supabase tier; no pooler configured |
| Main bottlenecks | Sync extraction, middleware auth on every request, plaintext Codex tokens, no connection pooler | Architecture review cross-checked against current code |

---

## Verification

| Check | Result |
|-------|--------|
| `npm run typecheck` | Pass |
| `npm run build` | Pass (with placeholder env vars) |
| `npm run check:follow-up` | Pass |
| `npm run check:queries-cursor` | Pass |
| `npm run lint` | **3 pre-existing errors** (not introduced by this branch) |

Lint failures (pre-existing, noted not fixed per no-behavior-change rule):

- `application-form.tsx:132` — `Date.now()` in render (`react-hooks/purity`)
- `first-run-guide-overlay.tsx:24` — setState in effect
- `workflow-pipeline.tsx:103` — setState in effect

---

## Bugs, risks, and improvements noted but not fixed

| Item | Severity | Notes |
|------|----------|-------|
| Codex tokens stored plaintext in Postgres | Medium | RLS protects cross-user access; encryption planned |
| `/api/extract` synchronous SSE | Medium | Holds serverless function 10–30s; no job queue |
| Client-side search/filter over loaded page | Low | GIN index exists but unused; server-side search deferred |
| Middleware calls `getUser()` on nearly every request | Low | ~2M auth round-trips/day at 100k DAU (Estimated) |
| No connection pooler configured | Medium | Hard ceiling under concurrent serverless load |
| Sentry stub only — no SDK | Low | `reportError()` is fire-and-forget envelope |
| ESLint purity violations (3) | Low | Pre-existing; CI runs lint but may fail on these |

---

## Assumptions

- Copyright holder: Ranjit Odedra
- Agent tooling (`.agents/`, `.cursor/`) kept in repo, documented in DEVELOPMENT.md only
- Owner must add `ADMIN_EMAIL` to `.env.local` for admin panel access
- No git history rewrite performed on private repo

---

## Dual-repository setup

| Remote | Repository | Role |
|--------|------------|------|
| `origin` | `github.com/ranjitodedra/lock-in-tracker` | Private production (Vercel) |
| `public` | `github.com/ranjitodedra/lock-in` | Public portfolio (orphan history + linear sync commits) |

- Portfolio prep merged to private `main` and pushed to `origin`
- Public repo bootstrapped via orphan `public-main` branch (no private commit history)
- Ongoing public updates: `npm run sync:public` (see [DEVELOPMENT.md](DEVELOPMENT.md))

---

## Before going public

1. Add `ADMIN_EMAIL` to `.env.local` and verify admin panel works
2. Enable GitHub secret scanning and push protection on both repos
3. Rotate Supabase service-role key and Google OAuth secret (precautionary)
4. Review public repo README on GitHub (Mermaid diagram)
5. Use `npm run sync:public` after future private releases when portfolio should update
