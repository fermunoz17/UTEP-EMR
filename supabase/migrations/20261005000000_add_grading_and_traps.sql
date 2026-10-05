-- Rubric scoring and chart annotations on cases
alter table public.assigned_cases
    add column if not exists rubric_scores jsonb not null default '{}'::jsonb,
    add column if not exists chart_annotations jsonb not null default '[]'::jsonb,
    add column if not exists score numeric(5,2),
    add column if not exists max_score numeric(5,2) default 100.0;

-- Allow "revision_requested" as a distinct status so students know
-- their work was reviewed and needs a fix, not just that it's "in progress"
alter table public.assigned_cases
    drop constraint if exists assigned_cases_encounter_status_check;

alter table public.assigned_cases
    add constraint assigned_cases_encounter_status_check
    check (encounter_status in (
        'not started',
        'in progress',
        'revision_requested',
        'pending review',
        'completed'
    ));

-- Deliberate traps and structured rubric criteria on templates
alter table public.patient_templates
    add column if not exists traps jsonb not null default '[]'::jsonb,
    add column if not exists rubric_criteria jsonb not null default '[]'::jsonb;
