# Vonage SMS Configuration Guide

## 🎯 Issue
Your SMS verification is failing because the Vonage API credentials aren't properly configured in your environment.

## ✅ Solution: Configure Vonage API Credentials

### Step 1: Get Your Vonage API Credentials

1. Go to [Vonage Dashboard](https://dashboard.nexmo.com/)
2. Log in with your Vonage account
3. From the dashboard, you'll find:
   - **API Key** (e.g., `a1b2c3d4`)
   - **API Secret** (e.g., `AbCdEfGhIjKlMnOp`)

### Step 2: Update Local Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# SMS Provider Configuration
SMS_PROVIDER=vonage

# Vonage API Configuration
VONAGE_API_KEY=your-actual-api-key-here
VONAGE_API_SECRET=your-actual-api-secret-here
VONAGE_FROM_NUMBER=Mukamba
```

**Important Notes about `VONAGE_FROM_NUMBER`:**

- **Alphanumeric Sender ID** (Recommended for testing): Use `"Mukamba"` or any name up to 11 characters
  - ✅ Works in most countries
  - ❌ May not work in Zimbabwe (+263) - check Vonage documentation
  
- **Virtual Number** (Best for production): Purchase a dedicated number from Vonage
  - Format: `+14155551234` (E.164 format)
  - ✅ Works worldwide
  - Costs vary by country

### Step 3: Update Vercel Environment Variables

Since you're deploying to Vercel (www.mukambagateway.com), you MUST add these to Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `mukamba-fintech`
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:

| Variable Name | Value | Environment |
|--------------|--------|-------------|
| `SMS_PROVIDER` | `vonage` | Production, Preview, Development |
| `VONAGE_API_KEY` | `your-actual-api-key` | Production, Preview, Development |
| `VONAGE_API_SECRET` | `your-actual-api-secret` | Production, Preview, Development |
| `VONAGE_FROM_NUMBER` | `Mukamba` or your number | Production, Preview, Development |

5. **Redeploy** your application after adding variables

### Step 4: Verify Configuration

After setting up the environment variables:

#### For Local Development:
```bash
# Restart your dev server
npm run dev
```

#### For Production (Vercel):
```bash
# Trigger a new deployment
git add .
git commit -m "Update environment variables for Vonage SMS"
git push origin main
```

Or manually redeploy from Vercel Dashboard → Deployments → Redeploy

### Step 5: Test SMS Sending

1. Go to your application
2. Try the phone verification flow
3. Check the browser console for logs
4. Check Vonage Dashboard → SMS → Logs for delivery status

## 🔍 Troubleshooting

### Error: "Vonage not configured"
- ✅ Check that `SMS_PROVIDER=vonage` in environment variables
- ✅ Verify `VONAGE_API_KEY` and `VONAGE_API_SECRET` are set
- ✅ Ensure `VONAGE_FROM_NUMBER` is set

### Error: "Invalid credentials"
- ❌ API Key or Secret is incorrect
- ✅ Copy credentials exactly from Vonage Dashboard
- ✅ No spaces or quotes in the values

### Error: "Invalid sender address"
- ❌ `VONAGE_FROM_NUMBER` format is incorrect
- ✅ For alphanumeric: Use 1-11 characters, no spaces
- ✅ For phone number: Use E.164 format (e.g., `+14155551234`)

### SMS Not Received
- Check Vonage Dashboard for delivery status
- Verify the recipient number is in E.164 format (e.g., `+26377903540`)
- Check your Vonage account balance
- For Zimbabwe numbers, you may need a registered sender ID

## 💰 Vonage Pricing (As of 2024)

- **Outbound SMS**: Varies by country
  - USA/Canada: ~$0.0075/SMS
  - Zimbabwe: ~$0.05-$0.08/SMS (check current rates)
- **Virtual Numbers**: $1-5/month depending on country
- **No monthly fees** for API usage

## 🌍 Zimbabwe-Specific Notes

Zimbabwe has specific SMS regulations:

1. **Sender ID Requirements**:
   - May require sender ID registration with local carriers
   - Alphanumeric sender IDs might be blocked
   - Virtual numbers are more reliable

2. **Recommended Setup for Zimbabwe**:
   ```bash
   # Option 1: Purchase a Zimbabwean virtual number from Vonage
   VONAGE_FROM_NUMBER=+263XXXXXXXXXX
   
   # Option 2: Use Vonage's shared number (if available)
   # Check Vonage docs for Zimbabwe
   ```

## 📚 Additional Resources

- [Vonage SMS API Documentation](https://developer.vonage.com/messaging/sms/overview)
- [Vonage Dashboard](https://dashboard.nexmo.com/)
- [Country-Specific SMS Requirements](https://help.nexmo.com/hc/en-us/articles/115011781468)
- [E.164 Phone Number Formatting](https://www.twilio.com/docs/glossary/what-e164)

## ✅ Quick Checklist

- [ ] Added `SMS_PROVIDER=vonage` to `.env.local`
- [ ] Added `VONAGE_API_KEY` to `.env.local`
- [ ] Added `VONAGE_API_SECRET` to `.env.local`
- [ ] Added `VONAGE_FROM_NUMBER` to `.env.local`
- [ ] Added all 4 variables to Vercel Dashboard
- [ ] Restarted local dev server
- [ ] Redeployed to Vercel
- [ ] Tested phone verification
- [ ] Verified SMS delivery in Vonage Dashboard

---

## 🚀 After Setup

Once configured, your SMS flow will:
1. ✅ Send OTP codes via Vonage
2. ✅ Work reliably in production
3. ✅ Support international numbers
4. ✅ Provide delivery tracking in Vonage Dashboard

