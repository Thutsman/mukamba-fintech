-- =====================================================
-- Fix Storage Policies for KYC Document Uploads
-- =====================================================

-- Drop all existing policies for user-documents
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can access own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;

-- Create more permissive policies for authenticated users
CREATE POLICY "Authenticated users can upload to user-documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-documents' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view user-documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-documents' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete user-documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-documents' AND 
    auth.role() = 'authenticated'
  );

-- Allow admins to access all documents
CREATE POLICY "Admins can access all user-documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'user-documents' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );
