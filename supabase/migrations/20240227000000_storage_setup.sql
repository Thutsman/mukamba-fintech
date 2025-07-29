-- Create storage buckets
INSERT INTO storage.buckets (id, name)
VALUES 
  ('property-images', 'Property Images'),
  ('property-documents', 'Property Documents'),
  ('user-documents', 'User Documents');

-- Public access policy for property images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- Authenticated access policy for property documents
CREATE POLICY "Authenticated Access - Property Documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'property-documents' 
  AND auth.role() = 'authenticated'
);

-- Authenticated access policy for user documents
CREATE POLICY "Authenticated Access - User Documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'user-documents' 
  AND auth.role() = 'authenticated'
);

-- Admin access policy for all buckets
CREATE POLICY "Admin Access"
ON storage.objects FOR ALL
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- RLS must be enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 