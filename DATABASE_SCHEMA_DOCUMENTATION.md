# Mukamba FinTech Database Schema Documentation

## Overview

This document provides a comprehensive overview of the database schema for the Mukamba FinTech platform, explaining how it supports all the user forms and workflows identified in the application.

## Database Architecture

The database is built on **Supabase** (PostgreSQL) and follows these key principles:
- **Row Level Security (RLS)** for data protection
- **JSONB fields** for flexible data storage
- **UUID primary keys** for security
- **Comprehensive indexing** for performance
- **Audit trails** for compliance

## Core Tables Overview

### 1. User Management & Authentication

#### `user_profiles` (extends auth.users)
**Purpose**: Stores user profile information and verification status
**Key Fields**:
- `id` (UUID) - References auth.users
- `first_name`, `last_name`, `phone`
- `user_level` - 'guest', 'basic', 'verified', 'premium'
- `roles` - Array of roles: 'buyer', 'seller', 'admin', 'agent'
- Verification flags: `is_phone_verified`, `is_identity_verified`, etc.
- `credit_score` - Calculated credit score
- `kyc_status` - 'none', 'partial', 'pending', 'approved', 'rejected'

**Form Mapping**: 
- `BasicSignupModal.tsx` → Creates initial user profile
- All verification forms update verification flags

#### `user_verification_steps`
**Purpose**: Tracks progress through verification workflow
**Key Fields**:
- `step_type` - 'phone_verification', 'identity_verification', 'financial_assessment'
- `status` - 'pending', 'in_progress', 'completed', 'failed', 'expired'
- `verification_data` - JSONB with step-specific data

**Form Mapping**:
- `PhoneVerificationModal.tsx` → 'phone_verification' step
- `IdentityVerificationModal.tsx` → 'identity_verification' step
- `FinancialAssessmentModal.tsx` → 'financial_assessment' step

#### `phone_verification_attempts`
**Purpose**: Manages OTP verification for phone numbers
**Key Fields**:
- `otp_code`, `otp_hash` - Secure OTP storage
- `attempts_count`, `max_attempts` - Rate limiting
- `expires_at` - OTP expiration

**Form Mapping**: `PhoneVerificationModal.tsx`

#### `financial_assessments`
**Purpose**: Stores detailed financial assessment data
**Key Fields**:
- Personal info: `id_number`, `date_of_birth`, `nationality`
- Address: `residential_address` (JSONB)
- Employment: `employment_status`, `monthly_income`, `employer_name`
- Financial: `monthly_expenses`, `has_debts`, `debt_details`
- Results: `credit_score`, `risk_level`, `pre_approved_amount`

**Form Mapping**: `FinancialAssessmentModal.tsx`

### 2. KYC Documentation System

#### `kyc_verifications`
**Purpose**: Main KYC verification records
**Key Fields**:
- `verification_type` - 'buyer' or 'seller'
- `verification_level` - 'basic', 'enhanced', 'premium'
- `expires_at` - Verification expiration
- `certificate_url` - Link to verification certificate

#### `kyc_documents`
**Purpose**: Stores uploaded KYC documents
**Key Fields**:
- `document_type` - 'id_document', 'proof_of_income', 'title_deed', etc.
- `file_path`, `file_name`, `file_size`, `mime_type`
- `verified` - Document verification status

**Form Mapping**: 
- `IdentityVerificationModal.tsx` → 'id_document' uploads
- `FinancialAssessmentModal.tsx` → 'proof_of_income', 'proof_of_address' uploads
- `PropertyDocumentationModal.tsx` → Property-related documents

#### `verification_certificates`
**Purpose**: Issued verification certificates
**Key Fields**:
- `certificate_type` - 'identity', 'financial', 'comprehensive'
- `verification_level` - 'basic', 'enhanced', 'premium'
- `issued_at`, `expires_at` - Certificate validity
- `features` - Array of certificate features

### 3. Property Management System

#### `properties`
**Purpose**: Property listings
**Key Fields**:
- Basic info: `title`, `description`, `property_type`, `listing_type`
- Location: `country`, `city`, `suburb`, `street_address`, coordinates
- Details: `size_sqm`, `bedrooms`, `bathrooms`, `features`, `amenities`
- Financial: `price`, `currency`, `rent_to_buy_deposit`, `monthly_rental`
- Status: `status`, `verification_status`, `featured`, `premium_listing`

