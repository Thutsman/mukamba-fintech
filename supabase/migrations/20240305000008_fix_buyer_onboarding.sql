-- Migration: Fix Buyer Onboarding Progress and KYC Level Updates
-- Description: Ensure buyer_onboarding_progress table is properly populated and KYC levels are updated correctly
-- Date: 2024-03-05

-- Fix the handle_buyer_signup function to ensure it creates buyer_onboarding_progress records
CREATE OR REPLACE FUNCTION handle_buyer_signup(
    p_user_id UUID,
    p_buyer_type VARCHAR(20),
    p_signup_source VARCHAR(50),
    p_property_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Update user profile with buyer type and set KYC level to email
    UPDATE user_profiles 
    SET 
        buyer_type = p_buyer_type,
        kyc_level = 'email',
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Create buyer onboarding progress record
    INSERT INTO buyer_onboarding_progress (
        user_id, 
        current_step, 
        buyer_type, 
        signup_source, 
        property_id,
        completed_steps,
        form_data
    ) VALUES (
        p_user_id, 
        'email_signup', 
        p_buyer_type, 
        p_signup_source, 
        p_property_id,
        ARRAY['email_signup'],
        jsonb_build_object(
            'buyer_type', p_buyer_type,
            'signup_source', p_signup_source,
            'signup_date', NOW()
        )
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        buyer_type = EXCLUDED.buyer_type,
        signup_source = EXCLUDED.signup_source,
        property_id = EXCLUDED.property_id,
        current_step = 'email_signup',
        completed_steps = ARRAY['email_signup'],
        form_data = jsonb_build_object(
            'buyer_type', p_buyer_type,
            'signup_source', p_signup_source,
            'signup_date', NOW()
        ),
        updated_at = NOW();
        
    -- Log the operation
    RAISE LOG 'Buyer signup completed for user % with type % from source %', p_user_id, p_buyer_type, p_signup_source;
END;
$$ LANGUAGE plpgsql;

-- Fix the handle_phone_verification function to properly update KYC level
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
        form_data = form_data || jsonb_build_object(
            'phone_number', p_phone_number,
            'phone_verified_at', NOW(),
            'verification_source', p_verification_source
        ),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Mark phone verification as completed
    UPDATE buyer_phone_verifications 
    SET verified_at = NOW()
    WHERE user_id = p_user_id AND phone_number = p_phone_number;
    
    -- Log the operation
    RAISE LOG 'Phone verification completed for user % with phone % from source %', p_user_id, p_phone_number, p_verification_source;
END;
$$ LANGUAGE plpgsql;

-- Create a function to manually populate buyer_onboarding_progress for existing users
CREATE OR REPLACE FUNCTION populate_missing_buyer_onboarding()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Find users who have buyer_type but no buyer_onboarding_progress record
    FOR user_record IN 
        SELECT up.id, up.buyer_type, up.created_at
        FROM user_profiles up
        LEFT JOIN buyer_onboarding_progress bop ON up.id = bop.user_id
        WHERE up.buyer_type IS NOT NULL 
        AND bop.user_id IS NULL
    LOOP
        -- Create buyer onboarding progress record
        INSERT INTO buyer_onboarding_progress (
            user_id,
            current_step,
            buyer_type,
            signup_source,
            completed_steps,
            form_data,
            created_at,
            updated_at
        ) VALUES (
            user_record.id,
            CASE 
                WHEN EXISTS (SELECT 1 FROM user_profiles WHERE id = user_record.id AND is_phone_verified = TRUE) 
                THEN 'phone_verified'
                ELSE 'email_signup'
            END,
            user_record.buyer_type,
            'manual_population',
            CASE 
                WHEN EXISTS (SELECT 1 FROM user_profiles WHERE id = user_record.id AND is_phone_verified = TRUE) 
                THEN ARRAY['email_signup', 'phone_verification']
                ELSE ARRAY['email_signup']
            END,
            jsonb_build_object(
                'buyer_type', user_record.buyer_type,
                'signup_source', 'manual_population',
                'signup_date', user_record.created_at
            ),
            user_record.created_at,
            NOW()
        );
        
        RAISE LOG 'Created buyer onboarding progress for user %', user_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the population function
SELECT populate_missing_buyer_onboarding();

-- Create a view to check buyer onboarding status
CREATE OR REPLACE VIEW buyer_onboarding_status AS
SELECT 
    up.id as user_id,
    up.email,
    up.buyer_type,
    up.kyc_level,
    up.is_phone_verified,
    up.created_at as signup_date,
    bop.current_step,
    bop.completed_steps,
    bop.signup_source,
    CASE 
        WHEN up.kyc_level = 'phone' THEN 'Phone Verified'
        WHEN up.kyc_level = 'email' THEN 'Email Verified'
        WHEN up.kyc_level = 'none' THEN 'Not Verified'
        ELSE up.kyc_level
    END as verification_status
FROM user_profiles up
LEFT JOIN buyer_onboarding_progress bop ON up.id = bop.user_id
WHERE up.buyer_type IS NOT NULL
ORDER BY up.created_at DESC;

-- Grant access to the view
GRANT SELECT ON buyer_onboarding_status TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION handle_buyer_signup IS 'Handles buyer signup completion and creates buyer_onboarding_progress record';
COMMENT ON FUNCTION handle_phone_verification IS 'Handles phone verification and updates KYC level to phone';
COMMENT ON FUNCTION populate_missing_buyer_onboarding IS 'Populates missing buyer_onboarding_progress records for existing users';
COMMENT ON VIEW buyer_onboarding_status IS 'View to check buyer onboarding status and KYC levels';

