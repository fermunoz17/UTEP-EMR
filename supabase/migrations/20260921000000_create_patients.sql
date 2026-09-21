create table public.patients (
    id uuid primary key default gen_random_uuid(),
    first_name text not null,
    last_name text not null,
    age integer not null check (age >= 0 and age <= 150),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.patients enable row level security;

-- Only admins can manage patients
create policy "Admins can do all on patients"
on public.patients
for all
to authenticated
using (
    exists (
        select 1 from public.profiles
        where user_id = auth.uid()
        and account_type = 'admin'
    )
);
