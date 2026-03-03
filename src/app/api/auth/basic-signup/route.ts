import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendConfirmationEmail } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Missing required signup fields' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const normalizedEmail = String(email).toLowerCase().trim();

    // Attempt user creation first. If the email is a duplicate Supabase returns a
    // clear error which we surface to the user, removing the need for a separate
    // pre-flight DB round trip on the hot path.
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
        app_type: 'fintech',
      },
    });

    if (createError || !createData.user) {
      const msg = createError?.message ?? '';
      const isDuplicate =
        msg.toLowerCase().includes('already registered') ||
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('duplicate') ||
        msg.toLowerCase().includes('unique') ||
        createError?.status === 422;

      if (isDuplicate) {
        return NextResponse.json(
          {
            success: false,
            error: 'This email is already registered. Please sign in instead or use a different email.',
          },
          { status: 409 }
        );
      }

      console.error('Error creating user in basic-signup:', createError);
      return NextResponse.json(
        { success: false, error: msg || 'Failed to create account' },
        { status: 500 }
      );
    }

    // Generate token and persist it before responding. The email send is fire-and-forget
    // so the user sees the success popup immediately — the email arrives seconds later.
    const confirmationToken = crypto.randomUUID();
    const { error: tokenInsertError } = await supabaseAdmin.from('email_confirmations').insert({
      user_id: createData.user.id,
      token: confirmationToken,
      email: normalizedEmail,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    if (tokenInsertError) {
      console.error('Failed to store confirmation token in basic-signup:', tokenInsertError);
      return NextResponse.json(
        { success: false, error: 'Failed to initialize email confirmation' },
        { status: 500 }
      );
    }

    // Fire confirmation email in background — do not block the response on it.
    // The resend-confirmation flow is the safety net if this fails.
    sendConfirmationEmail(normalizedEmail, firstName, confirmationToken).catch((err) => {
      console.error('Background confirmation email send failed:', err);
    });

    return NextResponse.json({
      success: true,
      user: createData.user,
    });
  } catch (error) {
    console.error('Error in basic-signup API:', error);
    return NextResponse.json(
      { success: false, error: 'Signup failed. Please try again.' },
      { status: 500 }
    );
  }
}
