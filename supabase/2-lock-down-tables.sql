-- ═══════════════════════════════════════════════════════════════════
-- STEP 2 of 2 — make the database private (Row Level Security)
-- Run ONLY after step 1 has run and the new site (with staff login) is live.
--
-- After this:
--   owner    → full access
--   manager  → read / add / edit everything; cannot delete; cannot change deals
--   visitors → can see active deals and use the two booking functions; nothing else
-- ═══════════════════════════════════════════════════════════════════

begin;

-- Remove any existing policies on these tables (e.g. old "allow all" rules)
do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
     where schemaname = 'public'
       and tablename in ('clients', 'appointments', 'invoices', 'deals')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

alter table public.clients      enable row level security;
alter table public.appointments enable row level security;
alter table public.invoices     enable row level security;
alter table public.deals        enable row level security;

-- clients, appointments, invoices: staff read/add/edit, owner deletes
create policy "staff read"   on public.clients for select to authenticated using (public.staff_role() in ('owner','manager'));
create policy "staff add"    on public.clients for insert to authenticated with check (public.staff_role() in ('owner','manager'));
create policy "staff edit"   on public.clients for update to authenticated using (public.staff_role() in ('owner','manager')) with check (public.staff_role() in ('owner','manager'));
create policy "owner delete" on public.clients for delete to authenticated using (public.staff_role() = 'owner');

create policy "staff read"   on public.appointments for select to authenticated using (public.staff_role() in ('owner','manager'));
create policy "staff add"    on public.appointments for insert to authenticated with check (public.staff_role() in ('owner','manager'));
create policy "staff edit"   on public.appointments for update to authenticated using (public.staff_role() in ('owner','manager')) with check (public.staff_role() in ('owner','manager'));
create policy "owner delete" on public.appointments for delete to authenticated using (public.staff_role() = 'owner');

create policy "staff read"   on public.invoices for select to authenticated using (public.staff_role() in ('owner','manager'));
create policy "staff add"    on public.invoices for insert to authenticated with check (public.staff_role() in ('owner','manager'));
create policy "staff edit"   on public.invoices for update to authenticated using (public.staff_role() in ('owner','manager')) with check (public.staff_role() in ('owner','manager'));
create policy "owner delete" on public.invoices for delete to authenticated using (public.staff_role() = 'owner');

-- deals: everyone sees active deals (booking page), staff see all, only owner changes them
create policy "public read active" on public.deals for select to anon, authenticated using (active = true or public.staff_role() in ('owner','manager'));
create policy "owner add"    on public.deals for insert to authenticated with check (public.staff_role() = 'owner');
create policy "owner edit"   on public.deals for update to authenticated using (public.staff_role() = 'owner') with check (public.staff_role() = 'owner');
create policy "owner delete" on public.deals for delete to authenticated using (public.staff_role() = 'owner');

commit;

-- ── Emergency undo (only if something breaks): makes the tables open again
-- alter table public.clients      disable row level security;
-- alter table public.appointments disable row level security;
-- alter table public.invoices     disable row level security;
-- alter table public.deals        disable row level security;
