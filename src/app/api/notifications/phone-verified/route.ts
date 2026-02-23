import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { sendTransactionalTemplateEmail, getAppUrl } from '@/lib/transactional-email-service';
import { PhoneVerifiedEmailTemplate } from '@/lib/email-templates/phone-verified';
import * as React from 'react';

const schema = z.object({
  user_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { user_id } = schema.parse(body);

    const supabase = createServiceClient();
    const { data: user } = await supabase
      .from('user_profiles')
      .select('first_name, email, phone')
      .eq('id', user_id)
      .single();

    const email = (user as any)?.email as string | undefined;
    const firstName = ((user as any)?.first_name as string | undefined) || 'there';
    const phone = (user as any)?.phone as string | undefined;

    if (email) {
      let appUrl: string | null = null;
      try {
        appUrl = getAppUrl();
      } catch (e) {
        console.error('NEXT_PUBLIC_APP_URL missing; skipping CTA links:', e);
      }

      await sendTransactionalTemplateEmail({
        to: [email],
        subject: 'Phone verification complete',
        react: React.createElement(PhoneVerifiedEmailTemplate, {
          firstName,
          phoneNumber: phone,
          cta: appUrl ? { label: 'Open your dashboard', url: `${appUrl}/?section=overview` } : undefined,
        }),
        tags: ['phone_verified'],
        metadata: { user_id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.issues }, { status: 400 });
    }
    console.error('POST /api/notifications/phone-verified error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

