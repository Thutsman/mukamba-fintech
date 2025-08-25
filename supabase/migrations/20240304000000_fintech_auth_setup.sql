-- Mukamba FinTech Database Schema - Authentication & Signup Setup
-- This migration creates the core authentication and user management tables
-- for the Mukamba FinTech platform while preserving existing early_access_signups table

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- CORE USER MANAGEMENT & AUTHENTICATION
-- =====================================================

-- Create user_profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  
  -- User Classification
  user_level TEXT DEFAULT 'new_user' CHECK (user_level IN ('new_user', 'verified_buyer', 'verified_seller', 'admin')),
  user_role TEXT DEFAULT 'user' CHECK (user_role IN ('user', 'buyer', 'seller', 'admin')),
  
  -- Verification Status
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_identity_verified BOOLEAN DEFAULT FALSE,
  is_financially_verified BOOLEAN DEFAULT FALSE,
  is_address_verified BOOLEAN DEFAULT FALSE,
  is_property_verified BOOLEAN DEFAULT FALSE,
  
  -- Additional Profile Information
  date_of_birth DATE,
  id_number TEXT,
  nationality TEXT CHECK (nationality IN ('SA', 'ZIM')),
  residential_address JSONB, -- {streetAddress, city, province, postalCode}
  employment_info JSONB, -- {status, employer, jobTitle, duration, income}
  financial_profile JSONB, -- {creditScore, riskLevel, preApprovedAmount}
  verification_certificates JSONB[], -- Array of certificate URLs
  
  -- Account Status
  is_active BOOLEAN DEFAULT TRUE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspension_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Preferences
  notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}'::jsonb,
  privacy_settings JSONB DEFAULT '{"profile_visible": true, "contact_visible": true}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_info JSONB, -- {deviceType, browser, os, ip}
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_login_history table for security tracking
CREATE TABLE IF NOT EXISTS user_login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  login_method TEXT NOT NULL CHECK (login_method IN ('email', 'phone', 'social_google', 'social_facebook')),
  ip_address INET,
  user_agent TEXT,
  location_info JSONB, -- {country, city, coordinates}
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- KYC VERIFICATION SYSTEM
-- =====================================================

-- Create kyc_verifications table
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Verification Details
  verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'financial', 'address', 'employment', 'comprehensive')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'expired')),
  
  -- Verification Data
  verification_data JSONB, -- Store verification-specific data
  verification_level TEXT DEFAULT 'basic' CHECK (verification_level IN ('basic', 'enhanced', 'premium')),
  
  -- Review Information
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES user_profiles(id),
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create kyc_documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  verification_id UUID REFERENCES kyc_verifications(id) ON DELETE CASCADE,
  
  -- Document Information
  document_type TEXT NOT NULL CHECK (document_type IN (
    'national_id',
    'passport',
    'drivers_license',
    'proof_of_income',
    'bank_statement',
    'utility_bill',
    'title_deeds',
    'tax_certificate',
    'employment_letter',
    'payslip'
  )),
  document_side TEXT CHECK (document_side IN ('front', 'back', 'single')),
  
  -- File Information
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Verification Status
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- PHONE VERIFICATION SYSTEM
-- =====================================================

-- Create phone_verification_attempts table
CREATE TABLE IF NOT EXISTS phone_verification_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  attempts_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- FINANCIAL ASSESSMENT SYSTEM
-- =====================================================

-- Create financial_assessments table
CREATE TABLE IF NOT EXISTS financial_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Personal Information
  id_number TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality TEXT NOT NULL CHECK (nationality IN ('SA', 'ZIM')),
  
  -- Address Information
  residential_address JSONB NOT NULL, -- {streetAddress, city, province, postalCode}
  
  -- Employment Information
  employment_status TEXT NOT NULL,
  monthly_income DECIMAL(12,2) NOT NULL,
  employer_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  employment_duration TEXT NOT NULL,
  additional_income DECIMAL(12,2),
  
  -- Financial Information
  monthly_expenses DECIMAL(12,2) NOT NULL,
  has_debts TEXT NOT NULL CHECK (has_debts IN ('no', 'minimal', 'moderate', 'significant')),
  debt_details TEXT,
  
  -- Assessment Results
  credit_score INTEGER,
  risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High')),
  debt_to_income_ratio DECIMAL(5,4),
  disposable_income DECIMAL(12,2),
  pre_approved_amount DECIMAL(12,2),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON user_profiles(email);
