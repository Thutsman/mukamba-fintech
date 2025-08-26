-- Migration: Buyer Onboarding Schema Support
-- Description: Add buyer_type, kyc_level, and phone verification tracking to user_profiles
-- Date: 2024-03-05

-- Add buyer_type column to user_profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'buyer_type') THEN
        ALTER TABLE user_profiles ADD COLUMN buyer_type VARCHAR(20) CHECK (buyer_type IN ('cash', 'installment'));
    END IF;
END
$$;

-- Add kyc_level column to user_profiles to track verification progress
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'kyc_level') THEN
        ALTER TABLE user_profiles ADD COLUMN kyc_level VARCHAR(20) DEFAULT 'none' CHECK (kyc_level IN ('none', 'email', 'phone', 'identity', 'financial', 'complete'));
    END IF;
END
$$;

-- Note: phone_verified and phone_number columns already exist in user_profiles
-- Using existing is_phone_verified (boolean) and phone (text) columns

-- Add buyer_onboarding_progress table for tracking buyer signup flow
CREATE TABLE IF NOT EXISTS buyer_onboarding_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_step VARCHAR(50) NOT NULL DEFAULT 'email_signup',
    form_data JSONB NOT NULL DEFAULT '{}',
    completed_steps TEXT[] DEFAULT '{}',
    buyer_type VARCHAR(20) CHECK (buyer_type IN ('cash', 'installment')),
    signup_source VARCHAR(50), -- 'property_details_gate', 'direct_signup', etc.
    property_id UUID, -- Will be referenced when properties table exists
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id)
);

-- Add RLS policies for buyer_onboarding_progress
DROP POLICY IF EXISTS "Users can manage their own buyer onboarding progress" ON buyer_onboarding_progress;
CREATE POLICY "Users can manage their own buyer onboarding progress" 
ON buyer_onboarding_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- Enable RLS on buyer_onboarding_progress
ALTER TABLE buyer_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Create buyer_phone_verifications table for tracking phone verification attempts
CREATE TABLE IF NOT EXISTS buyer_phone_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    otp_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_source VARCHAR(50), -- 'seller_contact_gate', 'property_alerts', etc.
    property_id UUID, -- Will be referenced when properties table exists
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active OTP per user
    UNIQUE(user_id, phone_number)
);

-- Add RLS policies for buyer_phone_verifications
DROP POLICY IF EXISTS "Users can manage their own phone verifications" ON buyer_phone_verifications;
CREATE POLICY "Users can manage their own phone verifications" 
ON buyer_phone_verifications 
FOR ALL 
USING (auth.uid() = user_id);

-- Enable RLS on buyer_phone_verifications
ALTER TABLE buyer_phone_verifications ENABLE ROW LEVEL SECURITY;

-- Create buyer_contact_requests table for tracking seller contact attempts
CREATE TABLE IF NOT EXISTS buyer_contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID, -- Will be referenced when properties table exists
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    buyer_type VARCHAR(20) NOT NULL CHECK (buyer_type IN ('cash', 'installment')),
    contact_method VARCHAR(20) NOT NULL CHECK (contact_method IN ('phone', 'email', 'both')),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'responded', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate contact requests
    UNIQUE(buyer_id, property_id)
);

-- Add RLS policies for buyer_contact_requests
DROP POLICY IF EXISTS "Users can view their own contact requests" ON buyer_contact_requests;
CREATE POLICY "Users can view their own contact requests" 
ON buyer_contact_requests 
FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Buyers can create contact requests" ON buyer_contact_requests;
CREATE POLICY "Buyers can create contact requests" 
ON buyer_contact_requests 
FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can update their own contact requests" ON buyer_contact_requests;
CREATE POLICY "Users can update their own contact requests" 
ON buyer_contact_requests 
FOR UPDATE
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Enable RLS on buyer_contact_requests
ALTER TABLE buyer_contact_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_buyer_onboarding_progress_user_id ON buyer_onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_onboarding_progress_buyer_type ON buyer_onboarding_progress(buyer_type);
CREATE INDEX IF NOT EXISTS idx_buyer_phone_verifications_user_id ON buyer_phone_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_phone_verifications_phone_number ON buyer_phone_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_buyer_contact_requests_buyer_id ON buyer_contact_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_contact_requests_property_id ON buyer_contact_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_buyer_contact_requests_seller_id ON buyer_contact_requests(seller_id);

