import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { sendTransactionalTemplateEmail, getAppUrl, safePreview } from '@/lib/transactional-email-service';
import { AdminActionRequiredEmailTemplate } from '@/lib/email-templates/admin-action-required';
import { getAdminNotificationRecipients } from '@/lib/admin-notification-recipients';
import * as React from 'react';

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
    // Use service role client to safely bypass RLS for admin-facing API
    const supabase = createAdminClient();
    
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
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply additional filters
    if (read !== null) {
      query = query.eq('read_by_admin', read === 'true');
    }
    if (property_id) {
      query = query.eq('property_id', property_id);
    }
    if (buyer_id) {
      query = query.eq('buyer_id', buyer_id);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: messages, error, count } = await query;

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
    const supabase = createAdminClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

    // Allow server-side creation; validation is done on client side before call

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

    // Admin email notification (best-effort)
    try {
      const appUrl = (() => {
        try {
          return getAppUrl();
        } catch (e) {
          console.error('NEXT_PUBLIC_APP_URL missing; using fallback URL:', e);
          return 'https://mukambagateway.com';
        }
      })();

      const adminRecipients = await getAdminNotificationRecipients({ supabase });
      if (adminRecipients.length > 0) {
        const preview = safePreview(validatedData.content, 240);

        const buyerIdentityParts = [
          validatedData.buyer_name,
          validatedData.buyer_email ? validatedData.buyer_email : null,
          validatedData.buyer_phone ? `Phone: ${validatedData.buyer_phone}` : null,
          `Buyer ID: ${validatedData.buyer_id}`,
        ].filter(Boolean);

        await sendTransactionalTemplateEmail({
          to: adminRecipients,
          subject: `New buyer message (${validatedData.property_title})`,
          react: React.createElement(AdminActionRequiredEmailTemplate, {
            title: 'New buyer message',
            message: [
              `Buyer: ${buyerIdentityParts.join(' • ')}`,
              `Property: ${validatedData.property_title}`,
              `Type: ${validatedData.message_type}`,
              '',
              'Preview:',
              preview,
              '',
              'Open the Admin Dashboard → Messages to reply.',
            ].join('\n'),
            cta: { label: 'Open Messages', url: `${appUrl}/?tab=messages` },
          }),
          tags: ['admin_message_received'],
          metadata: { message_id: String((message as any)?.id || ''), buyer_id: String(validatedData.buyer_id) },
        });
      }
    } catch (e) {
      console.error('Failed to send admin message notification email:', e);
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
