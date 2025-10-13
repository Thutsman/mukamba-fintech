# Custom Email Configuration Guide

## Disable Supabase Automatic Confirmation Emails

To prevent users from receiving duplicate emails (one from Supabase and one from your custom Resend service), you need to disable Supabase's automatic confirmation emails.

### Steps to Configure in Supabase Dashboard:

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://app.supabase.com

2. **Open Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Email Templates"

3. **Disable Confirm Email Template (Option 1 - Recommended)**
   - Find the "Confirm signup" template
   - You can either:
     - **Remove the template content** (leave it blank)
     - **Or keep it as a backup** but ensure your custom email sends first

4. **Configure Email Auth Settings (Option 2)**
   - Go to Authentication → Settings → Auth Providers
   - Find "Email" provider
   - You can configure "Confirm email" to be disabled
   - **Note:** This might affect the entire auth flow, so Option 1 is safer

5. **Alternative: Use Supabase with Custom SMTP (Advanced)**
   - Go to Authentication → Settings → SMTP Settings
   - Configure with Resend's SMTP (if you prefer this route)
   - This way, all emails come from Resend but use Supabase's templates

## Recommended Approach (Hybrid)

The best approach is to **keep Supabase confirmation emails disabled** in production but enabled in development:

### In Supabase Dashboard:

1. **Go to Authentication → URL Configuration**
2. Set the "Site URL" to: `https://your-domain.com` (production) or `http://localhost:3001` (development)
3. Add redirect URLs under "Redirect URLs":
   - `http://localhost:3001/auth/confirm`
   - `https://your-domain.com/auth/confirm`

### Environment-Based Email Sending:

Your current setup already handles this - the custom email is sent via API route and won't fail the signup if it doesn't send.

## Verification Steps

After configuration:

1. **Test Signup Flow:**
   ```bash
   # Create a new test account
   - Sign up with a new email
   - You should receive ONLY the custom Mukamba Gateway branded email
   - No Supabase confirmation email should arrive
   ```

2. **Verify Email Delivery:**
   - Check your email inbox
   - Confirm you receive only one email with Mukamba Gateway branding
   - Click the confirmation link
   - Verify you're redirected to `/auth/confirm` page

3. **Check Logs:**
   - Open browser console
   - Look for "Custom confirmation email sent successfully" message
   - Check Resend dashboard for email delivery status

## Fallback Strategy

If Resend fails, users can still:
1. Request a new confirmation email (you can build a "Resend Email" feature)
2. Use Supabase's backup email (if you keep it enabled)
3. Contact support for manual verification

## Benefits of This Approach

✅ **Single branded email** - Better UX, no confusion
✅ **Full control** - You control the email design and content
✅ **Cost effective** - Resend: 3,000 free emails/month
✅ **Better deliverability** - Resend has excellent email delivery rates
✅ **Tracking** - You can track email opens, clicks in Resend dashboard
✅ **Flexibility** - Easy to update email content without touching Supabase

## Resend Dashboard Configuration

### 1. Add Your Domain (Recommended for Production)

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain"
3. Add your domain (e.g., `mukambagateway.com`)
4. Follow DNS configuration steps
5. Update email sender in `src/lib/email-service.ts`:
   ```typescript
   from: 'Mukamba Gateway <noreply@mukambagateway.com>'
   ```

### 2. For Development (Use Resend Test Domain)

- Current setup uses: `onboarding@resend.dev`
- This works for testing but shows "via resend.dev" in email clients
- Free and works immediately without domain verification

### 3. Monitor Email Delivery

- Go to [Resend Logs](https://resend.com/emails)
- View delivery status, opens, clicks
- Debug any email delivery issues

## Security Considerations

✅ **Token Expiration:** Tokens expire after 24 hours
✅ **Database Storage:** Tokens stored securely in Supabase
✅ **HTTPS Only:** Confirmation links use HTTPS in production
✅ **One-Time Use:** Tokens can only be used once (implement in Phase 5)
✅ **User Privacy:** Email addresses not exposed in URLs

## Troubleshooting

### Users Not Receiving Emails?

1. Check Resend dashboard for delivery status
2. Verify API key is correct in environment variables
3. Check spam/junk folders
4. Ensure email service is not blocked by firewall
5. Check Supabase logs for any errors

### Token Validation Fails?

1. Check if token has expired (24 hours)
2. Verify database connection
3. Check if token was already used
4. Inspect `email_confirmations` table in Supabase

### Resend Rate Limits?

- Free tier: 100 emails/day, 3,000/month
- If exceeded, either:
  - Upgrade to paid plan ($20/month for 50k emails)
  - Temporarily enable Supabase fallback emails

## Next Steps

After disabling Supabase emails, proceed with:
- ✅ Phase 5: Create Confirmation Handler
- ✅ Phase 6: Implement Access Restrictions  
- ✅ Phase 7: Update UI with confirmation banner
- ✅ Phase 8: End-to-end testing

