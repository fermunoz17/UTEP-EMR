alter table public.patients
    add column occupation text,
    add column medications text,
    add column last_visit date,
    add column last_visit_notes text;