-- Create function to update KYC level based on verification status
CREATE OR REPLACE FUNCTION update_user_kyc_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Determine KYC level based on verification status
    IF NEW.is_phone_verified = TRUE AND EXISTS (
        SELECT 1 FROM identity_verifications 
        WHERE user_id = NEW.id AND status = 'verified'
    ) THEN
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

-- Create trigger to automatically update KYC level
DROP TRIGGER IF EXISTS trigger_update_kyc_level ON user_profiles;
CREATE TRIGGER trigger_update_kyc_level
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_kyc_level();

-- Create function to handle buyer signup completion
CREATE OR REPLACE FUNCTION handle_buyer_signup(
    p_user_id UUID,
    p_buyer_type VARCHAR(20),
    p_signup_source VARCHAR(50),
    p_property_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Update user profile with buyer type
    UPDATE user_profiles 
    SET 
        buyer_type = p_buyer_type,
        kyc_level = 'email',
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Create or update buyer onboarding progress
    INSERT INTO buyer_onboarding_progress (
        user_id, 
        current_step, 
        buyer_type, 
        signup_source, 
        property_id,
        completed_steps
    ) VALUES (
        p_user_id, 
        'email_signup', 
        p_buyer_type, 
        p_signup_source, 
        p_property_id,
        ARRAY['email_signup']
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        buyer_type = EXCLUDED.buyer_type,
        signup_source = EXCLUDED.signup_source,
        property_id = EXCLUDED.property_id,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to handle phone verification
CREATE OR REPLACE FUNCTION handle_phone_verification(
    p_user_id UUID,
    p_phone_number VARCHAR(20),
    p_verification_source VARCHAR(50),
    p_property_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Update user profile with phone verification
    UPDATE user_profiles 
    SET 
        is_phone_verified = TRUE,
        phone = p_phone_number,
        kyc_level = 'phone',
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Update buyer onboarding progress
    UPDATE buyer_onboarding_progress 
    SET 
        current_step = 'phone_verified',
        completed_steps = array_append(completed_steps, 'phone_verification'),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Mark phone verification as completed
    UPDATE buyer_phone_verifications 
    SET verified_at = NOW()
    WHERE user_id = p_user_id AND phone_number = p_phone_number;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON buyer_onboarding_progress TO authenticated;
GRANT ALL ON buyer_phone_verifications TO authenticated;
GRANT ALL ON buyer_contact_requests TO authenticated;

-- Create view for buyer analytics
CREATE OR REPLACE VIEW buyer_analytics AS
SELECT 
    up.id as user_id,
    up.email,
    up.buyer_type,
    up.kyc_level,
    up.is_phone_verified,
    up.created_at as signup_date,
    bop.signup_source,
    bop.current_step,
    bop.completed_steps,
    COUNT(bcr.id) as contact_requests_count,
    COUNT(CASE WHEN bcr.status = 'completed' THEN 1 END) as completed_contacts
FROM user_profiles up
LEFT JOIN buyer_onboarding_progress bop ON up.id = bop.user_id
LEFT JOIN buyer_contact_requests bcr ON up.id = bcr.buyer_id
WHERE up.buyer_type IS NOT NULL
GROUP BY up.id, up.email, up.buyer_type, up.kyc_level, up.is_phone_verified, up.created_at, bop.signup_source, bop.current_step, bop.completed_steps;

-- Grant access to the view
GRANT SELECT ON buyer_analytics TO authenticated;

