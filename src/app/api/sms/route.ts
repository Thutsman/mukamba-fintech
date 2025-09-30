import { NextRequest, NextResponse } from 'next/server';
import { sendSms, buildOtpMessage } from '@/lib/sms-providers';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otpCode, message } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: 'phoneNumber is required' }, { status: 400 });
    }

    const text = message || (otpCode ? buildOtpMessage(otpCode) : null);
    if (!text) {
      return NextResponse.json({ success: false, error: 'otpCode or message is required' }, { status: 400 });
    }

    const result = await sendSms(phoneNumber, text);
    const status = result.success ? 200 : 502;

    return NextResponse.json({ success: result.success, messageId: result.messageId, provider: result.provider, error: result.error }, { status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unexpected error' }, { status: 500 });
  }
}


