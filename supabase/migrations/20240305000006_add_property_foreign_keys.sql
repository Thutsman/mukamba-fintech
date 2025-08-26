-- Migration: Add Property Foreign Key Constraints
-- Description: Add foreign key constraints to properties table when it exists
-- Date: 2024-03-05

-- Add foreign key constraints to buyer_onboarding_progress
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') THEN
        ALTER TABLE buyer_onboarding_progress 
        ADD CONSTRAINT fk_buyer_onboarding_progress_property_id 
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- Add foreign key constraints to buyer_phone_verifications
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') THEN
        ALTER TABLE buyer_phone_verifications 
        ADD CONSTRAINT fk_buyer_phone_verifications_property_id 
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- Add foreign key constraints to buyer_contact_requests
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') THEN
        ALTER TABLE buyer_contact_requests 
        ADD CONSTRAINT fk_buyer_contact_requests_property_id 
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;
    END IF;
END
$$;