CREATE INDEX IF NOT EXISTS user_profiles_phone_idx ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS user_profiles_user_level_idx ON user_profiles(user_level);
CREATE INDEX IF NOT EXISTS user_profiles_user_role_idx ON user_profiles(user_role);
CREATE INDEX IF NOT EXISTS user_profiles_is_active_idx ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON user_profiles(created_at);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_session_token_idx ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON user_sessions(expires_at);

-- User login history indexes
CREATE INDEX IF NOT EXISTS user_login_history_user_id_idx ON user_login_history(user_id);
CREATE INDEX IF NOT EXISTS user_login_history_created_at_idx ON user_login_history(created_at);
CREATE INDEX IF NOT EXISTS user_login_history_success_idx ON user_login_history(success);

-- KYC verification indexes
CREATE INDEX IF NOT EXISTS kyc_verifications_user_id_idx ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS kyc_verifications_status_idx ON kyc_verifications(status);
CREATE INDEX IF NOT EXISTS kyc_verifications_verification_type_idx ON kyc_verifications(verification_type);
CREATE INDEX IF NOT EXISTS kyc_verifications_submitted_at_idx ON kyc_verifications(submitted_at);

-- KYC documents indexes
CREATE INDEX IF NOT EXISTS kyc_documents_user_id_idx ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS kyc_documents_verification_id_idx ON kyc_documents(verification_id);
CREATE INDEX IF NOT EXISTS kyc_documents_document_type_idx ON kyc_documents(document_type);
CREATE INDEX IF NOT EXISTS kyc_documents_verification_status_idx ON kyc_documents(verification_status);

-- Phone verification indexes
CREATE INDEX IF NOT EXISTS phone_verification_attempts_user_id_idx ON phone_verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS phone_verification_attempts_phone_number_idx ON phone_verification_attempts(phone_number);
CREATE INDEX IF NOT EXISTS phone_verification_attempts_expires_at_idx ON phone_verification_attempts(expires_at);

-- Financial assessment indexes
CREATE INDEX IF NOT EXISTS financial_assessments_user_id_idx ON financial_assessments(user_id);
CREATE INDEX IF NOT EXISTS financial_assessments_status_idx ON financial_assessments(status);
CREATE INDEX IF NOT EXISTS financial_assessments_credit_score_idx ON financial_assessments(credit_score);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_assessments ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- User login history policies
CREATE POLICY "Users can view own login history" ON user_login_history
  FOR SELECT USING (auth.uid() = user_id);

-- KYC verifications policies
CREATE POLICY "Users can view own KYC verifications" ON kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own KYC verifications" ON kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC verifications" ON kyc_verifications
  FOR UPDATE USING (auth.uid() = user_id);

-- KYC documents policies
CREATE POLICY "Users can view own KYC documents" ON kyc_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own KYC documents" ON kyc_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC documents" ON kyc_documents
  FOR UPDATE USING (auth.uid() = user_id);

