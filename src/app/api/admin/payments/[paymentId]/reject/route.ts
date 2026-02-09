import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

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
