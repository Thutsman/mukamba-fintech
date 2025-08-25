# Authentication Troubleshooting Guide

## 🚨 **Current Issue: Mock Authentication**

Your application is currently using **mock authentication** instead of real Supabase authentication. This is why:
- ✅ User signup form works
- ✅ Store updates correctly  
- ❌ **No real users created in Supabase**
- ❌ **No confirmation emails sent**
- ❌ **No user_profiles table entries**

## 🔧 **What I've Fixed**

### **1. Updated Authentication Store (`src/lib/store.ts`)**
- ✅ **Real Supabase signup calls** instead of mock data
- ✅ **Real Supabase login calls** instead of hardcoded credentials
- ✅ **Real Supabase logout calls**
- ✅ **User profile creation** in database
- ✅ **Authentication state checking** on app load

### **2. Updated AuthSystem Component**
- ✅ **Added `checkAuth()` call** on component mount
- ✅ **Real authentication flow** instead of mock flow

### **3. Enhanced Test Connection**
- ✅ **Detailed registration testing** with profile creation
- ✅ **Better error reporting** and success messages

## 🧪 **Testing Steps**

### **Step 1: Test the Connection**
1. Go to `http://localhost:3000/test-connection`
2. Click **"Run Connection Test"**
3. Verify all tests pass (✅)

### **Step 2: Test User Registration**
1. Click **"Test User Registration"**
2. Check console for detailed logs
3. Check Supabase dashboard:
   - **Authentication → Users** (should see new user)
   - **Table Editor → user_profiles** (should see new profile)

### **Step 3: Test Real Signup**
1. Go to your main app (`http://localhost:3000`)
2. Click **"Join Mukamba"** or signup button
3. Fill out the form and submit
4. Check console logs for Supabase calls
5. Check Supabase dashboard for new user

## 🔍 **Debugging Console Logs**

### **Expected Logs (After Fix):**
```
Starting signup process for: user@example.com
Supabase user created: {id: "uuid", email: "user@example.com", ...}
Created new user: {id: "uuid", firstName: "John", ...}
User authenticated successfully
```

### **Old Logs (Before Fix):**
```
Starting signup process for: user@example.com
Created new user: {id: "user_1", firstName: "John", ...}
User authenticated successfully
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Supabase client not initialized"**
**Solution:**
1. Check your `.env.local` file has correct values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Restart your development server: `npm run dev`

### **Issue 2: "RLS policy violation"**
**Solution:**
1. Run the RLS policies migration in Supabase SQL Editor
2. Check that `app_type: 'fintech'` is set in user metadata

### **Issue 3: "Profile creation failed"**
**Solution:**
1. Verify `user_profiles` table exists in Supabase
2. Check table structure matches the migration
3. Verify RLS policies allow profile creation

### **Issue 4: "No confirmation email"**
**Solution:**
1. Check Supabase **Authentication → Settings → Email Templates**
2. Verify email provider is configured
3. Check spam folder
4. For testing, you can disable email confirmation in Supabase settings

## 📊 **Verification Checklist**

### **In Supabase Dashboard:**
- [ ] **Authentication → Users**: New user appears
- [ ] **Table Editor → user_profiles**: New profile appears
- [ ] **Authentication → Settings → URL Configuration**: Correct redirect URLs
- [ ] **Table Editor → RLS Policies**: Policies are active

### **In Your App:**
- [ ] **Console logs**: Show Supabase calls instead of mock data
- [ ] **User authentication**: Persists after page refresh
- [ ] **User profile**: Shows correct data from database
- [ ] **Logout**: Actually logs out from Supabase

### **In Browser:**
- [ ] **Network tab**: Shows Supabase API calls
- [ ] **Application → Local Storage**: Contains auth tokens
- [ ] **No hydration errors**: Authentication state is consistent

## 🔄 **Next Steps After Fix**

1. **Test the complete flow**:
   - Signup → Email confirmation → Login → Dashboard
   
2. **Test user persistence**:
   - Refresh page → User should still be logged in
   
3. **Test logout**:
   - Logout → User should be logged out
   - Refresh page → User should stay logged out

4. **Test profile updates**:
   - Update user profile → Changes should save to database

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the console logs** for specific error messages
2. **Verify Supabase project settings** match your configuration
3. **Test with the connection test page** first
4. **Check network tab** for failed API calls
5. **Verify environment variables** are loaded correctly

## 📞 **Quick Debug Commands**

```bash
# Check if environment variables are loaded
echo $NEXT_PUBLIC_SUPABASE_URL

# Restart development server
npm run dev

# Clear browser cache and local storage
# (Open DevTools → Application → Clear Storage)
```

Your authentication system should now work with real Supabase users instead of mock data! 🎉
