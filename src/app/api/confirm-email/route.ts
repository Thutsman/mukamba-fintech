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

    return NextResponse.json({ 
      success: true, 
      message: 'Email confirmed successfully' 
    });

  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred during confirmation' 
    }, { status: 500 });
  }
}

