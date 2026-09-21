create table public.visits (
    id uuid primary key default gen_random_uuid(),
    patient_id uuid not null references public.patients(id) on delete cascade,
    visit_type text,
    notes text,
    medications text,
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now()
);

alter table public.visits enable row level security;

create policy "Authenticated users can read visits"
on public.visits for select to authenticated using (true);

create policy "Authenticated users can insert visits"
on public.visits for insert to authenticated with check (true);

create policy "Admins can delete visits"
on public.visits for delete to authenticated
using (
    exists (
        select 1 from public.profiles
        where user_id = auth.uid() and account_type = 'admin'
    )
);
