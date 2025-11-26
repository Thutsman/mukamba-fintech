-- Fix offer reference generation race condition by using a sequence
-- This prevents duplicate key violations when multiple offers are submitted simultaneously

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS trigger_set_offer_reference ON property_offers;
DROP FUNCTION IF EXISTS set_offer_reference();
DROP FUNCTION IF EXISTS generate_offer_reference();

-- Create a sequence for offer reference numbers (resets yearly via application logic)
CREATE SEQUENCE IF NOT EXISTS offer_reference_seq START 1;

-- Create improved function to generate offer reference numbers using a sequence
CREATE OR REPLACE FUNCTION generate_offer_reference()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    reference_number TEXT;
    next_val BIGINT;
    max_existing INTEGER;
BEGIN
    -- Get current year
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the maximum existing counter for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(offer_reference FROM 'OFF-' || year_part || '-(.*)') AS INTEGER)), 0)
    INTO max_existing
    FROM property_offers 
    WHERE offer_reference LIKE 'OFF-' || year_part || '-%';
    
    -- Get next sequence value
    next_val := nextval('offer_reference_seq');
    
    -- Use the greater of the two to handle year transitions
    IF max_existing >= next_val THEN
        -- Reset sequence to continue from max_existing
        PERFORM setval('offer_reference_seq', max_existing + 1, false);
        next_val := max_existing + 1;
    END IF;
    
    -- Format the sequence part with leading zeros (6 digits)
    sequence_part := LPAD(next_val::TEXT, 6, '0');
    
    -- Combine to create reference number
    reference_number := 'OFF-' || year_part || '-' || sequence_part;
    
    RETURN reference_number;
END;
$$ LANGUAGE plpgsql;

-- Create improved trigger function with retry logic
CREATE OR REPLACE FUNCTION set_offer_reference()
RETURNS TRIGGER AS $$
DECLARE
    max_retries INT := 5;
    retry_count INT := 0;
    reference_set BOOLEAN := false;
BEGIN
    -- Only set reference if it's not already provided
    IF NEW.offer_reference IS NULL THEN
        -- Retry loop to handle race conditions
        WHILE NOT reference_set AND retry_count < max_retries LOOP
            BEGIN
                NEW.offer_reference := generate_offer_reference();
                reference_set := true;
            EXCEPTION
                WHEN unique_violation THEN
                    retry_count := retry_count + 1;
                    IF retry_count >= max_retries THEN
                        RAISE EXCEPTION 'Failed to generate unique offer reference after % attempts', max_retries;
                    END IF;
                    -- Small delay before retry (in milliseconds)
                    PERFORM pg_sleep(0.01 * retry_count);
            END;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_set_offer_reference
    BEFORE INSERT ON property_offers
    FOR EACH ROW
    EXECUTE FUNCTION set_offer_reference();

-- Add comment explaining the fix
COMMENT ON FUNCTION generate_offer_reference() IS 
    'Generates unique offer reference numbers using a sequence to prevent race conditions. Format: OFF-YYYY-NNNNNN';

COMMENT ON FUNCTION set_offer_reference() IS 
    'Trigger function that sets offer_reference with retry logic to handle concurrent inserts';

