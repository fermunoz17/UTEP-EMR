-- Drop the old admin-only policy
DROP POLICY IF EXISTS "Admins can do all on patients" ON public.patients;

-- Create a new policy that allows both admins and instructors to manage patients
CREATE POLICY "Admins and instructors can do all on patients"
ON public.patients
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
        AND account_type IN ('admin', 'instructor')
    )
);
