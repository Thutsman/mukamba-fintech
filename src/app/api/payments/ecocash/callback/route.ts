import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * Ecocash Payment Callback Handler
 * 
 * This endpoint receives payment status updates from Ecocash API
 * and updates the payment status in the database.
 * 
 * Expected callback data from Ecocash C2B API:
 * - transaction_id: Unique transaction identifier
 * - status: Payment status (success, failed, pending, cancelled)
 * - amount: Payment amount
 * - customer_phone: Customer phone number
 * - reference: Ecocash payment reference
 * - merchant_id: Merchant identifier
 * - timestamp: Payment timestamp
 * - signature: Security signature for verification
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the callback for debugging
    console.log('Ecocash callback received:', body);
    
    // Validate required fields
    const { 
      transaction_id, 
      status, 
      amount, 
      customer_phone, 
      reference, 
      merchant_id,
      signature,
      timestamp 
    } = body;
    
    if (!transaction_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: transaction_id and status' },
        { status: 400 }
      );
    }
    
    // TODO: Verify signature for security (implement when you have the signature verification method)
    // if (!verifyEcocashSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    // Initialize Supabase client with service role for API operations
    const supabase = createServiceClient();
    
    // Update payment status in database
    const { data: payment, error: updateError } = await supabase
      .from('offer_payments')
      .update({
        status: status === 'success' ? 'completed' : 
                status === 'failed' ? 'failed' : 
                status === 'cancelled' ? 'cancelled' : 'pending',
        transaction_id: transaction_id,
        payment_reference: reference,
        phone_number: customer_phone,
        amount: amount,
        gateway_response: {
          ecocash_reference: reference,
          merchant_id: merchant_id,
          signature: signature,
          timestamp: timestamp,
          callback_data: body
        },
        updated_at: new Date().toISOString(),
        completed_at: status === 'success' ? new Date().toISOString() : null
      })
      .eq('transaction_id', transaction_id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }
    
    // If payment was successful, update the offer status
    if (status === 'success' && payment) {
      const { error: offerError } = await supabase
        .from('property_offers')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.offer_id);
      
      if (offerError) {
        console.error('Error updating offer status:', offerError);
      }
    }
    
    // Send notification to admin about payment status
    if (payment) {
      await supabase
        .from('system_notifications')
        .insert({
          notification_type: 'payment_update',
          title: `Payment ${status === 'success' ? 'Completed' : 'Failed'}`,
          message: `Payment for offer ${payment.offer_id} has been ${status}`,
          priority: status === 'success' ? 'normal' : 'high',
          target_user_id: payment.buyer_id,
          metadata: {
            offer_id: payment.offer_id,
            transaction_id: transaction_id,
            amount: amount,
            status: status
          }
        });
    }
    
    // Return success response to Ecocash
    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      transaction_id: transaction_id
    });
    
  } catch (error) {
    console.error('Ecocash callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Ecocash callback endpoint is active',
    timestamp: new Date().toISOString()
  });
}
