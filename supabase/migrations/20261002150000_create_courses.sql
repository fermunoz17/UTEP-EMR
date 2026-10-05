create table public.courses (
    id uuid primary key default gen_random_uuid(),
    instructor_id uuid not null references public.profiles(user_id) on delete cascade,
    course_number text not null,
    crn text not null,
    created_at timestamptz not null default now(),
    unique (instructor_id, crn)
);

alter table public.courses enable row level security;

create policy "Instructors manage own courses"
on public.courses for all to authenticated
using (
    instructor_id = auth.uid()
    and exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'instructor'
    )
)
with check (
    instructor_id = auth.uid()
    and exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'instructor'
    )
);

create policy "Admins manage all courses"
on public.courses for all to authenticated
using (
    exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'admin'
    )
)
with check (
    exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'admin'
    )
);


create table public.course_enrollments (
    id uuid primary key default gen_random_uuid(),
    course_id uuid not null references public.courses(id) on delete cascade,
    student_id uuid not null references public.profiles(user_id) on delete cascade,
    enrolled_by uuid not null references public.profiles(user_id),
    enrolled_at timestamptz not null default now(),
    unique (course_id, student_id)
);

alter table public.course_enrollments enable row level security;

-- Instructors can manage enrollments for courses they own
create policy "Instructors manage course enrollments"
on public.course_enrollments for all to authenticated
using (
    enrolled_by = auth.uid()
    and exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'instructor'
    )
)
with check (
    enrolled_by = auth.uid()
    and exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'instructor'
    )
);

-- Students can view their own enrollments
create policy "Students view own enrollments"
on public.course_enrollments for select to authenticated
using (
    student_id = auth.uid()
    and exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'student'
    )
);

create policy "Admins manage all enrollments"
on public.course_enrollments for all to authenticated
using (
    exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'admin'
    )
)
with check (
    exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'admin'
    )
);
