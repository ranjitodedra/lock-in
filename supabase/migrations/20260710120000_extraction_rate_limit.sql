-- Atomic extraction rate limit check + insert (closes check-then-insert race)
create or replace function public.check_and_record_extraction(
  p_limit int,
  p_window_seconds int
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  recent_count int;
begin
  if uid is null then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtext(uid::text));

  select count(*) into recent_count
  from public.extraction_usage
  where user_id = uid
    and created_at > now() - make_interval(secs => p_window_seconds);

  if recent_count >= p_limit then
    return false;
  end if;

  insert into public.extraction_usage (user_id) values (uid);
  return true;
end;
$$;

grant execute on function public.check_and_record_extraction(int, int) to authenticated;
