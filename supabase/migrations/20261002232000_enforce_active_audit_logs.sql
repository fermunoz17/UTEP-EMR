-- The audit table arrived after the 
-- other active-account policies
create policy "Active accounts only"
on public.audit_logs as restrictive
for all to authenticated
using ((select private.is_active_account()))
with check ((select private.is_active_account()));
