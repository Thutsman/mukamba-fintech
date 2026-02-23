import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendTransactionalTemplateEmail, getAppUrl } from '@/lib/transactional-email-service';
import { PaymentProofSubmittedEmailTemplate } from '@/lib/email-templates/payment-proof-submitted';
import { AdminActionRequiredEmailTemplate } from '@/lib/email-templates/admin-action-required';
import * as React from 'react';

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

    // Fetch buyer + offer reference for emails/notifications (best-effort)
    const [{ data: buyerProfile }, { data: offerRow }] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('id, first_name, email')
        .eq('id', user_id)
        .single(),
      supabase
        .from('property_offers')
        .select('id, offer_reference')
        .eq('id', offer_id)
        .single()
    ]);

    const buyerEmail = (buyerProfile as any)?.email as string | undefined;
    const buyerFirstName = ((buyerProfile as any)?.first_name as string | undefined) || 'there';
    const offerReference = ((offerRow as any)?.offer_reference as string | undefined) || offer_id;

    // Admin recipients (best-effort)
    const { data: adminProfiles } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('user_role', 'admin');

    // Buyer notification (in-app)
    const { error: buyerNotifError } = await supabase.from('system_notifications').insert({
      user_id: user_id,
      target_user_id: user_id,
      notification_type: 'payment_update',
      title: 'Proof of Payment Submitted',
      message: `Your proof of payment for $${amount} has been submitted and is awaiting verification.`,
      priority: 'normal',
      metadata: {
        payment_id,
        offer_id,
        offer_reference: offerReference,
        amount,
      },
      created_at: new Date().toISOString(),
    });

    if (buyerNotifError) {
      console.error('Buyer notification creation error:', buyerNotifError);
    }

    // Admin notifications (one per admin)
    if (adminProfiles && adminProfiles.length > 0) {
      const adminNotifs = adminProfiles
        .filter((a: any) => a?.id)
        .map((a: any) => ({
          user_id: user_id, // actor
          target_user_id: a.id, // recipient admin
          notification_type: 'payment_update',
          title: 'Proof of Payment Awaiting Verification',
          message: `A proof of payment for $${amount} (bank transfer) was submitted for offer ${offerReference}.`,
          priority: 'high',
          metadata: {
            payment_id,
            offer_id,
            offer_reference: offerReference,
            amount,
            proof_url,
            transfer_reference,
          },
          created_at: new Date().toISOString(),
        }));

      const { error: adminNotifError } = await supabase.from('system_notifications').insert(adminNotifs);
      if (adminNotifError) {
        console.error('Admin notification creation error:', adminNotifError);
      }
    }

    // Emails (best-effort; never fail the request)
    let appUrl: string | null = null;
    try {
      appUrl = getAppUrl();
    } catch (e) {
      console.error('NEXT_PUBLIC_APP_URL missing; skipping CTA links:', e);
    }

    if (buyerEmail) {
      sendTransactionalTemplateEmail({
        to: [buyerEmail],
        subject: 'Proof of payment submitted',
        react: React.createElement(PaymentProofSubmittedEmailTemplate, {
          firstName: buyerFirstName,
          offerReference,
          amount: `$${Number(amount).toLocaleString()}`,
          cta: appUrl ? { label: 'Open your dashboard', url: `${appUrl}/?section=offers` } : undefined,
        }),
        tags: ['payment_proof_submitted'],
        metadata: { payment_id: String(payment_id), offer_id: String(offer_id) },
      }).catch((e) => console.error('Failed to send buyer proof submitted email:', e));
    }

    const adminEmails = (adminProfiles || [])
      .map((a: any) => a?.email)
      .filter(Boolean) as string[];

    if (adminEmails.length > 0) {
      sendTransactionalTemplateEmail({
        to: adminEmails,
        subject: `Payment proof awaiting verification (${offerReference})`,
        react: React.createElement(AdminActionRequiredEmailTemplate, {
          title: 'Payment proof awaiting verification',
          message: `A proof of payment was submitted for offer ${offerReference}.\nAmount: $${Number(amount).toLocaleString()}\n\nOpen the Admin Dashboard → Payment Tracking to review and verify/reject.`,
          cta: {
            label: 'Open Admin Dashboard',
            url: appUrl ? `${appUrl}/?tab=payments` : 'https://mukambagateway.com',
          },
        }),
        tags: ['admin_payment_review'],
        metadata: { payment_id: String(payment_id), offer_id: String(offer_id) },
      }).catch((e) => console.error('Failed to send admin payment review email:', e));
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
