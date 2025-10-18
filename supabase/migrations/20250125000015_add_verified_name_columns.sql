-- =====================================================
-- Add Verified Name Columns to KYC Verifications
-- =====================================================

-- Add verified_first_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kyc_verifications' 
        AND column_name = 'verified_first_name'
    ) THEN
        ALTER TABLE kyc_verifications ADD COLUMN verified_first_name TEXT;
    END IF;
END
$$;

-- Add verified_last_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kyc_verifications' 
        AND column_name = 'verified_last_name'
    ) THEN
        ALTER TABLE kyc_verifications ADD COLUMN verified_last_name TEXT;
    END IF;
END
$$;
