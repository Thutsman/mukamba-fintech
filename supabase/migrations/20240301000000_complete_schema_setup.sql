-- Complete Database Schema for Mukamba FinTech
-- This migration sets up all tables, relationships, and policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER MANAGEMENT & AUTHENTICATION
-- =====================================================

-- Create user_profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  nationality TEXT CHECK (nationality IN ('SA', 'ZIM')),
  
  -- User level and roles
  user_level TEXT DEFAULT 'basic' CHECK (user_level IN ('guest', 'basic', 'verified', 'premium')),
  roles TEXT[] DEFAULT '{}',
  
  -- Verification status
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_identity_verified BOOLEAN DEFAULT FALSE,
  is_financially_verified BOOLEAN DEFAULT FALSE,
  is_property_verified BOOLEAN DEFAULT FALSE,
  is_address_verified BOOLEAN DEFAULT FALSE,
  
  -- KYC and credit information
  credit_score INTEGER,
  kyc_status TEXT DEFAULT 'none' CHECK (kyc_status IN ('none', 'partial', 'pending', 'approved', 'rejected')),
  
  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- KYC DOCUMENTATION SYSTEM
-- =====================================================

-- Create kyc_verifications table
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('buyer', 'seller')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Identity information
  id_number TEXT,
  date_of_birth DATE,
  
  -- Financial information (for buyers)
  monthly_income DECIMAL(12,2),
  employment_status TEXT,
  bank_name TEXT,
  credit_consent BOOLEAN DEFAULT FALSE,
  
  -- Business information (for sellers)
  business_registered BOOLEAN DEFAULT FALSE,
  business_name TEXT,
  business_registration_number TEXT,
  tax_number TEXT,
  
  -- Admin review
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create kyc_documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kyc_verification_id UUID REFERENCES kyc_verifications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'id_document',
    'proof_of_income',
    'bank_statement',
    'title_deed',
    'property_tax_certificate',
    'municipal_rates_certificate',
    'property_insurance',
    'compliance_certificate',
    'business_registration',
    'tax_clearance_certificate'
  )),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  verified BOOLEAN DEFAULT FALSE,
  verification_notes TEXT
);

-- =====================================================
-- PROPERTY MANAGEMENT SYSTEM
-- =====================================================

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Basic information
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'townhouse', 'land', 'commercial')),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('rent-to-buy', 'sale')),
  
  -- Location
  country TEXT NOT NULL CHECK (country IN ('ZW', 'SA')),
  city TEXT NOT NULL,
  suburb TEXT NOT NULL,
  street_address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Property details
  size_sqm DECIMAL(8,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking_spaces INTEGER,
  features TEXT[],
  amenities TEXT[],
  
  -- Financial information
  price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'ZAR')),
  rent_to_buy_deposit DECIMAL(12,2),
  monthly_rental DECIMAL(12,2),
  rent_credit_percentage DECIMAL(5,2),
  
  -- Status and tracking
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'sold', 'rented')),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  views_count INTEGER DEFAULT 0,
  saved_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  listed_at TIMESTAMP WITH TIME ZONE,
  sold_at TIMESTAMP WITH TIME ZONE
);

-- Create property_media table
CREATE TABLE IF NOT EXISTS property_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'virtual_tour', 'floor_plan')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  is_main_image BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create property_documents table
CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'title_deed',
    'property_tax_certificate',
    'municipal_rates_certificate',
    'property_insurance',
    'compliance_certificate',
    'survey_diagram',
    'building_plans'
  )),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- AGENT SYSTEM
-- =====================================================

-- Create agents table (already exists, but adding here for completeness)
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
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

-- =====================================================
-- USER INTERACTIONS
-- =====================================================

-- Create property_inquiries table
CREATE TABLE IF NOT EXISTS property_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('viewing', 'information', 'offer')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create saved_properties table
CREATE TABLE IF NOT EXISTS saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  notes TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, property_id)
);

-- Create property_alerts table
CREATE TABLE IF NOT EXISTS property_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  alert_name TEXT NOT NULL,
  country TEXT CHECK (country IN ('ZW', 'SA')),
  city TEXT,
  suburb TEXT,
  property_types TEXT[],
  price_min DECIMAL(12,2),
  price_max DECIMAL(12,2),
  bedrooms_min INTEGER,
  bathrooms_min INTEGER,
  features TEXT[],
  amenities TEXT[],
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  enabled BOOLEAN DEFAULT TRUE,
  last_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- ESCROW & TRANSACTIONS
