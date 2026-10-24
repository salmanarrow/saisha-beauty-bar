-- ═══════════════════════════════════════════════════════════════════
-- STEP 1 of 2 — staff roles + public booking functions
-- Safe to run while the old site is live: it only ADDS things.
-- Run in Supabase → SQL Editor, after creating the two staff users:
--   saisha@saishabeauty.staff   (owner)
--   manager@saishabeauty.staff  (manager)
-- ═══════════════════════════════════════════════════════════════════

begin;

-- Stop here if the staff users haven't been created yet
do $$
begin
  if not exists (select 1 from auth.users where email = 'saisha@saishabeauty.staff') then
    raise exception 'Owner user saisha@saishabeauty.staff not found — create it in Authentication → Users first';
  end if;
  if not exists (select 1 from auth.users where email = 'manager@saishabeauty.staff') then
    raise exception 'Manager user manager@saishabeauty.staff not found — create it in Authentication → Users first';
  end if;
end $$;

-- Tag each account with its role. app_metadata can only be changed by admins,
-- never by the user, so the database can trust it.
update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"owner"}'
 where email = 'saisha@saishabeauty.staff';

update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"manager"}'
 where email = 'manager@saishabeauty.staff';

-- Role of whoever is calling ('owner', 'manager' or '' for visitors)
create or replace function public.staff_role()
returns text
language sql stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')
$$;

-- Booking page: which slots are taken. Returns only date + time, no client info.
create or replace function public.taken_slots()
returns table (date text, "time" text)
language sql stable
security definer
set search_path = public
as $$
  select a.date::text, a.time::text
    from public.appointments a
   where a.date::date >= current_date
$$;

-- Booking page: create a booking. Matches a returning client by email or phone,
-- otherwise creates the client. Visitors never read the clients table.
create or replace function public.book_appointment(
  p_name     text,
  p_phone    text,
  p_email    text,
  p_services text,
  p_date     text,
  p_time     text,
  p_notes    text,
  p_duration integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name   text := trim(coalesce(p_name, ''));
  v_phone  text := trim(coalesce(p_phone, ''));
  v_digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_email  text := lower(trim(coalesce(p_email, '')));
  v_notes  text := nullif(trim(coalesce(p_notes, '')), '');
  v_date   date;
  v_client uuid;
  v_appt   uuid;
begin
  -- Basic checks so the public form can't be abused
  if v_name = '' or length(v_name) > 100 then raise exception 'invalid_name'; end if;
  if v_digits = '' or length(v_phone) > 30 then raise exception 'invalid_phone'; end if;
  if length(v_email) > 200 then raise exception 'invalid_email'; end if;
  if length(coalesce(v_notes, '')) > 1000 then raise exception 'invalid_notes'; end if;
  if p_services is null or length(p_services) > 20000 then raise exception 'invalid_services'; end if;
  if p_time not in ('11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM',
                    '3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM',
                    '7:00 PM','7:30 PM') then
    raise exception 'invalid_time';
  end if;
  v_date := p_date::date;
  if v_date < current_date or v_date > current_date + 365 then raise exception 'invalid_date'; end if;

  -- One booking per slot
  if exists (select 1 from appointments a where a.date::date = v_date and a.time = p_time) then
    raise exception 'slot_taken';
  end if;

  -- Returning client?
  select c.id into v_client
    from clients c
   where (v_email <> '' and lower(c.email) = v_email)
      or regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') = v_digits
   order by c.created_at
   limit 1;

  if v_client is null then
    insert into clients (name, phone, email, notes)
    values (v_name, v_phone, v_email, '')
    returning id into v_client;
  end if;

  insert into appointments (client_id, services, date, time, status, invoiced, source, special_request, total_duration)
  values (v_client, p_services, v_date, p_time, 'confirmed', false, 'online', v_notes, greatest(coalesce(p_duration, 0), 0))
  returning id into v_appt;

  return v_appt;
end;
$$;

grant execute on function public.taken_slots() to anon, authenticated;
grant execute on function public.book_appointment(text, text, text, text, text, text, text, integer) to anon, authenticated;

commit;
