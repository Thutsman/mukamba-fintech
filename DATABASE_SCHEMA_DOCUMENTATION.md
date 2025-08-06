# Mukamba FinTech Database Schema Documentation

## Overview

This document describes the complete database schema for the Mukamba FinTech application, which is designed to support a comprehensive property marketplace with user authentication, KYC verification, property management, agent system, and admin functionality.

## Database Architecture

The schema is built on Supabase (PostgreSQL) and includes:

- **User Management & Authentication**: Extended user profiles with roles and verification status
- **KYC Documentation System**: Complete verification workflow with document storage
- **Property Management**: Comprehensive property listings with media and documents
- **Agent System**: Real estate agent management with leads and viewings
- **User Interactions**: Inquiries, saved properties, and alerts
- **Escrow & Transactions**: Financial transaction tracking
- **Admin & System**: Audit logging and notifications
- **Storage**: File storage for images and documents

## Core Tables

### 1. User Management (`user_profiles`)

Extends Supabase's `auth.users` table with application-specific data.

```sql
user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  nationality TEXT CHECK (nationality IN ('SA', 'ZIM')),
  user_level TEXT DEFAULT 'basic',
  roles TEXT[] DEFAULT '{}',
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_identity_verified BOOLEAN DEFAULT FALSE,
  is_financially_verified BOOLEAN DEFAULT FALSE,
  is_property_verified BOOLEAN DEFAULT FALSE,
  is_address_verified BOOLEAN DEFAULT FALSE,
  credit_score INTEGER,
  kyc_status TEXT DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
)
```

**Key Features:**
- Extends Supabase auth with custom user data
- Supports multiple roles (buyer, seller, admin, agent)
- Tracks verification status for different aspects
- Credit scoring for buyers
- KYC status tracking

### 2. KYC Verification System

#### `kyc_verifications`
Main KYC verification records with different types for buyers and sellers.

```sql
kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  verification_type TEXT CHECK (verification_type IN ('buyer', 'seller')),
  status TEXT DEFAULT 'pending',
  id_number TEXT,
  date_of_birth DATE,
  monthly_income DECIMAL(12,2),
  employment_status TEXT,
  bank_name TEXT,
  credit_consent BOOLEAN DEFAULT FALSE,
  business_registered BOOLEAN DEFAULT FALSE,
  business_name TEXT,
  business_registration_number TEXT,
  tax_number TEXT,
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

#### `kyc_documents`
Stores uploaded KYC documents with metadata.

```sql
kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kyc_verification_id UUID REFERENCES kyc_verifications(id),
  document_type TEXT CHECK (document_type IN (
    'id_document', 'proof_of_income', 'bank_statement',
    'title_deed', 'property_tax_certificate', 'municipal_rates_certificate',
    'property_insurance', 'compliance_certificate', 'business_registration',
    'tax_clearance_certificate'
  )),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  verification_notes TEXT
)
```

### 3. Property Management System

#### `properties`
Core property listings with comprehensive details.

```sql
properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES user_profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT CHECK (property_type IN ('house', 'apartment', 'townhouse', 'land', 'commercial')),
  listing_type TEXT CHECK (listing_type IN ('rent-to-buy', 'sale')),
  country TEXT CHECK (country IN ('ZW', 'SA')),
  city TEXT NOT NULL,
  suburb TEXT NOT NULL,
  street_address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  size_sqm DECIMAL(8,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking_spaces INTEGER,
  features TEXT[],
  amenities TEXT[],
  price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  rent_to_buy_deposit DECIMAL(12,2),
  monthly_rental DECIMAL(12,2),
  rent_credit_percentage DECIMAL(5,2),
  status TEXT DEFAULT 'draft',
  verification_status TEXT DEFAULT 'pending',
  views_count INTEGER DEFAULT 0,
  saved_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  listed_at TIMESTAMP WITH TIME ZONE,
  sold_at TIMESTAMP WITH TIME ZONE
)
```

#### `property_media`
Stores property images, virtual tours, and floor plans.

```sql
property_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  media_type TEXT CHECK (media_type IN ('image', 'virtual_tour', 'floor_plan')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  is_main_image BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

#### `property_documents`
Stores property-related documents for verification.

```sql
property_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  document_type TEXT CHECK (document_type IN (
    'title_deed', 'property_tax_certificate', 'municipal_rates_certificate',
    'property_insurance', 'compliance_certificate', 'survey_diagram', 'building_plans'
  )),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### 4. Agent System

#### `agents`
Real estate agent profiles and verification.

```sql
agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  eac_number TEXT NOT NULL UNIQUE,
  bio TEXT NOT NULL,
  business_license_url TEXT,
  id_document_url TEXT,
  verified_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

#### `agent_leads`
Agent lead management system.

```sql
agent_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id),
  property_id UUID REFERENCES properties(id),
  property_title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

#### `agent_viewings`
Property viewing scheduling and management.

```sql
agent_viewings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id),
  lead_id UUID REFERENCES agent_leads(id),
  property_id UUID REFERENCES properties(id),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### 5. User Interactions

