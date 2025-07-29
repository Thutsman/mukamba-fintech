-- Create agent_leads table
CREATE TABLE IF NOT EXISTS agent_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  property_title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'viewing_scheduled', 'closed', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create agent_viewings table
CREATE TABLE IF NOT EXISTS agent_viewings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES agent_leads(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create RLS policies for agent_leads
ALTER TABLE agent_leads ENABLE ROW LEVEL SECURITY;

-- Allow agents to read their own leads
CREATE POLICY "Agents can read own leads" ON agent_leads
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM agents WHERE id = agent_leads.agent_id
  ));

-- Allow agents to update their own leads
CREATE POLICY "Agents can update own leads" ON agent_leads
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM agents WHERE id = agent_leads.agent_id
  ));

-- Allow admins to read all leads
CREATE POLICY "Admins can read all leads" ON agent_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow admins to update all leads
CREATE POLICY "Admins can update all leads" ON agent_leads
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create RLS policies for agent_viewings
ALTER TABLE agent_viewings ENABLE ROW LEVEL SECURITY;

-- Allow agents to read their own viewings
CREATE POLICY "Agents can read own viewings" ON agent_viewings
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM agents WHERE id = agent_viewings.agent_id
  ));

-- Allow agents to update their own viewings
CREATE POLICY "Agents can update own viewings" ON agent_viewings
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM agents WHERE id = agent_viewings.agent_id
  ));

-- Allow agents to create viewings for their leads
CREATE POLICY "Agents can create viewings" ON agent_viewings
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM agents WHERE id = agent_viewings.agent_id
  ));

-- Allow admins to read all viewings
CREATE POLICY "Admins can read all viewings" ON agent_viewings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow admins to update all viewings
CREATE POLICY "Admins can update all viewings" ON agent_viewings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create trigger to update updated_at timestamp for leads
CREATE TRIGGER update_agent_leads_updated_at
  BEFORE UPDATE ON agent_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update updated_at timestamp for viewings
CREATE TRIGGER update_agent_viewings_updated_at
  BEFORE UPDATE ON agent_viewings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS agent_leads_agent_id_idx ON agent_leads(agent_id);
CREATE INDEX IF NOT EXISTS agent_leads_property_id_idx ON agent_leads(property_id);
CREATE INDEX IF NOT EXISTS agent_leads_status_idx ON agent_leads(status);
CREATE INDEX IF NOT EXISTS agent_leads_created_at_idx ON agent_leads(created_at);

CREATE INDEX IF NOT EXISTS agent_viewings_agent_id_idx ON agent_viewings(agent_id);
CREATE INDEX IF NOT EXISTS agent_viewings_lead_id_idx ON agent_viewings(lead_id);
CREATE INDEX IF NOT EXISTS agent_viewings_property_id_idx ON agent_viewings(property_id);
CREATE INDEX IF NOT EXISTS agent_viewings_scheduled_for_idx ON agent_viewings(scheduled_for);
CREATE INDEX IF NOT EXISTS agent_viewings_status_idx ON agent_viewings(status); 