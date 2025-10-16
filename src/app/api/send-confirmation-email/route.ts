import { NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/lib/email-service';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, firstName, userId } = await request.json();

    // Generate confirmation token
    const confirmationToken = crypto.randomUUID();
    
    // Store token in database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from('email_confirmations')
      .insert({
        user_id: userId,
        token: confirmationToken,
        email: email,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      });

    // Send email
    const result = await sendConfirmationEmail(email, firstName, confirmationToken);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in send-confirmation-email:', error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

