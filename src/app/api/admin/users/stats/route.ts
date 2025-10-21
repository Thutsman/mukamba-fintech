import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Get all users (we'll need to paginate through them)
    let allUsers: any[] = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage
      });

      if (error) {
        console.error('Error fetching users for stats:', error);
        return NextResponse.json({ error: 'Failed to fetch user statistics' }, { status: 500 });
      }

      allUsers = [...allUsers, ...data.users];
      hasMore = data.users.length === perPage;
      page++;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      total_users: allUsers.length,
      new_users_today: allUsers.filter(user => new Date(user.created_at) >= today).length,
      new_users_this_week: allUsers.filter(user => new Date(user.created_at) >= weekAgo).length,
      new_users_this_month: allUsers.filter(user => new Date(user.created_at) >= monthAgo).length,
      verified_users: allUsers.filter(user => user.email_confirmed_at || user.phone_confirmed_at).length,
      unverified_users: allUsers.filter(user => !user.email_confirmed_at && !user.phone_confirmed_at).length
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error in GET /api/admin/users/stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
