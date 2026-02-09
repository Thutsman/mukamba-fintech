import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * GET /api/admin/offers/stats
 * Returns offer counts for admin sidebar badge (e.g. pending count).
 */
export async function GET() {
  try {
    const supabase = createServiceClient();

    const { count: pendingCount, error } = await supabase
      .from('property_offers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      console.error('Admin offers stats error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch offer stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        pending: pendingCount ?? 0,
      },
    });
  } catch (e: any) {
    console.error('Admin offers stats error:', e);
    return NextResponse.json(
      { error: e?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
