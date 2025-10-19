-- Add automated validation fields to kyc_verifications table
-- These fields store the results of automated document validation

ALTER TABLE kyc_verifications 
ADD COLUMN IF NOT EXISTS automated_risk_score DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS selfie_quality_score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS id_front_quality_score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS id_back_quality_score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS face_match_score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS auto_approved BOOLEAN DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN kyc_verifications.automated_risk_score IS 'Overall risk score from automated validation (0.0-1.0, where 0 is safe, 1 is risky)';
COMMENT ON COLUMN kyc_verifications.selfie_quality_score IS 'Image quality score for selfie photo (0-100)';
COMMENT ON COLUMN kyc_verifications.id_front_quality_score IS 'Image quality score for ID front photo (0-100)';
COMMENT ON COLUMN kyc_verifications.id_back_quality_score IS 'Image quality score for ID back photo (0-100)';
COMMENT ON COLUMN kyc_verifications.face_match_score IS 'Face similarity score between selfie and ID front (0-100)';
COMMENT ON COLUMN kyc_verifications.auto_approved IS 'Whether the verification was automatically approved by the system';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_auto_approved ON kyc_verifications(auto_approved);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_risk_score ON kyc_verifications(automated_risk_score);
