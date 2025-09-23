-- Fix RLS Policies for API Routes
-- This migration adds service role policies to allow API routes to work

-- =====================================================
-- 1. ADD SERVICE ROLE POLICIES FOR OFFER_PAYMENTS
-- =====================================================

-- Allow service role to insert payments (for API routes)
CREATE POLICY "Service role can insert payments" ON offer_payments
    FOR INSERT 
    TO service_role
    WITH CHECK (true);

-- Allow service role to update payments (for API routes)
CREATE POLICY "Service role can update payments" ON offer_payments
    FOR UPDATE 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow service role to select payments (for API routes)
CREATE POLICY "Service role can select payments" ON offer_payments
    FOR SELECT 
    TO service_role
    USING (true);

-- =====================================================
-- 2. ADD SERVICE ROLE POLICIES FOR PROPERTY_OFFERS
-- =====================================================

-- Allow service role to update offers (for payment status updates)
CREATE POLICY "Service role can update offers" ON property_offers
    FOR UPDATE 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow service role to select offers (for API routes)
CREATE POLICY "Service role can select offers" ON property_offers
    FOR SELECT 
    TO service_role
    USING (true);

-- =====================================================
-- 3. ADD SERVICE ROLE POLICIES FOR USER_PROFILES
-- =====================================================

-- Allow service role to select user profiles (for API routes)
CREATE POLICY "Service role can select user profiles" ON user_profiles
    FOR SELECT 
    TO service_role
    USING (true);

-- =====================================================
-- 4. ADD SERVICE ROLE POLICIES FOR SYSTEM_NOTIFICATIONS
-- =====================================================

-- Allow service role to insert notifications (for API routes)
CREATE POLICY "Service role can insert notifications" ON system_notifications
    FOR INSERT 
    TO service_role
    WITH CHECK (true);

-- Allow service role to select notifications (for API routes)
CREATE POLICY "Service role can select notifications" ON system_notifications
    FOR SELECT 
    TO service_role
    USING (true);

-- =====================================================
-- 5. ADD SERVICE ROLE POLICIES FOR PROPERTIES
-- =====================================================

-- Allow service role to select properties (for API routes)
CREATE POLICY "Service role can select properties" ON properties
    FOR SELECT 
    TO service_role
    USING (true);

-- =====================================================
-- 6. VERIFY POLICIES WERE CREATED
-- =====================================================

-- This query will show all the new service role policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND 'service_role' = ANY(roles)
ORDER BY tablename, policyname;
