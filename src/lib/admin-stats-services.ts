import { createServiceClient } from '@/lib/supabase';

export interface RealAdminStats {
  totalUsers: number;
  activeProperties: number;
  activeRentToBuy: number;
  userGrowth: number;
  propertyGrowth: number;
  pendingListings: number;
  rejectedListings: number;
}

export async function getRealAdminStats(): Promise<RealAdminStats> {
  try {
    // Call server-only API route to avoid exposing service role in client
    const res = await fetch('/api/admin/stats/overview', {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch overview stats: ${res.status}`);
    }
    const body = await res.json();
    return body.data as RealAdminStats;
  } catch (error) {
    console.error('Error in getRealAdminStats:', error);
    return {
      totalUsers: 0,
      activeProperties: 0,
      activeRentToBuy: 0,
      userGrowth: 0,
      propertyGrowth: 0,
      pendingListings: 0,
      rejectedListings: 0,
    };
  }
}
