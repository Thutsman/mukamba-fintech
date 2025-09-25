-- Add proof_url column to offer_payments table for bank transfer proof of payment
-- This migration adds support for storing proof of payment URLs

-- Add proof_url column if it doesn't exist
ALTER TABLE offer_payments 
ADD COLUMN IF NOT EXISTS proof_url TEXT;

-- Add comment for the new column
COMMENT ON COLUMN offer_payments.proof_url IS 'URL to proof of payment document (for bank transfers)';

-- Create index for proof_url for better query performance
CREATE INDEX IF NOT EXISTS idx_offer_payments_proof_url ON offer_payments(proof_url);

-- Update the gateway_response column to support more detailed bank transfer data
-- This is already a JSONB column, so we can store additional metadata
COMMENT ON COLUMN offer_payments.gateway_response IS 'JSON response from payment gateway or manual payment details (bank transfer proof, etc.)';
