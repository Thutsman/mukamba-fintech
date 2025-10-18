-- =====================================================
-- Fix KYC Verifications Schema
-- Add missing columns to kyc_verifications table
-- =====================================================

-- Add business_registered column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kyc_verifications' 
        AND column_name = 'business_registered'
    ) THEN
        ALTER TABLE kyc_verifications ADD COLUMN business_registered BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;

-- Add business_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kyc_verifications' 
        AND column_name = 'business_name'
    ) THEN
        ALTER TABLE kyc_verifications ADD COLUMN business_name TEXT;
    END IF;
END
$$;

-- Add business_registration_number column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kyc_verifications' 
        AND column_name = 'business_registration_number'
    ) THEN
        ALTER TABLE kyc_verifications ADD COLUMN business_registration_number TEXT;
    END IF;
END
$$;

-- Add tax_number column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kyc_verifications' 
        AND column_name = 'tax_number'
    ) THEN
        ALTER TABLE kyc_verifications ADD COLUMN tax_number TEXT;
    END IF;
END
$$;

-- Add date_of_birth column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kyc_verifications' 
        AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE kyc_verifications ADD COLUMN date_of_birth TEXT;
    END IF;
END
$$;

-- Add monthly_income column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kyc_verifications' 
        AND column_name = 'monthly_income'
    ) THEN
        ALTER TABLE kyc_verifications ADD COLUMN monthly_income NUMERIC;
    END IF;
END
$$;

-- Add employment_status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kyc_verifications' 
        AND column_name = 'employment_status'
    ) THEN
        ALTER TABLE kyc_verifications ADD COLUMN employment_status TEXT;
    END IF;
END
$$;

-- Add bank_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kyc_verifications' 
        AND column_name = 'bank_name'
    ) THEN
        ALTER TABLE kyc_verifications ADD COLUMN bank_name TEXT;
    END IF;
END
$$;
