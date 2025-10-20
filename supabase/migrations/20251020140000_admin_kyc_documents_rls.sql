-- Admin RLS policy for kyc_documents table
-- This allows admins to view all KYC documents for review

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own KYC documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Users can view own kyc_documents" ON public.kyc_documents;

-- Create new policies that allow both users to see their own documents AND admins to see all documents

-- Policy for users to view their own documents
CREATE POLICY "Users can view own KYC documents"
  ON public.kyc_documents
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    public.is_admin()
  );

-- Policy for admins to view all documents (redundant but explicit)
CREATE POLICY "Admins can view all KYC documents"
  ON public.kyc_documents
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Keep existing INSERT and UPDATE policies as they are
-- (Users can create/update their own documents)
