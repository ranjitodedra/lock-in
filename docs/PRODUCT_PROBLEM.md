# Does Lock-In solve a real problem?

Product answers for Lock-In — an AI job application tracker. Grounded in the [manifesto](../src/app/manifesto/page.tsx), [MVP decisions](PROJECT_DECISIONS.md), and [README](../README.md).

---

## Does this solve a real problem?

**Yes — for active job seekers who apply often and lose track.**

Job search is fragmented across LinkedIn, Indeed, company career sites, and email. People apply to dozens or hundreds of roles and end up with:

- Spreadsheets that go stale
- Browser bookmarks and screenshots of postings
- Forgotten follow-ups and missed deadlines
- Painful re-typing of company, title, salary, and skills from long job descriptions

Lock-In turns “paste the posting → review structured fields → track status” into a single personal loop. Manual entry always works; AI extraction (via the user’s own ChatGPT subscription) removes the busywork of copying fields.

It is **not** a marketplace, ATS, or recruiter tool. It does not apply for you, scrape jobs, or sync email. The problem it owns is **personal pipeline hygiene** during an active search.

---

## Who are the users?

| Segment | Why they care |
|--------|----------------|
| **Primary:** Active job seekers applying to many roles | Need one place to see status, follow-ups, and posting details without a spreadsheet |
| **Secondary:** Career switchers / new grads in a high-volume search | Same pain, often less process discipline |
| **Tertiary:** Builders / recruiters reviewing the project | Portfolio demo of auth, RLS, and production-minded patterns |

**Assumptions about a typical user:**

- Has (or can create) a Google or email account for sign-in
- Optionally has ChatGPT Plus/Pro for AI extract; otherwise uses the form
- Works alone — no shared boards or team collaboration in MVP
- Uses a laptop/phone browser; no native app or offline mode

Out of scope as users: hiring managers, recruiting teams, agencies, and anyone who needs collaborative pipelines.

---

## What pain point am I solving?

**The core pain:** *Entering and organizing job applications is slow, repetitive, and easy to drop.*

Concrete pains Lock-In targets:

1. **Data entry tax** — Copying title, company, salary, skills, location/mode, and deadlines from a wall of job-description text.
2. **Pipeline opacity** — Not knowing what is wishlist vs applied vs interview vs rejected without digging through notes.
3. **Follow-up amnesia** — Applying and never circling back; Lock-In auto-suggests a follow-up date 14 days after “Applied.”
4. **Cost anxiety around AI** — Users already pay for ChatGPT; BYOK/Codex OAuth means the app owner does not meter OpenAI API spend onto job seekers.

Pain it deliberately does **not** solve (yet): auto-applying, resume tailoring, interview prep, email inbox sync, multi-person boards, CSV import/export.

---

## What features are actually important?

Ranked by how much they carry the product promise:

| Priority | Feature | Why it matters |
|----------|---------|----------------|
| **P0** | Auth (magic link + Google) | Personal data must be private and recoverable |
| **P0** | Application CRUD + status | Without this, there is no tracker |
| **P0** | Dashboard list with search/filters | The daily surface people open |
| **P0** | Manual form that works without AI | Fail-open product: AI is acceleration, not a gate |
| **P1** | AI field extraction from pasted JD | Differentiator vs a plain spreadsheet |
| **P1** | Follow-up date suggestion | Turns status into an action reminder |
| **P1** | ChatGPT connect / disconnect in Settings | Required for extraction; must be clear and revocable |
| **P2** | Keyboard shortcuts (`/` search, `n` new) | Speed for power users mid-search |
| **P2** | Dark mode / theme | Comfort during long sessions |
| **P2** | Legal pages + manifesto | Trust for a free tool handling job-search data |
| **Nice** | Admin user overview | Operator need, not end-user value |

Deferred (v2+): CSV export, collaboration, attachments, bulk actions, kanban, browser extension, server full-text search usage, async extraction queue.

---

## What are edge cases in this domain?

Job applications are messy human data. Important edges:

### Input / extraction

