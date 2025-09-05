-- Create property_applications table
CREATE TABLE IF NOT EXISTS property_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_reviews table
CREATE TABLE IF NOT EXISTS admin_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES property_applications(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject')),
  reason TEXT,
  notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_applications_status ON property_applications(status);
CREATE INDEX IF NOT EXISTS idx_property_applications_seller_id ON property_applications(seller_id);
CREATE INDEX IF NOT EXISTS idx_property_applications_submitted_at ON property_applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_admin_reviews_application_id ON admin_reviews(application_id);
CREATE INDEX IF NOT EXISTS idx_admin_reviews_admin_id ON admin_reviews(admin_id);

-- Add RLS policies for property_applications
ALTER TABLE property_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all applications
CREATE POLICY "Admins can view all property applications" ON property_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can insert applications
CREATE POLICY "Admins can insert property applications" ON property_applications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can update applications
CREATE POLICY "Admins can update property applications" ON property_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Sellers can view their own applications
CREATE POLICY "Sellers can view own property applications" ON property_applications
  FOR SELECT USING (
    seller_id = auth.uid()
  );

-- Add RLS policies for admin_reviews
ALTER TABLE admin_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all reviews
CREATE POLICY "Admins can view all admin reviews" ON admin_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can insert reviews
CREATE POLICY "Admins can insert admin reviews" ON admin_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_applications_updated_at 
  BEFORE UPDATE ON property_applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add function to get property applications with related data
CREATE OR REPLACE FUNCTION get_property_applications_with_details(status_filter TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  property_id UUID,
  seller_id UUID,
  status TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  rejection_reason TEXT,
  admin_notes TEXT,
  property_data JSONB,
  seller_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    pa.property_id,
    pa.seller_id,
    pa.status,
    pa.submitted_at,
    pa.reviewed_at,
    pa.reviewed_by,
    pa.rejection_reason,
    pa.admin_notes,
    to_jsonb(p.*) as property_data,
    to_jsonb(u.*) as seller_data
  FROM property_applications pa
  JOIN properties p ON pa.property_id = p.id
  JOIN auth.users u ON pa.seller_id = u.id
  WHERE (status_filter IS NULL OR pa.status = status_filter)
  ORDER BY pa.submitted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
