-- Existing listings keep their original visitor directions until edited.
alter table public.places add column if not exists visit jsonb
  check (visit is null or jsonb_typeof(visit) = 'object');
