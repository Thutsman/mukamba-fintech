import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { status } = await request.json();

    if (!userId || !status) {
      return NextResponse.json({ error: 'Missing userId or status' }, { status: 400 });
    }

    if (!['active', 'banned'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be active or banned' }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    if (status === 'banned') {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: '876000h' // 100 years (effectively permanent)
      });
      if (error) throw error;
    } else {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: 'none'
      });
      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: `User ${status === 'banned' ? 'banned' : 'unbanned'} successfully`
    });

  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[userId]/status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
