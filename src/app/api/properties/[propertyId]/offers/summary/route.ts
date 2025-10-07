import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(
  _req: Request,
  { params }: { params: { propertyId: string } }
) {
  try {
    const propertyId = params.propertyId;
    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'propertyId is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch only minimal, non-identifying fields for public bidding view
    const { data, error } = await supabase
      .from('property_offers')
      .select('offer_price, status, payment_method, submitted_at')
      .eq('property_id', propertyId)
      .in('status', ['pending', 'approved'])
      .order('submitted_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const offers = data || [];
    const prices = offers.map(o => Number(o.offer_price)).filter(v => !Number.isNaN(v));
    const count = prices.length;
    const max = count ? Math.max(...prices) : null;
    const min = count ? Math.min(...prices) : null;
    const avg = count ? Math.round(prices.reduce((a, b) => a + b, 0) / count) : null;

    return NextResponse.json({
      success: true,
      offers,
      summary: {
        count,
        highest: max,
        lowest: min,
        average: avg
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unexpected error' }, { status: 500 });
  }
}


