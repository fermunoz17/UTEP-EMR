-- Seed clinical and administrative roles.
insert into public.roles (
    role_name,
    display_name,
    description,
    is_clinical
)
values

(
    'pharmacy',
    'Pharmacy',
    'Drug therapy problems, medication reconciliation, MTM, and comprehensive medication review documentation.',
    true
),

(
    'nursing',
    'Nursing',
    'Nursing assessments, vitals, care plans, and medication administration.',
    true
),

(
    'physical_therapy',
    'Physical Therapy',
    'SOAP treatment notes, range-of-motion, strength and gait measurements, and goal tracking.',
    true
),

(
    'occupational_therapy',
    'Occupational Therapy',
    'Occupational therapy evaluations, treatment notes, and functional goal tracking.',
    true
),

(
    'psychology',
    'Psychology',
    'Psychological and neuropsychological testing, therapy progress notes, treatment plans, and risk assessments.',
    true
),

(
    'psychiatry',
    'Psychiatry',
    'Psychiatric evaluations, mental status examinations, medication management, risk assessments, and treatment plans.',
    true
),

(
    'speech_language_pathology',
    'Speech-Language Pathology',
    'Speech, language, cognitive-communication and swallowing evaluations, plans of care, and progress notes.',
    true
),

(
    'social_work',
    'Social Work',
    'Psychosocial assessments, discharge and transition planning, safety screening, and care-planning notes.',
    true
),

(
    'inpatient_physician',
    'In-patient Physician',
    'History and physicals, daily progress notes, admission/discharge summaries, orders, and prescribing.',
    true
),

(
    'front_desk',
    'Front Desk',
    'Scheduling, patient check-in/check-out, demographics, and insurance intake.',
    false
),

(
    'admin',
    'Admin',
    'User and role management, system configuration, and reporting.',
    false
),

(
    'biller',
    'Biller',
    'Charge capture, ICD-10/CPT coding, claims, and billing-related encounter information.',
    false
);