**Form Mapping**: `PropertyListingModal.tsx`

#### `property_media`
**Purpose**: Property images and media
**Key Fields**:
- `media_type` - 'image', 'virtual_tour', 'floor_plan'
- `is_main_image` - Primary property image
- `display_order` - Image ordering

**Form Mapping**: `PropertyListingModal.tsx` (media upload step)

#### `property_documents`
**Purpose**: Property-related documents
**Key Fields**:
- `document_type` - 'title_deed', 'property_tax_certificate', etc.
- `verified` - Document verification status

**Form Mapping**: `PropertyDocumentsStep.tsx`

#### `property_listing_history`
**Purpose**: Audit trail of property changes
**Key Fields**:
- `action` - 'created', 'updated', 'activated', etc.
- `changes` - JSONB with what changed
- `performed_by` - Who made the change

#### `property_viewings`
**Purpose**: Scheduled property viewings
**Key Fields**:
- `scheduled_for` - Viewing date/time
- `status` - 'scheduled', 'confirmed', 'completed', 'cancelled'
- `feedback_rating`, `feedback_comment` - Post-viewing feedback

### 4. Messaging & Communication

#### `conversations`
**Purpose**: Conversation threads between users
**Key Fields**:
- `participant1_id`, `participant2_id` - Conversation participants
- `property_id` - Optional property context
- `last_message_at` - Last activity timestamp

#### `messages`
**Purpose**: Individual messages in conversations
**Key Fields**:
- `conversation_id` - Links to conversations table
- `sender_id`, `recipient_id` - Message participants
- `message_type` - 'text', 'image', 'file', 'system'
- `content` - Message content
- `attachments` - Array of file attachments
- `read_at` - Message read timestamp

**Form Mapping**: `MessageComposer.tsx`, `MessageThread.tsx`

### 5. Rent-to-Buy Agreements

#### `rent_to_buy_agreements`
**Purpose**: Rent-to-buy agreements between buyers and sellers
**Key Fields**:
- Agreement terms: `monthly_rental`, `rent_credit_percentage`, `option_period_months`
- Financial: `purchase_price`, `deposit_amount`
- Status: `status`, `start_date`, `end_date`, `purchase_deadline`
- Tracking: `total_rent_paid`, `total_rent_credit`, `remaining_balance`

#### `rent_payments`
**Purpose**: Monthly rent payments and credit tracking
**Key Fields**:
- `payment_month` - Month being paid for
- `rent_amount`, `rent_credit`, `net_payment`
- `payment_status` - 'pending', 'paid', 'overdue', 'cancelled'
- `transaction_id` - Links to escrow transaction

### 6. Escrow & Transactions

#### `escrow_transactions`
**Purpose**: Financial transactions
**Key Fields**:
- `transaction_type` - 'deposit', 'rental', 'purchase', 'refund'
- `amount`, `currency` - Transaction amount
- `status` - 'pending', 'completed', 'failed', 'cancelled'
- `payment_method` - 'bank_transfer', 'card', 'mobile_money', 'crypto'
- `processing_fee`, `net_amount` - Fee breakdown

#### `transaction_fees`
**Purpose**: Detailed fee breakdown
**Key Fields**:
- `fee_type` - 'processing', 'escrow', 'platform', 'late_payment'
- `amount` - Fee amount
- `description` - Fee description

### 7. Notifications & Alerts

#### `system_notifications`
**Purpose**: System notifications to users
**Key Fields**:
- `notification_type` - Type of notification
- `title`, `message` - Notification content
- `priority` - 'low', 'normal', 'high', 'urgent'
- `action_url` - Optional action link
- `read_at` - Read timestamp

#### `notification_templates`
**Purpose**: Reusable notification templates
**Key Fields**:
- `template_name` - Template identifier
- `title_template`, `message_template` - Template content
- `variables` - Array of template variables

