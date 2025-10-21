-- Admin RLS policy for user_profiles table UPDATE operations
-- This allows admins to update user profiles (specifically for KYC verification updates)

-- Create policy for admins to update user profiles
CREATE POLICY "Admins can update user profiles"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Also allow users to update their own profiles (if not already exists)
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
