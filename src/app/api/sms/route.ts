import { NextRequest, NextResponse } from 'next/server';
import { sendSms, buildOtpMessage } from '@/lib/sms-providers';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otpCode, message } = await req.json();

    console.log('SMS API called with:', { phoneNumber, otpCode, message });
    console.log('Environment variables:', {
      SMS_PROVIDER: process.env.SMS_PROVIDER,
      TEXTBELT_API_KEY: process.env.TEXTBELT_API_KEY,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME
    });

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: 'phoneNumber is required' }, { status: 400 });
    }

    const text = message || (otpCode ? buildOtpMessage(otpCode) : null);
    if (!text) {
      return NextResponse.json({ success: false, error: 'otpCode or message is required' }, { status: 400 });
    }

    console.log('Sending SMS to:', phoneNumber, 'with text:', text);
    const result = await sendSms(phoneNumber, text);
    console.log('SMS result:', result);
    
    const status = result.success ? 200 : 502;

    return NextResponse.json({ success: result.success, messageId: result.messageId, provider: result.provider, error: result.error }, { status });
  } catch (error: any) {
    console.error('SMS API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unexpected error' }, { status: 500 });
  }
}


