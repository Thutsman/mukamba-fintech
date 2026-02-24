import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { sendTransactionalTemplateEmail, getAppUrl } from '@/lib/transactional-email-service';
import { PhoneVerifiedEmailTemplate } from '@/lib/email-templates/phone-verified';
import { AdminActionRequiredEmailTemplate } from '@/lib/email-templates/admin-action-required';
import { getAdminNotificationRecipients } from '@/lib/admin-notification-recipients';
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
      .select('first_name, last_name, email, phone')
      .eq('id', user_id)
      .single();

    const email = (user as any)?.email as string | undefined;
    const firstName = ((user as any)?.first_name as string | undefined) || 'there';
    const phone = (user as any)?.phone as string | undefined;
    const userFullName = `${(user as any)?.first_name || ''} ${(user as any)?.last_name || ''}`.trim();

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

    // Admin email (best-effort)
    try {
      const appUrl = (() => {
        try {
          return getAppUrl();
        } catch (e) {
          console.error('NEXT_PUBLIC_APP_URL missing; using fallback URL:', e);
          return 'https://mukambagateway.com';
        }
      })();

      const adminRecipients = await getAdminNotificationRecipients({ supabase });
      if (adminRecipients.length > 0) {
        const identityParts = [
          userFullName || null,
          email || null,
          phone ? `Phone: ${phone}` : null,
          `User ID: ${user_id}`,
        ].filter(Boolean);

        await sendTransactionalTemplateEmail({
          to: adminRecipients,
          subject: `Phone verified (${userFullName || user_id})`,
          react: React.createElement(AdminActionRequiredEmailTemplate, {
            title: 'Phone verification complete',
            message: [
              `User: ${identityParts.join(' • ')}`,
              '',
              'Open the Admin Dashboard → Users to view this user.',
            ].join('\n'),
            cta: { label: 'Open Users', url: `${appUrl}/?tab=users` },
          }),
          tags: ['admin_phone_verified'],
          metadata: { user_id: String(user_id) },
        });
      }
    } catch (e) {
      console.error('Failed to send admin phone verified email:', e);
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

