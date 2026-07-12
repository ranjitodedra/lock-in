-- applications: job application records (one row per application per user)
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  status text not null default 'Wishlist'
    check (status in (
      'Wishlist', 'Preparing', 'Applied', 'OA',
      'Interview', 'Offer', 'Rejected', 'Accepted'
    )),

  company text,
  job_title text,
  location text,
  country text,
  work_mode text check (work_mode is null or work_mode in ('Remote', 'Hybrid', 'Onsite')),
  employment_type text,
  salary text,
  application_deadline timestamptz,
  follow_up_date date,
  skills text[],
  technologies text[],
  experience_required text,
  education text,
  responsibilities text,
  qualifications text,
  benefits text,
  visa_sponsorship boolean,
  recruiter_name text,
  recruiter_email text,
  recruiter_phone text,
  apply_url text,
  company_website text,
  summary text,
  raw_description text,
  notes text,
  search_vector tsvector,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_id_created_at_idx
  on public.applications (user_id, created_at desc);

create index applications_search_vector_idx
  on public.applications using gin (search_vector);

-- ponytail: trigger-maintained tsvector — to_tsvector is not immutable for generated/index expr
create or replace function public.applications_search_vector_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_vector := to_tsvector(
    'english',
    coalesce(new.company, '') || ' ' ||
    coalesce(new.job_title, '') || ' ' ||
    coalesce(array_to_string(new.skills, ' '), '')
  );
  return new;
end;
$$;

create trigger applications_search_vector_trigger
  before insert or update on public.applications
  for each row
  execute function public.applications_search_vector_update();

-- extraction_usage: append-only log for AI extraction quota (Phase 6)
create table public.extraction_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index extraction_usage_user_id_created_at_idx
  on public.extraction_usage (user_id, created_at desc);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_set_updated_at
  before update on public.applications
  for each row
  execute function public.set_updated_at();

-- RLS: applications
alter table public.applications enable row level security;

create policy "applications_select_own"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "applications_insert_own"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "applications_update_own"
  on public.applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "applications_delete_own"
  on public.applications for delete
  using (auth.uid() = user_id);

-- RLS: extraction_usage (append-only for users)
alter table public.extraction_usage enable row level security;

create policy "extraction_usage_select_own"
  on public.extraction_usage for select
  using (auth.uid() = user_id);

create policy "extraction_usage_insert_own"
  on public.extraction_usage for insert
  with check (auth.uid() = user_id);
