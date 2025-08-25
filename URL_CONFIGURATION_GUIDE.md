# URL Configuration Guide - Mukamba FinTech + Early Access

## 🎯 **Overview**

This guide helps you configure Supabase URL settings to allow both your **Mukamba FinTech application** (running locally) and your **Early Access website** to coexist in the same Supabase project.

## 🔧 **Step 1: Configure Supabase URL Settings**

### 1.1 Access URL Settings

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your **"MukambaGateway"** project
3. Navigate to **Settings** → **API**
4. Scroll down to the **"URL Configuration"** section

### 1.2 Set Site URL

Set the **Site URL** to your main FinTech application:
```
http://localhost:3000
```

### 1.3 Configure Redirect URLs

Add these URLs in the **Redirect URLs** section:

#### **For Mukamba FinTech (Local Development):**
```
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
http://localhost:3000/profile
http://localhost:3000/admin
http://localhost:3000/test-connection
```

#### **For Early Access Website:**
```
https://your-early-access-domain.com/auth/callback
https://your-early-access-domain.com/dashboard
https://your-early-access-domain.com/profile
```

#### **For Production (Future):**
```
https://your-fintech-domain.com/auth/callback
https://your-fintech-domain.com/dashboard
https://your-fintech-domain.com/profile
https://your-fintech-domain.com/admin
```

### 1.4 Save Configuration

Click **"Save"** to apply the changes.

## 🗄️ **Step 2: Deploy Application Separation Policies**

### 2.1 Run the Migration

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the content from `supabase/migrations/20240305000000_app_separation_policies.sql`
3. Click **Run** to execute the migration

### 2.2 Verify Policies

After running the migration, verify in **Table Editor** that:
- RLS is enabled on all tables
- New policies are created for each table
- Policies include `app_type` checks

## 🔐 **Step 3: Update Authentication Code**

### 3.1 Update Signup Components

Your authentication components now include `app_type: 'fintech'` metadata:

```typescript
// Example signup call
const { data, error } = await supabase.auth.signUp({
  email: userData.email,
  password: userData.password,
  options: {
    data: {
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      app_type: 'fintech' // Distinguishes from early access
    }
  }
});
```

### 3.2 Update Early Access Website

For your early access website, use:

```typescript
// Early access signup
const { data, error } = await supabase.auth.signUp({
  email: userData.email,
  password: userData.password,
  options: {
    data: {
      app_type: 'early_access' // Distinguishes from FinTech
    }
  }
});
```

## 🧪 **Step 4: Test the Configuration**

### 4.1 Test FinTech Application

1. Go to `http://localhost:3000/test-connection`
2. Click **"Run Connection Test"**
3. Click **"Test User Registration"**
4. Verify in Supabase dashboard:
   - User created in **Authentication → Users**
   - Profile created in **Table Editor → user_profiles**
   - User has `app_type: 'fintech'` in metadata

### 4.2 Test Early Access Website

1. Test signup on your early access website
2. Verify user has `app_type: 'early_access'` in metadata
3. Confirm early access users can only access `early_access_signups` table

## 🔒 **Step 5: Security Verification**

### 5.1 Test Data Separation

Verify that users from different applications can only access their respective data:

```sql
-- Test FinTech user access
-- Should work: SELECT * FROM user_profiles WHERE id = 'fintech_user_id';
-- Should fail: SELECT * FROM early_access_signups WHERE id = 'early_access_user_id';

-- Test Early Access user access  
-- Should work: SELECT * FROM early_access_signups WHERE id = 'early_access_user_id';
-- Should fail: SELECT * FROM user_profiles WHERE id = 'fintech_user_id';
```

### 5.2 Test Storage Access

Verify storage bucket access:

```typescript
// FinTech users should access:
// - user-documents
// - kyc-documents
// - property-images
// - property-documents

// Early access users should access:
// - Only basic user data
```

## 📊 **Step 6: Monitor and Maintain**

### 6.1 Check User Distribution

Monitor user types in your Supabase dashboard:

```sql
-- Check user distribution by app type
SELECT 
  raw_user_meta_data->>'app_type' as app_type,
  COUNT(*) as user_count
FROM auth.users 
GROUP BY raw_user_meta_data->>'app_type';
```

### 6.2 Update Production URLs

When deploying to production, update the URL settings:

1. **Site URL**: Set to your production FinTech domain
2. **Redirect URLs**: Add production URLs for both applications
3. **Remove localhost URLs**: Only keep production URLs

## 🚨 **Troubleshooting**

### Common Issues:

1. **"Invalid redirect URL" error**
   - Check that all redirect URLs are added in Supabase settings
   - Ensure URLs match exactly (including protocol)

2. **"RLS policy violation" error**
   - Verify policies are created correctly
   - Check that `app_type` metadata is set during signup

3. **"Bucket access denied" error**
   - Verify storage bucket policies are created
   - Check that user has correct `app_type` metadata

### Debug Steps:

1. **Check User Metadata:**
   ```sql
   SELECT id, email, raw_user_meta_data 
   FROM auth.users 
   WHERE email = 'user@example.com';
   ```

2. **Check RLS Policies:**
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

3. **Test Policy Access:**
   ```sql
   -- Test as FinTech user
   SET LOCAL "request.jwt.claim.app_type" = 'fintech';
   SELECT * FROM user_profiles LIMIT 1;
   ```

## ✅ **Success Indicators**

You'll know everything is working when:

1. ✅ **FinTech users** can sign up and access FinTech features
2. ✅ **Early access users** can sign up and access early access features
3. ✅ **Data separation** works correctly (no cross-access)
4. ✅ **Storage access** is properly restricted
5. ✅ **No RLS policy violations** in logs
6. ✅ **Both applications** can coexist without conflicts

## 🔄 **Next Steps**

After successful URL configuration:

1. **Test Property Management** - Create property tables
2. **Implement KYC Workflow** - Test document uploads
3. **Set up Admin System** - Create approval workflows
4. **Deploy to Production** - Update URLs for production domains

Your Mukamba FinTech and Early Access applications are now properly configured to coexist in the same Supabase project! 🎉
