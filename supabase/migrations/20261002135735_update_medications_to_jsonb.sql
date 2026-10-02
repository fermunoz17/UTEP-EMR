-- Drop the old text column and add JSONB for cleaner data
ALTER TABLE public.patients DROP COLUMN IF EXISTS medications;
ALTER TABLE public.patients ADD COLUMN current_medications JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.patient_templates DROP COLUMN IF EXISTS medications;
ALTER TABLE public.patient_templates ADD COLUMN current_medications JSONB DEFAULT '[]'::jsonb;
