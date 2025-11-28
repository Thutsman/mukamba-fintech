# Admin Password Update Guide

This guide explains how to update the admin user password to `Adm1n`.

## Method 1: Using the Script (Recommended)

### Prerequisites
- Node.js installed
- Access to `.env.local` file with Supabase credentials

### Steps

1. **Ensure your `.env.local` file has the required variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Run the script:**
   ```bash
   node scripts/update-admin-password.js
   ```

3. **Verify the update:**
   - The script will output success/error messages
   - Try signing in with:
     - Email: `admin@mukamba.com`
     - Password: `Adm1n`

## Method 2: Using Supabase Dashboard (Alternative)

If you prefer to update the password directly in Supabase:

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Access Authentication:**
   - Go to **Authentication** → **Users** in the left sidebar

3. **Find the Admin User:**
   - Search for `admin@mukamba.com`
   - Click on the user to open details

4. **Update Password:**
   - Click **"Reset Password"** or **"Update User"**
   - Set the new password to: `Adm1n`
   - Save changes

5. **Verify:**
   - Try signing in with the new password

## Method 3: Using Supabase SQL Editor (Advanced)

You can also use the Supabase SQL Editor to run a script, but you'll need to use the Admin API. The script method (Method 1) is easier.

## Current Admin Credentials

- **Email:** `admin@mukamba.com`
- **Password:** `Adm1n`

## Troubleshooting

### Script fails with "Missing Supabase configuration"
- Ensure `.env.local` exists in the project root
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Check that the service role key has admin permissions

### Script fails with "User not found"
- The admin user may not exist yet
- Create the user first in Supabase Dashboard → Authentication → Users → Add User
- Then run the script again

### Password update succeeds but login fails
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Verify the email is exactly `admin@mukamba.com` (case-sensitive)

## Security Notes

- The service role key has full admin access - keep it secure
- Never commit `.env.local` to version control
- Consider rotating passwords periodically
- Use strong passwords in production environments

