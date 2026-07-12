# Fable Master Prompt — Lock-In MVP

Copy the block below into Cursor as the initial message to Fable. Work **one phase at a time**.

---

# Project: Lock-In — AI Job Application Tracker (MVP)

You are my senior product engineer, UX designer, and software architect. Build a polished MVP incrementally. Do NOT generate the entire app at once. After each phase, stop and summarize what was built and what to test before continuing.

**Reference:** Locked decisions in `docs/PROJECT_DECISIONS.md`. Phase 0 scaffold already exists — extend it, do not recreate from scratch unless broken.

## Product vision

A minimal, professional job application tracker. Users paste a full job description; AI extracts structured fields into an editable form; they save and track status on a dashboard. Feel: Linear / Notion / Stripe — whitespace, soft shadows, rounded corners, fast interactions.

## Target user

Students and professionals applying to many jobs who want one searchable place to track everything.

## Confirmed tech stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js Route Handlers (no separate Express server)
- **Database:** Supabase PostgreSQL with Row Level Security
- **Auth:** Supabase Auth (email magic link + Google OAuth for MVP)
- **AI:** User's own ChatGPT subscription via AuthAI-style OAuth — `<LoginWithChatGPT />` pattern. The app owner NEVER pays OpenAI API costs for extraction.
- **Deploy target:** Vercel + Supabase (design for this from day one)

## Critical AI constraints

1. AI is used ONLY for structured job-data extraction from pasted job descriptions.
2. System prompt MUST refuse general chat, advice, coding help, or any non-extraction request.
3. Return strict JSON matching the schema below. Never invent values — use `null` when not stated or strongly implied.
4. If input is not a job posting, return `{ "error": "not_a_job_posting", "message": "..." }`.
5. Always allow manual form entry if ChatGPT is not connected or extraction fails.
6. Never log or expose OAuth tokens client-side beyond what AuthAI SDK requires.

## Extraction schema (all fields optional, nullable)

```typescript
type JobExtraction = {
  company: string | null;
  jobTitle: string | null;
  location: string | null;
  country: string | null;
  workMode: "Remote" | "Hybrid" | "Onsite" | null;
  employmentType: string | null;
  salary: string | null;
  applicationDeadline: string | null;
  skills: string[] | null;
  technologies: string[] | null;
  experienceRequired: string | null;
  education: string | null;
  responsibilities: string | null;
  qualifications: string | null;
  benefits: string | null;
  visaSponsorship: boolean | null;
  recruiterName: string | null;
  recruiterEmail: string | null;
  recruiterPhone: string | null;
  applyUrl: string | null;
  companyWebsite: string | null;
  summary: string | null;
};
```

## Application statuses

Wishlist | Preparing | Applied | OA | Interview | Offer | Rejected | Accepted

## Follow-up logic

When user sets status to **Applied** and no employer-specific follow-up guidance exists:

- Auto-suggest follow-up date **7–10 business days** later (exclude weekends; user locale).
- User can edit the suggested date before/after save.

## MVP user flow

1. Sign in (Supabase Auth)
2. Dashboard — table with search, filter by status, sort
3. "New Application" → paste job description
4. If ChatGPT not connected → prompt `<LoginWithChatGPT />` (AuthAI SDK)
5. Call extraction API with user token → editable pre-filled form
6. User corrects fields → Save
7. Application appears on dashboard
8. Click row → detail sheet with full extracted info

## Dashboard table columns

Company | Role | Status | Deadline | Follow-up Date | Location | Date Added

## Data model (Supabase)

See `supabase/migrations/` when added. RLS on all tables.

## AI extraction

- Unlimited extractions for all users (burst rate limit for abuse prevention only)
- Never block manual entry

## Phased build plan

### Phase 0 — Scaffold ✅ (done)

### Phase 1 — Auth

- Supabase Auth: login, signup, logout, protected routes

### Phase 2 — Database

- Migrations, RLS, TypeScript types

### Phase 3 — Dashboard shell

- Table, search, filter, sort, status badges

### Phase 4 — Manual CRUD

- New/edit/delete applications without AI

### Phase 5 — ChatGPT OAuth

- AuthAI SDK, settings page, httpOnly token cookie

### Phase 6 — AI extraction

- `POST /api/extract`, burst rate limits, re-extract

### Phase 7 — Follow-up logic

### Phase 8 — Polish

## Out of scope

Clerk, Express, Prisma, Railway, Kanban, CSV import, email parsing, browser extension, collaboration, resume storage

## Next step

Continue from the next incomplete phase. Read existing code first.
