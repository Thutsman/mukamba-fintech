-- Migration: Add buyer type trigger and user role management
-- This trigger automatically sets buyer type and user role when users sign up

-- Function to handle buyer signup and set appropriate user role
CREATE OR REPLACE FUNCTION handle_buyer_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a buyer signup (we'll use a temporary table or session variable)
  -- For now, we'll set default buyer type and role
  -- This will be updated by the buyer services after signup
  
  -- Set default buyer type to 'cash' for new users
  -- The actual buyer type will be set by the buyer services
  NEW.buyer_type := COALESCE(NEW.buyer_type, 'cash');
  
  -- Set user role to 'buyer' for new users
  NEW.user_role := 'buyer';
  
  -- Set user level to 'new_user' initially
  NEW.user_level := 'new_user';
  
  -- Set KYC level to 'email' (basic email verification)
  NEW.kyc_level := 'email';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set buyer type and role
CREATE TRIGGER set_buyer_type_on_signup
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_buyer_signup();

-- Function to update buyer type after signup
CREATE OR REPLACE FUNCTION update_buyer_type(
  user_id UUID,
  buyer_type TEXT,
  source TEXT DEFAULT 'property_details_gate'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update user profile with buyer type
  UPDATE user_profiles 
  SET 
    buyer_type = update_buyer_type.buyer_type,
    updated_at = NOW()
  WHERE id = update_buyer_type.user_id;
  
  -- Create buyer onboarding progress record
  INSERT INTO buyer_onboarding_progress (
    user_id,
    buyer_type,
    current_step,
    signup_source,
    created_at
  ) VALUES (
    update_buyer_type.user_id,
    update_buyer_type.buyer_type,
    'email_verified',
    update_buyer_type.source,
    NOW()
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error updating buyer type: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_buyer_type(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_buyer_type(UUID, TEXT, TEXT) TO service_role;
