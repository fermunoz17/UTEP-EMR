-- Drop the recursive policy
drop policy if exists "Instructors can read student profiles" on public.profiles;

-- Create a security definer function (same pattern as is_admin)
-- so the profiles lookup does not re-trigger RLS on profiles
create or replace function public.is_instructor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.profiles
        where user_id = auth.uid()
        and account_type = 'instructor'
        and active = true
    );
$$;

revoke all on function public.is_instructor() from public;
grant execute on function public.is_instructor() to authenticated;

-- Re-create the policy using the safe function
create policy "Instructors can read student profiles"
on public.profiles
for select to authenticated
using (
    account_type = 'student'
    and public.is_instructor()
);
