import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

const schema = z.object({
  doc_id: z.string().uuid(),
});

/**
 * GET /api/payments/documents/download?doc_id=...
 * Streams the document from storage with Content-Disposition: attachment.
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
      .select('id, buyer_id, bucket, path, original_filename, mime_type, document_type')
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

    const { data, error: dlError } = await supabase.storage.from(bucket).download(path);
    if (dlError) {
      console.error('Download payment document error:', dlError);
      return NextResponse.json(
        { error: dlError.message || 'Failed to download file' },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fallbackName = (() => {
      const ext = path.split('.').pop();
      const base = (doc as any).document_type === 'receipt' ? 'receipt' : 'agreement-of-sale';
      return ext ? `${base}.${ext}` : base;
    })();
    const filename = ((doc as any).original_filename as string | null | undefined) || fallbackName;
    const contentType = ((doc as any).mime_type as string | null | undefined) || data.type || 'application/octet-stream';

    return new NextResponse(data, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': contentType,
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.issues }, { status: 400 });
    }
    console.error('GET /api/payments/documents/download error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

