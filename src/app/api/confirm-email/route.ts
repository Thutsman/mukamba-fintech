import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    // Create Supabase admin client (with service role key)
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

    // 1. Verify token exists and hasn't expired
    const { data: confirmationData, error: fetchError } = await supabaseAdmin
      .from('email_confirmations')
      .select('*')
      .eq('token', token)
      .single();

    if (fetchError || !confirmationData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired confirmation link' 
      }, { status: 404 });
    }

    // 2. Check if already confirmed
    if (confirmationData.confirmed_at) {
      return NextResponse.json({ 
        success: true, 
        alreadyConfirmed: true,
        message: 'Email already confirmed' 
      });
    }

    // 3. Check expiration
    if (new Date() > new Date(confirmationData.expires_at)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Confirmation link has expired' 
      }, { status: 410 });
    }

    // 4. Confirm user's email in Supabase Auth
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      confirmationData.user_id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error('Failed to confirm user in auth:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to confirm email' 
      }, { status: 500 });
    }

    // 5. Mark as confirmed in our custom table
    const { error: markConfirmedError } = await supabaseAdmin
      .from('email_confirmations')
      .update({ confirmed_at: new Date().toISOString() })
      .eq('token', token);

    if (markConfirmedError) {
      console.error('Failed to update confirmation record:', markConfirmedError);
    }

    // 6. Generate an access token for auto sign-in
    // Create a short-lived session token that the client can use to sign in
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: updateData.user.email!,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`
      }
    });

    if (sessionError) {
      console.error('Failed to generate session token:', sessionError);
      // Still return success since email was confirmed
      return NextResponse.json({ 
        success: true, 
        message: 'Email confirmed successfully',
        userId: confirmationData.user_id
      });
    }

    // Extract tokens from the magic link URL
    const actionLink = sessionData.properties.action_link;
    const url = new URL(actionLink);
    const accessToken = url.searchParams.get('access_token');
    const refreshToken = url.searchParams.get('refresh_token');

    return NextResponse.json({ 
      success: true, 
      message: 'Email confirmed successfully',
      userId: confirmationData.user_id,
      accessToken: accessToken,
      refreshToken: refreshToken
    });

  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred during confirmation' 
    }, { status: 500 });
  }
}

