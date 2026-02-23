import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { sendTransactionalTemplateEmail, getAppUrl } from '@/lib/transactional-email-service';
import { OfferSubmittedEmailTemplate } from '@/lib/email-templates/offer-submitted';
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
      .select('id, buyer_id, offer_reference, offer_price')
      .eq('id', offer_id)
      .single();

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    const buyerId = (offer as any).buyer_id as string;
    const offerReference = ((offer as any).offer_reference as string | undefined) || offer_id;
    const offerPrice = Number((offer as any).offer_price || 0);

    const { data: buyer } = await supabase
      .from('user_profiles')
      .select('first_name, email')
      .eq('id', buyerId)
      .single();

    const email = (buyer as any)?.email as string | undefined;
    const firstName = ((buyer as any)?.first_name as string | undefined) || 'there';

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

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.issues }, { status: 400 });
    }
    console.error('POST /api/notifications/offer-submitted error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

