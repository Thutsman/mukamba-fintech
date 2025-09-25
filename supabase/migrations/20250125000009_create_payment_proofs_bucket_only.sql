-- Create storage bucket for payment proof documents (simplified version)
-- This creates only the bucket without RLS policies to avoid permission issues

-- Create the payment-proofs storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false, -- Private bucket for security
  10485760, -- 10MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- The bucket is now created and ready to use
-- RLS policies will be set up through the Supabase Dashboard
