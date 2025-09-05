-- Rename monthly_rental column to monthly_installment
-- Migration: 20240307000001_rename_monthly_rental.sql

-- Rename the column from monthly_rental to monthly_installment
ALTER TABLE properties 
RENAME COLUMN monthly_rental TO monthly_installment;

-- Add a comment to explain the column
COMMENT ON COLUMN properties.monthly_installment IS 'Monthly installment amount for rent-to-buy properties';

