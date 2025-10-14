# 📋 Vonage SMS Setup - Quick Reference Card

## 🔐 Your Vonage Credentials

Get from: https://dashboard.nexmo.com/

```
API Key:    __________________ (8 chars)
API Secret: __________________ (16 chars)
From Number: Mukamba (or your virtual number)
```

---

## ⚙️ Environment Variables to Set

### Local (.env.local file):
```bash
SMS_PROVIDER=vonage
VONAGE_API_KEY=your-api-key-here
VONAGE_API_SECRET=your-api-secret-here
VONAGE_FROM_NUMBER=Mukamba
```

### Vercel (vercel.com/dashboard):
| Variable | Value | Environments |
|----------|-------|--------------|
| SMS_PROVIDER | vonage | ✅ All |
| VONAGE_API_KEY | [your-key] | ✅ All |
| VONAGE_API_SECRET | [your-secret] | ✅ All |
| VONAGE_FROM_NUMBER | Mukamba | ✅ All |

---

## 🚀 Quick Commands

```bash
# Restart dev server after adding .env.local
npm run dev

# Force redeploy to Vercel
git commit --allow-empty -m "Update Vonage config"
git push origin main

# Test SMS API directly
curl -X POST https://www.mukambagateway.com/api/sms \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+263779035404","otpCode":"123456"}'
```

---

## ✅ Verification Checklist

- [ ] Vonage account active with credits
- [ ] API Key & Secret copied from dashboard
- [ ] `.env.local` created with 4 variables
- [ ] Vercel env vars set (all 4)
- [ ] All env vars enabled for "Production"
- [ ] Dev server restarted
- [ ] Vercel app redeployed
- [ ] SMS test successful
- [ ] Vonage logs show "delivered"

---

## 📊 Test Flow

1. Open: https://www.mukambagateway.com
2. Click property → "Make Offer"
3. Enter phone: `+263 779 035 404`
4. Click "Send Verification Code"
5. Check phone for SMS
6. Enter 6-digit code
7. Verify success ✅

---

## 🐛 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| 502 Bad Gateway | Missing env vars → Add to Vercel + redeploy |
| "Vonage not configured" | Check all 4 vars exist in Vercel |
| "Invalid credentials" | Verify API key/secret from dashboard |
| SMS not received | Try virtual number instead of "Mukamba" |

---

## 🌍 Zimbabwe-Specific

**Issue:** Alphanumeric sender IDs may be blocked

**Solution:** Buy Zimbabwe virtual number
1. Vonage Dashboard → Numbers → Buy
2. Search: Zimbabwe (+263)
3. Purchase number (~$1-5/month)
4. Update: `VONAGE_FROM_NUMBER=+263XXXXXXXXXX`

---

## 💰 Pricing

- SMS to Zimbabwe: ~$0.05-$0.08/message
- Virtual number: ~$1-5/month
- No monthly API fees

**Example:** 100 verifications/month = ~$5-8

---

## 📱 Phone Format

✅ **Correct:** `+26377903540`
❌ **Wrong:** `077903540` or `263779035404`

Always use E.164 format: `+[country][number]`

---

## 🔗 Quick Links

- Vonage Dashboard: https://dashboard.nexmo.com/
- SMS Logs: https://dashboard.nexmo.com/sms/logs
- Vercel Project: https://vercel.com/dashboard
- Buy Numbers: https://dashboard.nexmo.com/buy-numbers

---

## 📞 Test Numbers

- Zimbabwe: `+263 77 903 5404`
- Format: E.164 (`+` + country code + number)

---

## 🔍 Success Indicators

### Browser Console:
```
SMS Provider selected: vonage ✅
Vonage response status: 200 ✅
```

### Vonage Dashboard:
- SMS → Logs shows message ✅
- Status: "delivered" ✅

### Phone:
- SMS received with 6-digit code ✅

---

**Print this page for quick reference while setting up!** 📄

