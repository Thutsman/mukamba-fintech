# Mukamba FinTech Database Implementation Guide

## Quick Start

### 1. Deploy the Database Schema

Copy and paste the SQL from `supabase/migrations/20240302000000_enhanced_schema_setup.sql` into your Supabase SQL Editor and run it.

### 2. Verify the Setup

Run these queries to verify everything is working:

```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%verification%' OR table_name LIKE '%property%';

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'properties', 'kyc_verifications');
```

## Key Database Design Decisions

### 1. **User Verification Workflow**
- **Problem**: Users need to go through multiple verification steps
- **Solution**: `user_verification_steps` table tracks progress through each step
- **Benefits**: 
  - Clear audit trail of verification progress
  - Flexible step management
  - Easy to add new verification types

### 2. **Financial Assessment Data**
- **Problem**: Complex financial data with varying requirements
- **Solution**: Dedicated `financial_assessments` table with JSONB for flexible data
- **Benefits**:
  - Structured storage of financial information
  - Built-in credit scoring function
  - Easy to extend with new financial fields

### 3. **Property Management**
- **Problem**: Properties need media, documents, and complex metadata
- **Solution**: Separate tables for properties, media, and documents
- **Benefits**:
  - Efficient media management
  - Document verification workflow
  - Scalable property data structure

### 4. **Rent-to-Buy Agreements**
- **Problem**: Complex financial agreements with monthly payments
- **Solution**: `rent_to_buy_agreements` and `rent_payments` tables
- **Benefits**:
  - Track agreement terms and status
  - Monitor monthly payments and credits
  - Support for escrow transactions

## Integration with Your Forms

### 1. Basic Signup Flow

```typescript
// In your BasicSignupModal.tsx
const handleSignup = async (data: BasicSignupData) => {
  // 1. Create user in Supabase Auth
  const { user, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone
      }
    }
  });

  // 2. User profile is automatically created by trigger
  // 3. Create initial verification step
  await supabase.rpc('create_verification_step', {
    p_user_id: user.id,
    p_step_type: 'phone_verification'
  });
};
```

### 2. Phone Verification Flow

```typescript
// In your PhoneVerificationModal.tsx
const handleSendOTP = async (phoneNumber: string) => {
  // 1. Generate OTP
  const otp = generateOTP();
  const otpHash = await hashOTP(otp);
  
  // 2. Store verification attempt
  await supabase.from('phone_verification_attempts').insert({
    user_id: user.id,
    phone_number: phoneNumber,
    otp_code: otp,
    otp_hash: otpHash,
    expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  });
  
  // 3. Send SMS (implement your SMS service)
  await sendSMS(phoneNumber, `Your verification code is: ${otp}`);
};

const handleVerifyOTP = async (otp: string) => {
  // 1. Verify OTP
  const { data: attempt } = await supabase
    .from('phone_verification_attempts')
    .select('*')
    .eq('user_id', user.id)
    .eq('otp_code', otp)
    .single();
    
  if (attempt && new Date() < new Date(attempt.expires_at)) {
    // 2. Mark verification as complete
    await supabase.rpc('complete_verification_step', {
      p_user_id: user.id,
      p_step_type: 'phone_verification'
    });
    
    // 3. Update user profile
    await supabase.rpc('update_user_verification_status', {
      p_user_id: user.id
    });
  }
};
```

### 3. Identity Verification Flow

```typescript
// In your IdentityVerificationModal.tsx
const handleDocumentUpload = async (files: File[]) => {
  // 1. Create verification step
  await supabase.rpc('create_verification_step', {
    p_user_id: user.id,
    p_step_type: 'identity_verification'
  });
  
  // 2. Upload files to Supabase Storage
  for (const file of files) {
    const filePath = `user-documents/${user.id}/${file.name}`;
    await supabase.storage.from('user-documents').upload(filePath, file);
    
    // 3. Store document metadata
    await supabase.from('kyc_documents').insert({
      kyc_verification_id: verificationId,
      document_type: 'id_document',
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type
    });
  }
};
```

