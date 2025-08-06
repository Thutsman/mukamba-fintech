-- =====================================================
-- KYC File Upload Setup Migration
-- Focused on essential tables for KYC document upload and admin review
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for secure functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USER PROFILES TABLE (Essential for KYC)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL, -- Links to Supabase auth.users
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  nationality TEXT CHECK (nationality IN ('SA', 'ZIM')),
  
  -- Verification status
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_identity_verified BOOLEAN DEFAULT FALSE,
  is_financially_verified BOOLEAN DEFAULT FALSE,
  is_property_verified BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'none' CHECK (kyc_status IN ('none', 'partial', 'pending', 'approved', 'rejected')),
  
  -- User roles (can be multiple)
  roles TEXT[] DEFAULT ARRAY['buyer'],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- 2. KYC VERIFICATIONS TABLE (Core KYC records)
-- =====================================================

CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('buyer', 'seller')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Identity information
  id_number TEXT,
  date_of_birth DATE,
  
  -- Financial information (for buyers)
  monthly_income DECIMAL(12,2),
  employment_status TEXT,
  bank_name TEXT,
  credit_consent BOOLEAN DEFAULT FALSE,
  
  -- Business information (for sellers)
  business_registered BOOLEAN DEFAULT FALSE,
  business_name TEXT,
  business_registration_number TEXT,
  tax_number TEXT,
  
  -- Admin review
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- 3. KYC DOCUMENTS TABLE (File storage metadata)
-- =====================================================

CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kyc_verification_id UUID REFERENCES kyc_verifications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'id_document',
    'proof_of_income',
    'bank_statement',
    'title_deed',
    'property_tax_certificate',
    'municipal_rates_certificate',
    'property_insurance',
    'compliance_certificate',
    'business_registration',
    'tax_clearance_certificate'
  )),
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  verified BOOLEAN DEFAULT FALSE,
  verification_notes TEXT
);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

-- KYC verifications policies
CREATE POLICY "Users can view own verifications" ON kyc_verifications
  FOR SELECT USING (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own verifications" ON kyc_verifications
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can update own verifications" ON kyc_verifications
  FOR UPDATE USING (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all verifications" ON kyc_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

-- KYC documents policies
CREATE POLICY "Users can view own documents" ON kyc_documents
  FOR SELECT USING (kyc_verification_id IN (
    SELECT id FROM kyc_verifications WHERE user_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert own documents" ON kyc_documents
  FOR INSERT WITH CHECK (kyc_verification_id IN (
    SELECT id FROM kyc_verifications WHERE user_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Admins can view all documents" ON kyc_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

-- =====================================================
-- 5. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_verifications_updated_at 
  BEFORE UPDATE ON kyc_verifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (auth_user_id, first_name, last_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name', NEW.email);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 6. STORAGE BUCKETS SETUP
-- =====================================================

-- Create storage bucket for user documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user documents
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-documents' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc_status ON user_profiles(kyc_status);

-- KYC verifications indexes
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_type ON kyc_verifications(verification_type);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_submitted_at ON kyc_verifications(submitted_at);

-- KYC documents indexes
CREATE INDEX IF NOT EXISTS idx_kyc_documents_verification_id ON kyc_documents(kyc_verification_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_type ON kyc_documents(document_type);

-- =====================================================
-- 8. SAMPLE DATA FOR TESTING (Optional)
-- =====================================================

-- Insert a test admin user (you can modify this)
INSERT INTO user_profiles (auth_user_id, first_name, last_name, email, roles, kyc_status)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual auth user ID
  'Admin',
  'User',
  'admin@mukamba.com',
  ARRAY['admin'],
  'approved'
) ON CONFLICT (auth_user_id) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- This migration creates the essential tables for:
-- 1. User profiles with KYC status tracking
-- 2. KYC verification records with detailed fields
-- 3. KYC document metadata storage
-- 4. Secure file storage with proper access controls
-- 5. Admin capabilities to review and download documents

-- Next steps:
-- 1. Run this migration in Supabase
-- 2. Test user KYC document upload
-- 3. Test admin document review and download
-- 4. Add additional tables as needed for full functionality 