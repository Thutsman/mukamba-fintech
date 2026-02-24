import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { sendTransactionalTemplateEmail, getAppUrl } from '@/lib/transactional-email-service';
import { KycSubmittedEmailTemplate } from '@/lib/email-templates/kyc-submitted';
import { AdminActionRequiredEmailTemplate } from '@/lib/email-templates/admin-action-required';
import { getAdminNotificationRecipients } from '@/lib/admin-notification-recipients';
import * as React from 'react';

const schema = z.object({
  verification_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { verification_id } = schema.parse(body);

    const supabase = createServiceClient();
    const { data: verification } = await supabase
      .from('kyc_verifications')
      .select('id, user_id, verification_type')
      .eq('id', verification_id)
      .single();

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    const userId = (verification as any).user_id as string;
    const verificationType = ((verification as any).verification_type as string) || 'identity';

    const { data: user } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', userId)
      .single();

    const email = (user as any)?.email as string | undefined;
    const firstName = ((user as any)?.first_name as string | undefined) || 'there';
    const userFullName = `${(user as any)?.first_name || ''} ${(user as any)?.last_name || ''}`.trim();
    const userPhone = (user as any)?.phone as string | undefined;

    if (email) {
      let appUrl: string | null = null;
      try {
        appUrl = getAppUrl();
      } catch (e) {
        console.error('NEXT_PUBLIC_APP_URL missing; skipping CTA links:', e);
      }

      await sendTransactionalTemplateEmail({
        to: [email],
        subject: 'KYC submission received',
        react: React.createElement(KycSubmittedEmailTemplate, {
          firstName,
          verificationType,
          cta: appUrl ? { label: 'Open your dashboard', url: `${appUrl}/?section=overview` } : undefined,
        }),
        tags: ['kyc_submitted'],
        metadata: { verification_id, verification_type: String(verificationType) },
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
          userPhone ? `Phone: ${userPhone}` : null,
          `User ID: ${userId}`,
        ].filter(Boolean);

        await sendTransactionalTemplateEmail({
          to: adminRecipients,
          subject: `KYC pending review (${verificationType})`,
          react: React.createElement(AdminActionRequiredEmailTemplate, {
            title: 'KYC pending review',
            message: [
              `User: ${identityParts.join(' • ')}`,
              `Verification type: ${verificationType}`,
              '',
              'Open the Admin Dashboard → KYC to approve/reject this submission.',
            ].join('\n'),
            cta: { label: 'Open KYC queue', url: `${appUrl}/?tab=kyc` },
          }),
          tags: ['admin_kyc_review'],
          metadata: { verification_id, verification_type: String(verificationType), user_id: String(userId) },
        });
      }
    } catch (e) {
      console.error('Failed to send admin KYC review email:', e);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.issues }, { status: 400 });
    }
    console.error('POST /api/notifications/kyc-submitted error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

