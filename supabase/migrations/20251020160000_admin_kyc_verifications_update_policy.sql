-- Admin UPDATE policy for kyc_verifications table
-- This allows admins to update any KYC verification record

-- First, create the is_admin() function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND (
        COALESCE(up.is_admin, false) = true
        OR COALESCE(up.user_role, '') = 'admin'
        OR 'admin' = ANY(up.roles)
      )
  );
$$;

-- Create policy for admins to update any KYC verification
CREATE POLICY "Admins can update any KYC verification"
  ON public.kyc_verifications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Also ensure admins can select any verification for review
CREATE POLICY "Admins can select any KYC verification"
  ON public.kyc_verifications
  FOR SELECT
  TO authenticated
  USING (public.is_admin());
