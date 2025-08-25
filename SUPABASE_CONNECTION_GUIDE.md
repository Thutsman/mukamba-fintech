# Supabase Connection Guide for Mukamba FinTech

## 🔗 **Step 1: Get Your Supabase Connection Details**

### 1.1 Access Your Supabase Project

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your **"MukambaGateway"** project
3. Navigate to **Settings** → **API** in the left sidebar

### 1.2 Copy Your Connection Details

You'll see two important pieces of information:

**Project URL:**
```
https://your-project-id.supabase.co
```

**Anon/Public Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔧 **Step 2: Create Environment File**

### 2.1 Create `.env.local` File

In your project root directory, create a file named `.env.local`:

```bash
# In your terminal, from the project root:
touch .env.local
```

### 2.2 Add Your Configuration

Copy the content from `env.template` and replace the placeholder values:

```env
# Mukamba FinTech - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here

# Application Configuration
NEXT_PUBLIC_APP_NAME=Mukamba FinTech
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_KYC=true
NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION=true
NEXT_PUBLIC_ENABLE_FINANCIAL_ASSESSMENT=true
```

**Replace:**
- `your-actual-project-id` with your actual project ID from the URL
- `your-actual-anon-key-here` with your actual anon key

## 🚀 **Step 3: Test the Connection**

### 3.1 Start Your Development Server

```bash
npm run dev
# or
yarn dev
```

### 3.2 Test Authentication

1. Go to your application (usually http://localhost:3000)
2. Try to sign up with a test email
3. Check your Supabase dashboard → **Authentication** → **Users** to see if the user was created
4. Check **Table Editor** → **user_profiles** to see if the profile was automatically created

### 3.3 Test Storage Buckets

1. Go to your Supabase dashboard → **Storage** → **Buckets**
2. Verify these buckets exist:
   - `user-documents` (private)
   - `kyc-documents` (private)
   - `property-images` (public)
   - `property-documents` (private)

## 🔍 **Step 4: Verify Database Schema**

### 4.1 Check Tables in Supabase

Go to **Table Editor** and verify these tables exist:

**Core Tables:**
- ✅ `user_profiles`
- ✅ `user_sessions`
- ✅ `user_login_history`
- ✅ `kyc_verifications`
- ✅ `kyc_documents`
- ✅ `phone_verification_attempts`
- ✅ `financial_assessments`

### 4.2 Check RLS Policies

For each table, verify:
- RLS is enabled (green badge)
- Policies are created (check the "Policies" tab)

### 4.3 Check Functions

Go to **Database** → **Functions** and verify:
- `update_updated_at_column`
- `handle_new_user`
- `calculate_credit_score`
- `verify_phone_number`

## 🧪 **Step 5: Test Authentication Workflow**

### 5.1 Test User Registration

```typescript
// In your browser console or test component
const testSignUp = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123',
    options: {
      data: {
        first_name: 'Test',
        last_name: 'User'
      }
    }
  });
  
  console.log('Signup result:', { data, error });
};
```

### 5.2 Test User Profile Creation

After signup, check if a profile was automatically created:

```typescript
const checkProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    console.log('Profile:', { profile, error });
  }
};
```

## 🔧 **Step 6: Update Your Application Code**

### 6.1 Update Type Definitions

Make sure your TypeScript types match the database schema:

```typescript
// In src/types/auth.ts
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  user_level: 'new_user' | 'verified_buyer' | 'verified_seller' | 'admin';
  user_role: 'user' | 'buyer' | 'seller' | 'admin';
  is_phone_verified: boolean;
  is_identity_verified: boolean;
  is_financially_verified: boolean;
  is_address_verified: boolean;
  is_property_verified: boolean;
  // ... other fields
}
```

### 6.2 Test Your Forms

Update your authentication components to use the new schema:

```typescript
// Example: Basic signup
const signUp = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
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
  });
  
  if (error) {
    console.error('Signup error:', error);
    return { error };
  }
  
  return { data };
};
```

## 🚨 **Troubleshooting**

### Common Issues:

1. **"Invalid API key" error**
   - Double-check your anon key in `.env.local`
   - Make sure there are no extra spaces or characters

2. **"Project not found" error**
   - Verify your project URL is correct
   - Check that you're using the right project

3. **"RLS policy violation" error**
   - Check that RLS policies are created
   - Verify user authentication is working

4. **"Bucket not found" error**
   - Run the database migration first
   - Check that storage buckets were created

### Debug Steps:

1. **Check Environment Variables:**
   ```typescript
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
   console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
   ```

2. **Test Supabase Client:**
   ```typescript
   console.log('Supabase client:', supabase);
   ```

3. **Check Network Tab:**
   - Open browser dev tools
   - Go to Network tab
   - Look for requests to your Supabase URL

## ✅ **Success Indicators**

You'll know everything is working when:

1. ✅ User registration creates entries in both `auth.users` and `user_profiles`
2. ✅ Storage buckets are accessible
3. ✅ RLS policies allow authenticated users to access their data
4. ✅ No console errors related to Supabase connection
5. ✅ Your forms can successfully submit data to the database

## 🔄 **Next Steps**

After successful connection:

1. **Test KYC Workflow** - Try uploading documents
2. **Test Phone Verification** - Implement OTP functionality
3. **Test Financial Assessment** - Submit financial data
4. **Create Property Tables** - Set up property management
5. **Implement Admin System** - Set up approval workflows

Your Mukamba FinTech application is now connected to your Supabase backend! 🎉
