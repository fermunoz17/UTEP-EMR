-- Store multidisciplinary notes for patients or educational cases.
create table public.clinical_notes (

    note_id uuid primary key default gen_random_uuid(),

    -- Educational cases can use snapshots without a patient record.
    patient_id uuid
        references public.patients(id)
        on delete restrict,

    assigned_case_id uuid
        references public.assigned_cases(id)
        on delete cascade,

    constraint clinical_notes_context_required
        check (
            patient_id is not null
            or assigned_case_id is not null
        ),

    author_id uuid not null
        references public.profiles(user_id)
        on delete restrict,

    discipline text not null,

    note_type text not null,

    status text not null default 'draft'
        check (
            status in (
                'draft',
                'pending_review',
                'revision_requested',
                'final'
            )
        ),

    -- Store discipline-specific fields as JSON.
    note_data jsonb not null default '{}'::jsonb,

    instructor_feedback text,

    reviewed_by uuid
        references public.profiles(user_id)
        on delete restrict,

    author_signed_at timestamptz,

    submitted_at timestamptz,

    reviewed_at timestamptz,

    instructor_signed_at timestamptz,

    finalized_at timestamptz,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create index idx_clinical_notes_patient
    on public.clinical_notes(patient_id)
    where patient_id is not null;

create index idx_clinical_notes_case
    on public.clinical_notes(assigned_case_id)
    where assigned_case_id is not null;

create index idx_clinical_notes_author
    on public.clinical_notes(author_id);

create index idx_clinical_notes_status
    on public.clinical_notes(status);

create index idx_clinical_notes_discipline
    on public.clinical_notes(discipline);

create index idx_clinical_notes_reviewer
    on public.clinical_notes(reviewed_by)
    where reviewed_by is not null;

-- Access policies are defined separately.
alter table public.clinical_notes
enable row level security;
