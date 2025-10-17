# 🚨 URGENT: SMS Verification Fix for BuyerPhoneVerificationModal

## Current Error
```
Failed to send SMS: Edge Function returned a non-2xx status code
POST https://www.mukambagateway.com/api/sms 502 (Bad Gateway)
POST https://kiptlccxjvbxcwspozwz.supabase.co/functions/v1/send-sms 500 (Internal Server Error)
```

## 🎯 Root Cause
Your SMS provider environment variables are **NOT configured** in Vercel, causing both the primary API route and fallback Edge Function to fail.

## ✅ IMMEDIATE SOLUTION

### Option 1: Quick Fix with Textbelt (Free, 1 SMS/day)
1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `mukamba-fintech`
3. **Go to**: Settings → Environment Variables
4. **Add these variables**:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `SMS_PROVIDER` | `textbelt` | ✅ Production ✅ Preview ✅ Development |
| `TEXTBELT_API_KEY` | `textbelt` | ✅ Production ✅ Preview ✅ Development |

5. **Redeploy** your application

### Option 2: Production Setup with Vonage (Recommended)
1. **Get Vonage Credentials**:
   - Go to: https://dashboard.nexmo.com/
   - Login and get your API Key and API Secret

2. **Configure Vercel Environment Variables**:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `SMS_PROVIDER` | `vonage` | ✅ Production ✅ Preview ✅ Development |
| `VONAGE_API_KEY` | `your-vonage-api-key` | ✅ Production ✅ Preview ✅ Development |
| `VONAGE_API_SECRET` | `your-vonage-api-secret` | ✅ Production ✅ Preview ✅ Development |
| `VONAGE_FROM_NUMBER` | `Mukamba` | ✅ Production ✅ Preview ✅ Development |

3. **Redeploy** your application

## 🔧 Alternative Providers

### Twilio Setup
```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=your-twilio-number
```

### MessageBird Setup
```bash
SMS_PROVIDER=messagebird
MESSAGEBIRD_ACCESS_KEY=your-access-key
MESSAGEBIRD_ORIGINATOR=your-originator
```

## 🧪 Testing After Fix

1. **Deploy the changes**
2. **Test phone verification**:
   - Go to a property details page
   - Try to verify your phone number
   - Check browser console for success messages

## 📋 Verification Checklist

- [ ] Environment variables added to Vercel
- [ ] Application redeployed
- [ ] SMS provider credentials are valid
- [ ] Phone verification works in production
- [ ] No more 502/500 errors in console

## 🚨 Important Notes

- **Textbelt**: Free but limited (1 SMS/day with 'textbelt' key)
- **Vonage**: Paid but reliable, good for Zimbabwe (+263)
- **Twilio**: Paid but very reliable globally
- **MessageBird**: Paid, good for international

Choose based on your budget and requirements!
