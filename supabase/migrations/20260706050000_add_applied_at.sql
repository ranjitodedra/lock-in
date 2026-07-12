alter table public.applications
  add column applied_at date;

update public.applications
set applied_at = coalesce(
  follow_up_date - interval '14 days',
  created_at::date
)
where applied_at is null
  and status not in ('Wishlist', 'Preparing');
