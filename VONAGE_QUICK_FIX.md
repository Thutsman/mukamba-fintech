# 🚨 QUICK FIX: Vonage SMS Not Working

## Your Current Error:
```
Failed to send SMS: Edge Function returned a non-2xx status code
POST https://www.mukambagateway.com/api/sms 502 (Bad Gateway)
```

## 🎯 Root Cause:
Your Vonage API credentials are not configured in your **Vercel environment variables**, even though you've purchased the paid tier.

---

## ✅ IMMEDIATE ACTION REQUIRED

### Step 1: Get Your Vonage Credentials (5 minutes)

1. Go to: https://dashboard.nexmo.com/
2. Log in with your Vonage account
3. On the dashboard, you'll see:
   - **API Key**: (e.g., `a1b2c3d4`)
   - **API Secret**: (e.g., `AbCdEfGhIjKlMnOp`)
4. **Copy both values** (you'll need them in Step 2)

### Step 2: Configure Vercel Environment Variables (5 minutes)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select** your `mukamba-fintech` project
3. **Click**: Settings → Environment Variables
4. **Add these 4 variables** (click "Add New" for each):

   | Variable Name | Value | Environments |
   |--------------|--------|--------------|
   | `SMS_PROVIDER` | `vonage` | ✅ Production ✅ Preview ✅ Development |
   | `VONAGE_API_KEY` | `paste-your-api-key-here` | ✅ Production ✅ Preview ✅ Development |
   | `VONAGE_API_SECRET` | `paste-your-api-secret-here` | ✅ Production ✅ Preview ✅ Development |
   | `VONAGE_FROM_NUMBER` | `Mukamba` | ✅ Production ✅ Preview ✅ Development |

   **Important**: 
   - Check ALL three environment checkboxes (Production, Preview, Development) for each variable
   - For `VONAGE_FROM_NUMBER`, use `Mukamba` initially. If it doesn't work for Zimbabwe, you may need to purchase a virtual number.

### Step 3: Redeploy Your Application (2 minutes)

**Option A: From Vercel Dashboard**
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. Click **Redeploy** again to confirm

**Option B: From Git (Alternative)**
```bash
git commit --allow-empty -m "Trigger redeploy for Vonage config"
git push origin main
```

### Step 4: Test SMS (2 minutes)

1. Wait for deployment to complete (~2-3 minutes)
2. Go to: https://www.mukambagateway.com
3. Try the phone verification again
4. Enter your number: `+263 779 035 404`
5. Click "Send Verification Code"

---

## 🔍 Verification Checklist

After completing the steps above, verify:

- [ ] All 4 environment variables are set in Vercel
- [ ] Each variable is enabled for all 3 environments
- [ ] Application has been redeployed
- [ ] Deployment status shows "Ready" (green)
- [ ] SMS test sends successfully

---

## 📊 How to Monitor SMS Delivery

### In Vonage Dashboard:
1. Go to: https://dashboard.nexmo.com/
2. Click **SMS** → **Logs**
3. You'll see all sent messages with delivery status
4. Each successful SMS will show:
   - ✅ Status: "delivered"
   - Phone number
   - Timestamp
   - Cost

### In Browser Console:
Look for these logs after sending SMS:
```
SMS Provider selected: vonage
Vonage: Checking configuration... {hasKey: true, hasSecret: true, hasFrom: true}
Vonage: Sending SMS to +26377903540 from Mukamba
Vonage response status: 200
Vonage response data: {messages: [{status: "0", message-id: "..."}]}
```

---

## ⚠️ Troubleshooting

### Still Getting 502 Error?
**Check:**
1. ✅ Did you redeploy after adding variables?
2. ✅ Are variables set for "Production" environment?
3. ✅ Did you wait for deployment to complete?

**Quick Test**: Check if variables are loaded
```bash
# In your browser console on www.mukambagateway.com
console.log('Provider should be vonage:', process.env.SMS_PROVIDER)
```

### "Vonage not configured" Error?
**This means** one or more environment variables are missing.

**Fix:**
1. Go back to Vercel → Settings → Environment Variables
2. Verify ALL 4 variables exist:
   - SMS_PROVIDER
   - VONAGE_API_KEY
   - VONAGE_API_SECRET
   - VONAGE_FROM_NUMBER
3. Click each to verify they're set for "Production"
4. Redeploy again

### SMS Sent But Not Received?
**Possible reasons:**
1. **Sender ID blocked in Zimbabwe**: Try using a virtual number instead
   - Go to Vonage Dashboard → Numbers → Buy Numbers
   - Search for Zimbabwe (+263) numbers
   - Purchase one
   - Update `VONAGE_FROM_NUMBER` to the purchased number (e.g., `+263123456789`)

2. **Account balance**: Check Vonage dashboard for remaining credits

3. **Number format**: Ensure recipient number is in E.164 format
   - ✅ Correct: `+26377903540`
   - ❌ Wrong: `077903540`

---

## 💡 Zimbabwe-Specific Tips

Zimbabwe has strict SMS regulations:

1. **Alphanumeric Sender IDs** (like "Mukamba") may not work
   - Some carriers block them
   - Solution: Purchase a Zimbabwe virtual number from Vonage

2. **Virtual Number Recommended**:
   ```
   VONAGE_FROM_NUMBER=+263XXXXXXXXXX
   ```
   - Costs ~$1-5/month
   - 100% delivery rate
   - No carrier blocking

3. **Alternative**: Test with a different country first
   - Try with a South African number: `+27XXXXXXXXX`
   - If it works, the issue is Zimbabwe-specific regulations

---

## 🎯 Expected Result After Fix

✅ **Phone verification modal should:**
1. Accept phone number input
2. Send OTP code via Vonage
3. Show "Code sent successfully" message
4. User receives SMS with 6-digit code
5. User enters code and verification succeeds

✅ **In Vonage Dashboard, you should see:**
- SMS logged under "SMS → Logs"
- Status: "delivered"
- Cost deducted from balance

---

## 📞 Need Help?

If issues persist after following this guide:

1. **Check Vonage Status Page**: https://status.nexmo.com/
2. **Vonage Support**: https://help.nexmo.com/
3. **Check our detailed guide**: `VONAGE_SMS_SETUP_GUIDE.md`

---

## ⏱️ Total Time Required: ~15 minutes
1. Get credentials: 5 min
2. Configure Vercel: 5 min
3. Redeploy: 2 min
4. Test: 2 min

