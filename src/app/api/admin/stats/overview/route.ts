import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Total users from user_profiles
    const { count: totalUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('overview stats: usersError', usersError);
    }

    // Active properties: status = 'active' OR 'available'
    const { count: activeProperties, error: activePropsError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .or('status.eq.active,status.eq.available');

    if (activePropsError) {
      console.error('overview stats: activePropsError', activePropsError);
    }

    // Rent-to-buy available/active
    const { count: activeRentToBuy, error: rtbError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('rent_to_buy', true)
      .or('status.eq.active,status.eq.available');

    if (rtbError) {
      console.error('overview stats: rtbError', rtbError);
    }

    // Pending listings
    const { count: pendingListings, error: pendErr } = await supabase
      .from('property_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendErr) {
      console.error('overview stats: pendErr', pendErr);
    }

    // Rejected listings
    const { count: rejectedListings, error: rejErr } = await supabase
      .from('property_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');

    if (rejErr) {
      console.error('overview stats: rejErr', rejErr);
    }

    const payload = {
      totalUsers: totalUsers || 0,
      activeProperties: activeProperties || 0,
      activeRentToBuy: activeRentToBuy || 0,
      userGrowth: 0,
      propertyGrowth: 0,
      pendingListings: pendingListings || 0,
      rejectedListings: rejectedListings || 0,
    };

    return NextResponse.json({ data: payload });
  } catch (e: any) {
    console.error('overview stats error', e);
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}


