create table public.audit_logs (
    id          uuid        primary key default gen_random_uuid(),
    case_id     uuid        not null references public.assigned_cases(id) on delete cascade,
    actor_id    uuid        not null references public.profiles(user_id) on delete cascade,
    action_type text        not null,
    old_value   text,
    new_value   text,
    created_at  timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- Instructors can read logs for any case they originally assigned
create policy "Instructors view audit logs for their cases"
on public.audit_logs for select to authenticated
using (
    exists (
        select 1 from public.assigned_cases ac
        join public.profiles p on p.user_id = auth.uid()
        where ac.id = audit_logs.case_id
          and ac.assigned_by = auth.uid()
          and p.account_type in ('instructor', 'admin')
    )
);

-- Students can read logs for their own cases
create policy "Students view audit logs for their own cases"
on public.audit_logs for select to authenticated
using (
    exists (
        select 1 from public.assigned_cases ac
        where ac.id = audit_logs.case_id
          and ac.student_id = auth.uid()
    )
);

-- Any authenticated user can insert a log row attributed to themselves
create policy "Authenticated users insert own audit logs"
on public.audit_logs for insert to authenticated
with check (actor_id = auth.uid());
