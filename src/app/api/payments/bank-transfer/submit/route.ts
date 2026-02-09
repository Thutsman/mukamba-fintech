import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      offer_id,
      user_id,
      amount,
      proof_url,
      transfer_reference,
      transfer_notes
    } = body;

    if (!offer_id || !user_id || !amount || !proof_url) {
      return NextResponse.json(
        { error: 'Missing required fields: offer_id, user_id, amount, proof_url' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Generate unique payment ID
    const payment_id = crypto.randomUUID();

    // Insert payment record into offer_payments table
    const { data: payment, error: paymentError } = await supabase
      .from('offer_payments')
      .insert({
        id: payment_id,
        offer_id: offer_id,
        buyer_id: user_id,
        payment_method: 'bank_transfer',
        amount: amount,
        currency: 'USD',
        status: 'pending',
        phone_number: null, // Not applicable for bank transfer
        transaction_id: transfer_reference || null,
        payment_reference: transfer_reference || null,
        bank_details: transfer_notes || null,
        gateway_response: {
          proof_url: proof_url,
          transfer_reference: transfer_reference,
          transfer_notes: transfer_notes,
          submission_method: 'bank_transfer_manual',
          submitted_at: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    // Create notification for admin to review the payment
    const { error: notificationError } = await supabase
      .from('system_notifications')
      .insert({
        user_id: user_id,
        notification_type: 'payment_update',
        title: 'Proof of Payment Submitted',
        message: `A proof of payment for $${amount} (bank transfer) has been submitted and is awaiting your verification.`,
        priority: 'high',
        metadata: {
          payment_id: payment_id,
          offer_id: offer_id,
          amount: amount,
          proof_url: proof_url,
          transfer_reference: transfer_reference
        },
        created_at: new Date().toISOString()
      });

    if (notificationError) {
      console.error('Notification creation error:', notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      payment_id: payment_id,
      status: 'pending',
      message: 'Proof of payment submitted successfully. Your payment will be verified within 1-2 business days.',
      payment: payment
    });

  } catch (error) {
    console.error('Bank transfer submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
