import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { Buffer } from 'buffer';

export const runtime = 'nodejs';

const STORAGE_BUCKET = 'property-documents';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const offerId = formData.get('offer_id') as string | null;
    const invoiceNumber = formData.get('invoice_number') as string | null;

    if (!file || !offerId || !invoiceNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: file, offer_id, invoice_number' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF files are allowed.' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // ── 1. Fetch offer ────────────────────────────────────────────────────────
    const { data: offer, error: offerError } = await supabase
      .from('property_offers')
      .select('id, buyer_id, property_id, offer_price, deposit_amount, payment_method, offer_reference')
      .eq('id', offerId)
      .single();

    if (offerError || !offer) {
      return NextResponse.json({ error: 'Related offer not found.' }, { status: 404 });
    }

    // ── 2. Fetch property ─────────────────────────────────────────────────────
    const { data: property } = await supabase
      .from('properties')
      .select('id, currency, title, city, country')
      .eq('id', offer.property_id)
      .single();

    const currency = (property as any)?.currency || 'USD';
    const subtotal = offer.payment_method === 'cash' ? offer.offer_price : offer.deposit_amount;
    const taxes = 0;
    const total = subtotal + taxes;

    // ── 3. Upload PDF to storage ──────────────────────────────────────────────
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeInvoiceNumber = invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '-');
    const fileName = `invoice-${offerId}-${safeInvoiceNumber}-${Date.now()}.pdf`;
    // Store path WITHOUT leading slash; we'll use it to create signed URLs
    const storagePath = `invoices/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Invoice storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload invoice PDF: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // ── 4. Upsert invoice row ─────────────────────────────────────────────────
    // We store the storage_path in metadata so we can always generate a fresh
    // signed URL later, regardless of whether pdf_url column exists.
    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const metadataPayload = {
      offer_reference: offer.offer_reference,
      property_title: (property as any)?.title,
      property_address: property
        ? `${(property as any).city || ''}, ${(property as any).country || ''}`
        : '',
      // Always store the storage path so we can produce signed URLs
      storage_bucket: STORAGE_BUCKET,
      storage_path: storagePath,
    };

    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, metadata')
      .eq('offer_id', offerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let invoiceRecord: any = null;
    let dbWarning: string | undefined;

    if (existingInvoice) {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          invoice_number: invoiceNumber,
          pdf_url: storagePath,           // store path, not public URL
          metadata: { ...(existingInvoice.metadata || {}), ...metadataPayload },
        })
        .eq('id', existingInvoice.id)
        .select('*')
        .single();

      if (error) {
        console.error('Failed to update invoice row:', error);
        dbWarning = error.message;
        // Return a minimal record so the front-end still gets success
        invoiceRecord = { id: existingInvoice.id, invoice_number: invoiceNumber, storage_path: storagePath };
      } else {
        invoiceRecord = data;
      }
    } else {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          offer_id: offer.id,
          buyer_id: offer.buyer_id,
          property_id: offer.property_id,
          currency,
          subtotal,
          taxes,
          total,
          amount_due: total,
          status: 'unpaid',
          issue_date: issueDate.toISOString(),
          due_date: dueDate.toISOString(),
          pdf_url: storagePath,           // store path, not public URL
          metadata: metadataPayload,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Failed to create invoice row:', error);
        dbWarning = error.message;
        invoiceRecord = { invoice_number: invoiceNumber, storage_path: storagePath };
      } else {
        invoiceRecord = data;
      }
    }

    return NextResponse.json({
      success: true,
      data: invoiceRecord,
      ...(dbWarning ? { warning: `Invoice PDF uploaded but DB record failed: ${dbWarning}` } : {}),
    });
  } catch (error: any) {
    console.error('Invoice upload handler error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error while uploading invoice.' },
      { status: 500 }
    );
  }
}
