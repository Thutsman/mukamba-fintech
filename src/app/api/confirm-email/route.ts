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

    // 2. If already confirmed, still try to generate a magic link to create a session
    if (confirmationData.confirmed_at) {
      try {
        const { data: userData, error: fetchUserError } = await supabaseAdmin.auth.admin.getUserById(confirmationData.user_id);
        if (fetchUserError) {
          console.error('Failed to fetch user for magic link (already confirmed):', fetchUserError);
        }
        let magicLink: string | null = null;
        if (userData?.user?.email) {
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: userData.user.email,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
            }
          });
          if (linkError) {
            console.error('Failed to generate magic link (already confirmed):', linkError);
          } else {
            magicLink = linkData?.properties?.action_link || null;
          }
        }
        return NextResponse.json({ 
          success: true, 
          alreadyConfirmed: true,
          message: 'Email already confirmed',
          magicLink
        });
      } catch (e) {
        console.error('Error generating magic link for already-confirmed user:', e);
        return NextResponse.json({ 
          success: true, 
          alreadyConfirmed: true,
          message: 'Email already confirmed'
        });
      }
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

    // 6. Generate a Supabase magic link to create a client session immediately
    //    and redirect back to our app, where AuthSystem can route to ProfileDashboard
    try {
      // Fetch the user's email to generate a magic link
      const { data: userData, error: fetchUserError } = await supabaseAdmin.auth.admin.getUserById(confirmationData.user_id);
      if (fetchUserError) {
        console.error('Failed to fetch user for magic link:', fetchUserError);
      }

      let magicLink: string | null = null;
      if (userData?.user?.email) {
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: userData.user.email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
          }
        });
        if (linkError) {
          console.error('Failed to generate magic link:', linkError);
        } else {
          magicLink = linkData?.properties?.action_link || null;
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Email confirmed successfully',
        magicLink
      });
    } catch (e) {
      console.error('Error generating magic link after confirmation:', e);
      return NextResponse.json({ 
        success: true, 
        message: 'Email confirmed successfully'
      });
    }

  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred during confirmation' 
    }, { status: 500 });
  }
}

