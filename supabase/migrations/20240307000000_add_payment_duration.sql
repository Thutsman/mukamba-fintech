-- Add payment_duration column and rename monthly_rental to monthly_installment
-- Migration: 20240307000000_add_payment_duration.sql

-- First, add the new payment_duration column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS payment_duration INTEGER;

-- Add a comment to explain the column
COMMENT ON COLUMN properties.payment_duration IS 'Payment duration in months for rent-to-buy properties';

-- Note: The monthly_rental column will be renamed to monthly_installment in a separate migration
-- to avoid breaking existing data during deployment

