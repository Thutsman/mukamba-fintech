import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

const schema = z.object({
  offer_ids: z.array(z.string().uuid()).min(1),
});

/**
 * POST /api/admin/invoices/status
 * Body: { offer_ids: string[] }
 *
 * Returns whether each offer has an invoice PDF uploaded.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { offer_ids } = schema.parse(body);

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('invoices')
      .select('offer_id, invoice_number, pdf_url, metadata, created_at')
      .in('offer_id', offer_ids)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Invoice status fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch invoice status' }, { status: 500 });
    }

    // For each offer, pick the newest invoice row (data is ordered newest-first).
    const result: Record<
      string,
      { has_invoice: boolean; invoice_number?: string | null; storage_path?: string | null }
    > = {};

    for (const id of offer_ids) {
      result[id] = { has_invoice: false, invoice_number: null, storage_path: null };
    }

    for (const row of data || []) {
      const offerId = (row as any).offer_id as string | undefined;
      if (!offerId) continue;
      if (result[offerId]?.has_invoice) continue; // already filled with newest

      const invoiceNumber = ((row as any).invoice_number as string | null | undefined) ?? null;
      const pdfUrl = ((row as any).pdf_url as string | null | undefined) ?? null;
      const metaPath = (((row as any).metadata as any)?.storage_path as string | null | undefined) ?? null;

      // We consider invoice uploaded if we have a stored path in pdf_url or metadata.storage_path
      const hasInvoice = Boolean(metaPath || (pdfUrl && !pdfUrl.startsWith('http')) || pdfUrl);

      result[offerId] = {
        has_invoice: hasInvoice,
        invoice_number: invoiceNumber,
        storage_path: metaPath || pdfUrl,
      };
    }

    return NextResponse.json({ data: result });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.issues }, { status: 400 });
    }
    console.error('POST /api/admin/invoices/status error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

