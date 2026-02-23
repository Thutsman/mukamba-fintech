import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { sendTransactionalTemplateEmail, getAppUrl } from '@/lib/transactional-email-service';
import { OfferStatusEmailTemplate } from '@/lib/email-templates/offer-status';
import * as React from 'react';

const patchSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().optional(),
  admin_id: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const { offerId } = await params;
    const body = await request.json().catch(() => ({}));
    const data = patchSchema.parse(body);

    if (!offerId) {
      return NextResponse.json({ error: 'Offer ID is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Update offer (service role)
    const updatePayload: any = {
      status: data.status,
      updated_at: new Date().toISOString(),
    };
    if (data.admin_id) {
      updatePayload.admin_reviewed_by = data.admin_id;
      updatePayload.admin_reviewed_at = new Date().toISOString();
    }
    if (data.status === 'rejected') {
      updatePayload.rejection_reason = data.rejection_reason || 'Offer was rejected';
    }

    const { error: updateError } = await supabase
      .from('property_offers')
      .update(updatePayload)
      .eq('id', offerId);

    if (updateError) {
      console.error('Offer update error:', updateError);
      return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
    }

    // Fetch offer + buyer info for email (best-effort)
    const { data: offerRow } = await supabase
      .from('property_offers')
      .select('id, buyer_id, offer_reference, offer_price, rejection_reason')
      .eq('id', offerId)
      .single();

    const buyerId = (offerRow as any)?.buyer_id as string | undefined;
    const offerReference = ((offerRow as any)?.offer_reference as string | undefined) || offerId;
    const rejectionReason = (offerRow as any)?.rejection_reason as string | undefined;

    if (buyerId) {
      const { data: buyer } = await supabase
        .from('user_profiles')
        .select('first_name, email')
        .eq('id', buyerId)
        .single();

      const buyerEmail = (buyer as any)?.email as string | undefined;
      const buyerFirstName = ((buyer as any)?.first_name as string | undefined) || 'there';

      if (buyerEmail) {
        let appUrl: string | null = null;
        try {
          appUrl = getAppUrl();
        } catch (e) {
          console.error('NEXT_PUBLIC_APP_URL missing; skipping CTA links:', e);
        }

        const cta =
          appUrl && data.status === 'approved'
            ? { label: 'Upload proof of payment', url: `${appUrl}/?section=offers` }
            : appUrl
            ? { label: 'View your offers', url: `${appUrl}/?section=offers` }
            : undefined;

        sendTransactionalTemplateEmail({
          to: [buyerEmail],
          subject:
            data.status === 'approved'
              ? `Offer approved (${offerReference})`
              : `Offer rejected (${offerReference})`,
          react: React.createElement(OfferStatusEmailTemplate, {
            firstName: buyerFirstName,
            offerReference,
            status: data.status,
            rejectionReason:
              data.status === 'rejected'
                ? (data.rejection_reason || rejectionReason || null)
                : null,
            cta,
          }),
          tags: [data.status === 'approved' ? 'offer_approved' : 'offer_rejected'],
          metadata: { offer_id: String(offerId), offer_reference: String(offerReference) },
        }).catch((e) => console.error('Failed to send offer status email:', e));
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.issues }, { status: 400 });
    }
    console.error('PATCH /api/admin/offers/[offerId] error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