#### `user_notification_preferences`
**Purpose**: User notification preferences
**Key Fields**:
- `notification_type` - Type of notification
- `email_enabled`, `sms_enabled`, `push_enabled` - Delivery preferences

#### `property_alerts`
**Purpose**: Property search alerts
**Key Fields**:
- Search criteria: `country`, `city`, `property_types`, `price_min`, `price_max`
- `frequency` - 'daily', 'weekly'
- `enabled` - Alert status

### 8. Analytics & Reporting

#### `property_analytics`
**Purpose**: Daily property performance metrics
**Key Fields**:
- `date` - Analytics date
- `views_count`, `unique_views` - View metrics
- `saved_count`, `inquiry_count`, `viewing_count` - Engagement metrics

#### `user_activity_log`
**Purpose**: User activity audit trail
**Key Fields**:
- `activity_type` - Type of activity
- `activity_data` - JSONB with activity details
- `ip_address`, `user_agent` - Activity context

## Form-to-Database Mapping

### User Registration Flow

1. **Basic Signup** (`BasicSignupModal.tsx`)
   ```sql
   -- Creates user in auth.users (handled by Supabase)
   -- Creates profile in user_profiles
   INSERT INTO user_profiles (id, first_name, last_name, email, phone, user_level, roles)
   VALUES (auth.uid(), 'John', 'Doe', 'john@example.com', '+27123456789', 'basic', ARRAY['buyer']);
   ```

2. **Phone Verification** (`PhoneVerificationModal.tsx`)
   ```sql
   -- Creates verification attempt
   INSERT INTO phone_verification_attempts (user_id, phone_number, otp_code, otp_hash, expires_at)
   VALUES (auth.uid(), '+27123456789', '123456', 'hashed_otp', NOW() + INTERVAL '10 minutes');
   
   -- On successful verification
   UPDATE user_profiles SET is_phone_verified = TRUE WHERE id = auth.uid();
   SELECT complete_verification_step(auth.uid(), 'phone_verification');
   ```

3. **Identity Verification** (`IdentityVerificationModal.tsx`)
   ```sql
   -- Creates verification step
   SELECT create_verification_step(auth.uid(), 'identity_verification');
   
   -- Uploads documents
   INSERT INTO kyc_documents (kyc_verification_id, document_type, file_path, file_name, file_size, mime_type)
   VALUES (verification_id, 'id_document', '/uploads/id_front.jpg', 'id_front.jpg', 1024000, 'image/jpeg');
   
   -- On approval
   SELECT complete_verification_step(auth.uid(), 'identity_verification', '{"document_type": "national_id"}');
   ```

4. **Financial Assessment** (`FinancialAssessmentModal.tsx`)
   ```sql
   -- Creates financial assessment
   INSERT INTO financial_assessments (
     user_id, id_number, date_of_birth, nationality, residential_address,
     employment_status, monthly_income, employer_name, job_title,
     monthly_expenses, has_debts, credit_score, risk_level
   ) VALUES (
     auth.uid(), '63-123456-A-12', '1990-01-01', 'ZIM',
     '{"streetAddress": "123 Main St", "city": "Harare", "province": "Harare"}',
     'full-time', 25000.00, 'Tech Corp', 'Developer',
     15000.00, 'minimal', 720, 'Medium'
   );
   
   -- On completion
   SELECT complete_verification_step(auth.uid(), 'financial_assessment');
   ```

### Property Listing Flow

1. **Property Details** (`PropertyListingModal.tsx`)
   ```sql
   -- Creates property listing
   INSERT INTO properties (
     owner_id, title, description, property_type, listing_type,
     country, city, suburb, street_address, size_sqm, bedrooms, bathrooms,
     price, currency, rent_to_buy_deposit, monthly_rental, rent_credit_percentage
   ) VALUES (
     auth.uid(), 'Modern 3-Bedroom House', 'Beautiful family home...',
     'house', 'rent-to-buy', 'ZW', 'Harare', 'Borrowdale', '123 Example St',
     200.00, 3, 2, 150000.00, 'USD', 15000.00, 1000.00, 25.00
   );
   ```