-- =====================================================

-- Create escrow_transactions table
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'rental', 'purchase', 'refund')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'ZAR')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  transaction_hash TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- ADMIN & SYSTEM TABLES
-- =====================================================

-- Create admin_audit_log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create system_notifications table
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'kyc_approved',
    'kyc_rejected',
    'property_approved',
    'property_rejected',
    'inquiry_received',
    'viewing_scheduled',
    'escrow_transaction',
    'system_alert'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON user_profiles(id);
CREATE INDEX IF NOT EXISTS user_profiles_kyc_status_idx ON user_profiles(kyc_status);
CREATE INDEX IF NOT EXISTS user_profiles_roles_idx ON user_profiles USING GIN(roles);

-- KYC indexes
CREATE INDEX IF NOT EXISTS kyc_verifications_user_id_idx ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS kyc_verifications_status_idx ON kyc_verifications(status);
CREATE INDEX IF NOT EXISTS kyc_documents_verification_id_idx ON kyc_documents(kyc_verification_id);

-- Property indexes
CREATE INDEX IF NOT EXISTS properties_owner_id_idx ON properties(owner_id);
CREATE INDEX IF NOT EXISTS properties_status_idx ON properties(status);
CREATE INDEX IF NOT EXISTS properties_country_city_idx ON properties(country, city);
CREATE INDEX IF NOT EXISTS properties_price_idx ON properties(price);
CREATE INDEX IF NOT EXISTS properties_property_type_idx ON properties(property_type);
CREATE INDEX IF NOT EXISTS properties_created_at_idx ON properties(created_at);

-- Property media indexes
CREATE INDEX IF NOT EXISTS property_media_property_id_idx ON property_media(property_id);
CREATE INDEX IF NOT EXISTS property_media_main_image_idx ON property_media(property_id) WHERE is_main_image = TRUE;

-- Agent indexes
CREATE INDEX IF NOT EXISTS agents_user_id_idx ON agents(user_id);
CREATE INDEX IF NOT EXISTS agents_eac_number_idx ON agents(eac_number);
CREATE INDEX IF NOT EXISTS agents_verified_status_idx ON agents(verified_status);

-- Lead and viewing indexes
CREATE INDEX IF NOT EXISTS agent_leads_agent_id_idx ON agent_leads(agent_id);
CREATE INDEX IF NOT EXISTS agent_leads_property_id_idx ON agent_leads(property_id);
CREATE INDEX IF NOT EXISTS agent_leads_status_idx ON agent_leads(status);
CREATE INDEX IF NOT EXISTS agent_viewings_agent_id_idx ON agent_viewings(agent_id);
CREATE INDEX IF NOT EXISTS agent_viewings_scheduled_for_idx ON agent_viewings(scheduled_for);

-- Interaction indexes
CREATE INDEX IF NOT EXISTS property_inquiries_property_id_idx ON property_inquiries(property_id);
CREATE INDEX IF NOT EXISTS property_inquiries_user_id_idx ON property_inquiries(user_id);
CREATE INDEX IF NOT EXISTS saved_properties_user_id_idx ON saved_properties(user_id);
CREATE INDEX IF NOT EXISTS saved_properties_property_id_idx ON saved_properties(property_id);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS escrow_transactions_property_id_idx ON escrow_transactions(property_id);
CREATE INDEX IF NOT EXISTS escrow_transactions_buyer_id_idx ON escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS escrow_transactions_seller_id_idx ON escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS escrow_transactions_status_idx ON escrow_transactions(status);

-- Notification indexes
CREATE INDEX IF NOT EXISTS system_notifications_user_id_idx ON system_notifications(user_id);
CREATE INDEX IF NOT EXISTS system_notifications_read_at_idx ON system_notifications(read_at) WHERE read_at IS NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND 'admin' = ANY(user_profiles.roles)
    )
  );

-- KYC policies
CREATE POLICY "Users can view own KYC" ON kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own KYC" ON kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all KYC" ON kyc_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND 'admin' = ANY(user_profiles.roles)
    )
  );

