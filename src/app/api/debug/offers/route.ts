import { NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase';

export async function GET() {
  try {
    // Try service client first, fallback to regular client
    let supabase;
    try {
      supabase = createServiceClient();
      console.log('Debug: Using service client');
    } catch (error) {
      console.log('Debug: Service client not available, using regular client:', error);
      try {
        supabase = createClient();
      } catch (clientError) {
        console.log('Debug: Regular client also not available:', clientError);
        // Return mock data for testing
        return NextResponse.json({
          success: true,
          message: 'Supabase not configured - using mock data',
          totalOffers: 3,
          uniquePropertyIds: ['ee1d488e-c6ed-42d9-91d9-56df99757f38', 'mock-property-2'],
          sampleOffers: [
            {
              id: 'mock-offer-1',
              property_id: 'ee1d488e-c6ed-42d9-91d9-56df99757f38',
              offer_price: 245000,
              status: 'pending',
              payment_method: 'cash',
              submitted_at: '2024-01-15T10:30:00Z'
            },
            {
              id: 'mock-offer-2', 
              property_id: 'ee1d488e-c6ed-42d9-91d9-56df99757f38',
              offer_price: 230000,
              status: 'pending',
              payment_method: 'installments',
              submitted_at: '2024-01-14T15:45:00Z'
            }
          ],
          setupRequired: true
        });
      }
    }

    // Get all offers to see the structure
    const { data: allOffers, error: allOffersError } = await supabase
      .from('property_offers')
      .select('*')
      .limit(20);

    if (allOffersError) {
      return NextResponse.json({ 
        success: false, 
        error: allOffersError.message,
        details: allOffersError 
      }, { status: 500 });
    }

    // Get unique property IDs
    const { data: propertyIds, error: propertyIdsError } = await supabase
      .from('property_offers')
      .select('property_id')
      .not('property_id', 'is', null);

    const uniquePropertyIds = [...new Set(propertyIds?.map(p => p.property_id) || [])];

    return NextResponse.json({
      success: true,
      totalOffers: allOffers?.length || 0,
      uniquePropertyIds,
      sampleOffers: allOffers?.slice(0, 5),
      propertyIdsError: propertyIdsError?.message
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unexpected error' 
    }, { status: 500 });
  }
}