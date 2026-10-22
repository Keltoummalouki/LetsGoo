create table public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security;
create policy "Read own admin membership" on public.admins for select to authenticated using (user_id = auth.uid());
create function public.is_admin() returns boolean language sql security definer stable set search_path = public as $$ select exists(select 1 from public.admins where user_id = auth.uid()); $$;
create table public.categories (name text primary key);
create table public.neighborhoods (name text primary key);
create table public.places (
 id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null,
 category text not null references public.categories(name) on update cascade, neighborhood text not null references public.neighborhoods(name) on update cascade,
 description text not null default '', price numeric not null default 0 check(price >= 0), image text not null default '',
 address text not null default '', hours text not null default '', transport text not null default '', parking text not null default '',
 tips text not null default '', audience text[] not null default '{}', outdoor boolean not null default false,
 kid_friendly boolean not null default false, verified_at timestamptz, website text not null default '', phone text not null default '',
 activities text not null default '', published boolean not null default false, created_at timestamptz not null default now()
);
create table public.favorites (user_id uuid not null references auth.users(id) on delete cascade, place_id uuid not null references public.places(id) on delete cascade, primary key(user_id,place_id));
create table public.reviews (id uuid primary key default gen_random_uuid(), place_id uuid not null references public.places(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, rating integer not null check(rating between 1 and 5), body text not null check(char_length(body) between 10 and 2000), created_at timestamptz not null default now(), unique(user_id,place_id));
create table public.deals (id uuid primary key default gen_random_uuid(),place_id uuid not null references public.places(id) on delete cascade,title text not null,description text not null default '',conditions text not null default '',expires_at date not null);
alter table public.categories enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.places enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.deals enable row level security;
create policy "Public categories" on public.categories for select using(true);
create policy "Admin categories" on public.categories for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Public neighborhoods" on public.neighborhoods for select using(true);
create policy "Admin neighborhoods" on public.neighborhoods for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Published places" on public.places for select using(published or public.is_admin());
create policy "Admin places" on public.places for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Own favorites" on public.favorites for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.places where id=place_id and published));
create policy "Public reviews" on public.reviews for select using(public.is_admin() or exists(select 1 from public.places where id=place_id and published));
create policy "Write own review" on public.reviews for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.places where id=place_id and published));
create policy "Edit own review" on public.reviews for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.places where id=place_id and published));
create policy "Remove reviews" on public.reviews for delete to authenticated using(user_id=auth.uid() or public.is_admin());
create policy "Public active deals" on public.deals for select using((expires_at >= current_date and exists(select 1 from public.places where id=place_id and published)) or public.is_admin());
create policy "Admin deals" on public.deals for all to authenticated using(public.is_admin()) with check(public.is_admin());
insert into storage.buckets(id,name,public) values ('place-images','place-images',true) on conflict do nothing;
create policy "View place images" on storage.objects for select using(bucket_id='place-images');
create policy "Admin place images" on storage.objects for all to authenticated using(bucket_id='place-images' and public.is_admin()) with check(bucket_id='place-images' and public.is_admin());
-- Catalog and per-place lookup indexes.
create index places_published_category_idx on public.places(published,category);
create index reviews_place_id_idx on public.reviews(place_id);
create index favorites_place_id_idx on public.favorites(place_id);
create index deals_place_expiry_idx on public.deals(place_id,expires_at);
update storage.buckets set file_size_limit=5242880, allowed_mime_types=array['image/jpeg','image/png','image/webp'] where id='place-images';


