-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  eac_number TEXT NOT NULL UNIQUE,
  bio TEXT NOT NULL,
  business_license_url TEXT,
  id_document_url TEXT,
  verified_status TEXT DEFAULT 'pending' CHECK (verified_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create RLS policies for agents table
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Allow agents to read their own data
CREATE POLICY "Agents can read own data" ON agents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow agents to update their own data
CREATE POLICY "Agents can update own data" ON agents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow admins to read all agent data
CREATE POLICY "Admins can read all agent data" ON agents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow admins to update all agent data
CREATE POLICY "Admins can update all agent data" ON agents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS agents_user_id_idx ON agents(user_id);

-- Create index on eac_number for faster verification lookups
CREATE INDEX IF NOT EXISTS agents_eac_number_idx ON agents(eac_number);

-- Create index on verified_status for filtering
CREATE INDEX IF NOT EXISTS agents_verified_status_idx ON agents(verified_status); 