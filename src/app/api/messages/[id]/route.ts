import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateMessageSchema = z.object({
  read_by_buyer: z.boolean().optional(),
  read_by_admin: z.boolean().optional(),
  admin_response: z.string().optional(),
  admin_response_read_by_buyer: z.boolean().optional()
});

// GET /api/messages/[id] - Get a specific message
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check roles
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('roles')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const isAdmin = userProfile.roles?.includes('admin') || false;

    // Get the message
    const { id } = await params;
    const { data: message, error } = await supabase
      .from('buyer_messages')
      .select(`
        *,
        property:properties(id, title, location),
        buyer:user_profiles!buyer_messages_buyer_id_fkey(id, first_name, last_name, email, phone)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching message:', error);
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check permissions
    if (!isAdmin && message.buyer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view this message' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Error in GET /api/messages/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/messages/[id] - Update a message (mark as read, add admin response)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check roles
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('roles')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const isAdmin = userProfile.roles?.includes('admin') || false;

    const body = await request.json();
    const validatedData = updateMessageSchema.parse(body);

    // Check if message exists
    const { id } = await params;
    const { data: existingMessage, error: fetchError } = await supabase
      .from('buyer_messages')
      .select('buyer_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check permissions
    if (!isAdmin && existingMessage.buyer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to update this message' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = { ...validatedData };
    
    // If marking as read by buyer, set read_at and read_by
    if (validatedData.read_by_buyer === true) {
      updateData.read_at = new Date().toISOString();
      updateData.read_by = user.id;
    }

    // If marking as read by admin, set read_at and read_by
    if (validatedData.read_by_admin === true) {
      updateData.read_at = new Date().toISOString();
      updateData.read_by = user.id;
    }

    // If adding admin response, set admin response fields
    if (validatedData.admin_response && isAdmin) {
      updateData.admin_response_at = new Date().toISOString();
      updateData.admin_response_by = user.id;
    }

    // If marking admin response as read by buyer
    if (validatedData.admin_response_read_by_buyer === true) {
      updateData.admin_response_read_at = new Date().toISOString();
    }

    // Update the message
    const { data: message, error } = await supabase
      .from('buyer_messages')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        property:properties(id, title, location),
        buyer:user_profiles!buyer_messages_buyer_id_fkey(id, first_name, last_name, email, phone)
      `)
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in PATCH /api/messages/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/messages/[id] - Delete a message (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check roles
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('roles')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const isAdmin = userProfile.roles?.includes('admin') || false;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to delete messages' }, { status: 403 });
    }

    // Delete the message
    const { id } = await params;
    const { error } = await supabase
      .from('buyer_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting message:', error);
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/messages/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
