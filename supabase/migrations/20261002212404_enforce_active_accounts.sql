-- Check the signed-in person's current account status.
-- Keep this helper outside the API-exposed public schema.
create schema if not exists private;

create function private.is_active_account()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
      and active = true
  );
$$;

revoke all on function private.is_active_account() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_active_account() to authenticated;

-- These checks limit existing permissions; they grant no new access.
create policy "Active accounts only"
on public.patients as restrictive
for all to authenticated
using ((select private.is_active_account()))
with check ((select private.is_active_account()));

create policy "Active accounts only"
on public.visits as restrictive
for all to authenticated
using ((select private.is_active_account()))
with check ((select private.is_active_account()));

create policy "Active accounts only"
on public.appointments as restrictive
for all to authenticated
using ((select private.is_active_account()))
with check ((select private.is_active_account()));

create policy "Active accounts only"
on public.patient_templates as restrictive
for all to authenticated
using ((select private.is_active_account()))
with check ((select private.is_active_account()));

create policy "Active accounts only"
on public.assigned_cases as restrictive
for all to authenticated
using ((select private.is_active_account()))
with check ((select private.is_active_account()));