-- =====================================================
-- Fix user-documents storage bucket
-- =====================================================

-- Create user-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'user-documents', 
  'user-documents', 
  false, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Update existing bucket if it exists but has wrong settings
UPDATE storage.buckets 
SET 
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
WHERE id = 'user-documents';

-- Ensure proper storage policies exist - drop existing ones first
DROP POLICY IF EXISTS "Authenticated users can upload to user-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view user-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete user-documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can access all user-documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;

-- Create proper storage policies for user documents
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
