ALTER TABLE public.patient_templates
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN phone_number TEXT,
  ADD COLUMN email TEXT,
  ADD COLUMN emergency_contact_name TEXT,
  ADD COLUMN emergency_contact_phone TEXT,
  ADD COLUMN allergies TEXT[] DEFAULT '{}',
  ADD COLUMN medical_history TEXT[] DEFAULT '{}',
  ADD COLUMN medications TEXT;
