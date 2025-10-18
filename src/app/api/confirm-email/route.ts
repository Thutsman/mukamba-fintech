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

    // 6. Fetch user profile data for auto-login
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', confirmationData.user_id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // 7. Return user data for auto-login
    return NextResponse.json({ 
      success: true, 
      message: 'Email confirmed successfully',
      user: {
        id: confirmationData.user_id,
        email: confirmationData.email,
        firstName: profileData?.first_name || updateData.user?.user_metadata?.first_name || 'User',
        lastName: profileData?.last_name || updateData.user?.user_metadata?.last_name || '',
        phone: profileData?.phone || updateData.user?.user_metadata?.phone || '',
        level: profileData?.user_level === 'verified_buyer' || profileData?.user_level === 'verified_seller' ? 'verified' : 'basic',
        roles: profileData?.user_role === 'admin' ? ['admin'] : 
               profileData?.user_role === 'seller' ? ['seller'] : 
               profileData?.user_role === 'buyer' ? ['buyer'] : [],
        is_phone_verified: profileData?.is_phone_verified || false,
        isIdentityVerified: profileData?.is_identity_verified || false,
        isFinanciallyVerified: profileData?.is_financially_verified || false,
        isPropertyVerified: profileData?.is_property_verified || false,
        isAddressVerified: profileData?.is_address_verified || false,
        kyc_level: profileData?.kyc_level || 'none',
        buyer_type: profileData?.buyer_type || undefined,
        kycStatus: 'none',
        createdAt: updateData.user?.created_at ? new Date(updateData.user.created_at) : new Date()
      }
    });

  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred during confirmation' 
    }, { status: 500 });
  }
}

