# SMS Verification Issue - Root Cause & Fix

## Problem Summary

You were experiencing SMS sending failures with the error:
```
Failed to send SMS: Edge Function returned a non-2xx status code
Access to fetch at 'https://www.mukambagateway.com/api/sms' has been blocked by CORS policy
```

## Root Causes Identified

### 1. **CORS Error - Wrong Domain URL**
- **Issue**: The code was using `${process.env.NEXT_PUBLIC_APP_URL}/api/sms` to call the SMS API
- **Problem**: When you switched from Vercel domain to your custom domain (`www.mukambagateway.com`), the environment variable wasn't updated
- **Result**: The app was trying to make a cross-origin request, blocked by CORS policy

### 2. **Missing Vonage Configuration in Vercel**
- **Issue**: Even if the CORS issue was resolved, the Vonage API keys might not be set in your production environment
- **Problem**: The SMS API route couldn't connect to Vonage to send SMS
- **Result**: 500 Internal Server Error

### 3. **Edge Function Fallback Also Failed**
- **Issue**: When the primary API failed, it tried to use Supabase Edge Function as fallback
- **Problem**: The Edge Function also doesn't have Vonage credentials configured
- **Result**: 500 error from Edge Function

## Code Fixes Applied

### Fix 1: Remove CORS Dependency in `buyer-services.ts`
**Changed from:**
```typescript
const apiRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/sms`, {
```

**Changed to:**
```typescript
// Use relative URL to avoid CORS issues when domain changes
const apiRes = await fetch('/api/sms', {
```

**Why:** Using a relative URL (`/api/sms`) instead of an absolute URL prevents CORS issues and automatically works with any domain.

### Fix 2: Update Ecocash Callback URL Fallback
**Changed from:**
```typescript
callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mukamba-fintech.vercel.app'}/api/payments/ecocash/callback`
```

**Changed to:**
```typescript
callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.mukambagateway.com'}/api/payments/ecocash/callback`
```

**Why:** Updated the fallback domain to your new custom domain.

## Required Actions in Vercel

Even with the code fixes, you **MUST** configure environment variables in Vercel:

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click on your `mukamba-fintech` project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add/Update These Variables

#### Critical Variables:

| Variable Name | Value | Environment | Purpose |
|---------------|-------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | `https://www.mukambagateway.com` | Production | Fix callbacks & URLs |
| `SMS_PROVIDER` | `vonage` | All | Select Vonage as SMS provider |
| `VONAGE_API_KEY` | Your Vonage API Key | All | Vonage authentication |
| `VONAGE_API_SECRET` | Your Vonage API Secret | All | Vonage authentication |
| `VONAGE_FROM_NUMBER` | `Mukamba` | All | SMS sender name/number |

#### How to Get Vonage Credentials:

1. **Login to Vonage Dashboard**: https://dashboard.nexmo.com
2. **Get API Credentials**:
   - Click on your account name (top right)
   - Select **API Settings**
   - Copy **API Key** and **API Secret**
3. **From Number**:
   - Can be your brand name: `Mukamba` (alphanumeric sender ID)
   - Or a verified phone number
   - Check Zimbabwe SMS regulations for sender ID requirements

### Step 3: Redeploy Your Application

After adding/updating environment variables:

1. Go to **Deployments** tab in Vercel
2. Click **...** on the latest deployment
3. Select **Redeploy**
4. Click **Redeploy** to confirm

**Important:** Environment variables only take effect after redeployment!

## Testing After Deployment

### Test 1: Check Environment Variables
```bash
# Visit your site and open browser console
# You should see in Network tab that /api/sms is called with relative URL
```

### Test 2: Try Phone Verification
1. Go to a property details page
2. Click "Contact Seller" or similar action that requires phone verification
3. Enter your phone number with country code
4. Click "Send Verification Code"
5. You should receive an SMS with a 6-digit code

### Test 3: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for logs showing:
   ```
   SMS Provider selected: vonage
   Vonage: Checking configuration... { hasKey: true, hasSecret: true, hasFrom: true }
   Vonage: Sending SMS to +263...
   SMS sent via API to +263... Message ID: ...
   ```

## Troubleshooting

### Error: "Vonage not configured"
**Solution:** 
- Verify all 3 Vonage variables are set in Vercel
- Check for typos in variable names
- Ensure you redeployed after adding variables

### Error: "Failed to send SMS"
**Solution:**
- Check Vonage account has credits
- Verify Zimbabwe is a supported country
- Check API credentials are correct
- Look at Vercel function logs for detailed error

### Error: Still getting CORS error
**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Verify the deployment is using the latest code
- Check Network tab to see if it's still using absolute URL

### SMS Not Received
**Possible Causes:**
1. **Vonage Account Issue**:
   - Low or no credits
   - Account not activated
   - Trial account restrictions

2. **Phone Number Format**:
   - Must include country code: `+263771234567`
   - No spaces or special characters in database
   - Check the "Full number" display in the modal

3. **Carrier Issues**:
   - Some carriers block international SMS
   - Sender ID not registered in Zimbabwe
   - Network delays (can take 1-2 minutes)

4. **Vonage Configuration**:
   - From number not verified
   - SMS service not enabled for your account
   - API restrictions on your account

## Vonage Account Checklist

Before testing, verify in Vonage Dashboard:

- [ ] Account is active (not trial expired)
- [ ] Account has sufficient credits ($5+ recommended)
- [ ] SMS API is enabled
- [ ] API Key and Secret are correct
- [ ] Zimbabwe (+263) is in your allowed countries list
- [ ] Sender ID is configured (if required by Zimbabwe regulations)
- [ ] No IP restrictions on your API key

## Alternative: Use Textbelt for Testing

If Vonage is still having issues, you can temporarily use Textbelt for testing:

```env
SMS_PROVIDER=textbelt
TEXTBELT_API_KEY=textbelt
```

**Note:** Textbelt free tier allows 1 SMS per day per phone number. Good for testing only.

## Files Modified

1. ✅ `src/lib/buyer-services.ts` - Fixed CORS issue with relative URL
2. ✅ `src/app/api/payments/ecocash/initiate/route.ts` - Updated callback URL fallback
3. ✅ `VERCEL_ENV_SETUP.md` - Detailed Vercel setup guide (created)
4. ✅ `SMS_ISSUE_FIX_SUMMARY.md` - This comprehensive guide (created)

## Next Steps

1. **Immediate Actions**:
   - [ ] Update Vercel environment variables (see Step 2 above)
   - [ ] Redeploy your application
   - [ ] Test phone verification

2. **Verification**:
   - [ ] Commit and push the code changes
   - [ ] Test SMS sending with a real phone number
   - [ ] Check Vercel logs for any errors
   - [ ] Verify Vonage dashboard shows SMS sent

3. **Optional Enhancements**:
   - [ ] Set up Vonage webhooks for delivery receipts
   - [ ] Add SMS usage monitoring
   - [ ] Configure backup SMS provider (Twilio/MessageBird)
   - [ ] Add rate limiting for SMS sends

## Summary

**What was wrong:**
- CORS error due to using absolute URL with outdated domain
- Missing Vonage configuration in production environment

**What I fixed:**
- Changed API calls to use relative URLs (no more CORS issues)
- Updated fallback domain references to your new custom domain

**What you need to do:**
1. Add Vonage credentials to Vercel environment variables
2. Set `SMS_PROVIDER=vonage` in Vercel
3. Update `NEXT_PUBLIC_APP_URL=https://www.mukambagateway.com` in Vercel
4. Redeploy your application

After completing these steps, SMS verification should work perfectly! 🎉

## Support Resources

- **Vonage Documentation**: https://developer.vonage.com/messaging/sms/overview
- **Vonage Dashboard**: https://dashboard.nexmo.com
- **Vercel Docs - Environment Variables**: https://vercel.com/docs/projects/environment-variables
- **Zimbabwe SMS Regulations**: Check local carrier requirements for sender IDs

---

**Questions?** Check the Vercel logs first, then the Vonage dashboard for delivery status.