-- KYC documents policies
CREATE POLICY "Users can view own KYC documents" ON kyc_documents
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM kyc_verifications WHERE id = kyc_documents.kyc_verification_id
    )
  );

CREATE POLICY "Users can upload own KYC documents" ON kyc_documents
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM kyc_verifications WHERE id = kyc_documents.kyc_verification_id
    )
  );

CREATE POLICY "Admins can manage all KYC documents" ON kyc_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND 'admin' = ANY(user_profiles.roles)
    )
  );

-- Properties policies
CREATE POLICY "Public can view active properties" ON properties
  FOR SELECT USING (status = 'active');

CREATE POLICY "Owners can manage own properties" ON properties
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all properties" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND 'admin' = ANY(user_profiles.roles)
    )
  );

-- Property media policies
CREATE POLICY "Public can view property media" ON property_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_media.property_id AND status = 'active'
    )
  );

CREATE POLICY "Property owners can manage media" ON property_media
  FOR ALL USING (
    auth.uid() IN (
      SELECT owner_id FROM properties WHERE id = property_media.property_id
    )
  );

-- Property documents policies
CREATE POLICY "Property owners can view own documents" ON property_documents
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM properties WHERE id = property_documents.property_id
    )
  );

CREATE POLICY "Property owners can upload documents" ON property_documents
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM properties WHERE id = property_documents.property_id
    )
  );

CREATE POLICY "Admins can view all property documents" ON property_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND 'admin' = ANY(user_profiles.roles)
    )
  );

-- Property inquiries policies
CREATE POLICY "Users can view own inquiries" ON property_inquiries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create inquiries" ON property_inquiries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Property owners can view property inquiries" ON property_inquiries
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM properties WHERE id = property_inquiries.property_id
    )
  );

-- Saved properties policies
CREATE POLICY "Users can manage own saved properties" ON saved_properties
  FOR ALL USING (auth.uid() = user_id);

-- Property alerts policies
CREATE POLICY "Users can manage own alerts" ON property_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Escrow transactions policies
CREATE POLICY "Users can view own transactions" ON escrow_transactions
  FOR SELECT USING (auth.uid() IN (buyer_id, seller_id));

CREATE POLICY "Admins can view all transactions" ON escrow_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND 'admin' = ANY(user_profiles.roles)
    )
  );

-- System notifications policies
CREATE POLICY "Users can view own notifications" ON system_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON system_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin audit log policies
CREATE POLICY "Admins can view audit log" ON admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND 'admin' = ANY(user_profiles.roles)
    )
  );

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_inquiries_updated_at
  BEFORE UPDATE ON property_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_alerts_updated_at
  BEFORE UPDATE ON property_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update property views count
CREATE OR REPLACE FUNCTION increment_property_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE properties 
  SET views_count = views_count + 1
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to increment views when inquiry is created
CREATE TRIGGER on_property_inquiry_created
  AFTER INSERT ON property_inquiries
  FOR EACH ROW EXECUTE FUNCTION increment_property_views();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO system_notifications (user_id, notification_type, title, message)
  VALUES (p_user_id, p_notification_type, p_title, p_message);
END;
$$ language 'plpgsql';

-- =====================================================
-- STORAGE BUCKETS SETUP
-- =====================================================

-- Create storage buckets (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('property-images', 'Property Images', TRUE),
  ('property-documents', 'Property Documents', FALSE),
  ('user-documents', 'User Documents', FALSE),
  ('agent-documents', 'Agent Documents', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property-images (public read, authenticated write)
CREATE POLICY "Public read access for property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Property owners can update property images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'property-images' 
    AND auth.role() = 'authenticated'
  );

-- Storage policies for property-documents (authenticated access)
CREATE POLICY "Authenticated access for property documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'property-documents' 
    AND auth.role() = 'authenticated'
  );

-- Storage policies for user-documents (authenticated access)
CREATE POLICY "Authenticated access for user documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'user-documents' 
    AND auth.role() = 'authenticated'
  );

-- Storage policies for agent-documents (authenticated access)
CREATE POLICY "Authenticated access for agent documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'agent-documents' 
    AND auth.role() = 'authenticated'
  );

-- Admin access to all storage buckets
CREATE POLICY "Admin access to all storage" ON storage.objects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND 'admin' = ANY(user_profiles.roles)
    )
  );

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 