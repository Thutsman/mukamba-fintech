import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validatePassword } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Reset token is required' }, { status: 400 });
    }

    if (!newPassword) {
      return NextResponse.json({ success: false, error: 'New password is required' }, { status: 400 });
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      }, { status: 400 });
    }

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify token exists and hasn't expired
    const { data: resetData, error: fetchError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .single();

    if (fetchError || !resetData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired reset token' 
      }, { status: 404 });
    }

    // Check if token has already been used
    if (resetData.used_at) {
      return NextResponse.json({ 
        success: false, 
        error: 'This reset link has already been used' 
      }, { status: 400 });
    }

    // Check if token has expired
    if (new Date() > new Date(resetData.expires_at)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Reset link has expired. Please request a new one.' 
      }, { status: 410 });
    }

    // Update user's password using Supabase admin
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      resetData.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Failed to update user password:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to reset password. Please try again.' 
      }, { status: 500 });
    }

    // Mark token as used
    const { error: markUsedError } = await supabase
      .from('password_resets')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (markUsedError) {
      console.error('Failed to mark token as used:', markUsedError);
      // Don't fail the request - password was successfully updated
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password has been successfully reset' 
    });

  } catch (error) {
    console.error('Error in reset-password:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred while resetting your password' 
    }, { status: 500 });
  }
}
