import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { sendTransactionalTemplateEmail, getAppUrl, safePreview } from '@/lib/transactional-email-service';
import { AdminMessageReplyEmailTemplate } from '@/lib/email-templates/admin-message-reply';
import * as React from 'react';

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
    const supabase = createAdminClient();
    
    // Get the message
    const { id } = await params;
    const { data: message, error } = await supabase
      .from('buyer_messages')
      .select(`
        *,
        property:properties(id, title, city, suburb),
        buyer:user_profiles!buyer_messages_buyer_id_fkey(id, first_name, last_name, email, phone)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching message:', error);
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
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
    const supabase = createAdminClient();
    
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

    // Prepare update data
    const updateData: any = { ...validatedData };
    
    // If marking as read by buyer, set read_at and read_by
    if (validatedData.read_by_buyer === true) {
      updateData.read_at = new Date().toISOString();
      // admin endpoint; track as system update
      updateData.read_by = null;
    }

    // If marking as read by admin, set read_at and read_by
    if (validatedData.read_by_admin === true) {
      updateData.read_at = new Date().toISOString();
      updateData.read_by = null;
    }

    // If adding admin response, set admin response fields
    if (validatedData.admin_response) {
      updateData.admin_response_at = new Date().toISOString();
      updateData.admin_response_by = null;
      // Ensure buyer sees this as a new/unread response
      updateData.admin_response_read_by_buyer = false;
      updateData.admin_response_read_at = null;
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
        property:properties(id, title, city, suburb, street_address),
        buyer:user_profiles!buyer_messages_buyer_id_fkey(id, first_name, last_name, email, phone)
      `)
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }

    // If admin responded, email the buyer (best-effort)
    if (validatedData.admin_response) {
      const buyerEmail = message?.buyer?.email;
      const buyerFirstName = message?.buyer?.first_name || 'there';
      if (buyerEmail) {
        const ctaUrl = `${getAppUrl()}/?section=messages`;
        const preview = safePreview(validatedData.admin_response, 240);
        sendTransactionalTemplateEmail({
          to: [buyerEmail],
          subject: 'New message from Mukamba Gateway',
          react: React.createElement(AdminMessageReplyEmailTemplate, {
            firstName: buyerFirstName,
            propertyTitle: message?.property?.title,
            preview,
            cta: { label: 'Open inbox', url: ctaUrl },
          }),
          tags: ['message_reply'],
          metadata: { message_id: String(id) },
        }).catch((e) => {
          console.error('Failed to send message reply email:', e);
        });
      }
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
    const supabase = createAdminClient();

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
