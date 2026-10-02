ALTER TABLE public.patients
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN phone_number TEXT,
  ADD COLUMN email TEXT,
  ADD COLUMN address TEXT,
  ADD COLUMN insurance_provider TEXT,
  ADD COLUMN insurance_policy_number TEXT,

  -- Used JSONB array to allow to have objects stored in column
  ADD COLUMN emergency_contacts JSONB DEFAULT '[]'::jsonb,

  -- Text arrays for list
  ADD COLUMN allergies TEXT[] DEFAULT '{}',
  ADD COLUMN medical_history TEXT[] DEFAULT '{}';

