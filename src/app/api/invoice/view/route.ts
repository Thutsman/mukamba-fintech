import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

const STORAGE_BUCKET = 'property-documents';
// Signed URL valid for 1 hour
const SIGNED_URL_EXPIRY = 60 * 60;

/**
 * GET /api/invoice/view?offer_id=xxx
 *
 * Returns a short-lived signed URL for the invoice PDF attached to an offer.
 * This works even when the storage bucket is private.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('offer_id');

    if (!offerId) {
      return NextResponse.json({ error: 'offer_id query param is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch the invoice for this offer
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, pdf_url, metadata')
      .eq('offer_id', offerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError);
      return NextResponse.json({ error: 'Failed to fetch invoice.' }, { status: 500 });
    }

    if (!invoice) {
      return NextResponse.json({ error: 'No invoice found for this offer.' }, { status: 404 });
    }

    // Resolve storage path from pdf_url or metadata
    // pdf_url is stored as the path relative to the bucket, e.g. "invoices/invoice-xxx.pdf"
    // Older records may have had a full public URL stored; handle both.
    let storagePath: string | null = null;

    const metaBucket: string = invoice.metadata?.storage_bucket || STORAGE_BUCKET;
    const metaPath: string | null = invoice.metadata?.storage_path || null;

    if (metaPath) {
      storagePath = metaPath;
    } else if (invoice.pdf_url) {
      const raw: string = invoice.pdf_url;
      // If it already looks like a relative path (no http) use it directly
      if (!raw.startsWith('http')) {
        storagePath = raw;
      } else {
        // Extract path after /object/public/{bucket}/ or /object/sign/{bucket}/
        const match = raw.match(/\/object\/(?:public|sign)\/[^/]+\/(.+?)(?:\?|$)/);
        storagePath = match?.[1] ?? null;
      }
    }

    if (!storagePath) {
      return NextResponse.json({ error: 'Invoice PDF path not found.' }, { status: 404 });
    }

    // Generate a signed URL (works for private buckets)
    const { data: signedData, error: signError } = await supabase.storage
      .from(metaBucket)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);

    if (signError || !signedData?.signedUrl) {
      console.error('Error creating signed URL:', signError);
      return NextResponse.json(
        { error: `Failed to generate invoice URL: ${signError?.message || 'unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: signedData.signedUrl });
  } catch (error: any) {
    console.error('Invoice view error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
