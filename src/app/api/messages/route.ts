import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const createMessageSchema = z.object({
  property_id: z.string().uuid(),
  property_title: z.string().min(1),
  buyer_id: z.string().uuid(),
  buyer_name: z.string().min(1),
  buyer_email: z.string().email().optional(),
  buyer_phone: z.string().optional(),
  content: z.string().min(1),
  message_type: z.enum(['inquiry', 'offer_related', 'general']).default('inquiry')
});

const updateMessageSchema = z.object({
  read_by_buyer: z.boolean().optional(),
  read_by_admin: z.boolean().optional(),
  admin_response: z.string().optional(),
  admin_response_read_by_buyer: z.boolean().optional()
});

// GET /api/messages - Get messages (with filtering for admin vs buyer)
export async function GET(request: NextRequest) {
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
    
    console.log('API: User ID:', user.id);
    console.log('API: User roles:', userProfile.roles);
    console.log('API: Is admin:', isAdmin);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const read = searchParams.get('read');
    const property_id = searchParams.get('property_id');
    const buyer_id = searchParams.get('buyer_id');
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('buyer_messages')
      .select(`
        *,
        property:properties(id, title, city, suburb),
        buyer:user_profiles!buyer_messages_buyer_id_fkey(id, first_name, last_name, email, phone)
      `)
      .order('created_at', { ascending: false });

    // Apply filters based on user role
    if (!isAdmin) {
      // Buyers can only see their own messages
      query = query.eq('buyer_id', user.id);
    }

    // Apply additional filters
    if (read !== null) {
      query = query.eq('read', read === 'true');
    }
    if (property_id) {
      query = query.eq('property_id', property_id);
    }
    if (buyer_id && isAdmin) {
      query = query.eq('buyer_id', buyer_id);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    console.log('API: Executing query for messages...');
    const { data: messages, error, count } = await query;
    
    console.log('API: Query result - messages:', messages?.length || 0);
    console.log('API: Query result - error:', error);
    console.log('API: Query result - count:', count);

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/messages - Create a new message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

    // Verify the buyer_id matches the authenticated user
    if (validatedData.buyer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to create message for another user' }, { status: 403 });
    }

    // Insert the message
    const { data: message, error } = await supabase
      .from('buyer_messages')
      .insert({
        ...validatedData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
