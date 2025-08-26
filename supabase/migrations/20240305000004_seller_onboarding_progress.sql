-- Migration: Seller Onboarding Progress Tracking
-- Description: Add table to track seller onboarding progress and resume interrupted flows
-- Date: 2024-03-05

-- Create seller onboarding progress table
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

-- Enable RLS
ALTER TABLE seller_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Add app separation policy for fintech app
CREATE POLICY "Fintech app users only" 
ON seller_onboarding_progress 
FOR ALL 
USING (
  COALESCE(
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'app_type',
    'fintech'
  ) = 'fintech'
);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_seller_onboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seller_onboarding_progress_updated_at
  BEFORE UPDATE ON seller_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_onboarding_progress_updated_at();

-- Add helpful comments
COMMENT ON TABLE seller_onboarding_progress IS 'Tracks seller onboarding progress to allow users to resume interrupted flows';
COMMENT ON COLUMN seller_onboarding_progress.current_step IS 'Current step in the onboarding process (welcome, phone, identity, property, documents, complete)';
COMMENT ON COLUMN seller_onboarding_progress.form_data IS 'JSON object containing all form data entered by the user';
COMMENT ON COLUMN seller_onboarding_progress.completed_steps IS 'Array of completed step IDs for progress tracking';
COMMENT ON COLUMN seller_onboarding_progress.completed_at IS 'Timestamp when onboarding was fully completed (null if in progress)';

-- Grant permissions
GRANT ALL ON seller_onboarding_progress TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
