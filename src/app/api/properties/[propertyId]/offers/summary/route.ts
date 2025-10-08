import { NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    console.log('API: Fetching offers for propertyId:', propertyId);
    
    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'propertyId is required' }, { status: 400 });
    }

    // Try service client first, fallback to regular client
    let supabase;
    try {
      supabase = createServiceClient();
      console.log('API: Using service client');
    } catch (error) {
      console.log('API: Service client not available, using regular client:', error);
      supabase = createClient();
    }

    // First, let's check if there are any offers for this property at all
    const { data: allOffers, error: allOffersError } = await supabase
      .from('property_offers')
      .select('*')
      .eq('property_id', propertyId);

    console.log('API: All offers for property:', allOffers);
    console.log('API: All offers error:', allOffersError);

    // Let's also check what property IDs exist in the offers table
    const { data: allPropertyIds, error: propertyIdsError } = await supabase
      .from('property_offers')
      .select('property_id')
      .limit(10);
    
    console.log('API: Sample property IDs in offers table:', allPropertyIds);
    console.log('API: Property IDs error:', propertyIdsError);

    // Let's try a broader query first to see what columns are available
    const { data: sampleData, error: sampleError } = await supabase
      .from('property_offers')
      .select('*')
      .limit(5);
    
    console.log('API: Sample data from property_offers:', sampleData);
    console.log('API: Sample data error:', sampleError);

    // Fetch only minimal, non-identifying fields for public bidding view
    const { data, error } = await supabase
      .from('property_offers')
      .select('offer_price, status, payment_method, submitted_at')
      .eq('property_id', propertyId)
      .in('status', ['pending', 'approved'])
      .order('submitted_at', { ascending: false })
      .limit(50);

    console.log('API: Filtered offers:', data);
    console.log('API: Filtered offers error:', error);

    if (error) {
      console.error('API: Database error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const offers = data || [];
    console.log('API: Final offers count:', offers.length);
    
    const prices = offers.map(o => Number(o.offer_price)).filter(v => !Number.isNaN(v));
    const count = prices.length;
    const max = count ? Math.max(...prices) : null;
    const min = count ? Math.min(...prices) : null;
    const avg = count ? Math.round(prices.reduce((a, b) => a + b, 0) / count) : null;

    const response = {
      success: true,
      offers,
      summary: {
        count,
        highest: max,
        lowest: min,
        average: avg
      }
    };

    console.log('API: Response:', response);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unexpected error' }, { status: 500 });
  }
}