#### `property_inquiries`
User inquiries about properties.

```sql
property_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  user_id UUID REFERENCES user_profiles(id),
  inquiry_type TEXT CHECK (inquiry_type IN ('viewing', 'information', 'offer')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

#### `saved_properties`
User's saved/favorited properties.

```sql
saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  property_id UUID REFERENCES properties(id),
  notes TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
)
```

#### `property_alerts`
User-defined property search alerts.

```sql
property_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
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
  frequency TEXT DEFAULT 'daily',
  enabled BOOLEAN DEFAULT TRUE,
  last_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### 6. Financial & Transactions

#### `escrow_transactions`
Financial transaction tracking for property deals.

```sql
escrow_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  buyer_id UUID REFERENCES user_profiles(id),
  seller_id UUID REFERENCES user_profiles(id),
  transaction_type TEXT CHECK (transaction_type IN ('deposit', 'rental', 'purchase', 'refund')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  transaction_hash TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
)
```

### 7. Admin & System

#### `admin_audit_log`
Audit trail for admin actions.

```sql
admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

#### `system_notifications`
User notification system.

```sql
system_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  notification_type TEXT CHECK (notification_type IN (
    'kyc_approved', 'kyc_rejected', 'property_approved', 'property_rejected',
    'inquiry_received', 'viewing_scheduled', 'escrow_transaction', 'system_alert'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## Storage Buckets

The schema includes four storage buckets for file management:

1. **`property-images`** (Public): Property photos and media
2. **`property-documents`** (Private): Property-related documents
3. **`user-documents`** (Private): KYC and user documents
4. **`agent-documents`** (Private): Agent verification documents

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Users**: Can only access their own data
- **Property Owners**: Can manage their own properties and media
- **Admins**: Have access to all data for management
- **Public**: Can view active properties and images

## Key Features

### 1. Scalable User Management
- Multiple user roles and levels
- Progressive verification system
- Credit scoring for buyers
- KYC workflow for compliance

### 2. Comprehensive Property System
- Support for multiple property types
- Rent-to-buy and sale listings
- Media management (images, virtual tours, floor plans)
- Document verification system
- Location-based search capabilities

### 3. Agent Management
- Agent verification and onboarding
- Lead management system
- Viewing scheduling
- Performance tracking

### 4. Financial Integration
- Escrow transaction tracking
- Support for multiple currencies
- Transaction history and audit trail

### 5. Admin Capabilities
- Complete audit logging
- KYC document review and approval
- Property verification management
- User management and monitoring
- System notifications

### 6. Security & Compliance
- Row Level Security (RLS) on all tables
- Secure file storage with access controls
- Audit trails for admin actions
- KYC document verification workflow

## Usage Patterns

### User Registration Flow
1. User signs up via Supabase Auth
2. `handle_new_user()` trigger creates `user_profiles` record
3. User completes basic profile information
4. User initiates KYC verification process
5. Documents uploaded to `user-documents` bucket
6. Admin reviews and approves/rejects KYC

### Property Listing Flow
1. Verified seller creates property listing
2. Property documents uploaded to `property-documents` bucket
3. Property images uploaded to `property-images` bucket
4. Admin reviews and approves property
5. Property becomes visible to buyers

### Agent Onboarding Flow
1. User applies to become an agent
2. Agent documents uploaded to `agent-documents` bucket
3. Admin verifies agent credentials
4. Agent can manage leads and viewings

### KYC Document Management
1. Users upload documents through the application
2. Documents stored in appropriate storage buckets
3. File metadata stored in `kyc_documents` table
4. Admins can download and review documents
5. Verification status updated based on review

## Performance Considerations

### Indexes
- Comprehensive indexing on frequently queried columns
- GIN indexes for array fields (roles, features, amenities)
- Composite indexes for location-based queries
- Partial indexes for status-based filtering

### Triggers
- Automatic `updated_at` timestamp updates
- Property view count increments
- User profile creation on auth signup
- Notification creation for system events

### Storage Optimization
- Separate buckets for different file types
- Public access only for property images
- Private access for sensitive documents
- Admin access to all storage buckets

## Migration Strategy

1. **Phase 1**: Core user and KYC system
2. **Phase 2**: Property management and media
3. **Phase 3**: Agent system and leads
4. **Phase 4**: Financial transactions and escrow
5. **Phase 5**: Admin features and audit logging

## Security Considerations

- All tables have RLS enabled
- File access controlled by storage policies
- Admin actions logged for audit trail
- Sensitive data encrypted at rest
- API access controlled by Supabase Auth

This schema provides a solid foundation for a scalable, secure, and feature-rich property marketplace with comprehensive user management, KYC verification, and admin capabilities. 