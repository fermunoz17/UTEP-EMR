-- Allow users to read their own role assignments and active role definitions.
create policy "Users can read own clinical roles"
on public.profile_roles
for select
to authenticated
using (
    user_id = auth.uid()
);

create policy "Authenticated users can read active roles"
on public.roles
for select
to authenticated
using (
    active = true
);
