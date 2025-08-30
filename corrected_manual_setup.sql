-- Corrected Manual Account Setup for Project Manager Testing
-- This script bypasses the problematic update_user_kyc_level trigger

-- =====================================================
-- STEP 1: Temporarily Disable the Problematic Trigger
-- =====================================================

-- Disable the trigger that's causing the error
DROP TRIGGER IF EXISTS trigger_update_kyc_level ON user_profiles;

-- =====================================================
-- STEP 2: Create Verified Seller Account
-- =====================================================

-- First, create the auth user (you'll need to do this manually in Supabase Auth)
-- Go to Authentication > Users > Add User
-- Email: seller@mukamba.com
-- Password: seller

-- Then update the user profile to be a verified seller
UPDATE user_profiles 
SET 
  first_name = 'John',
  last_name = 'Seller',
  user_level = 'verified_seller',
  user_role = 'seller',
  is_phone_verified = true,
  is_identity_verified = true,
  is_financially_verified = true,
  is_address_verified = true,
  is_property_verified = true,
  phone = '+27123456789',
  date_of_birth = '1985-06-15',
  id_number = '8506155009087',
  nationality = 'SA',
  residential_address = '{"streetAddress": "123 Main Street", "city": "Johannesburg", "province": "Gauteng", "postalCode": "2000"}',
  employment_info = '{"status": "employed", "employer": "Real Estate Agency", "jobTitle": "Property Agent", "duration": "5+years", "income": 45000}',
  financial_profile = '{"creditScore": 750, "riskLevel": "Low", "preApprovedAmount": 2000000}',
  updated_at = NOW()
WHERE email = 'seller@mukamba.com';

-- Create KYC verification record for seller
INSERT INTO kyc_verifications (
  user_id,
  verification_type,
  status,
  verification_level,
  submitted_at,
  reviewed_at,
  certificate_url
) 
SELECT 
  id,
  'comprehensive',
  'approved',
  'premium',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '6 days',
  'https://example.com/certificates/seller-kyc.pdf'
FROM user_profiles 
WHERE email = 'seller@mukamba.com';

-- =====================================================
-- STEP 3: Create Verified Buyer Account
-- =====================================================

-- First, create the auth user (you'll need to do this manually in Supabase Auth)
-- Go to Authentication > Users > Add User
-- Email: buyer@mukamba.com
-- Password: buyer

-- Then update the user profile to be a verified buyer
UPDATE user_profiles 
SET 
  first_name = 'Sarah',
  last_name = 'Buyer',
  user_level = 'verified_buyer',
  user_role = 'buyer',
  is_phone_verified = true,
  is_identity_verified = true,
  is_financially_verified = true,
  is_address_verified = true,
  phone = '+27123456790',
  date_of_birth = '1990-03-22',
  id_number = '9003225009088',
  nationality = 'SA',
  residential_address = '{"streetAddress": "456 Oak Avenue", "city": "Cape Town", "province": "Western Cape", "postalCode": "8001"}',
  employment_info = '{"status": "employed", "employer": "Tech Company", "jobTitle": "Software Engineer", "duration": "3-5years", "income": 65000}',
  financial_profile = '{"creditScore": 780, "riskLevel": "Low", "preApprovedAmount": 1500000}',
  updated_at = NOW()
WHERE email = 'buyer@mukamba.com';

-- Create KYC verification record for buyer
INSERT INTO kyc_verifications (
  user_id,
  verification_type,
  status,
  verification_level,
  submitted_at,
  reviewed_at,
  certificate_url
) 
SELECT 
  id,
  'comprehensive',
  'approved',
  'premium',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 days',
  'https://example.com/certificates/buyer-kyc.pdf'
FROM user_profiles 
WHERE email = 'buyer@mukamba.com';

-- Create financial assessment for buyer
INSERT INTO financial_assessments (
  user_id,
  id_number,
  date_of_birth,
  nationality,
  residential_address,
  employment_status,
  monthly_income,
  employer_name,
  job_title,
  employment_duration,
  monthly_expenses,
  has_debts,
  credit_score,
  risk_level,
  debt_to_income_ratio,
  disposable_income,
  pre_approved_amount,
  status
) 
SELECT 
  id,
  '9003225009088',
  '1990-03-22',
  'SA',
  '{"streetAddress": "456 Oak Avenue", "city": "Cape Town", "province": "Western Cape", "postalCode": "8001"}',
  'employed',
  65000.00,
  'Tech Company',
  'Software Engineer',
  '3-5years',
  25000.00,
  'minimal',
  780,
  'Low',
  0.38,
  40000.00,
  1500000.00,
  'completed'
FROM user_profiles 
WHERE email = 'buyer@mukamba.com';

-- =====================================================
-- STEP 4: Create Buyer Onboarding Progress Records
-- =====================================================

-- For verified buyer, create onboarding progress
INSERT INTO buyer_onboarding_progress (
  user_id,
  buyer_type,
  kyc_level,
  email_verified,
  phone_verified,
  identity_verified,
  financial_assessment_completed,
  onboarding_completed,
  created_at,
  updated_at
) 
SELECT 
  id,
  'installment',
  'complete',
  true,
  true,
  true,
  true,
  true,
  NOW() - INTERVAL '5 days',
  NOW()
FROM user_profiles 
WHERE email = 'buyer@mukamba.com';

-- =====================================================
-- STEP 5: Re-enable the Trigger (Fixed Version)
-- =====================================================

-- Create a corrected version of the update_user_kyc_level function
CREATE OR REPLACE FUNCTION update_user_kyc_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Determine KYC level based on verification status (without identity_verifications table)
    IF NEW.is_phone_verified = TRUE AND NEW.is_identity_verified = TRUE THEN
        NEW.kyc_level = 'complete';
    ELSIF NEW.is_phone_verified = TRUE THEN
        NEW.kyc_level = 'phone';
    ELSIF NEW.email_confirmed_at IS NOT NULL THEN
        NEW.kyc_level = 'email';
    ELSE
        NEW.kyc_level = 'none';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-enable the trigger with the corrected function
CREATE TRIGGER trigger_update_kyc_level
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_kyc_level();

-- =====================================================
-- STEP 6: Verify the Setup
-- =====================================================

-- Check the created accounts
SELECT 
  email,
  first_name,
  last_name,
  user_level,
  user_role,
  is_phone_verified,
  is_identity_verified,
  is_financially_verified,
  created_at
FROM user_profiles 
WHERE email IN ('seller@mukamba.com', 'buyer@mukamba.com')
ORDER BY email;

-- Check KYC verifications
SELECT 
  up.email,
  kv.verification_type,
  kv.status,
  kv.verification_level
FROM kyc_verifications kv
JOIN user_profiles up ON kv.user_id = up.id
WHERE up.email IN ('seller@mukamba.com', 'buyer@mukamba.com');

-- Check buyer onboarding progress
SELECT 
  up.email,
  bop.buyer_type,
  bop.kyc_level,
  bop.onboarding_completed
FROM buyer_onboarding_progress bop
JOIN user_profiles up ON bop.user_id = up.id
WHERE up.email = 'buyer@mukamba.com';