### 4. Financial Assessment Flow

```typescript
// In your FinancialAssessmentModal.tsx
const handleFinancialAssessment = async (data: FinancialFormData) => {
  // 1. Calculate credit score
  const creditScore = await supabase.rpc('calculate_credit_score', {
    p_monthly_income: parseFloat(data.monthlyIncome),
    p_monthly_expenses: parseFloat(data.monthlyExpenses),
    p_employment_duration: data.employmentDuration,
    p_has_debts: data.hasDebts
  });
  
  // 2. Store financial assessment
  await supabase.from('financial_assessments').insert({
    user_id: user.id,
    id_number: data.idNumber,
    date_of_birth: data.dateOfBirth,
    nationality: data.nationality,
    residential_address: data.residentialAddress,
    employment_status: data.employmentStatus,
    monthly_income: parseFloat(data.monthlyIncome),
    employer_name: data.employerName,
    job_title: data.jobTitle,
    employment_duration: data.employmentDuration,
    monthly_expenses: parseFloat(data.monthlyExpenses),
    has_debts: data.hasDebts,
    debt_details: data.debtDetails,
    credit_score: creditScore.data,
    risk_level: getRiskLevel(creditScore.data)
  });
  
  // 3. Complete verification step
  await supabase.rpc('complete_verification_step', {
    p_user_id: user.id,
    p_step_type: 'financial_assessment'
  });
};
```

### 5. Property Listing Flow

```typescript
// In your PropertyListingModal.tsx
const handlePropertySubmission = async (data: PropertyListingData, images: File[]) => {
  // 1. Create property listing
  const { data: property } = await supabase.from('properties').insert({
    owner_id: user.id,
    title: data.title,
    description: data.description,
    property_type: data.propertyType,
    listing_type: data.listingType,
    country: data.country,
    city: data.city,
    suburb: data.suburb,
    street_address: data.streetAddress,
    size_sqm: parseFloat(data.size),
    bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
    bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
    price: parseFloat(data.price),
    rent_to_buy_deposit: data.rentToBuyDeposit ? parseFloat(data.rentToBuyDeposit) : null,
    monthly_rental: data.monthlyRental ? parseFloat(data.monthlyRental) : null,
    rent_credit_percentage: data.rentCreditPercentage ? parseFloat(data.rentCreditPercentage) : null,
    features: data.features,
    amenities: data.amenities
  }).select().single();
  
  // 2. Upload property images
  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const filePath = `property-images/${property.id}/${file.name}`;
    await supabase.storage.from('property-images').upload(filePath, file);
    
    // 3. Store media metadata
    await supabase.from('property_media').insert({
      property_id: property.id,
      media_type: 'image',
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      is_main_image: i === 0,
      display_order: i
    });
  }
};
```

## Storage Bucket Setup

### 1. Create Storage Buckets

The migration creates these buckets automatically, but verify they exist:

```sql
-- Check storage buckets
SELECT * FROM storage.buckets;
```

### 2. Storage Policies

The migration sets up RLS policies for storage. Key policies:

- **property-images**: Public read, authenticated write
- **property-documents**: Authenticated access only
- **user-documents**: Authenticated access only
- **agent-documents**: Authenticated access only

### 3. File Upload Example

```typescript
const uploadFile = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) throw error;
  
  // Get public URL (for property-images only)
  if (bucket === 'property-images') {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return publicUrl;
  }
  
  return data.path;
};
```

## Testing the Implementation

### 1. Test User Registration

```sql
-- Check user profile creation
SELECT * FROM user_profiles WHERE email = 'test@example.com';

-- Check verification steps
SELECT * FROM user_verification_steps WHERE user_id = 'user-uuid';
```

### 2. Test Property Creation

```sql
-- Check property listing
SELECT p.*, pm.file_path 
FROM properties p 
LEFT JOIN property_media pm ON p.id = pm.property_id 
WHERE p.owner_id = 'user-uuid';
```

### 3. Test Credit Scoring

```sql
-- Test credit score calculation
SELECT calculate_credit_score(25000.00, 15000.00, '2-5years', 'minimal');
```

