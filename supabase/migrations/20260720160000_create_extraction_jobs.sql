-- extraction_jobs: async AI extraction queue (status tracked; worker updates via service role)
create table public.extraction_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  raw_description text not null,
  result jsonb,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index extraction_jobs_user_id_created_at_idx
  on public.extraction_jobs (user_id, created_at desc);

create index extraction_jobs_status_created_at_idx
  on public.extraction_jobs (status, created_at);

alter table public.extraction_jobs enable row level security;

create policy "extraction_jobs_select_own"
  on public.extraction_jobs for select
  using (auth.uid() = user_id);

create policy "extraction_jobs_insert_own"
  on public.extraction_jobs for insert
  with check (auth.uid() = user_id);
