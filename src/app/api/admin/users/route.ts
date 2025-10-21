import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    const supabase = createAdminClient();
    
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: limit
    });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Transform the auth users to our format
    const users = data.users.map(user => ({
      id: user.id,
      email: user.email || '',
      first_name: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0],
      last_name: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
      phone: user.phone,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      phone_confirmed_at: user.phone_confirmed_at,
      role: user.user_metadata?.role || 'user',
      status: (user as any).banned_until ? 'banned' : (user.email_confirmed_at ? 'active' : 'inactive'),
      is_verified: !!(user.email_confirmed_at || user.phone_confirmed_at),
      signup_method: user.phone ? 'phone' : 'email',
      provider: user.app_metadata?.provider
    }));

    // Sort by created_at descending (most recent first)
    const sortedUsers = users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      users: sortedUsers,
      pagination: {
        page,
        limit,
        total: users.length
      }
    });

  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
