-- Create email_confirmations table for custom email confirmation tracking
CREATE TABLE IF NOT EXISTS email_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_email_confirmations_token ON email_confirmations(token);
CREATE INDEX idx_email_confirmations_user_id ON email_confirmations(user_id);

-- Enable RLS
ALTER TABLE email_confirmations ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own confirmation records
CREATE POLICY "Users can read own confirmations"
  ON email_confirmations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for API routes)
CREATE POLICY "Service role has full access"
  ON email_confirmations
  FOR ALL
  USING (auth.role() = 'service_role');

