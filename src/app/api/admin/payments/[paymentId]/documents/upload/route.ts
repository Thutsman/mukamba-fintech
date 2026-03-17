import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { Buffer } from 'buffer';

export const runtime = 'nodejs';

const STORAGE_BUCKET = 'payment-documents';

const querySchema = z.object({
  document_type: z.enum(['receipt', 'agreement_of_sale']),
  admin_id: z.string().uuid().optional(),
});

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);

function safeName(name: string): string {
  return (name || 'document')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

async function isFirstPaymentForOffer(params: {
  supabase: ReturnType<typeof createServiceClient>;
  offerId: string;
  paymentId: string;
}): Promise<boolean> {
  const { data: first } = await params.supabase
    .from('offer_payments')
    .select('id')
    .eq('offer_id', params.offerId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  return Boolean(first?.id && String(first.id) === String(params.paymentId));
}

/**
 * POST /api/admin/payments/:paymentId/documents/upload
 * multipart/form-data: file=<File>
 * query/body: document_type=receipt|agreement_of_sale, admin_id optional
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      document_type: searchParams.get('document_type'),
      admin_id: searchParams.get('admin_id') || undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.issues },
        { status: 400 }
      );
    }
    const { document_type, admin_id } = parsed.data;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Missing required field: file' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: payment, error: paymentError } = await supabase
      .from('offer_payments')
      .select('id, offer_id, buyer_id, status')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const paymentStatus = String((payment as any).status || '');
    if (document_type === 'receipt') {
      // Receipts are required before verification, so allow upload while pending or completed.
      if (!['pending', 'completed'].includes(paymentStatus)) {
        return NextResponse.json(
          { error: `Receipt upload is not allowed when payment is ${paymentStatus}.` },
          { status: 400 }
        );
      }
    } else {
      // Agreement of sale only after verification.
      if (paymentStatus !== 'completed') {
        return NextResponse.json(
          { error: 'Agreement of sale can only be uploaded after the payment is verified (completed).' },
          { status: 400 }
        );
      }
    }

    const offerId = String((payment as any).offer_id);
    const buyerId = String((payment as any).buyer_id);

    // Agreement is tied to first payment only. Receipt applies to all payments.
    if (document_type === 'agreement_of_sale') {
      const firstOk = await isFirstPaymentForOffer({ supabase, offerId, paymentId });
      if (!firstOk) {
        return NextResponse.json(
          { error: 'Agreement of sale can only be uploaded for the first payment on an offer.' },
          { status: 400 }
        );
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext =
      file.type === 'application/pdf'
        ? 'pdf'
        : file.type === 'image/png'
        ? 'png'
        : 'jpg';

    const prefix = document_type === 'receipt' ? 'receipts' : 'agreements';
    const fileName = `${Date.now()}-${safeName(file.name || `${document_type}.${ext}`)}`;
    const storagePath = `${prefix}/${offerId}/${paymentId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Payment document upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload document: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const upsertPayload = {
      payment_id: paymentId,
      offer_id: offerId,
      buyer_id: buyerId,
      document_type,
      bucket: STORAGE_BUCKET,
      path: storagePath,
      mime_type: file.type,
      original_filename: file.name || null,
      uploaded_by: admin_id || null,
      uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: docRow, error: dbError } = await supabase
      .from('payment_documents')
      .upsert(upsertPayload, { onConflict: 'payment_id,document_type' })
      .select('*')
      .single();

    if (dbError) {
      console.error('Payment document DB upsert error:', dbError);
      return NextResponse.json(
        { error: `Document uploaded but failed to save record: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: docRow });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.issues }, { status: 400 });
    }
    console.error('Upload payment document error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

