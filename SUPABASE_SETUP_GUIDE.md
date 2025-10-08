# Supabase Setup Guide

## Issue: "Supabase service role credentials not configured"

The bidding activity is not showing because the Supabase service role key is not configured. Here's how to fix it:

## Quick Fix Steps:

### 1. Create Environment File
Create a `.env.local` file in your project root with the following content:

```bash
# Copy your actual Supabase credentials here
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Get Your Supabase Credentials

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### 3. Restart Development Server
After adding the environment variables:
```bash
npm run dev
```

## Alternative: Use Mock Data (Temporary)

If you want to test the bidding activity without setting up Supabase, the debug endpoint now includes mock data that will show sample offers.

## Testing the Fix

1. Visit: `http://localhost:3000/api/debug/offers`
2. You should see either:
   - Real data from your Supabase database, OR
   - Mock data for testing

3. Visit your property page and check the bidding activity section

## Expected Result

After proper setup, the bidding activity should show:
- Total Offers: [actual count]
- Highest Offer: [actual highest price]
- Recent offers list with timestamps

## Troubleshooting

- **Still showing "No offers yet"**: Check that the property ID in the URL matches the `property_id` in your `property_offers` table
- **Database connection issues**: Verify your Supabase credentials are correct
- **RLS policies**: Make sure your Supabase RLS policies allow reading from `property_offers` table
