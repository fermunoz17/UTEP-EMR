create table public.appointments (
    id uuid primary key default gen_random_uuid(),
    patient_id uuid not null references public.patients(id) on delete cascade,
    appointment_type text not null default 'Follow-up',
    scheduled_date date not null,
    scheduled_time time,
    notes text,
    status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now()
);

alter table public.appointments enable row level security;

create policy "Authenticated users can read appointments"
on public.appointments for select to authenticated using (true);

create policy "Authenticated users can insert appointments"
on public.appointments for insert to authenticated with check (true);

create policy "Authenticated users can update appointments"
on public.appointments for update to authenticated using (true);

create policy "Admins can delete appointments"
on public.appointments for delete to authenticated
using (
    exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'admin'
    )
);
