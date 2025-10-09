-- Create buyer_messages table for storing messages between buyers and admin
-- This table stores messages sent by buyers through the "Send Message" modal
-- and admin responses to those messages

CREATE TABLE IF NOT EXISTS buyer_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Message content
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  property_title TEXT NOT NULL,
  
  -- Buyer information
  buyer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT,
  buyer_phone TEXT,
  
  -- Message details
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'inquiry' CHECK (message_type IN ('inquiry', 'offer_related', 'general')),
  
  -- Status tracking
  read_by_buyer BOOLEAN DEFAULT FALSE,
  read_by_admin BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  read_by UUID REFERENCES user_profiles(id),
  
  -- Admin response (optional)
  admin_response TEXT,
  admin_response_at TIMESTAMP WITH TIME ZONE,
  admin_response_by UUID REFERENCES user_profiles(id),
  admin_response_read_by_buyer BOOLEAN DEFAULT FALSE,
  admin_response_read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_buyer_messages_property_id ON buyer_messages(property_id);
CREATE INDEX IF NOT EXISTS idx_buyer_messages_buyer_id ON buyer_messages(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_messages_created_at ON buyer_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buyer_messages_read_by_buyer ON buyer_messages(read_by_buyer);
CREATE INDEX IF NOT EXISTS idx_buyer_messages_read_by_admin ON buyer_messages(read_by_admin);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_buyer_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_buyer_messages_updated_at
  BEFORE UPDATE ON buyer_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_buyer_messages_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE buyer_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow buyers to insert their own messages
CREATE POLICY "Buyers can insert their own messages" ON buyer_messages
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Allow buyers to read their own messages
CREATE POLICY "Buyers can read their own messages" ON buyer_messages
  FOR SELECT
  USING (auth.uid() = buyer_id);

-- Allow buyers to update their own messages (mark as read)
CREATE POLICY "Buyers can update their own messages" ON buyer_messages
  FOR UPDATE
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

-- Allow admins to read all messages
CREATE POLICY "Admins can read all messages" ON buyer_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

-- Allow admins to update messages (mark as read, add responses)
CREATE POLICY "Admins can update messages" ON buyer_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

-- Allow admins to delete messages
CREATE POLICY "Admins can delete messages" ON buyer_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );