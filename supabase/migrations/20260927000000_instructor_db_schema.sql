create table public.patient_templates (
    id uuid primary key default gen_random_uuid(),
    instructor_id uuid not null references public.profiles(user_id) on delete cascade,
    first_name text not null,
    last_name text not null,
    age integer not null check (age >= 0 and age <= 150),
    sex text,
    occupation text,
    chief_complaint text not null,
    clinical_baseline jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.patient_templates enable row level security;

-- only the instructor who created a template can touch it
create policy "Instructors manage own templates"
on public.patient_templates for all to authenticated
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

create policy "Admins manage all templates"
on public.patient_templates for all to authenticated
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


create table public.assigned_cases (
    id uuid primary key default gen_random_uuid(),
    template_id uuid not null references public.patient_templates(id) on delete cascade,
    student_id uuid not null references public.profiles(user_id) on delete cascade,
    assigned_by uuid not null references public.profiles(user_id),
    patient_snapshot jsonb not null default '{}'::jsonb,
    encounter_status text not null default 'not started'
        check (encounter_status in ('not started', 'in progress', 'pending review', 'completed')),
    encounter_notes text,
    assigned_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.assigned_cases enable row level security;

-- instructors can see, create, and update cases they assigned
-- no delete on purpose — mark as 'completed' instead
create policy "Instructors view assigned cases"
on public.assigned_cases for select to authenticated
using (
    assigned_by = auth.uid()
    and exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'instructor'
    )
);

create policy "Instructors insert cases"
on public.assigned_cases for insert to authenticated
with check (
    assigned_by = auth.uid()
    and exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'instructor'
    )
);

create policy "Instructors update assigned cases"
on public.assigned_cases for update to authenticated
using (
    assigned_by = auth.uid()
    and exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'instructor'
    )
);

-- students can only read and update cases assigned to them
create policy "Students view own cases"
on public.assigned_cases for select to authenticated
using (
    student_id = auth.uid()
    and exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'student'
    )
);

create policy "Students update own cases"
on public.assigned_cases for update to authenticated
using (
    student_id = auth.uid()
    and exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'student'
    )
);

create policy "Admins manage all cases"
on public.assigned_cases for all to authenticated
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
