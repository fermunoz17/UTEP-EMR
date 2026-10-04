alter table public.patient_templates
    add column title text,
    add column target_year text,
    add column discipline text,
    add column student_instructions text,
    add column hidden_diagnosis text;
