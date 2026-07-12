-- ChatGPT / Codex OAuth tokens per user (too large for browser cookies)
create table public.codex_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.codex_connections enable row level security;

create policy "Users manage own codex connection"
  on public.codex_connections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
