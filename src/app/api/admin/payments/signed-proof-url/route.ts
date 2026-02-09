import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

const BUCKET = 'payment-proofs';
const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour

/**
 * GET /api/admin/payments/signed-proof-url?url=<encoded-proof-url>
 * Returns a signed URL for viewing a proof file in the private payment-proofs bucket.
 * The stored proof_url is a public URL that fails for private buckets; this endpoint
 * generates a temporary signed URL so admins can view the file.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const proofUrl = searchParams.get('url');

    if (!proofUrl) {
      return NextResponse.json(
        { error: 'Missing url query parameter' },
        { status: 400 }
      );
    }

    // Extract object path from the stored public URL
    // e.g. https://xxx.supabase.co/storage/v1/object/public/payment-proofs/proof-of-payment/file.pdf
    // -> proof-of-payment/file.pdf
    const match = proofUrl.match(/\/payment-proofs\/(.+)$/);
    const path = match ? decodeURIComponent(match[1].split('?')[0]) : null;

    if (!path) {
      return NextResponse.json(
        { error: 'Invalid proof URL: could not extract path' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

    if (error) {
      console.error('Signed URL error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create signed URL' },
        { status: 500 }
      );
    }

    if (!data?.signedUrl) {
      return NextResponse.json(
        { error: 'No signed URL returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (e: any) {
    console.error('signed-proof-url error:', e);
    return NextResponse.json(
      { error: e?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
