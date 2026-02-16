import { createClient } from '@/lib/supabase';

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
  property_id: string | null;
  property_title: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email?: string;
  buyer_phone?: string;
  content: string;
  message_type?: 'inquiry' | 'offer_related' | 'general';
}

export interface MessageFilters {
  page?: number;
  limit?: number;
  read?: boolean;
  property_id?: string;
  buyer_id?: string;
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
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.read !== undefined) params.set('read', String(filters.read));
  if (filters?.property_id) params.set('property_id', filters.property_id);
  if (filters?.buyer_id) params.set('buyer_id', filters.buyer_id);

  const res = await fetch(`/api/messages?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch messages');
  }

  const json = await res.json();
  return {
    messages: (json.messages || []) as BuyerMessage[],
    total: json.pagination?.total || (json.messages?.length || 0)
  };
}

// Get messages for a specific buyer (select only buyer_messages to avoid join/RLS issues)
export async function getBuyerMessages(buyerId: string): Promise<BuyerMessage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('buyer_messages')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) {
    const msg = error?.message ?? JSON.stringify(error);
    console.error('Error fetching buyer messages:', error);
    throw new Error(`Failed to fetch buyer messages: ${msg}`);
  }

  return (data || []) as BuyerMessage[];
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
    .select('*')
    .single();

  if (error) {
    console.error('Error creating message:', error);
    throw new Error('Failed to create message');
  }

  return data as BuyerMessage;
}

// Update a message
export async function updateMessage(messageId: string, updateData: UpdateMessageData): Promise<BuyerMessage> {
  const res = await fetch(`/api/messages/${messageId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updateData)
  });

  if (!res.ok) {
    throw new Error('Failed to update message');
  }
  const json = await res.json();
  return json.message as BuyerMessage;
}

// Delete a message
export async function deleteMessage(messageId: string): Promise<void> {
  const res = await fetch(`/api/messages/${messageId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete message');
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
