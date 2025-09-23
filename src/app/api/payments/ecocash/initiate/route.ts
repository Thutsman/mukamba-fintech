import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * Ecocash Payment Initiation Handler
 * 
 * This endpoint initiates a payment with Ecocash API
 * and creates a payment record in the database.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { offer_id, phone_number, amount, user_id } = body;
    
    if (!offer_id || !phone_number || !amount || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: offer_id, phone_number, amount, user_id' },
        { status: 400 }
      );
    }
    
    // Initialize Supabase client with service role for API operations
    const supabase = createServiceClient();
    
    // Generate unique transaction ID (UUID v4 format required by Ecocash)
    const transaction_id = crypto.randomUUID();
    
    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('offer_payments')
      .insert({
        offer_id: offer_id,
        buyer_id: user_id,
        payment_method: 'ecocash',
        amount: amount,
        status: 'pending',
        transaction_id: transaction_id,
        phone_number: phone_number,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }
    
    // TODO: Integrate with actual Ecocash API
    // For now, we'll simulate the API call
    const ecocashResponse = await initiateEcocashPayment({
      transaction_id,
      phone_number,
      amount,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mukamba-fintech.vercel.app'}/api/payments/ecocash/callback`
    });
    
    if (!ecocashResponse.success) {
      // Update payment status to failed
      await supabase
        .from('offer_payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);
      
      return NextResponse.json(
        { error: 'Failed to initiate Ecocash payment' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      payment_id: payment.id,
      transaction_id: transaction_id,
      status: 'pending',
      message: 'Payment initiated successfully. Please check your phone for Ecocash prompt.'
    });
    
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Initiate Ecocash C2B Merchant Payment
 * This function calls the real Ecocash API to initiate a customer-to-business payment
 */
async function initiateEcocashPayment(params: {
  transaction_id: string;
  phone_number: string;
  amount: number;
  callback_url: string;
}) {
  try {
    // Get Ecocash API credentials from environment
    const apiKey = process.env.ECOCASH_API_KEY;
    const merchantId = process.env.ECOCASH_MERCHANT_ID;
    const environment = process.env.ECOCASH_ENVIRONMENT || 'sandbox';
    
    if (!apiKey || !merchantId) {
      throw new Error('Ecocash API credentials not configured');
    }
    
    // Determine API endpoint based on environment
    const baseUrl = 'https://developers.ecocash.co.zw/api/ecocash_pay';
    const endpoint = environment === 'production' 
      ? '/api/v2/payment/instant/c2b/live'
      : '/api/v2/payment/instant/c2b/sandbox';
    
    // Format phone number to include country code if not present
    let formattedPhone = params.phone_number;
    if (!formattedPhone.startsWith('263')) {
      // Remove leading 0 and add 263 country code
      formattedPhone = formattedPhone.replace(/^0/, '263');
    }
    // Remove any spaces or special characters
    formattedPhone = formattedPhone.replace(/[^0-9]/g, '');
    
    // Prepare payment request payload according to Ecocash API spec
    const paymentRequest = {
      customerMsisdn: formattedPhone,
      amount: params.amount,
      reason: 'Property deposit payment - Mukamba FinTech',
      currency: 'USD',
      sourceReference: params.transaction_id // Must be valid UUID format
    };
    
    console.log('Initiating Ecocash payment:', {
      ...paymentRequest,
      customerMsisdn: '[REDACTED]'
    });
    
    // Log the request for debugging
    console.log('Ecocash API Request:', {
      url: `${baseUrl}${endpoint}`,
      headers: {
        'X-API-KEY': '[REDACTED]',
        'Content-Type': 'application/json'
      },
      body: {
        ...paymentRequest,
        customerMsisdn: '[REDACTED]'
      }
    });

    // Make API call to Ecocash
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentRequest)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Ecocash API error:', result);
      
      // Handle specific Ecocash error codes
      let errorMessage = 'Payment initiation failed';
      switch (response.status) {
        case 400:
          errorMessage = 'Invalid request parameters';
          break;
        case 401:
          errorMessage = 'Invalid API key';
          break;
        case 402:
          errorMessage = 'Payment request failed';
          break;
        case 403:
          errorMessage = 'API key does not have required permissions';
          break;
        case 404:
          errorMessage = 'API endpoint not found';
          break;
        case 409:
          errorMessage = 'Transaction already exists';
          break;
        case 429:
          errorMessage = 'Too many requests - please try again later';
          break;
        case 500:
          errorMessage = 'Ecocash server error - please try again';
          break;
        default:
          errorMessage = result.message || `Ecocash API error: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    console.log('Ecocash payment initiated successfully:', result);
    
    return {
      success: true,
      transaction_id: params.transaction_id,
      ecocash_reference: result.sourceReference || params.transaction_id,
      status: 'pending',
      message: 'Payment request sent to customer. Please check your phone for Ecocash prompt.',
      sandbox_info: environment === 'sandbox' ? 'Use PIN: 0000, 1234, or 9999 to complete payment' : null
    };
    
  } catch (error) {
    console.error('Error initiating Ecocash payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      transaction_id: params.transaction_id
    };
  }
}
