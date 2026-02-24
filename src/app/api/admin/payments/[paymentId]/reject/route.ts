import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendTransactionalTemplateEmail, getAppUrl } from '@/lib/transactional-email-service';
import { PaymentStatusEmailTemplate } from '@/lib/email-templates/payment-status';
import * as React from 'react';

async function getBuyerContact(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string
): Promise<{ firstName: string; email?: string }> {
  const { data: buyerProfile } = await supabase
    .from('user_profiles')
    .select('first_name, email')
    .eq('id', userId)
    .single();

  const profileFirstName = (buyerProfile as any)?.first_name as string | undefined;
  const profileEmail = (buyerProfile as any)?.email as string | undefined;

  if (profileEmail) {
    return { firstName: profileFirstName || 'there', email: profileEmail };
  }

  const { data: authData } = await supabase.auth.admin.getUserById(userId);
  const authUser = authData?.user;
  const authFirstName =
    ((authUser?.user_metadata as any)?.first_name as string | undefined) ||
    ((authUser?.user_metadata as any)?.name as string | undefined);

  return {
    firstName: profileFirstName || authFirstName || 'there',
    email: authUser?.email || undefined,
  };
}

/**
 * PATCH /api/admin/payments/[paymentId]/reject
 * Marks a pending payment as failed/rejected by admin.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const body = await request.json().catch(() => ({}));
    const { admin_id, reason } = body as { admin_id?: string; reason?: string };

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Fetch the payment
    const { data: payment, error: fetchError } = await supabase
      .from('offer_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: `Payment is already ${payment.status}. Only pending payments can be rejected.` },
        { status: 400 }
      );
    }

    // Build updated gateway_response with rejection metadata
    const existingGateway = payment.gateway_response || {};
    const updatedGateway = {
      ...existingGateway,
      admin_rejection: {
        rejected_by: admin_id || 'admin',
        rejected_at: new Date().toISOString(),
        reason: reason || 'Payment proof rejected by admin',
      },
    };

    // Update payment status to failed
    const { error: updateError } = await supabase
      .from('offer_payments')
      .update({
        status: 'failed',
        gateway_response: updatedGateway,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Error rejecting payment:', updateError);
      return NextResponse.json(
        { error: 'Failed to reject payment' },
        { status: 500 }
      );
    }

    // Create a notification for the buyer
    if (payment.buyer_id) {
      await supabase.from('system_notifications').insert({
        user_id: payment.buyer_id,
        notification_type: 'payment_update',
        title: 'Payment Proof Rejected',
        message: `Your payment proof for $${payment.amount} was not accepted. ${reason ? `Reason: ${reason}` : 'Please resubmit a valid proof of payment.'}`,
        priority: 'high',
        metadata: {
          payment_id: paymentId,
          offer_id: payment.offer_id,
          amount: payment.amount,
          reason: reason,
        },
        created_at: new Date().toISOString(),
      });
    }

    // Email the buyer (best-effort)
    if (payment.buyer_id) {
      const [{ firstName: buyerFirstName, email: buyerEmail }, { data: offer }] = await Promise.all([
        getBuyerContact(supabase, payment.buyer_id),
        payment.offer_id
          ? supabase
              .from('property_offers')
              .select('offer_reference')
              .eq('id', payment.offer_id)
              .single()
          : Promise.resolve({ data: null } as any),
      ]);

      const offerReference = ((offer as any)?.offer_reference as string | undefined) || payment.offer_id || paymentId;

      if (buyerEmail) {
        let appUrl: string | null = null;
        try {
          appUrl = getAppUrl();
        } catch (e) {
          console.error('NEXT_PUBLIC_APP_URL missing; skipping CTA links:', e);
        }

        const emailResult = await sendTransactionalTemplateEmail({
          to: [buyerEmail],
          subject: 'Payment proof rejected',
          react: React.createElement(PaymentStatusEmailTemplate, {
            firstName: buyerFirstName,
            status: 'rejected',
            amount: `$${Number(payment.amount).toLocaleString()}`,
            offerReference,
            reason: reason || null,
            cta: appUrl ? { label: 'Resubmit proof of payment', url: `${appUrl}/?section=offers` } : undefined,
          }),
          tags: ['payment_rejected'],
          metadata: { payment_id: String(paymentId), offer_id: String(payment.offer_id || '') },
        });
        if (!emailResult.success) {
          console.error('Failed to send payment rejected email:', emailResult.error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment rejected successfully',
    });
  } catch (e: any) {
    console.error('Reject payment error:', e);
    return NextResponse.json(
      { error: e?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
