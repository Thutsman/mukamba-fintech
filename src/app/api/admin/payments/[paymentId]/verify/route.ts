import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * PATCH /api/admin/payments/[paymentId]/verify
 * Marks a pending payment as completed (verified by admin).
 * Also marks the related invoice as paid if one exists.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const body = await request.json().catch(() => ({}));
    const { admin_id, note } = body as { admin_id?: string; note?: string };

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
        { error: `Payment is already ${payment.status}. Only pending payments can be verified.` },
        { status: 400 }
      );
    }

    // Build updated gateway_response with admin verification metadata
    const existingGateway = payment.gateway_response || {};
    const updatedGateway = {
      ...existingGateway,
      admin_verification: {
        verified_by: admin_id || 'admin',
        verified_at: new Date().toISOString(),
        note: note || null,
      },
    };

    // Update payment status to completed
    const { error: updateError } = await supabase
      .from('offer_payments')
      .update({
        status: 'completed',
        gateway_response: updatedGateway,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Error verifying payment:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify payment' },
        { status: 500 }
      );
    }

    // Try to mark the related invoice as paid
    if (payment.offer_id) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id, status')
        .eq('offer_id', payment.offer_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (invoice && invoice.status !== 'paid') {
        await supabase
          .from('invoices')
          .update({ status: 'paid', amount_due: 0 })
          .eq('id', invoice.id);
      }
    }

    // Create a notification for the buyer
    if (payment.buyer_id) {
      await supabase.from('system_notifications').insert({
        user_id: payment.buyer_id,
        notification_type: 'payment_update',
        title: 'Payment Verified',
        message: `Your payment of $${payment.amount} has been verified by the admin.`,
        priority: 'medium',
        metadata: {
          payment_id: paymentId,
          offer_id: payment.offer_id,
          amount: payment.amount,
        },
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (e: any) {
    console.error('Verify payment error:', e);
    return NextResponse.json(
      { error: e?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
