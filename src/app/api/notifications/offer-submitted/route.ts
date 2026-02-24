import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { sendTransactionalTemplateEmail, getAppUrl } from '@/lib/transactional-email-service';
import { OfferSubmittedEmailTemplate } from '@/lib/email-templates/offer-submitted';
import { AdminActionRequiredEmailTemplate } from '@/lib/email-templates/admin-action-required';
import { getAdminNotificationRecipients } from '@/lib/admin-notification-recipients';
import * as React from 'react';

const schema = z.object({
  offer_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { offer_id } = schema.parse(body);

    const supabase = createServiceClient();
    const { data: offer } = await supabase
      .from('property_offers')
      .select(
        'id, buyer_id, offer_reference, offer_price, property:properties(title, suburb, street_address, city)'
      )
      .eq('id', offer_id)
      .single();

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    const buyerId = (offer as any).buyer_id as string;
    const offerReference = ((offer as any).offer_reference as string | undefined) || offer_id;
    const offerPrice = Number((offer as any).offer_price || 0);
    const propertyTitle = (offer as any)?.property?.title as string | undefined;
    const propertySuburb = (offer as any)?.property?.suburb as string | undefined;
    const propertyStreet = (offer as any)?.property?.street_address as string | undefined;
    const propertyCity = (offer as any)?.property?.city as string | undefined;

    const { data: buyer } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', buyerId)
      .single();

    const email = (buyer as any)?.email as string | undefined;
    const firstName = ((buyer as any)?.first_name as string | undefined) || 'there';
    const buyerFullName = `${(buyer as any)?.first_name || ''} ${(buyer as any)?.last_name || ''}`.trim();
    const buyerPhone = (buyer as any)?.phone as string | undefined;

    if (email) {
      let appUrl: string | null = null;
      try {
        appUrl = getAppUrl();
      } catch (e) {
        console.error('NEXT_PUBLIC_APP_URL missing; skipping CTA links:', e);
      }

      await sendTransactionalTemplateEmail({
        to: [email],
        subject: `Offer submitted (${offerReference})`,
        react: React.createElement(OfferSubmittedEmailTemplate, {
          firstName,
          offerReference,
          offerAmount: `$${offerPrice.toLocaleString()}`,
          cta: appUrl ? { label: 'View your offers', url: `${appUrl}/?section=offers` } : undefined,
        }),
        tags: ['offer_submitted'],
        metadata: { offer_id, offer_reference: String(offerReference) },
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
        const addressParts = [propertyStreet, propertySuburb, propertyCity].filter(Boolean);
        const addressLine = addressParts.length ? addressParts.join(', ') : null;

        const buyerIdentityParts = [
          buyerFullName || null,
          email || null,
          buyerPhone ? `Phone: ${buyerPhone}` : null,
        ].filter(Boolean);

        await sendTransactionalTemplateEmail({
          to: adminRecipients,
          subject: `Offer pending review (${offerReference})`,
          react: React.createElement(AdminActionRequiredEmailTemplate, {
            title: 'Offer pending review',
            message: [
              `Buyer: ${buyerIdentityParts.join(' • ')}`,
              propertyTitle ? `Property: ${propertyTitle}` : null,
              addressLine ? `Address: ${addressLine}` : null,
              `Offer: ${offerReference}`,
              `Amount: $${offerPrice.toLocaleString()}`,
              '',
              'Open the Admin Dashboard → Offers to approve/reject this offer.',
            ]
              .filter(Boolean)
              .join('\n'),
            cta: { label: 'Open Offers', url: `${appUrl}/?tab=offers` },
          }),
          tags: ['admin_offer_review'],
          metadata: { offer_id, offer_reference: String(offerReference) },
        });
      }
    } catch (e) {
      console.error('Failed to send admin offer review email:', e);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.issues }, { status: 400 });
    }
    console.error('POST /api/notifications/offer-submitted error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

