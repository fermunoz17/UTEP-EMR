alter table public.patients
    add column sex text check (sex in ('Male', 'Female'));
