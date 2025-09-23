-- Update property_offers table to include 'paid' status
ALTER TABLE property_offers 
DROP CONSTRAINT IF EXISTS property_offers_status_check;

ALTER TABLE property_offers 
ADD CONSTRAINT property_offers_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn', 'expired', 'paid'));

-- Add comment
COMMENT ON COLUMN property_offers.status IS 'Current status of the offer (pending, approved, rejected, withdrawn, expired, paid)';
