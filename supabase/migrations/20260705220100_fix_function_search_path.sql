-- Fix function search_path warnings from security advisor
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
