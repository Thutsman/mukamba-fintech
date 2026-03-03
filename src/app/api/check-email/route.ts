import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to check if an email is already registered
 * This prevents duplicate account creation
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { available: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { available: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create Supabase admin client to check auth.users table
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check user_profiles table with a targeted query — avoids expensive listUsers() scan
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .ilike('email', email)
      .limit(1);

    if (profileError) {
      console.error('Error checking user profiles:', profileError);
      // On error, allow signup to proceed — basic-signup API does its own check
      return NextResponse.json({ available: true, message: 'Email is available' });
    }

    const profileExists = profiles && profiles.length > 0;

    return NextResponse.json({
      available: !profileExists,
      message: profileExists
        ? 'This email is already registered. Please sign in instead.'
        : 'Email is available'
    });

  } catch (error) {
    console.error('Error in check-email API:', error);
    return NextResponse.json(
      { available: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

