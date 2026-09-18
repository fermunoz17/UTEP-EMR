-- check if logged in user is an admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'admin' and active = true
    );
$$;

-- Prevent by default to use permission
revoke all on function public.is_admin() from public;

-- Give access to logged in user
grant execute on function public.is_admin() to authenticated;

-- Users can read their own profile
create policy "Users can read their own profile" on public.profiles
for select to authenticated
using (
    user_id = auth.uid()
);

-- Admin can read all profiles
create policy "Admin can read all profiles" on public.profiles
for select to authenticated
using (
    public.is_admin()
);