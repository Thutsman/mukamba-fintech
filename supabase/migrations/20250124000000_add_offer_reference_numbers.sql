-- Add offer reference number column to property_offers table
ALTER TABLE property_offers 
ADD COLUMN offer_reference VARCHAR(20) UNIQUE;

-- Create index for better performance on reference lookups
CREATE INDEX IF NOT EXISTS idx_property_offers_reference ON property_offers(offer_reference);

-- Add comment to the new column
COMMENT ON COLUMN property_offers.offer_reference IS 'Unique reference number for the offer (e.g., OFF-2024-001234)';

-- Create a function to generate offer reference numbers
CREATE OR REPLACE FUNCTION generate_offer_reference()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    reference_number TEXT;
    counter INTEGER;
BEGIN
    -- Get current year
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(offer_reference FROM 'OFF-' || year_part || '-(.*)') AS INTEGER)), 0) + 1
    INTO counter
    FROM property_offers 
    WHERE offer_reference LIKE 'OFF-' || year_part || '-%';
    
    -- Format the sequence part with leading zeros (6 digits)
    sequence_part := LPAD(counter::TEXT, 6, '0');
    
    -- Combine to create reference number
    reference_number := 'OFF-' || year_part || '-' || sequence_part;
    
    RETURN reference_number;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate reference numbers
CREATE OR REPLACE FUNCTION set_offer_reference()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set reference if it's not already provided
    IF NEW.offer_reference IS NULL THEN
        NEW.offer_reference := generate_offer_reference();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_set_offer_reference
    BEFORE INSERT ON property_offers
    FOR EACH ROW
    EXECUTE FUNCTION set_offer_reference();

-- Update existing offers with reference numbers (if any exist)
-- This will only run if there are existing offers without reference numbers
UPDATE property_offers 
SET offer_reference = generate_offer_reference()
WHERE offer_reference IS NULL;