2. **Property Media** (`PropertyListingModal.tsx`)
   ```sql
   -- Uploads property images
   INSERT INTO property_media (property_id, media_type, file_path, file_name, is_main_image, display_order)
   VALUES 
     (property_id, 'image', '/uploads/property_1.jpg', 'property_1.jpg', TRUE, 1),
     (property_id, 'image', '/uploads/property_2.jpg', 'property_2.jpg', FALSE, 2);
   ```

3. **Property Documents** (`PropertyDocumentsStep.tsx`)
   ```sql
   -- Uploads property documents
   INSERT INTO property_documents (property_id, document_type, file_path, file_name, file_size, mime_type)
   VALUES (property_id, 'title_deed', '/uploads/title_deed.pdf', 'title_deed.pdf', 2048000, 'application/pdf');
   ```

### Rent-to-Buy Agreement Flow

1. **Agreement Creation**
   ```sql
   -- Creates rent-to-buy agreement
   INSERT INTO rent_to_buy_agreements (
     property_id, buyer_id, seller_id, monthly_rental, rent_credit_percentage,
     option_period_months, purchase_price, deposit_amount, status, start_date
   ) VALUES (
     property_id, buyer_id, seller_id, 1000.00, 25.00, 36, 150000.00, 15000.00,
     'active', CURRENT_DATE
   );
   ```

2. **Monthly Payments**
   ```sql
   -- Records monthly rent payment
   INSERT INTO rent_payments (
     agreement_id, payment_month, rent_amount, rent_credit, net_payment, payment_status
   ) VALUES (
     agreement_id, '2024-01-01', 1000.00, 250.00, 750.00, 'paid'
   );
   ```

## Key Functions

### Verification Functions

```sql
-- Create verification step
SELECT create_verification_step(user_id, 'phone_verification', 30);

-- Complete verification step
SELECT complete_verification_step(user_id, 'identity_verification', '{"document_type": "passport"}');

-- Update user verification status
SELECT update_user_verification_status(user_id);
```

### Credit Scoring Function

```sql
-- Calculate credit score
SELECT calculate_credit_score(25000.00, 15000.00, '2-5years', 'minimal');
-- Returns: 720
```

### Notification Functions

```sql
-- Create user notification
SELECT create_user_notification(
  user_id, 
  'kyc_approved', 
  'KYC Approved', 
  'Your verification has been approved!',
  'high'
);

-- Log user activity
SELECT log_user_activity(user_id, 'property_viewed', '{"property_id": "uuid"}');
```

## Security & Performance

### Row Level Security (RLS)
All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Property owners can manage their properties
- Admins have appropriate access levels
- Public access is limited to active properties

### Indexing Strategy
- **Primary keys**: UUID with automatic indexing
- **Foreign keys**: Indexed for join performance
- **Search fields**: Text search indexes on property titles, descriptions
- **Date fields**: Indexed for time-based queries
- **Status fields**: Indexed for filtering

### Performance Optimizations
- **JSONB fields**: For flexible data storage with indexing
- **Array fields**: For tags and features with GIN indexes
- **Composite indexes**: For common query patterns
- **Partial indexes**: For active records only

## Data Migration Strategy

### Phase 1: Core Tables
1. Run the enhanced schema migration
2. Migrate existing user data
3. Set up RLS policies
4. Create indexes

### Phase 2: Verification System
1. Set up verification workflows
2. Create notification templates
3. Configure credit scoring

### Phase 3: Property Management
1. Migrate property data
2. Set up media storage
3. Configure document verification

### Phase 4: Rent-to-Buy System
1. Set up agreement workflows
2. Configure payment processing
3. Set up escrow system

## Monitoring & Maintenance

### Key Metrics to Monitor
- **User verification completion rates**
- **Property listing performance**
- **Rent-to-buy agreement success rates**
- **System response times**
- **Storage usage**

### Regular Maintenance Tasks
- **Clean up expired verification attempts**
- **Archive old property listings**
- **Update credit scores**
- **Purge old activity logs**
- **Optimize database performance**

## Conclusion

This database schema provides a robust foundation for the Mukamba FinTech platform, supporting all the user workflows identified in the application forms while maintaining security, performance, and scalability. The schema is designed to grow with the platform and can accommodate future features and requirements. 