import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * GET /api/admin/payments
 * Returns payment rows from offer_payments joined to property_offers,
 * properties, and user_profiles (buyer).
 * Supports query params: status, q (search), dateFrom, dateTo
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || 'all';
    const q = searchParams.get('q') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Fetch all offer_payments
    let query = supabase
      .from('offer_payments')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply date filters
    if (dateFrom) {
      query = query.gte('created_at', new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      // Include the entire end day
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data: payments, error: paymentsError } = await query;

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      );
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Collect unique IDs for joins
    const offerIds = [...new Set(payments.map((p: any) => p.offer_id).filter(Boolean))];
    const buyerIds = [...new Set(payments.map((p: any) => p.buyer_id).filter(Boolean))];

    // Fetch related offers with property info
    let offers: any[] = [];
    if (offerIds.length > 0) {
      const { data: offerData } = await supabase
        .from('property_offers')
        .select('id, property_id, buyer_id, seller_id, offer_price, deposit_amount, payment_method, offer_reference, status')
        .in('id', offerIds);
      offers = offerData || [];
    }

    // Fetch properties from offers
    const propertyIds = [...new Set(offers.map((o: any) => o.property_id).filter(Boolean))];
    let properties: any[] = [];
    if (propertyIds.length > 0) {
      const { data: propData } = await supabase
        .from('properties')
        .select('id, title, price, currency, city, country')
        .in('id', propertyIds);
      properties = propData || [];
    }

    // Fetch buyer profiles
    let buyers: any[] = [];
    if (buyerIds.length > 0) {
      const { data: buyerData } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, phone')
        .in('id', buyerIds);
      buyers = buyerData || [];
    }

    // Fetch seller profiles from offers
    const sellerIds = [...new Set(offers.map((o: any) => o.seller_id).filter(Boolean))];
    let sellers: any[] = [];
    if (sellerIds.length > 0) {
      const { data: sellerData } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', sellerIds);
      sellers = sellerData || [];
    }

    // Fetch invoices for offers
    let invoices: any[] = [];
    if (offerIds.length > 0) {
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('id, offer_id, invoice_number, status, total, amount_due')
        .in('offer_id', offerIds);
      invoices = invoiceData || [];
    }

    // Build lookup maps
    const offerMap = new Map(offers.map((o: any) => [o.id, o]));
    const propertyMap = new Map(properties.map((p: any) => [p.id, p]));
    const buyerMap = new Map(buyers.map((b: any) => [b.id, b]));
    const sellerMap = new Map(sellers.map((s: any) => [s.id, s]));
    const invoiceMap = new Map<string, any>();
    invoices.forEach((inv: any) => {
      // Keep latest invoice per offer
      if (!invoiceMap.has(inv.offer_id) || inv.id > (invoiceMap.get(inv.offer_id)?.id || '')) {
        invoiceMap.set(inv.offer_id, inv);
      }
    });

    // Enrich payment records
    const enriched = payments.map((payment: any) => {
      const offer = offerMap.get(payment.offer_id);
      const property = offer ? propertyMap.get(offer.property_id) : null;
      const buyer = buyerMap.get(payment.buyer_id);
      const seller = offer ? sellerMap.get(offer.seller_id) : null;
      const invoice = invoiceMap.get(payment.offer_id);

      return {
        ...payment,
        offer: offer ? {
          id: offer.id,
          offer_reference: offer.offer_reference,
          offer_price: offer.offer_price,
          deposit_amount: offer.deposit_amount,
          payment_method: offer.payment_method,
          status: offer.status,
        } : null,
        property: property ? {
          id: property.id,
          title: property.title,
          price: property.price,
          currency: property.currency,
          city: property.city,
          country: property.country,
        } : null,
        buyer: buyer ? {
          id: buyer.id,
          first_name: buyer.first_name,
          last_name: buyer.last_name,
          email: buyer.email,
          phone: buyer.phone,
        } : null,
        seller: seller ? {
          id: seller.id,
          first_name: seller.first_name,
          last_name: seller.last_name,
          email: seller.email,
        } : null,
        invoice: invoice ? {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          status: invoice.status,
          total: invoice.total,
          amount_due: invoice.amount_due,
        } : null,
      };
    });

    // Apply text search filter on enriched data (buyer name, seller name, property title, offer ref)
    let filtered = enriched;
    if (q) {
      const lower = q.toLowerCase();
      filtered = enriched.filter((p: any) => {
        const buyerName = p.buyer ? `${p.buyer.first_name} ${p.buyer.last_name}`.toLowerCase() : '';
        const sellerName = p.seller ? `${p.seller.first_name} ${p.seller.last_name}`.toLowerCase() : '';
        const propertyTitle = p.property?.title?.toLowerCase() || '';
        const offerRef = p.offer?.offer_reference?.toLowerCase() || '';
        const invoiceNum = p.invoice?.invoice_number?.toLowerCase() || '';
        return (
          buyerName.includes(lower) ||
          sellerName.includes(lower) ||
          propertyTitle.includes(lower) ||
          offerRef.includes(lower) ||
          invoiceNum.includes(lower)
        );
      });
    }

    return NextResponse.json({ data: filtered });
  } catch (e: any) {
    console.error('Admin payments error:', e);
    return NextResponse.json(
      { error: e?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
