-- Safe Authentication Fix - Handles Existing Policies
-- This migration safely fixes authentication issues without conflicts

-- =====================================================
-- SAFELY DROP AND RECREATE USER_PROFILES POLICIES
-- =====================================================

-- Drop existing policies safely
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "FinTech users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "FinTech users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "FinTech users can insert own profile" ON user_profiles;

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create basic policies that allow authenticated users to manage their own profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- SAFELY DROP AND RECREATE EARLY_ACCESS_SIGNUPS POLICIES
-- =====================================================

-- Drop existing policies safely
DROP POLICY IF EXISTS "Early access users can view own signup" ON early_access_signups;
DROP POLICY IF EXISTS "Early access users can insert own signup" ON early_access_signups;
DROP POLICY IF EXISTS "Early access users can update own signup" ON early_access_signups;
DROP POLICY IF EXISTS "Anyone can view early access signups" ON early_access_signups;
DROP POLICY IF EXISTS "Anyone can insert early access signups" ON early_access_signups;
DROP POLICY IF EXISTS "Anyone can update early access signups" ON early_access_signups;

-- Enable RLS on early_access_signups table
ALTER TABLE early_access_signups ENABLE ROW LEVEL SECURITY;

-- Create basic policies for early access signups
CREATE POLICY "Anyone can view early access signups" ON early_access_signups
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert early access signups" ON early_access_signups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update early access signups" ON early_access_signups
  FOR UPDATE USING (true);

-- =====================================================
-- SAFELY HANDLE OTHER TABLES
-- =====================================================

-- Function to safely handle table policies
CREATE OR REPLACE FUNCTION safe_update_table_policies(table_name text)
RETURNS void AS $$
BEGIN
  -- Enable RLS
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  
  -- Drop existing policies safely
  EXECUTE format('DROP POLICY IF EXISTS "Users can view own %I" ON %I', table_name, table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %I" ON %I', table_name, table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Users can update own %I" ON %I', table_name, table_name);
  EXECUTE format('DROP POLICY IF EXISTS "FinTech users can view own %I" ON %I', table_name, table_name);
  EXECUTE format('DROP POLICY IF EXISTS "FinTech users can insert own %I" ON %I', table_name, table_name);
  EXECUTE format('DROP POLICY IF EXISTS "FinTech users can update own %I" ON %I', table_name, table_name);
  
  -- Create basic policies for each table
  EXECUTE format('CREATE POLICY "Users can view own %I" ON %I FOR SELECT USING (auth.uid() = user_id)', table_name, table_name);
  EXECUTE format('CREATE POLICY "Users can insert own %I" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', table_name, table_name);
  EXECUTE format('CREATE POLICY "Users can update own %I" ON %I FOR UPDATE USING (auth.uid() = user_id)', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
SELECT safe_update_table_policies(tablename)
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'kyc_verifications', 
    'kyc_documents', 
    'phone_verification_attempts', 
    'financial_assessments', 
    'user_sessions', 
    'user_login_history'
);

-- Clean up the function
DROP FUNCTION safe_update_table_policies(text);

-- =====================================================
-- SAFELY HANDLE STORAGE POLICIES
-- =====================================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('user-documents', 'user-documents', false),
    ('kyc-documents', 'kyc-documents', false),
    ('property-images', 'property-images', true),
    ('property-documents', 'property-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies safely
DROP POLICY IF EXISTS "FinTech users can access user documents" ON storage.objects;
DROP POLICY IF EXISTS "FinTech users can upload user documents" ON storage.objects;
DROP POLICY IF EXISTS "FinTech users can access KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "FinTech users can upload KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can access own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can access own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Public access to property images" ON storage.objects;

-- Create basic storage policies
CREATE POLICY "Users can access own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can access own KYC documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own KYC documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public access for property images
CREATE POLICY "Public access to property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

-- =====================================================
-- FIX THE TRIGGER FUNCTION
-- =====================================================

-- Ensure the handle_new_user trigger exists with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Try to insert the user profile, but don't fail if it already exists
  INSERT INTO public.user_profiles (
    id,
    first_name,
    last_name,
    email,
    phone,
    user_level,
    user_role,
    is_phone_verified,
    is_identity_verified,
    is_financially_verified,
    is_address_verified,
    is_property_verified,
    is_active,
    is_suspended,
    notification_preferences,
    privacy_settings,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'new_user',
    'user',
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    '{"email": true, "sms": true, "push": true}'::jsonb,
    '{"profile_visible": true, "contact_visible": true}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Don't fail if profile already exists
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables exist and have correct structure
SELECT 
    table_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = t.table_name
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (VALUES 
    ('user_profiles'),
    ('early_access_signups'),
    ('kyc_verifications'),
    ('kyc_documents'),
    ('phone_verification_attempts'),
    ('financial_assessments'),
    ('user_sessions'),
    ('user_login_history')
) AS t(table_name);

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'user_profiles',
    'early_access_signups',
    'kyc_verifications',
    'kyc_documents',
    'phone_verification_attempts',
    'financial_assessments',
    'user_sessions',
    'user_login_history'
);

-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
