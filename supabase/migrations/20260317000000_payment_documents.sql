-- Create payment_documents table for admin-uploaded receipt and agreement docs

CREATE TABLE IF NOT EXISTS payment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES offer_payments(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES property_offers(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  document_type TEXT NOT NULL CHECK (document_type IN ('receipt', 'agreement_of_sale')),

  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  original_filename TEXT,

  uploaded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- One receipt + one agreement per payment
CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_documents_payment_type
  ON payment_documents(payment_id, document_type);

CREATE INDEX IF NOT EXISTS idx_payment_documents_payment_id ON payment_documents(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_documents_offer_id ON payment_documents(offer_id);
CREATE INDEX IF NOT EXISTS idx_payment_documents_buyer_id ON payment_documents(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payment_documents_uploaded_at ON payment_documents(uploaded_at);

-- updated_at trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE TRIGGER update_payment_documents_updated_at
      BEFORE UPDATE ON payment_documents
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

ALTER TABLE payment_documents ENABLE ROW LEVEL SECURITY;

-- Buyer can view their own documents
CREATE POLICY "Buyers can view their own payment documents" ON payment_documents
  FOR SELECT
  USING (buyer_id = auth.uid()::text::uuid);

-- Admin can view all payment documents (based on user_profiles.user_role)
CREATE POLICY "Admins can view all payment documents" ON payment_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()::text::uuid
        AND user_role = 'admin'
    )
  );

-- Admin can insert/update documents
CREATE POLICY "Admins can manage payment documents" ON payment_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()::text::uuid
        AND user_role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()::text::uuid
        AND user_role = 'admin'
    )
  );

-- Service role policies for API routes
CREATE POLICY "Service role can select payment documents" ON payment_documents
  FOR SELECT TO service_role
  USING (true);

CREATE POLICY "Service role can insert payment documents" ON payment_documents
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update payment documents" ON payment_documents
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE payment_documents IS 'Admin-uploaded documents (receipt and signed agreement of sale) attached to a buyer''s first verified payment';
COMMENT ON COLUMN payment_documents.document_type IS 'receipt | agreement_of_sale';
COMMENT ON COLUMN payment_documents.bucket IS 'Supabase Storage bucket containing the file';
COMMENT ON COLUMN payment_documents.path IS 'Path within bucket for the stored file';

