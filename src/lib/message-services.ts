import { createClient } from '@/lib/supabase/client';

export interface BuyerMessage {
  id: string;
  property_id: string;
  property_title: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email?: string;
  buyer_phone?: string;
  content: string;
  message_type: 'inquiry' | 'offer_related' | 'general';
  read_by_buyer: boolean;
  read_by_admin: boolean;
  read_at?: string;
  read_by?: string;
  admin_response?: string;
  admin_response_at?: string;
  admin_response_by?: string;
  admin_response_read_by_buyer: boolean;
  admin_response_read_at?: string;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    title: string;
    location: {
      suburb: string;
      city: string;
    };
  };
  buyer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
}

export interface CreateMessageData {
  property_id: string;
  property_title: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email?: string;
  buyer_phone?: string;
  content: string;
  message_type?: 'inquiry' | 'offer_related' | 'general';
}

export interface UpdateMessageData {
  read_by_buyer?: boolean;
  read_by_admin?: boolean;
  admin_response?: string;
  admin_response_read_by_buyer?: boolean;
}

// Get all messages for admin dashboard
export async function getMessages(filters?: {
  page?: number;
  limit?: number;
  read?: boolean;
  property_id?: string;
  buyer_id?: string;
}): Promise<{ messages: BuyerMessage[]; total: number }> {
  const supabase = createClient();
  
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('buyer_messages')
    .select(`
      *,
      property:properties(id, title, location),
      buyer:user_profiles!buyer_messages_buyer_id_fkey(id, first_name, last_name, email, phone)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (filters?.read !== undefined) {
    query = query.eq('read', filters.read);
  }
  if (filters?.property_id) {
    query = query.eq('property_id', filters.property_id);
  }
  if (filters?.buyer_id) {
    query = query.eq('buyer_id', filters.buyer_id);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }

  return {
    messages: data || [],
    total: count || 0
  };
}

// Get messages for a specific buyer
export async function getBuyerMessages(buyerId: string): Promise<BuyerMessage[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('buyer_messages')
    .select(`
      *,
      property:properties(id, title, location),
      buyer:user_profiles!buyer_messages_buyer_id_fkey(id, first_name, last_name, email, phone)
    `)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching buyer messages:', error);
    throw new Error('Failed to fetch buyer messages');
  }

  return data || [];
}

// Create a new message
export async function createMessage(messageData: CreateMessageData): Promise<BuyerMessage> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('buyer_messages')
    .insert({
      ...messageData,
      message_type: messageData.message_type || 'inquiry'
    })
    .select(`
      *,
      property:properties(id, title, location),
      buyer:user_profiles!buyer_messages_buyer_id_fkey(id, first_name, last_name, email, phone)
    `)
    .single();

  if (error) {
    console.error('Error creating message:', error);
    throw new Error('Failed to create message');
  }

  return data;
}

// Update a message
export async function updateMessage(messageId: string, updateData: UpdateMessageData): Promise<BuyerMessage> {
  const supabase = createClient();
  
  // Prepare update data with timestamps
  const updatePayload: any = { ...updateData };
  
  if (updateData.read_by_buyer === true) {
    updatePayload.read_at = new Date().toISOString();
  }
  
  if (updateData.read_by_admin === true) {
    updatePayload.read_at = new Date().toISOString();
  }
  
  if (updateData.admin_response) {
    updatePayload.admin_response_at = new Date().toISOString();
  }
  
  if (updateData.admin_response_read_by_buyer === true) {
    updatePayload.admin_response_read_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('buyer_messages')
    .update(updatePayload)
    .eq('id', messageId)
    .select(`
      *,
      property:properties(id, title, location),
      buyer:user_profiles!buyer_messages_buyer_id_fkey(id, first_name, last_name, email, phone)
    `)
    .single();

  if (error) {
    console.error('Error updating message:', error);
    throw new Error('Failed to update message');
  }

  return data;
}

// Delete a message
export async function deleteMessage(messageId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('buyer_messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error);
    throw new Error('Failed to delete message');
  }
}

// Mark message as read by buyer
export async function markMessageAsReadByBuyer(messageId: string): Promise<BuyerMessage> {
  return updateMessage(messageId, { read_by_buyer: true });
}

// Mark message as read by admin
export async function markMessageAsReadByAdmin(messageId: string): Promise<BuyerMessage> {
  return updateMessage(messageId, { read_by_admin: true });
}

// Add admin response to a message
export async function addAdminResponse(messageId: string, response: string): Promise<BuyerMessage> {
  return updateMessage(messageId, { admin_response: response });
}

// Mark admin response as read by buyer
export async function markAdminResponseAsRead(messageId: string): Promise<BuyerMessage> {
  return updateMessage(messageId, { admin_response_read_by_buyer: true });
}

// Get unread messages count for admin
export async function getUnreadMessagesCount(): Promise<number> {
  const supabase = createClient();
  
  const { count, error } = await supabase
    .from('buyer_messages')
    .select('*', { count: 'exact', head: true })
    .eq('read_by_admin', false);

  if (error) {
    console.error('Error fetching unread messages count:', error);
    throw new Error('Failed to fetch unread messages count');
  }

  return count || 0;
}

// Get unread admin responses count for buyer
export async function getUnreadAdminResponsesCount(buyerId: string): Promise<number> {
  const supabase = createClient();
  
  const { count, error } = await supabase
    .from('buyer_messages')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', buyerId)
    .not('admin_response', 'is', null)
    .eq('admin_response_read_by_buyer', false);

  if (error) {
    console.error('Error fetching unread admin responses count:', error);
    throw new Error('Failed to fetch unread admin responses count');
  }

  return count || 0;
}
