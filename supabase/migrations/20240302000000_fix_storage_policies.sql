-- Fix storage policies to allow image uploads
-- This migration adds the missing INSERT policy for property-images bucket

-- Allow INSERT operations on property-images bucket for all users (since this is a public listing system)
CREATE POLICY "Allow Image Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images');

-- Allow UPDATE operations on property-images bucket for all users
CREATE POLICY "Allow Image Updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-images')
WITH CHECK (bucket_id = 'property-images');

-- Allow DELETE operations on property-images bucket for all users
CREATE POLICY "Allow Image Deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images');

-- Note: We don't need the "Full Access" policy since we're creating specific policies for each operation
-- The existing "Public Access" policy for SELECT is already in place from the previous migration
