-- ═══════════════════════════════════════════════════════════════════
-- STEP 3 — services the owner can add to the menu
-- Run in Supabase → SQL Editor. Only creates a new table; existing data is untouched.
-- Everyone can see services that are on the menu; only the owner can change them.
-- ═══════════════════════════════════════════════════════════════════

begin;

create table if not exists public.services (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) between 1 and 120),
  category   text not null check (length(trim(category)) between 1 and 60),
  price      numeric not null check (price >= 0),
  duration   integer not null default 0 check (duration >= 0),
  active     boolean not null default true,
  created_at timestamp default now()
);

alter table public.services enable row level security;

drop policy if exists "public read active" on public.services;
drop policy if exists "owner add"          on public.services;
drop policy if exists "owner edit"         on public.services;
drop policy if exists "owner delete"       on public.services;

create policy "public read active" on public.services for select to anon, authenticated using (active = true or public.staff_role() in ('owner','manager'));
create policy "owner add"    on public.services for insert to authenticated with check (public.staff_role() = 'owner');
create policy "owner edit"   on public.services for update to authenticated using (public.staff_role() = 'owner') with check (public.staff_role() = 'owner');
create policy "owner delete" on public.services for delete to authenticated using (public.staff_role() = 'owner');

commit;
