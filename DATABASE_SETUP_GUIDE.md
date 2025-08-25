# Database Setup Guide for Mukamba FinTech

## Overview

This guide will help you set up the database tables for your Mukamba FinTech project in your existing Supabase project "MukambaGateway". The setup includes authentication, user management, KYC verification, and financial assessment systems.

## Prerequisites

- Access to your Supabase project "MukambaGateway"
- The existing `early_access_signups` table (which you already have)
- Basic understanding of SQL and Supabase

## Step 1: Deploy the Database Schema

### 1.1 Access Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your "MukambaGateway" project
3. Navigate to the **SQL Editor** in the left sidebar

### 1.2 Run the Migration

1. Copy the entire content from `supabase/migrations/20240304000000_fintech_auth_setup.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the migration

### 1.3 Verify the Setup

After running the migration, you should see the following new tables in your Table Editor:

#### Core Tables Created:
- `user_profiles` - Extended user profiles
- `user_sessions` - Session management
- `user_login_history` - Security tracking
- `kyc_verifications` - KYC verification tracking
- `kyc_documents` - Document storage
- `phone_verification_attempts` - Phone verification
- `financial_assessments` - Financial assessment

#### Storage Buckets Created:
- `user-documents` - Private user documents
- `kyc-documents` - Private KYC documents
- `property-images` - Public property images
- `property-documents` - Private property documents

## Step 2: Configure Authentication Settings

### 2.1 Enable Email Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Ensure **Email Auth** is enabled
3. Configure your email templates if needed

### 2.2 Set Up Row Level Security (RLS)

The migration automatically enables RLS on all tables. Verify this by:

1. Going to **Table Editor**
2. Checking that each table shows "RLS enabled" (green badge)
3. Reviewing the policies created for each table

## Step 3: Test the Setup

### 3.1 Test User Registration

1. Go to **Authentication** → **Users**
2. Try creating a test user
3. Verify that a corresponding record is created in `user_profiles`

### 3.2 Test Storage Buckets

1. Go to **Storage** → **Buckets**
2. Verify all four buckets are created
3. Test uploading a file to ensure permissions work

## Step 4: Integration with Your Application

### 4.1 Update Your Supabase Client Configuration

Make sure your application is configured to use the correct Supabase project:

```typescript
// In your lib/supabase.ts or similar
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-mukamba-gateway-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 4.2 Update Your Type Definitions

Update your TypeScript types to match the new database schema:

```typescript
// In your types/auth.ts
export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  user_level: 'new_user' | 'verified_buyer' | 'verified_seller' | 'admin'
  user_role: 'user' | 'buyer' | 'seller' | 'admin'
  is_phone_verified: boolean
  is_identity_verified: boolean
  is_financially_verified: boolean
  is_address_verified: boolean
  is_property_verified: boolean
  date_of_birth?: string
  id_number?: string
  nationality?: 'SA' | 'ZIM'
  residential_address?: any
  employment_info?: any
  financial_profile?: any
  verification_certificates?: string[]
  is_active: boolean
  is_suspended: boolean
  created_at: string
  updated_at: string
}
```

### 4.3 Update Your Authentication Components

Update your signup/signin components to work with the new schema:

```typescript
// Example: Basic signup function
const signUp = async (userData: {
  email: string
  password: string
  first_name: string
  last_name: string
}) => {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        first_name: userData.first_name,
        last_name: userData.last_name,
      }
    }
  })
  
  if (error) {
    console.error('Signup error:', error)
    return { error }
  }
  
  return { data }
}
```

## Step 5: Key Features Available

### 5.1 User Management

- **Automatic Profile Creation**: When users sign up, a profile is automatically created
- **User Levels**: Track user progression from new_user to verified_buyer/seller
- **Verification Status**: Track different types of verification (phone, identity, financial, etc.)

### 5.2 KYC System

- **Document Upload**: Store and manage KYC documents
- **Verification Tracking**: Track verification status and admin reviews
- **Multiple Document Types**: Support for IDs, passports, proof of income, etc.

### 5.3 Phone Verification

- **OTP Management**: Secure phone verification with OTP codes
- **Attempt Tracking**: Prevent abuse with attempt limits
- **Expiration Handling**: Automatic OTP expiration

### 5.4 Financial Assessment

- **Credit Scoring**: Built-in credit score calculation
- **Risk Assessment**: Risk level determination
- **Pre-approval Amounts**: Calculate pre-approved amounts

### 5.5 Security Features

- **Row Level Security**: Data access control
- **Session Management**: Track user sessions
- **Login History**: Security audit trail
- **Document Security**: Private storage buckets

## Step 6: Next Steps

### 6.1 Property Management Tables

After this setup, you'll want to create tables for:
- Property listings
- Property media
- Property documents
- Property inquiries

### 6.2 Transaction Tables

For the financial aspects:
- Escrow transactions
- Rent-to-buy agreements
- Payment tracking
- Transaction fees

### 6.3 Admin System Tables

For admin management:
- Admin users and roles
- Approval workflows
- Audit logs
- System settings

## Troubleshooting

### Common Issues

1. **RLS Policies Not Working**
   - Check that RLS is enabled on tables
   - Verify user authentication is working
   - Check policy conditions

2. **Storage Upload Failures**
   - Verify bucket permissions
   - Check file size limits
   - Ensure correct MIME types

3. **Trigger Not Firing**
   - Check if triggers are created
   - Verify function syntax
   - Check for errors in function logic

### Getting Help

If you encounter issues:

1. Check the Supabase logs in the dashboard
2. Review the SQL migration for syntax errors
3. Test individual components step by step
4. Consult the Supabase documentation

## Security Considerations

### Data Protection

- All sensitive data is stored in private buckets
- RLS policies ensure data access control
- User sessions are tracked and managed
- Login attempts are logged for security

### Compliance

- KYC documents are securely stored
- Audit trails are maintained
- User consent and privacy settings are tracked
- Data retention policies can be implemented

## Performance Optimization

### Indexes

The migration includes optimized indexes for:
- User lookups by email/phone
- Verification status queries
- Document type filtering
- Date-based queries

### Storage

- Images are stored in public buckets for fast access
- Documents are stored in private buckets for security
- File size limits prevent abuse
- MIME type restrictions ensure security

This setup provides a solid foundation for your Mukamba FinTech platform while maintaining security and performance. The schema is designed to scale with your platform's growth and can accommodate future features and requirements.
