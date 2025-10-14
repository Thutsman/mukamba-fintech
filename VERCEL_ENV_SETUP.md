# Vercel Environment Variables Setup for Custom Domain

## Critical Environment Variables to Set in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### 1. Application URL (CRITICAL - Fixes CORS Error)
```
NEXT_PUBLIC_APP_URL=https://www.mukambagateway.com
```
**Environment:** Production
**Note:** This MUST match your custom domain exactly

### 2. SMS Provider Selection
```
SMS_PROVIDER=vonage
```
**Environment:** Production, Preview, Development

### 3. Vonage API Credentials
```
VONAGE_API_KEY=your-vonage-api-key
VONAGE_API_SECRET=your-vonage-api-secret
VONAGE_FROM_NUMBER=Mukamba
```
**Environment:** Production, Preview, Development
**Note:** 
- Get these from your Vonage Dashboard at https://dashboard.nexmo.com
- `VONAGE_FROM_NUMBER` can be your brand name (alphanumeric sender ID) or a phone number

### 4. Supabase Configuration (Should already be set)
```
NEXT_PUBLIC_SUPABASE_URL=https://kiptlccxjvbxcuspozwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Application Configuration
```
NEXT_PUBLIC_APP_NAME=Mukamba FinTech
NEXT_PUBLIC_ENABLE_KYC=true
NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION=true
NEXT_PUBLIC_ENABLE_FINANCIAL_ASSESSMENT=true
```

## Steps to Update in Vercel:

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your `mukamba-fintech` project

2. **Open Environment Variables**
   - Click on **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add/Update Each Variable**
   - Click "Add New" or edit existing variables
   - For each variable:
     - Name: `NEXT_PUBLIC_APP_URL`
     - Value: `https://www.mukambagateway.com`
     - Select environments: Check "Production"
     - Click "Save"

4. **Important: Redeploy**
   - After updating all variables, go to **Deployments** tab
   - Click the **...** menu on the latest deployment
   - Select **Redeploy**
   - Check "Use existing Build Cache" (optional)
   - Click **Redeploy**

## Troubleshooting:

### If SMS Still Fails After Setup:

1. **Check Vonage Account Status**
   - Login to https://dashboard.nexmo.com
   - Verify your account is active and has credits
   - Check that SMS service is enabled for your account
   - Verify the country (Zimbabwe) is supported

2. **Check Vonage Credentials**
   - API Key should be alphanumeric (8 characters)
   - API Secret should be alphanumeric (16 characters)
   - From Number: Can be "Mukamba" or a verified phone number

3. **Test the API Endpoint Directly**
   ```bash
   curl -X POST https://www.mukambagateway.com/api/sms \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"+263771234567","otpCode":"123456"}'
   ```

4. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for SMS-related errors
   - Check if environment variables are loading correctly

### Alternative: Use Supabase Edge Function

If you prefer to use Supabase Edge Function for SMS:

1. **Set Environment Variables in Supabase**
   - Go to: Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Add the same Vonage variables there

2. **Verify Edge Function Deployment**
   ```bash
   supabase functions list
   supabase functions deploy send-sms
   ```

## Common Errors and Fixes:

| Error | Cause | Fix |
|-------|-------|-----|
| CORS policy error | `NEXT_PUBLIC_APP_URL` mismatch | Update to match your domain exactly |
| 500 from Edge Function | Missing Vonage keys in Supabase | Add secrets to Supabase Edge Functions |
| "Vonage not configured" | Missing env vars in Vercel | Add all three Vonage variables |
| "Failed to send SMS" | Invalid Vonage credentials | Verify keys from Vonage dashboard |

## Verification Checklist:

- [ ] `NEXT_PUBLIC_APP_URL` is set to `https://www.mukambagateway.com`
- [ ] `SMS_PROVIDER` is set to `vonage`
- [ ] All three Vonage variables are set (KEY, SECRET, FROM_NUMBER)
- [ ] Environment variables are set for "Production" environment
- [ ] Project has been redeployed after variable changes
- [ ] Vonage account has active credits
- [ ] Domain SSL certificate is valid (https works)

## Quick Fix Summary:

**The main issue is:** Your app is calling an API route with the wrong domain, causing a CORS error.

**Quick fix:**
1. Set `NEXT_PUBLIC_APP_URL=https://www.mukambagateway.com` in Vercel
2. Set your Vonage credentials in Vercel
3. Set `SMS_PROVIDER=vonage` in Vercel
4. Redeploy your application

After these changes, SMS should work correctly!



