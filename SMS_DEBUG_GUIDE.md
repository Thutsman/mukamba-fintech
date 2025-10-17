# 🔧 SMS Debug Guide for Vonage Configuration

## Current Issue Analysis

You have Vonage properly configured in Vercel, but SMS is still failing. Here are the most likely causes:

## 🎯 **Potential Issues & Solutions**

### 1. **VONAGE_FROM_NUMBER Format Issue**
**Problem**: Your `VONAGE_FROM_NUMBER` might not be in the correct format for Zimbabwe.

**Check your VONAGE_FROM_NUMBER value:**
- ✅ **Good**: `Mukamba` (alphanumeric sender ID)
- ✅ **Good**: `+263XXXXXXXXXX` (Zimbabwe virtual number)
- ❌ **Bad**: `263XXXXXXXXXX` (missing +)
- ❌ **Bad**: `MUKAMBA` (too long, max 11 chars)

### 2. **Zimbabwe SMS Regulations**
**Problem**: Zimbabwe has strict SMS regulations. Alphanumeric sender IDs might not work.

**Solutions:**
1. **Try a different sender ID**: Change `VONAGE_FROM_NUMBER` to `Mukamba` (shorter)
2. **Purchase a Zimbabwe virtual number** from Vonage
3. **Test with a different country first** (e.g., US number)

### 3. **Phone Number Format**
**Problem**: The phone number `+263779035404` might need formatting.

**Current format**: `+263779035404`
**Should be**: `+263779035404` (already correct)

## 🧪 **Testing Steps**

### Step 1: Check Environment Variables
1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Verify these values**:
   ```
   SMS_PROVIDER=vonage
   VONAGE_API_KEY=your-key-here
   VONAGE_API_SECRET=your-secret-here
   VONAGE_FROM_NUMBER=Mukamba
   ```

### Step 2: Test SMS API Directly
1. **Open browser console** on your live site
2. **Run this test**:
   ```javascript
   fetch('/api/sms', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       phoneNumber: '+263779035404',
       otpCode: '123456',
       message: 'Test SMS from Mukamba'
     })
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error);
   ```

### Step 3: Check Vercel Function Logs
1. **Go to Vercel Dashboard** → Your Project → Functions
2. **Click on the latest deployment**
3. **Check the logs** for SMS API calls
4. **Look for these messages**:
   - `SMS API called with:`
   - `Environment variables:`
   - `Vonage: Checking configuration...`
   - `Vonage response status:`
   - `Vonage response data:`

## 🔧 **Quick Fixes to Try**

### Fix 1: Update VONAGE_FROM_NUMBER
```bash
# In Vercel Environment Variables, change:
VONAGE_FROM_NUMBER=Mukamba
# to:
VONAGE_FROM_NUMBER=Mukamba
```

### Fix 2: Test with Different Phone Number
Try testing with a US number first:
```javascript
// Test with US number
phoneNumber: '+1234567890'
```

### Fix 3: Check Vonage Account Status
1. **Go to**: https://dashboard.nexmo.com/
2. **Check account status**
3. **Verify API key permissions**
4. **Check SMS credits/balance**

## 📋 **Debugging Checklist**

- [ ] Environment variables are set in Vercel
- [ ] Application has been redeployed after setting variables
- [ ] VONAGE_FROM_NUMBER is set to `Mukamba`
- [ ] Vonage API credentials are valid
- [ ] Account has SMS credits
- [ ] Tested with different phone number
- [ ] Checked Vercel function logs
- [ ] Verified phone number format (+263...)

## 🚨 **Common Vonage Issues**

### Issue 1: "Invalid sender ID"
**Solution**: Change `VONAGE_FROM_NUMBER` to a shorter name like `Mukamba`

### Issue 2: "Destination number not supported"
**Solution**: Try with a different country code first (US: +1, UK: +44)

### Issue 3: "Insufficient credits"
**Solution**: Add credits to your Vonage account

### Issue 4: "API key not authorized"
**Solution**: Verify your API key and secret are correct

## 🎯 **Next Steps**

1. **Check your VONAGE_FROM_NUMBER value** in Vercel
2. **Test the SMS API directly** using the browser console
3. **Check Vercel function logs** for detailed error messages
4. **Try with a different phone number** (US/UK) to isolate the issue
5. **Verify your Vonage account** has sufficient credits

## 📞 **Support Resources**

- **Vonage Dashboard**: https://dashboard.nexmo.com/
- **Vonage SMS API Docs**: https://developer.nexmo.com/messaging/sms/overview
- **Zimbabwe SMS Regulations**: Check local telecom regulations

---

**Ready to test?** Deploy these changes and try the phone verification again!
