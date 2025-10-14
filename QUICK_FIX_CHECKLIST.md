# Quick Fix Checklist - SMS Issue Resolution

## ✅ Code Changes (Already Done)
- [x] Fixed CORS issue in `buyer-services.ts` (changed to relative URL)
- [x] Updated Ecocash callback URL fallback to new domain
- [x] No linter errors introduced

## 🔧 Your Action Items (Required Now)

### 1. Update Vercel Environment Variables (5 minutes)

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Add/Update these 5 variables:**

```env
NEXT_PUBLIC_APP_URL=https://www.mukambagateway.com
SMS_PROVIDER=vonage
VONAGE_API_KEY=<your-key-from-vonage-dashboard>
VONAGE_API_SECRET=<your-secret-from-vonage-dashboard>
VONAGE_FROM_NUMBER=Mukamba
```

**For each variable:**
- Click "Add New" or edit existing
- Paste the variable name and value
- Select environment: **Production** (and optionally Preview/Development)
- Click Save

### 2. Get Vonage Credentials (If you don't have them)

1. Visit: https://dashboard.nexmo.com
2. Login to your account
3. Click your name (top right) → **API Settings**
4. Copy:
   - API Key (8 characters, alphanumeric)
   - API Secret (16 characters, alphanumeric)

### 3. Redeploy Application (1 minute)

**In Vercel:**
1. Go to **Deployments** tab
2. Click **...** (three dots) on the latest deployment
3. Select **Redeploy**
4. Click **Redeploy** to confirm
5. Wait for deployment to complete (~2-3 minutes)

### 4. Test SMS (2 minutes)

**Once deployed:**
1. Go to: https://www.mukambagateway.com
2. Navigate to any property details page
3. Click action that requires phone verification
4. Enter phone number: `+263 77 123 4567` (your Zimbabwe number)
5. Click "Send Verification Code"
6. **Expected:** SMS arrives within 30 seconds
7. Enter the 6-digit code
8. **Expected:** Verification successful

## 🔍 Verification Steps

### Check 1: Vercel Logs
**After testing SMS:**
1. Go to Vercel Dashboard → Logs
2. Look for:
   ```
   ✅ SMS Provider selected: vonage
   ✅ Vonage: Checking configuration... { hasKey: true, hasSecret: true, hasFrom: true }
   ✅ Vonage: Sending SMS to +263...
   ✅ SMS sent via API... Message ID: xxx
   ```

### Check 2: Browser Console
**While testing:**
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Look for `/api/sms` request
4. **Expected:** Status 200 OK
5. **Should NOT see:** CORS error

### Check 3: Vonage Dashboard
**After SMS sent:**
1. Go to: https://dashboard.nexmo.com/reports/sms
2. Check recent SMS logs
3. **Expected:** See your message with status "Delivered"

## 🚨 Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Still CORS error | Clear cache, hard refresh (Ctrl+Shift+R) |
| "Vonage not configured" | Check all 3 Vonage vars are set, redeploy |
| SMS not received | Check Vonage credits, verify phone format |
| 500 error | Check Vercel logs for detailed error |

## 📊 Success Indicators

**You'll know it's working when:**
- ✅ No CORS errors in browser console
- ✅ `/api/sms` returns 200 status
- ✅ SMS arrives on your phone within 30 seconds
- ✅ Vercel logs show "SMS sent via API"
- ✅ Vonage dashboard shows message delivered
- ✅ Phone verification modal shows "Verification successful"

## 📞 Need More Help?

**Read detailed guides:**
- `SMS_ISSUE_FIX_SUMMARY.md` - Comprehensive explanation
- `VERCEL_ENV_SETUP.md` - Detailed Vercel setup instructions

**Check Vonage:**
- Account credits: https://dashboard.nexmo.com/billing-and-payments
- SMS logs: https://dashboard.nexmo.com/reports/sms
- API settings: https://dashboard.nexmo.com/settings

**Check Vercel:**
- Deployment logs: Vercel Dashboard → Your Project → Logs
- Function logs: Filter by `/api/sms`

## ⏱️ Time Estimate

- **Environment variables setup:** 5 minutes
- **Redeploy:** 2-3 minutes
- **Testing:** 2 minutes
- **Total:** ~10 minutes

## 🎯 Expected Outcome

After completing all steps:
1. Phone verification works smoothly
2. SMS arrives within seconds
3. No CORS errors
4. Users can successfully verify their phones and contact sellers

---

**Start with Step 1 (Vercel Environment Variables) now!** 🚀



