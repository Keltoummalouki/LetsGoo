begin;
alter table public.reviews add column display_name text check (length(display_name) <= 80);
alter table public.deals
  add column starts_on date,
  add column min_members integer check (min_members > 0),
  add column weekdays integer[] check (cardinality(weekdays) > 0 and weekdays <@ array[1,2,3,4,5,6,7]),
  add constraint deal_date_order check (starts_on <= expires_at);
commit;