-- Phone verification attempts policies
CREATE POLICY "Users can view own phone verification attempts" ON phone_verification_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own phone verification attempts" ON phone_verification_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Financial assessments policies
CREATE POLICY "Users can view own financial assessments" ON financial_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own financial assessments" ON financial_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial assessments" ON financial_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate credit score
CREATE OR REPLACE FUNCTION calculate_credit_score(
  p_monthly_income DECIMAL,
  p_monthly_expenses DECIMAL,
  p_employment_duration TEXT,
  p_has_debts TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_base_score INTEGER := 600;
  v_income_score INTEGER := 0;
  v_expense_score INTEGER := 0;
  v_employment_score INTEGER := 0;
  v_debt_score INTEGER := 0;
  v_final_score INTEGER;
BEGIN
  -- Income scoring (0-100 points)
  IF p_monthly_income >= 50000 THEN
    v_income_score := 100;
  ELSIF p_monthly_income >= 30000 THEN
    v_income_score := 80;
  ELSIF p_monthly_income >= 20000 THEN
    v_income_score := 60;
  ELSIF p_monthly_income >= 10000 THEN
    v_income_score := 40;
  ELSE
    v_income_score := 20;
  END IF;
  
  -- Expense ratio scoring (0-50 points)
  IF p_monthly_expenses > 0 THEN
    IF (p_monthly_expenses / p_monthly_income) <= 0.3 THEN
      v_expense_score := 50;
    ELSIF (p_monthly_expenses / p_monthly_income) <= 0.5 THEN
      v_expense_score := 30;
    ELSIF (p_monthly_expenses / p_monthly_income) <= 0.7 THEN
      v_expense_score := 10;
    ELSE
      v_expense_score := 0;
    END IF;
  END IF;
  
  -- Employment duration scoring (0-50 points)
  CASE p_employment_duration
    WHEN '5+years' THEN v_employment_score := 50;
    WHEN '2-5years' THEN v_employment_score := 40;
    WHEN '1-2years' THEN v_employment_score := 30;
    WHEN '6-12months' THEN v_employment_score := 20;
    WHEN '0-6months' THEN v_employment_score := 10;
    ELSE v_employment_score := 0;
  END CASE;
  
  -- Debt scoring (0-50 points)
  CASE p_has_debts
    WHEN 'no' THEN v_debt_score := 50;
    WHEN 'minimal' THEN v_debt_score := 40;
    WHEN 'moderate' THEN v_debt_score := 20;
    WHEN 'significant' THEN v_debt_score := 0;
    ELSE v_debt_score := 25;
  END CASE;
  
  -- Calculate final score (300-850 range)
  v_final_score := v_base_score + v_income_score + v_expense_score + v_employment_score + v_debt_score;
  
  -- Ensure score is within valid range
  v_final_score := GREATEST(300, LEAST(850, v_final_score));
  
  RETURN v_final_score;
END;
$$ language 'plpgsql';

-- Function to verify phone number
CREATE OR REPLACE FUNCTION verify_phone_number(
  p_user_id UUID,
  p_phone_number TEXT,
  p_otp_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_attempt_id UUID;
  v_stored_hash TEXT;
  v_attempts_count INTEGER;
  v_max_attempts INTEGER;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the latest verification attempt
  SELECT id, otp_hash, attempts_count, max_attempts, expires_at
  INTO v_attempt_id, v_stored_hash, v_attempts_count, v_max_attempts, v_expires_at
  FROM phone_verification_attempts
  WHERE user_id = p_user_id 
    AND phone_number = p_phone_number
    AND verified_at IS NULL
    AND expires_at > TIMEZONE('utc', NOW())
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check if attempt exists and is valid
  IF v_attempt_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if max attempts exceeded
  IF v_attempts_count >= v_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  -- Check if OTP is correct (in real implementation, use proper hash comparison)
  IF p_otp_code = v_stored_hash THEN
    -- Mark as verified
    UPDATE phone_verification_attempts
    SET verified_at = TIMEZONE('utc', NOW())
    WHERE id = v_attempt_id;
    
    -- Update user profile
    UPDATE user_profiles
    SET is_phone_verified = TRUE,
        phone = p_phone_number,
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = p_user_id;
    
    RETURN TRUE;
  ELSE
    -- Increment attempt count
    UPDATE phone_verification_attempts
    SET attempts_count = attempts_count + 1
    WHERE id = v_attempt_id;
    
    RETURN FALSE;
  END IF;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update updated_at column
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at
  BEFORE UPDATE ON kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_assessments_updated_at
  BEFORE UPDATE ON financial_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to handle new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage buckets for different file types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
('user-documents', 'user-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
('kyc-documents', 'kyc-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
('property-images', 'property-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']),
('property-documents', 'property-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE user_profiles IS 'Extended user profiles for Mukamba FinTech platform';
COMMENT ON TABLE user_sessions IS 'User session management and tracking';
COMMENT ON TABLE user_login_history IS 'Security tracking for user login attempts';
COMMENT ON TABLE kyc_verifications IS 'KYC verification tracking and management';
COMMENT ON TABLE kyc_documents IS 'KYC document storage and verification';
COMMENT ON TABLE phone_verification_attempts IS 'Phone verification OTP management';
COMMENT ON TABLE financial_assessments IS 'Financial assessment and credit scoring';

COMMENT ON FUNCTION calculate_credit_score IS 'Calculates credit score based on financial assessment data';
COMMENT ON FUNCTION verify_phone_number IS 'Verifies phone number using OTP code';
COMMENT ON FUNCTION handle_new_user IS 'Creates user profile when new user signs up';
COMMENT ON FUNCTION update_updated_at_column IS 'Updates the updated_at timestamp column';

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample admin user (you can modify this as needed)
-- INSERT INTO user_profiles (id, first_name, last_name, email, user_level, user_role, is_phone_verified, is_identity_verified, is_financially_verified)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   'Admin',
--   'User',
--   'admin@mukamba.com',
--   'admin',
--   'admin',
--   true,
--   true,
--   true
-- );