## Performance Optimization

### 1. Database Indexes

The migration creates comprehensive indexes. Monitor query performance:

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### 2. Storage Optimization

- Use image compression for property photos
- Implement lazy loading for property images
- Set appropriate cache headers for static assets

### 3. Query Optimization

```sql
-- Example optimized property search
SELECT p.*, 
       pm.file_path as main_image,
       up.first_name || ' ' || up.last_name as owner_name
FROM properties p
LEFT JOIN property_media pm ON p.id = pm.property_id AND pm.is_main_image = TRUE
LEFT JOIN user_profiles up ON p.owner_id = up.id
WHERE p.status = 'active'
  AND p.country = 'ZW'
  AND p.price BETWEEN 100000 AND 200000
ORDER BY p.created_at DESC
LIMIT 20;
```

## Security Considerations

### 1. Row Level Security (RLS)

All tables have RLS enabled. Test policies:

```sql
-- Test user can only see own data
SELECT * FROM user_profiles WHERE id = auth.uid();

-- Test property owner access
SELECT * FROM properties WHERE owner_id = auth.uid();
```

### 2. File Access Control

Test storage policies:

```typescript
// Should work for property owner
const { data } = await supabase.storage
  .from('property-documents')
  .list('property-uuid/');

// Should fail for non-owner
const { error } = await supabase.storage
  .from('property-documents')
  .list('other-property-uuid/');
```

### 3. API Security

Always validate user permissions in your API routes:

```typescript
// Example: Property update endpoint
const updateProperty = async (propertyId: string, updates: any) => {
  // Check if user owns the property
  const { data: property } = await supabase
    .from('properties')
    .select('owner_id')
    .eq('id', propertyId)
    .single();
    
  if (property.owner_id !== user.id) {
    throw new Error('Unauthorized');
  }
  
  // Update property
  return await supabase
    .from('properties')
    .update(updates)
    .eq('id', propertyId);
};
```

## Monitoring & Maintenance

### 1. Database Monitoring

Set up monitoring for:
- Query performance
- Storage usage
- User activity
- Error rates

### 2. Regular Maintenance

```sql
-- Clean up expired verification attempts
DELETE FROM phone_verification_attempts 
WHERE expires_at < NOW() - INTERVAL '1 day';

-- Archive old property listings
UPDATE properties 
SET status = 'archived' 
WHERE updated_at < NOW() - INTERVAL '1 year' 
AND status = 'active';

-- Update credit scores (run monthly)
UPDATE user_profiles 
SET credit_score = (
  SELECT credit_score 
  FROM financial_assessments 
  WHERE user_id = user_profiles.id 
  ORDER BY created_at DESC 
  LIMIT 1
)
WHERE credit_score IS NULL;
```

### 3. Backup Strategy

- Enable Supabase point-in-time recovery
- Set up automated backups
- Test restore procedures regularly

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   ```sql
   -- Check if RLS is enabled
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'your_table';
   
   -- Check policies
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

2. **Storage Upload Failures**
   ```sql
   -- Check storage bucket exists
   SELECT * FROM storage.buckets WHERE id = 'your-bucket';
   
   -- Check storage policies
   SELECT * FROM storage.policies WHERE bucket_id = 'your-bucket';
   ```

3. **Function Errors**
   ```sql
   -- Check function exists
   SELECT routine_name, routine_type 
   FROM information_schema.routines 
   WHERE routine_schema = 'public';
   ```

### Performance Issues

1. **Slow Queries**
   - Check if indexes are being used
   - Analyze query execution plans
   - Consider query optimization

2. **Storage Issues**
   - Monitor storage usage
   - Implement file cleanup
   - Optimize image sizes

## Next Steps

1. **Deploy the schema** to your Supabase project
2. **Update your application code** to use the new database structure
3. **Test all user flows** thoroughly
4. **Set up monitoring** and alerting
5. **Plan for scaling** as your user base grows

This implementation provides a solid foundation for your Mukamba FinTech platform with comprehensive user management, property listings, and financial transactions. 