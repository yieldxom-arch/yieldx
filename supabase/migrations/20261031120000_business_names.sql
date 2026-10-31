-- Business-name registry for the YieldX name check (Level 1).
--
-- Privacy: only a normalised key of the name is stored (no display name, no
-- study content). Users can read and change only their own rows. Other users'
-- names are never returned: check_business_name() returns counts only.

create extension if not exists fuzzystrmatch with schema extensions;

create table if not exists public.business_names (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_key text not null check (char_length(project_key) between 1 and 100),
  normalized text not null check (char_length(normalized) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_key)
);

comment on table public.business_names is
  'Normalised business names from YieldX studies, used to tell users whether another YieldX study uses the same or a similar name. Counts only are exposed to other users.';

create index if not exists business_names_normalized_idx on public.business_names (normalized);

alter table public.business_names enable row level security;

create policy "business_names_select_own" on public.business_names
  for select to authenticated using (user_id = (select auth.uid()));

create policy "business_names_insert_own" on public.business_names
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "business_names_update_own" on public.business_names
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "business_names_delete_own" on public.business_names
  for delete to authenticated using (user_id = (select auth.uid()));

-- Counts of other users' studies with the same or a similar name.
-- "Similar" = edit distance of about one letter in six (same rule as the app).
create or replace function public.check_business_name(p_normalized text)
returns table (exact_matches integer, similar_matches integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    count(*) filter (where b.normalized = p_normalized)::integer as exact_matches,
    count(*) filter (
      where b.normalized <> p_normalized
        and char_length(p_normalized) >= 4
        and extensions.levenshtein(b.normalized, p_normalized)
            <= greatest(1, char_length(p_normalized) / 6)
    )::integer as similar_matches
  from public.business_names b
  where b.user_id is distinct from auth.uid()
    and char_length(p_normalized) between 1 and 120;
$$;

revoke all on function public.check_business_name(text) from public, anon;
grant execute on function public.check_business_name(text) to authenticated;
