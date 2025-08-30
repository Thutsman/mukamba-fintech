-- COMPLETE SELLER ONBOARDING DATABASE SETUP
-- Paste this entire code into Supabase SQL Editor
-- This creates all missing tables and updates existing ones for seller onboarding

-- =======================
-- 1. CREATE SELLER ONBOARDING PROGRESS TABLE
-- =======================

CREATE TABLE IF NOT EXISTS seller_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_step VARCHAR(50) NOT NULL DEFAULT 'welcome',
  form_data JSONB NOT NULL DEFAULT '{}',
  completed_steps TEXT[] DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one progress record per user
  UNIQUE(user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seller_onboarding_progress_user_id 
ON seller_onboarding_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_seller_onboarding_progress_current_step 
ON seller_onboarding_progress(current_step);

-- =======================
-- 2. ADD ADDITIONAL_INFO COLUMN TO USER_PROFILES
-- =======================

-- Check if additional_info column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'additional_info'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN additional_info JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_additional_info_gin 
ON user_profiles USING GIN (additional_info);

-- =======================
-- 3. ADD ROLES COLUMN TO USER_PROFILES (if not exists)
-- =======================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'roles'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN roles TEXT[] DEFAULT ARRAY['user'];
    END IF;
END $$;

-- =======================
-- 4. ENABLE RLS ON SELLER_ONBOARDING_PROGRESS
-- =======================

ALTER TABLE seller_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- =======================
-- 5. CREATE RLS POLICIES FOR SELLER_ONBOARDING_PROGRESS
-- =======================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own onboarding progress" ON seller_onboarding_progress;
DROP POLICY IF EXISTS "Users can insert their own onboarding progress" ON seller_onboarding_progress;
DROP POLICY IF EXISTS "Users can update their own onboarding progress" ON seller_onboarding_progress;
DROP POLICY IF EXISTS "Users can delete their own onboarding progress" ON seller_onboarding_progress;
DROP POLICY IF EXISTS "Fintech app users only" ON seller_onboarding_progress;

-- Create new policies
CREATE POLICY "Users can view their own onboarding progress" 
ON seller_onboarding_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding progress" 
ON seller_onboarding_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding progress" 
ON seller_onboarding_progress 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own onboarding progress" 
ON seller_onboarding_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- App separation policy for fintech app
CREATE POLICY "Fintech app users only" 
ON seller_onboarding_progress 
FOR ALL 
USING (
  COALESCE(
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'app_type',
    'fintech'
  ) = 'fintech'
);

-- =======================
-- 6. CREATE TRIGGER FOR UPDATED_AT
-- =======================

CREATE OR REPLACE FUNCTION update_seller_onboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS seller_onboarding_progress_updated_at ON seller_onboarding_progress;

-- Create trigger
CREATE TRIGGER seller_onboarding_progress_updated_at
  BEFORE UPDATE ON seller_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_onboarding_progress_updated_at();

-- =======================
-- 7. GRANT PERMISSIONS
-- =======================

GRANT ALL ON seller_onboarding_progress TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- =======================
-- 8. ADD HELPFUL COMMENTS
-- =======================

COMMENT ON TABLE seller_onboarding_progress IS 'Tracks seller onboarding progress to allow users to resume interrupted flows';
COMMENT ON COLUMN seller_onboarding_progress.current_step IS 'Current step in the onboarding process (welcome, phone, identity, property, documents, complete)';
COMMENT ON COLUMN seller_onboarding_progress.form_data IS 'JSON object containing all form data entered by the user';
COMMENT ON COLUMN seller_onboarding_progress.completed_steps IS 'Array of completed step IDs for progress tracking';
COMMENT ON COLUMN seller_onboarding_progress.completed_at IS 'Timestamp when onboarding was fully completed (null if in progress)';

-- =======================
-- 9. CREATE SAMPLE QUERIES FOR TESTING (COMMENTED OUT)
-- =======================

-- Test queries (uncomment to run):
-- SELECT * FROM seller_onboarding_progress WHERE user_id = auth.uid();
-- SELECT additional_info FROM user_profiles WHERE id = auth.uid();
-- SELECT * FROM phone_verification_attempts WHERE user_id = auth.uid();

-- =======================
-- SETUP COMPLETE!
-- =======================

-- This script has:
-- ✅ Created seller_onboarding_progress table
-- ✅ Added additional_info JSONB column to user_profiles  
-- ✅ Added roles column to user_profiles (if missing)
-- ✅ Set up proper RLS policies
-- ✅ Created indexes for performance
-- ✅ Added update trigger
-- ✅ Granted proper permissions
