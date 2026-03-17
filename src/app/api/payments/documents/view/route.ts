import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

const schema = z.object({
  doc_id: z.string().uuid(),
});

const SIGNED_URL_EXPIRY = 60 * 60; // 1 hour

/**
 * GET /api/payments/documents/view?doc_id=...
 * Returns a signed URL for a payment document (receipt/agreement).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = schema.safeParse({ doc_id: searchParams.get('doc_id') });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const docId = parsed.data.doc_id;
    const buyerId = searchParams.get('buyer_id'); // optional guard

    const supabase = createServiceClient();

    const { data: doc, error } = await supabase
      .from('payment_documents')
      .select('id, buyer_id, bucket, path')
      .eq('id', docId)
      .single();

    if (error || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (buyerId && String((doc as any).buyer_id) !== String(buyerId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const bucket = String((doc as any).bucket);
    const path = String((doc as any).path);

    const { data: signedData, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, SIGNED_URL_EXPIRY);

    if (signError || !signedData?.signedUrl) {
      console.error('Create signed doc URL error:', signError);
      return NextResponse.json(
        { error: `Failed to generate URL: ${signError?.message || 'unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: signedData.signedUrl });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.issues }, { status: 400 });
    }
    console.error('GET /api/payments/documents/view error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

