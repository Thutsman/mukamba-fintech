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

    // Load profile flags for the listed users
    const userIds = data.users.map(user => user.id);
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, phone, is_phone_verified, is_identity_verified')
      .in('id', userIds);

    if (profileError) {
      console.error('Error fetching user profiles:', profileError);
    }

    const profileMap = new Map<string, { phone?: string; is_phone_verified?: boolean; is_identity_verified?: boolean }>();
    profileData?.forEach((profile) => {
      profileMap.set(profile.id, {
        phone: profile.phone,
        is_phone_verified: profile.is_phone_verified ?? false,
        is_identity_verified: profile.is_identity_verified ?? false
      });
    });

    // Transform the auth users to our format and merge profile flags
    const users = data.users.map(user => ({
      id: user.id,
      email: user.email || '',
      first_name: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0],
      last_name: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
      phone: profileMap.get(user.id)?.phone || user.phone,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      phone_confirmed_at: user.phone_confirmed_at,
      role: user.user_metadata?.role || 'user',
      status: (user as any).banned_until ? 'banned' : (user.email_confirmed_at ? 'active' : 'inactive'),
      is_verified: !!(user.email_confirmed_at || user.phone_confirmed_at),
      is_phone_verified: profileMap.get(user.id)?.is_phone_verified ?? false,
      is_identity_verified: profileMap.get(user.id)?.is_identity_verified ?? false,
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
