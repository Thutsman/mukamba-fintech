-- Create property_offers table
CREATE TABLE IF NOT EXISTS property_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    offer_price NUMERIC NOT NULL CHECK (offer_price > 0),
    deposit_amount NUMERIC NOT NULL CHECK (deposit_amount >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'installments')),
    estimated_timeline TEXT NOT NULL,
    additional_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Admin review fields
    admin_reviewed_by UUID REFERENCES user_profiles(id),
    admin_reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    rejection_reason TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_offers_property_id ON property_offers(property_id);
CREATE INDEX IF NOT EXISTS idx_property_offers_buyer_id ON property_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_property_offers_seller_id ON property_offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_property_offers_status ON property_offers(status);
CREATE INDEX IF NOT EXISTS idx_property_offers_submitted_at ON property_offers(submitted_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_offers_updated_at 
    BEFORE UPDATE ON property_offers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE property_offers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Buyers can view their own offers
CREATE POLICY "Buyers can view their own offers" ON property_offers
    FOR SELECT USING (buyer_id = auth.uid()::text::uuid);

-- Sellers can view offers for their properties (if seller_id is set)
CREATE POLICY "Sellers can view offers for their properties" ON property_offers
    FOR SELECT USING (seller_id IS NOT NULL AND seller_id = auth.uid()::text::uuid);

-- Buyers can create offers
CREATE POLICY "Buyers can create offers" ON property_offers
    FOR INSERT WITH CHECK (buyer_id = auth.uid()::text::uuid);

-- Buyers can update their own pending offers
CREATE POLICY "Buyers can update their own pending offers" ON property_offers
    FOR UPDATE USING (buyer_id = auth.uid()::text::uuid AND status = 'pending');

-- Admins can view all offers
CREATE POLICY "Admins can view all offers" ON property_offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text::uuid 
            AND user_role = 'admin'
        )
    );

-- Admins can update all offers
CREATE POLICY "Admins can update all offers" ON property_offers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text::uuid 
            AND user_role = 'admin'
        )
    );

-- Add comment to table
COMMENT ON TABLE property_offers IS 'Stores property offers made by buyers to sellers';
COMMENT ON COLUMN property_offers.offer_price IS 'The price offered by the buyer';
COMMENT ON COLUMN property_offers.deposit_amount IS 'The deposit amount offered by the buyer';
COMMENT ON COLUMN property_offers.payment_method IS 'How the buyer intends to pay (cash or installments)';
COMMENT ON COLUMN property_offers.estimated_timeline IS 'When the buyer expects to complete payment';
COMMENT ON COLUMN property_offers.expires_at IS 'When the offer expires';
COMMENT ON COLUMN property_offers.status IS 'Current status of the offer';
