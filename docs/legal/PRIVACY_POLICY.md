# Privacy Policy

**Last updated:** July 5, 2026

Lock-In ("we", "our", "the app") is an AI-powered job application tracker. This policy describes what we collect, why, and your choices.

## Information we collect

### Account information

When you sign in (via Supabase Auth), we store:

- Email address and authentication identifiers
- Optional display name and avatar URL

### Application data

When you save a job application, we store the fields you submit, which may include:

- Company name, job title, location, salary, deadlines, skills, and related job metadata
- The raw job description you paste (if you choose to save it)
- Application status, follow-up dates, and notes

Job descriptions may contain personal information about recruiters or third parties. You are responsible for what you paste and store.

### ChatGPT connection (optional)

If you connect ChatGPT for AI extraction:

- We use an experimental third-party OAuth relay (AuthAI-style) to obtain a token scoped to model calls on your behalf
- Tokens are stored in **httpOnly secure cookies** on our servers, not in browser localStorage
- We do **not** sell or share your ChatGPT tokens with other users

We do not receive your ChatGPT password.

### Usage data

We may collect:

- Basic analytics (e.g., page views via Vercel Analytics) if enabled

## How we use information

- Provide the dashboard, CRUD, search, and AI extraction features
- Improve reliability and fix bugs
- Comply with legal obligations

We do **not** use your job data to train AI models.

## AI extraction

Extraction sends the job description text you provide to a language model via your connected ChatGPT subscription (or future fallback you configure). Only the pasted text and our fixed extraction system prompt are sent, not your full application history.

## Data storage and security

- Data is stored in **Supabase PostgreSQL** with Row Level Security so each user sees only their own records
- Connections use HTTPS in production
- OAuth tokens are not logged

## Data retention

We retain your data until you delete your account or individual applications. We do not auto-delete inactive accounts in the MVP.

## Your rights

Depending on your location, you may have the right to:

- Access, correct, or delete your data
- Export your data (when available)
- Withdraw consent for optional ChatGPT connection (disconnect in Settings)

To request deletion, use in-app account deletion (when available) or contact the project maintainer.

## Third-party services

| Service | Purpose |
|---|---|
| Supabase | Auth, database, hosting |
| Vercel | App hosting |
| AuthAI relay | ChatGPT OAuth token exchange and model proxy |

Each provider has its own privacy policy.

## Children

Lock-In is not directed at children under 13. We do not knowingly collect data from children.

## Changes

We may update this policy. Material changes will be noted in the app or repository.

## Contact

For privacy questions, open an issue in the project repository or contact the maintainer listed in the README.
