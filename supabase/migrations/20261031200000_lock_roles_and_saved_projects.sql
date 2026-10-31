-- Security fixes, 31 Oct 2026. Safe to run more than once.
-- 1. A user cannot make themselves admin or give themselves a paid plan.
-- 2. Profiles (names, emails) are readable only by their owner and admins,
--    and never without signing in.
-- 3. Saved studies move to saved_projects, which only the owner can read or
--    write. (They used to go to an old server with no login check.)

-- ── Is the caller an admin? ─────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ── users: replace every existing policy ───────────────────────────────────
alter table public.users enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'users' loop
    execute format('drop policy %I on public.users', p.policyname);
  end loop;
end $$;

revoke all on public.users from anon;

create policy users_select_own_or_admin on public.users
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- Sign-up can create only your own row, never admin, always the free plan.
create policy users_insert_own on public.users
  for insert to authenticated
  with check (
    id = auth.uid()
    and role in ('student', 'lecturer', 'organization')
    and coalesce(subscription_tier, 'free') = 'free'
  );

create policy users_update_own on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Role, plan and email change only through admin tools (the approve-upgrade
-- function, which uses the service role, or the SQL editor).
create or replace function public.users_protect_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    if new.role is distinct from old.role
       or new.subscription_tier is distinct from old.subscription_tier
       or new.email is distinct from old.email then
      raise exception 'Role, plan and email cannot be changed from the app' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists users_protect_columns on public.users;
create trigger users_protect_columns
  before update on public.users
  for each row execute function public.users_protect_columns();

-- ── saved_projects: one row per saved study, owner only ─────────────────────
create table if not exists public.saved_projects (
  user_id    uuid not null references auth.users (id) on delete cascade,
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  constraint saved_projects_size check (octet_length(data::text) < 3000000)
);

alter table public.saved_projects enable row level security;
revoke all on public.saved_projects from anon;
grant select, insert, update, delete on public.saved_projects to authenticated;

drop policy if exists saved_projects_select_own on public.saved_projects;
drop policy if exists saved_projects_insert_own on public.saved_projects;
drop policy if exists saved_projects_update_own on public.saved_projects;
drop policy if exists saved_projects_delete_own on public.saved_projects;

create policy saved_projects_select_own on public.saved_projects
  for select to authenticated using (user_id = auth.uid());
create policy saved_projects_insert_own on public.saved_projects
  for insert to authenticated with check (user_id = auth.uid());
create policy saved_projects_update_own on public.saved_projects
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy saved_projects_delete_own on public.saved_projects
  for delete to authenticated using (user_id = auth.uid());
