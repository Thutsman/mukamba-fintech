-- Mukamba FinTech - Application Separation Policies
-- This migration creates RLS policies to separate data between early access and FinTech apps

-- =====================================================
-- EARLY ACCESS SIGNUPS TABLE POLICIES
-- =====================================================

-- Policy for early access users to view their own signup data
CREATE POLICY "Early access users can view own signup" ON early_access_signups
  FOR SELECT USING (
    auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'early_access' OR
    auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
    auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL
  );

-- Policy for early access users to insert their own signup data
CREATE POLICY "Early access users can insert own signup" ON early_access_signups
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'early_access' OR
    auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
    auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL
  );

-- Policy for early access users to update their own signup data
CREATE POLICY "Early access users can update own signup" ON early_access_signups
  FOR UPDATE USING (
    auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'early_access' OR
    auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
    auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL
  );

-- =====================================================
-- FINANCIAL APP TABLES POLICIES
-- =====================================================

-- Policy for FinTech users to view their own profiles
CREATE POLICY "FinTech users can view own profile" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to update their own profiles
CREATE POLICY "FinTech users can update own profile" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to insert their own profiles
CREATE POLICY "FinTech users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- =====================================================
-- KYC VERIFICATIONS POLICIES
-- =====================================================

-- Policy for FinTech users to view their own KYC verifications
CREATE POLICY "FinTech users can view own KYC verifications" ON kyc_verifications
  FOR SELECT USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to create their own KYC verifications
CREATE POLICY "FinTech users can create own KYC verifications" ON kyc_verifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to update their own KYC verifications
CREATE POLICY "FinTech users can update own KYC verifications" ON kyc_verifications
  FOR UPDATE USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- =====================================================
-- KYC DOCUMENTS POLICIES
-- =====================================================

-- Policy for FinTech users to view their own KYC documents
CREATE POLICY "FinTech users can view own KYC documents" ON kyc_documents
  FOR SELECT USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to create their own KYC documents
CREATE POLICY "FinTech users can create own KYC documents" ON kyc_documents
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to update their own KYC documents
CREATE POLICY "FinTech users can update own KYC documents" ON kyc_documents
  FOR UPDATE USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- =====================================================
-- PHONE VERIFICATION POLICIES
-- =====================================================

-- Policy for FinTech users to view their own phone verification attempts
CREATE POLICY "FinTech users can view own phone verification attempts" ON phone_verification_attempts
  FOR SELECT USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to create their own phone verification attempts
CREATE POLICY "FinTech users can create own phone verification attempts" ON phone_verification_attempts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- =====================================================
-- FINANCIAL ASSESSMENTS POLICIES
-- =====================================================

-- Policy for FinTech users to view their own financial assessments
CREATE POLICY "FinTech users can view own financial assessments" ON financial_assessments
  FOR SELECT USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to create their own financial assessments
CREATE POLICY "FinTech users can create own financial assessments" ON financial_assessments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to update their own financial assessments
CREATE POLICY "FinTech users can update own financial assessments" ON financial_assessments
  FOR UPDATE USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- =====================================================
-- SESSION AND LOGIN HISTORY POLICIES
-- =====================================================

-- Policy for FinTech users to view their own sessions
CREATE POLICY "FinTech users can view own sessions" ON user_sessions
  FOR SELECT USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to manage their own sessions
CREATE POLICY "FinTech users can manage own sessions" ON user_sessions
  FOR ALL USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to view their own login history
CREATE POLICY "FinTech users can view own login history" ON user_login_history
  FOR SELECT USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- =====================================================
-- STORAGE BUCKET POLICIES
-- =====================================================

-- Policy for FinTech users to access user documents
CREATE POLICY "FinTech users can access user documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-documents' AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to upload user documents
CREATE POLICY "FinTech users can upload user documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-documents' AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to access KYC documents
CREATE POLICY "FinTech users can access KYC documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kyc-documents' AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- Policy for FinTech users to upload KYC documents
CREATE POLICY "FinTech users can upload KYC documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kyc-documents' AND
    (auth.jwt() ->> 'app_metadata' ->> 'app_type' = 'fintech' OR
     auth.jwt() ->> 'app_metadata' ->> 'app_type' IS NULL)
  );

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "Early access users can view own signup" ON early_access_signups IS 'Allows early access and FinTech users to view early access signup data';
COMMENT ON POLICY "FinTech users can view own profile" ON user_profiles IS 'Allows FinTech users to view their own profiles only';
COMMENT ON POLICY "FinTech users can view own KYC verifications" ON kyc_verifications IS 'Allows FinTech users to view their own KYC verifications only';
COMMENT ON POLICY "FinTech users can access user documents" ON storage.objects IS 'Allows FinTech users to access user documents bucket';
