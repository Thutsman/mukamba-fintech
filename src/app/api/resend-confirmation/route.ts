import { NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/lib/email-service';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find user by email
    const { data: user, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      return NextResponse.json({ success: false, error: 'Failed to find user' }, { status: 500 });
    }

    const targetUser = user.users.find(u => u.email === email);
    
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Check if user is already confirmed
    if (targetUser.email_confirmed_at) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is already confirmed' 
      }, { status: 400 });
    }

    // Generate new confirmation token
    const confirmationToken = crypto.randomUUID();
    
    // Store new token in database (replace any existing)
    await supabase
      .from('email_confirmations')
      .upsert({
        user_id: targetUser.id,
        token: confirmationToken,
        email: email,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        confirmed_at: null // Reset confirmation status
      });

    // Send new confirmation email
    const result = await sendConfirmationEmail(
      email, 
      targetUser.user_metadata?.first_name || 'User', 
      confirmationToken
    );

    if (result.success) {
      return NextResponse.json({ success: true, message: 'New confirmation email sent' });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in resend-confirmation:', error);
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 });
  }
}
