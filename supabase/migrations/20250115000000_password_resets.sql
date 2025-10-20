-- Create password_resets table for password reset functionality
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);

-- Add RLS policies
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to manage password resets
CREATE POLICY "Service role can manage password resets" ON password_resets
    FOR ALL USING (auth.role() = 'service_role');

-- Policy to allow users to view their own password resets (for cleanup)
CREATE POLICY "Users can view their own password resets" ON password_resets
    FOR SELECT USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE password_resets IS 'Stores password reset tokens and their metadata';
COMMENT ON COLUMN password_resets.token IS 'Unique token for password reset link';
COMMENT ON COLUMN password_resets.expires_at IS 'When the token expires (typically 1 hour)';
COMMENT ON COLUMN password_resets.used_at IS 'When the token was used (NULL if unused)';
