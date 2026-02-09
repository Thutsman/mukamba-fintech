import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

const BUCKET = 'payment-proofs';

/**
 * GET /api/admin/payments/download-proof?url=<encoded-proof-url>
 * Streams the proof file from the private bucket and returns it with
 * Content-Disposition: attachment so the browser downloads it instead of
 * navigating away. This avoids cross-origin download attribute being ignored.
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
      .download(path);

    if (error) {
      console.error('Download proof error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to download file' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const filename = path.split('/').pop() || 'proof-of-payment';
    const contentType = data.type || 'application/octet-stream';

    return new NextResponse(data, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': contentType,
      },
    });
  } catch (e: any) {
    console.error('download-proof error:', e);
    return NextResponse.json(
      { error: e?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
