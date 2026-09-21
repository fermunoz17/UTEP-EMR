-- Allow all authenticated users to read patients (for lookup)
create policy "Authenticated users can read patients"
on public.patients
for select
to authenticated
using (true);
