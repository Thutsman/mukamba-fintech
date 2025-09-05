-- Fix property_media RLS policies to allow proper access
-- This migration fixes the RLS policies that were preventing property media from being fetched

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view property media" ON property_media;
DROP POLICY IF EXISTS "Property owners can manage media" ON property_media;

-- Create new policies that allow proper access
-- Allow public access to view property media for active properties
CREATE POLICY "Public can view property media" ON property_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_media.property_id 
      AND status IN ('active', 'pending', 'draft')
    )
  );

-- Allow property owners to manage their media
CREATE POLICY "Property owners can manage media" ON property_media
  FOR ALL USING (
    auth.uid() IN (
      SELECT owner_id FROM properties WHERE id = property_media.property_id
    )
  );

-- Allow admins to access all property media
CREATE POLICY "Admins can access all property media" ON property_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND 'admin' = ANY(user_profiles.roles)
    )
  );

-- Allow insert operations for property media (needed for admin property creation)
CREATE POLICY "Allow property media inserts" ON property_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_media.property_id
    )
  );

-- Also fix the properties table RLS to allow admin access
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view properties" ON properties;
DROP POLICY IF EXISTS "Property owners can manage properties" ON properties;

-- Create new policies for properties table
CREATE POLICY "Public can view active properties" ON properties
  FOR SELECT USING (status IN ('active', 'pending', 'draft'));

CREATE POLICY "Property owners can manage properties" ON properties
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Admins can access all properties" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND 'admin' = ANY(user_profiles.roles)
    )
  );

-- Allow admin to insert properties (needed for admin property creation)
CREATE POLICY "Allow admin property creation" ON properties
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND 'admin' = ANY(user_profiles.roles)
    )
  );
