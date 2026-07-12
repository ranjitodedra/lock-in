# Development

Owner reference for local setup, testing, and conventions. This project is **not open for external contributions** — see [LICENSE](../LICENSE).

---

## Prerequisites

- Node.js 20+
- npm
- Supabase project (cloud or local via Supabase CLI)
- (Optional) Supabase CLI logged in (`supabase login`) for Google OAuth setup scripts

---

## Local setup

```bash
cp .env.example .env.local
# Fill in Supabase credentials and ADMIN_EMAIL
npm install
npm run dev
```

See [README.md](../README.md) for Supabase Auth configuration and migration steps.

---

## npm scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Serve production build |
| `lint` | `eslint` | Lint source |
| `typecheck` | `tsc --noEmit` | Type check |
| `check:follow-up` | `tsx follow-up.ts` | Self-check for follow-up date logic |
| `check:queries-cursor` | `tsx queries-cursor-check.ts` | Self-check for cursor encode/decode |
| `setup:google-oauth` | `node scripts/setup-google-oauth.mjs` | Configure Google OAuth on Supabase |
| `verify:google-oauth` | `node scripts/verify-google-oauth.mjs` | Verify Google redirect URI |
| `sync:public` | `node scripts/sync-public.mjs` | Publish current private tree to public portfolio repo |

There is no formal test framework (Jest/Vitest/Playwright). Verification is lint + typecheck + build + self-check scripts.

---

## Dual-repository publishing

This project uses two GitHub repositories:

| Remote | Repository | Purpose |
|--------|------------|---------|
| `origin` | `lock-in-tracker` (private) | Production — Vercel deploys from here |
| `public` | `lock-in` (public) | Portfolio — clean history, no private commits |

**Never** run `git push public main:main` from private history. The public repo is bootstrapped from an orphan branch and updated only via `sync:public`.

### One-time bootstrap (already done if public repo has an initial commit)

```powershell
git remote add public https://github.com/ranjitodedra/lock-in.git
git checkout main
git checkout --orphan public-main
git add -A
git commit -m "Initial public release: Lock-In job application tracker"
git push -u public public-main:main
git checkout main
```

### Ongoing workflow

```powershell
# 1. Ship to production (private)
git checkout main
git merge my-feature
git push origin main

# 2. Publish to portfolio when ready (adds one linear commit on public)
npm run sync:public
```

Optional source branch:

```powershell
node scripts/sync-public.mjs recruiter-ready
```

The sync script requires a clean working tree and the `public` git remote.

---

## Environment variables

All variables are documented in [`.env.example`](../.env.example) with placeholders and comments.

Validated at startup by [`src/env.ts`](../src/env.ts). Required for local dev:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_EMAIL` (your email, for admin panel access)

Optional locally, required on Vercel production:

- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

---

## Database migrations

Migrations are in [`supabase/migrations/`](../supabase/migrations/). Apply to your Supabase project via:

```bash
supabase db push
```

Or run the SQL files manually in the Supabase dashboard SQL editor.

After schema changes, regenerate TypeScript types:

```bash
supabase gen types typescript --project-id <ref> > src/types/database.ts
```

Also update [`src/types/application.ts`](../src/types/application.ts) if application-specific types change.

---

## CI

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs on push and PR:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build` (with placeholder Supabase env vars)

---

## Conventions

### Code style

- TypeScript strict mode
- ESLint with `eslint-config-next`
- Match existing patterns in surrounding files — no drive-by refactors
- Intentional shortcuts marked with `ponytail:` comments (known ceiling + upgrade path)

### Auth patterns

- Protected routes: middleware redirect + `requireUser()` in layouts/actions
- Admin: `requireAdmin()` server-side; nav visibility via `showAdminNav` prop from server
- Never trust client-supplied `user_id`

### Data access

- User-scoped queries via Supabase client with RLS (`createClient()` from `@/lib/supabase/server`)
- Admin queries via service-role client (`createAdminClient()`)
- List views use column projection; detail views fetch full rows

### Server Actions

- Return updated entity for optimistic UI updates
- Revalidate paths only when the client cannot infer the new state (create, delete — not patch)

---

## Agent tooling (not runtime)

These directories support AI-assisted development and are **not part of the application**:

| Path | Purpose |
|------|---------|
| `.agents/` | Cursor agent skills (caveman, cavecrew) |
| `.cursor/rules/` | Cursor editor rules (ponytail, karpathy guidelines) |
| `AGENTS.md`, `CLAUDE.md` | Agent instructions for Next.js 16 |
| `docs/dev/FABLE_PROMPT.md` | Master prompt used for incremental AI-assisted builds |

They can be ignored when reviewing the application architecture.

---

## Internal docs

| Document | Purpose |
|----------|---------|
| [PROJECT_DECISIONS.md](PROJECT_DECISIONS.md) | Locked MVP boundaries |
| [ENGINEERING_HIGHLIGHTS.md](ENGINEERING_HIGHLIGHTS.md) | Production hardening changelog |
| [ARCHITECTURE_REVIEW_100K_DAU.md](ARCHITECTURE_REVIEW_100K_DAU.md) | Scale review |
| [dev/FABLE_PROMPT.md](dev/FABLE_PROMPT.md) | AI build prompt archive |
