-- =====================================================
-- Create Selfie Storage Bucket
-- =====================================================

-- Create storage bucket for selfie photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'selfie-photos', 
  'selfie-photos', 
  false, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for selfie photos
CREATE POLICY "Users can upload own selfie photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'selfie-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own selfie photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'selfie-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all selfie photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'selfie-photos' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

-- Allow admins to delete selfie photos for cleanup
CREATE POLICY "Admins can delete selfie photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'selfie-photos' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );
