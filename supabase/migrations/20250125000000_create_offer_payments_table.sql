-- Create offer_payments table for tracking payments on property offers
CREATE TABLE IF NOT EXISTS offer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES property_offers(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('ecocash', 'bank_transfer', 'diaspora', 'card')),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'ZAR', 'ZWL')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Ecocash specific fields
    phone_number TEXT,
    transaction_id TEXT UNIQUE,
    payment_reference TEXT,
    
    -- Bank transfer specific fields
    bank_details TEXT,
    
    -- General payment fields
    processing_fee NUMERIC DEFAULT 0,
    net_amount NUMERIC,
    gateway_response JSONB,
    failure_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Admin fields
    admin_notes TEXT,
    refund_reason TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offer_payments_offer_id ON offer_payments(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_payments_buyer_id ON offer_payments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offer_payments_status ON offer_payments(status);
CREATE INDEX IF NOT EXISTS idx_offer_payments_transaction_id ON offer_payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_offer_payments_payment_method ON offer_payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_offer_payments_created_at ON offer_payments(created_at);

-- Create updated_at trigger
CREATE TRIGGER update_offer_payments_updated_at 
    BEFORE UPDATE ON offer_payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE offer_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Buyers can view their own payments
CREATE POLICY "Buyers can view their own payments" ON offer_payments
    FOR SELECT USING (buyer_id = auth.uid()::text::uuid);

-- Buyers can create payments for their offers
CREATE POLICY "Buyers can create payments for their offers" ON offer_payments
    FOR INSERT WITH CHECK (
        buyer_id = auth.uid()::text::uuid 
        AND EXISTS (
            SELECT 1 FROM property_offers 
            WHERE id = offer_id 
            AND buyer_id = auth.uid()::text::uuid
        )
    );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON offer_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text::uuid 
            AND user_role = 'admin'
        )
    );

-- Admins can update all payments
CREATE POLICY "Admins can update all payments" ON offer_payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text::uuid 
            AND user_role = 'admin'
        )
    );

-- Sellers can view payments for their properties
CREATE POLICY "Sellers can view payments for their properties" ON offer_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM property_offers po
            JOIN user_profiles up ON po.seller_id = up.id
            WHERE po.id = offer_id 
            AND up.id = auth.uid()::text::uuid
        )
    );

-- Add comments to table and columns
COMMENT ON TABLE offer_payments IS 'Tracks payments made for property offers including Ecocash, bank transfers, and other payment methods';
COMMENT ON COLUMN offer_payments.offer_id IS 'Reference to the property offer being paid for';
COMMENT ON COLUMN offer_payments.payment_method IS 'Payment method used (ecocash, bank_transfer, diaspora, card)';
COMMENT ON COLUMN offer_payments.amount IS 'Payment amount in the specified currency';
COMMENT ON COLUMN offer_payments.status IS 'Current payment status (pending, processing, completed, failed, cancelled, refunded)';
COMMENT ON COLUMN offer_payments.phone_number IS 'Phone number used for Ecocash payments';
COMMENT ON COLUMN offer_payments.transaction_id IS 'Unique transaction ID from payment gateway';
COMMENT ON COLUMN offer_payments.payment_reference IS 'Payment reference number from gateway';
COMMENT ON COLUMN offer_payments.gateway_response IS 'Full response from payment gateway (JSON)';
COMMENT ON COLUMN offer_payments.processing_fee IS 'Fee charged by payment gateway';
COMMENT ON COLUMN offer_payments.net_amount IS 'Amount after processing fees';
