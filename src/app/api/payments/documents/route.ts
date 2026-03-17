import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

const schema = z.object({
  payment_id: z.string().uuid(),
});

/**
 * GET /api/payments/documents?payment_id=...
 * Returns available receipt/agreement docs for a payment.
 *
 * Note: authorization is enforced by matching buyer_id to the payment’s buyer_id.
 * (Admin UIs should use service routes and can pass through by using service role,
 * but this endpoint still validates by buyer_id when a buyer_id query is provided.)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = schema.safeParse({ payment_id: searchParams.get('payment_id') });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const paymentId = parsed.data.payment_id;
    const buyerId = searchParams.get('buyer_id'); // optional guard for buyer client

    const supabase = createServiceClient();

    const { data: payment } = await supabase
      .from('offer_payments')
      .select('id, buyer_id')
      .eq('id', paymentId)
      .single();

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (buyerId && String((payment as any).buyer_id) !== String(buyerId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: docs, error } = await supabase
      .from('payment_documents')
      .select('id, payment_id, offer_id, buyer_id, document_type, bucket, path, mime_type, original_filename, uploaded_at')
      .eq('payment_id', paymentId);

    if (error) {
      console.error('Fetch payment documents error:', error);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    return NextResponse.json({ data: docs || [] });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.issues }, { status: 400 });
    }
    console.error('GET /api/payments/documents error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

