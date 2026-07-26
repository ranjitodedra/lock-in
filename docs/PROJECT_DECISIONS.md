# Lock-In — Project Decisions

Locked MVP boundaries and architecture decisions for the AI Job Application Tracker.

## Product scope (MVP)

| Question | Decision | Rationale |
|---|---|---|
| Personal vs collaborative | **Personal only** | Simpler RLS model; collaboration is v2 |
| Multiple job searches / boards | **Single flat list** | Avoid over-engineering; tags/boards in v2 |
| Import / export | **Out of MVP** (v2: CSV export) | Manual entry + AI extract is core loop |
| File attachments | **Out of MVP** | No Supabase Storage setup in v1 |
| Notes / activity timeline | **Out of MVP** | Optional `notes` text field on application only |
| Email integration | **Explicitly out** | High complexity, low MVP value |
| Browser extension | **v2+** | Web paste flow is sufficient for launch |
| Mobile | **Responsive web only** | No PWA install prompt in MVP |
| Offline | **Online-only** | Manual form works without AI; extraction requires network |
| Multi-language descriptions | **Preserve original language** | Do not translate; extract as written |

## AI extraction behavior

| Question | Decision |
|---|---|
| Where extraction runs | **Inngest worker** triggered by `POST /api/extract` (enqueue `202` + poll) |
| ChatGPT not connected | **Allow manual entry**; show connect prompt for AI extract button only |
| Re-extract | **Yes** — optional "Re-extract" on new/edit form if description changes |
| Max description length | **32,000 characters** (~8k tokens); truncate with user warning above limit |
| Output format | **Strict JSON** via Zod validation server-side; system prompt enforces schema |
| Partial extraction UI | **Editable empty fields** only (no confidence scores in MVP) |
| Non-job input | Return `{ error: "not_a_job_posting", message: "..." }` |
| Store raw description | **Yes** — `raw_description` column for re-extraction and audit |
| Skills vs technologies | **Separate arrays** per schema |
| Salary | **Raw string** in MVP; normalized min/max in v2 |
| Deadline timezone | **User locale** for display; store ISO date in UTC |
| Free vs Plus ChatGPT | **Same flow**; show capability message if relay returns subscription error |

## ChatGPT OAuth / AuthAI

| Question | Decision |
|---|---|
| Relay hosting | **Hosted relay (`https://relay.authai.io`) for MVP**; self-host on Railway/Fly before scale |
| Token storage | **httpOnly secure cookie** set by server after OAuth callback; never localStorage |
| Token refresh | **Silent refresh** via server when possible; re-prompt Connect ChatGPT when refresh fails |
| Consent copy | "Lock-In uses your ChatGPT subscription only to extract job fields from text you paste. We do not use it for general chat." |
| Rate limits (app-side) | **20/min burst throttle** to prevent abuse (no monthly cap) |
| Security | No token logging; RLS on all user data; tokens in `codex_connections` (plaintext at rest — encryption planned) |
| ToS disclaimer | Shown on connect screen and Settings |
| Plan B | **Manual form always available**; BYOK OpenAI key deferred to v2 |

## Authentication (Supabase)

| Question | Decision |
|---|---|
| Sign-in methods | **Email magic link + Google OAuth** for MVP |
| Email verification | **Required** before saving applications |
| Anonymous trial | **No** — sign in first |
| ChatGPT link | **One ChatGPT connection per Supabase user** |
| Account deletion | **Cascade delete** applications; clear AI cookies |

## Dashboard & data model

| Question | Decision |
|---|---|
| Default status | **Wishlist** |
| Follow-up auto-set | **Applied only** (14 calendar days) |
| Business days | **User locale calendar** |
| MVP filters | Status, work mode, deadline range |
| Search | **Company, job title, skills** (full-text on key fields) |
| Detail view | **Sheet/drawer** from dashboard row click |
| Bulk actions | **v2** |
| Kanban | **Table only** in MVP |
| Tags / labels | **v2** |

## AI extraction

| Question | Decision |
|---|---|
| Extraction limits | **Unlimited** for all users (burst rate limit only for abuse prevention) |

## UX & quality

| Question | Decision |
|---|---|
| Design | shadcn/ui defaults + subtle brand accent (neutral/zinc palette) |
| Dark mode | **Yes** — system preference + toggle |
| Keyboard shortcuts | `/` focus search, `n` new application (dashboard) |
| Extraction errors | **Toast** for failures; inline for field validation |
| Loading | **Skeleton** — wait for full JSON (no streaming partial fields) |
| Accessibility | **WCAG 2.1 AA** target |
| Monorepo | **Single Next.js app** |
| Local dev | **Supabase cloud** for MVP; CLI optional later |
| CI | lint + typecheck (GitHub Actions when repo pushed) |
| Error monitoring | **Sentry-ready** hooks in Phase 8 |
| Analytics | **Vercel Analytics** (optional, privacy-friendly) |

## Legal & compliance

| Question | Decision |
|---|---|
| Privacy / Terms | See `docs/legal/` |
| Data residency | **Supabase US region** default (configurable) |
| Retention | No auto-delete in MVP; manual account deletion supported |

## Build phases

Follow order in `docs/dev/FABLE_PROMPT.md`: Phase 0 → 9 incrementally.
