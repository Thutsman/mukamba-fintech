import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * GET /api/admin/payments/stats
 * Returns aggregate counts/sums for payment summary cards and sidebar badge.
 */
export async function GET() {
  try {
    const supabase = createServiceClient();

    // Fetch all payments (we aggregate in JS for simplicity)
    const { data: payments, error } = await supabase
      .from('offer_payments')
      .select('id, status, amount, created_at, updated_at, offer_id');

    if (error) {
      console.error('Error fetching payment stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment stats' },
        { status: 500 }
      );
    }

    const allPayments = payments || [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Pending count (for sidebar badge)
    const pendingCount = allPayments.filter((p: any) => p.status === 'pending').length;

    // Completed this month
    const completedThisMonth = allPayments
      .filter((p: any) => {
        if (p.status !== 'completed') return false;
        const updatedAt = new Date(p.updated_at || p.created_at);
        return updatedAt >= monthStart;
      })
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    // Failed / cancelled count
    const failedCount = allPayments.filter(
      (p: any) => p.status === 'failed' || p.status === 'cancelled'
    ).length;

    // Total completed (all time)
    const totalCompleted = allPayments
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    // Buyers near completion: group completed amounts by offer, compare with offer totals
    // We need offer data for this
    const offerIds = [...new Set(allPayments.map((p: any) => p.offer_id).filter(Boolean))];
    let buyersNearCompletion = 0;

    if (offerIds.length > 0) {
      const { data: offers } = await supabase
        .from('property_offers')
        .select('id, offer_price')
        .in('id', offerIds);

      if (offers && offers.length > 0) {
        const offerTotalMap = new Map(offers.map((o: any) => [o.id, o.offer_price]));

        // Sum completed payments per offer
        const paidByOffer = new Map<string, number>();
        allPayments
          .filter((p: any) => p.status === 'completed')
          .forEach((p: any) => {
            const current = paidByOffer.get(p.offer_id) || 0;
            paidByOffer.set(p.offer_id, current + (p.amount || 0));
          });

        // Count offers where paid >= 80% of offer price
        paidByOffer.forEach((paid, offerId) => {
          const total = offerTotalMap.get(offerId) || 0;
          if (total > 0 && paid / total >= 0.8) {
            buyersNearCompletion++;
          }
        });
      }
    }

    return NextResponse.json({
      data: {
        pendingCount,
        completedThisMonth,
        failedCount,
        totalCompleted,
        buyersNearCompletion,
      },
    });
  } catch (e: any) {
    console.error('Payment stats error:', e);
    return NextResponse.json(
      { error: e?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