- **Not a job posting** — User pastes a blog, resume, or chat thread; extraction should refuse with a clear error, not invent fields.
- **Partial / weird postings** — Missing salary, vague “competitive,” remote + hybrid mixed language, multiple locations.
- **Non-English or mixed-language JDs** — Preserve original language; do not silently translate.
- **Huge descriptions** — Cap (~32k characters); warn and truncate rather than hang or blow token limits.
- **AI hallucination** — Wrong company/title/skills; user must always review before save.
- **Re-extract after edit** — Description changed; stale extracted fields must be overwriteable intentionally.
- **ChatGPT not connected / subscription error** — Manual path still works; connect prompt only on extract.

### Lifecycle / status

- **Wishlist vs applied** — Default wishlist; follow-up only when status becomes applied.
- **Duplicate applications** — Same role posted twice or reapplied; no unique constraint on company+title (user may legitimately reapply).
- **Deleted accounts** — Cascade applications and clear Codex tokens.
- **Email not verified** — Block saves until verification (trust boundary).

### Auth / AI credentials

- **OAuth token expiry / refresh failure** — Prompt reconnect; do not leave silent broken extract.
- **Unofficial Codex OAuth breaks** — Plan B is manual entry; product must stay useful if the relay dies.
- **Rate-limit bursts** — Abuse or double-clicks; burst throttle (~20/min) without a monthly “paywall” feel.

### Product boundaries

- **No collaboration** — Sharing a login is unsupported; data is per `user_id` via RLS.
- **Online-only** — Offline mid-flight on a plane: form needs network for save; extract needs network always.

---

## What would happen if 1000 people used this?

**Short answer: the product would likely hold.** One thousand users is well inside the architecture’s comfortable band (~5k–10k DAU estimated in the README), assuming they are not all extracting at the same second.

### What goes fine

- **Auth + RLS** — Each user’s applications stay isolated; 1k accounts is routine for Supabase.
- **Dashboard** — Keyset pagination and slim list projections keep list loads bounded even if some users have hundreds of rows.
- **Storage** — A few thousand applications with optional 32KB raw descriptions is small Postgres load.
- **Cost model** — BYOK ChatGPT means extraction cost stays on users’ subscriptions; app cost is mostly Vercel + Supabase free/low tiers plus any AuthAI relay dependency.

### What gets stressed (still manageable at 1k)

| Area | At ~1k users | Risk level |
|------|----------------|------------|
| Concurrent AI extractions | Sync SSE holds a serverless function 10–30s; a spike of simultaneous extracts can queue or time out | Low–medium if usage is staggered; higher during “Sunday apply night” |
| `extraction_usage` rows | Append-only with nightly cleanup — fine at this scale | Low |
| Middleware `getUser()` on many requests | Extra Auth round-trips; annoying at 100k, noise at 1k | Low |
| Codex tokens plaintext at rest | Blast radius if DB leaks — scale of users increases impact of the same bug | Medium (security, not capacity) |
| Unofficial OAuth / relay | One upstream change breaks extract for everyone at once | Medium (availability of AI feature) |

### What “success” looks like at 1k

- Most users treat it as a **personal CRM for applications**.
- A fraction connect ChatGPT; the rest use manual entry.
- Support load is mostly “extract wrong fields” and “reconnect ChatGPT,” not “site is down.”
- The first real scale cliff is not 1k users — it is **concurrent long-running extractions** and later **unbounded dashboard payloads** for power users, documented for much larger targets in [ARCHITECTURE_REVIEW_100K_DAU.md](ARCHITECTURE_REVIEW_100K_DAU.md) and [SCALE_UP_PLAN.md](SCALE_UP_PLAN.md).

### Honest bottom line

At 1,000 people, Lock-In should feel like a solid free personal tool. Failure modes are more likely **product/trust** (bad AI fields, OAuth breakage) than **infrastructure collapse**. Infrastructure work becomes urgent closer to tens of thousands of DAU or a viral spike of simultaneous extractions — not at one thousand calm daily users.
