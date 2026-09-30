-- Allow instructors to read student profiles (needed for case assignment)
create policy "Instructors can read student profiles"
on public.profiles
for select to authenticated
using (
    -- the row being read is a student
    account_type = 'student'
    -- and the caller is an active instructor
    and exists (
        select 1 from public.profiles
        where user_id = auth.uid()
        and account_type = 'instructor'
        and active = true
    )
);
