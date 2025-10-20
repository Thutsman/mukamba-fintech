import { NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email-service';
import { createClient } from '@supabase/supabase-js';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    // Rate limiting: max 3 requests per email per hour
    const now = Date.now();
    const rateLimitKey = `password_reset_${email}`;
    const rateLimitEntry = rateLimitStore.get(rateLimitKey);
    
    if (rateLimitEntry && now < rateLimitEntry.resetTime) {
      if (rateLimitEntry.count >= 3) {
        return NextResponse.json({ 
          success: false, 
          error: 'Too many password reset requests. Please try again in an hour.' 
        }, { status: 429 });
      }
      rateLimitEntry.count++;
    } else {
      rateLimitStore.set(rateLimitKey, { count: 1, resetTime: now + 60 * 60 * 1000 }); // 1 hour
    }

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error finding user:', userError);
      // Don't reveal if user exists for security
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, you will receive a password reset link.' 
      });
    }

    const targetUser = users.users.find(u => u.email === email);
    
    if (!targetUser) {
      // Don't reveal if user exists for security
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, you will receive a password reset link.' 
      });
    }

    // Generate secure reset token using Supabase
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
      }
    });

    if (linkError) {
      console.error('Error generating reset link:', linkError);
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, you will receive a password reset link.' 
      });
    }

    // Extract token from the link
    const resetUrl = new URL(linkData.properties.action_link);
    const token = resetUrl.searchParams.get('token');
    
    if (!token) {
      console.error('No token in generated link');
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, you will receive a password reset link.' 
      });
    }

    // Store token metadata in our database
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    const { error: insertError } = await supabase
      .from('password_resets')
      .insert({
        user_id: targetUser.id,
        token: token,
        email: email,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.error('Error storing password reset token:', insertError);
      // Continue anyway - the token is still valid
    }

    // Send custom branded email
    const result = await sendPasswordResetEmail(
      email, 
      targetUser.user_metadata?.first_name || 'User', 
      token
    );

    if (!result.success) {
      console.error('Failed to send password reset email:', result.error);
      // Don't fail the request - user still gets Supabase's default email
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, you will receive a password reset link.' 
    });

  } catch (error) {
    console.error('Error in request-password-reset:', error);
    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, you will receive a password reset link.' 
    });
  }
}
