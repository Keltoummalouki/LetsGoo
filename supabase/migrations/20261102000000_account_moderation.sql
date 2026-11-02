begin;

create function public.admin_accounts(page_index integer default 0)
returns table (id uuid, email text, joined_at timestamptz, suspended boolean, protected boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise insufficient_privilege; end if;
  return query select u.id, u.email::text, u.created_at, coalesce(u.banned_until > now(), false),
    exists (select 1 from public.admins a where a.user_id = u.id)
    from auth.users u order by u.created_at desc, u.id
    limit 51 offset (greatest(page_index, 0)::bigint * 50);
end;
$$;

create function public.admin_set_suspension(account_id uuid, suspend boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise insufficient_privilege; end if;
  if suspend is null or account_id = auth.uid() or exists
    (select 1 from public.admins where user_id = account_id) then
    raise exception 'Administrator accounts cannot be suspended here.';
  end if;
  update auth.users set banned_until = case when suspend then now() + interval '100 years' else null end,
    updated_at = now() where id = account_id;
  if not found then raise exception 'Account no longer exists.'; end if;
  if suspend then delete from auth.sessions where user_id = account_id; end if;
end;
$$;

-- Existing JWTs can outlive a revoked session. Enforce suspension on member data immediately.
create function public.account_active() returns boolean language sql stable security definer
set search_path = '' as $$ select exists (
  select 1 from auth.users where id = auth.uid() and (banned_until is null or banned_until <= now())
); $$;
create policy "Active favorite owner" on public.favorites as restrictive for all to authenticated
using (public.account_active()) with check (public.account_active());
create policy "Active review author insert" on public.reviews as restrictive for insert to authenticated
with check (public.account_active());
create policy "Active review author update" on public.reviews as restrictive for update to authenticated
using (public.account_active()) with check (public.account_active());
create policy "Active review author delete" on public.reviews as restrictive for delete to authenticated
using (public.account_active());

revoke all on function public.admin_accounts(integer), public.admin_set_suspension(uuid,boolean),
  public.account_active() from public, anon;
grant execute on function public.admin_accounts(integer), public.admin_set_suspension(uuid,boolean),
  public.account_active() to authenticated;
commit;
