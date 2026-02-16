import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  createMessage, 
  getMessages, 
  getBuyerMessages,
  updateMessage, 
  deleteMessage,
  markMessageAsReadByBuyer,
  markAdminResponseAsRead,
  addAdminResponse,
  getUnreadMessagesCount,
  getUnreadAdminResponsesCount,
  type BuyerMessage as DatabaseBuyerMessage,
  type CreateMessageData,
  type MessageFilters
} from '@/lib/message-services';

export interface BuyerMessage {
  id: string;
  propertyId: string | null;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  content: string;
  createdAt: string; // ISO string
  readByBuyer: boolean;
  readByAdmin: boolean;
  messageType?: 'inquiry' | 'offer_related' | 'general';
  adminResponse?: string;
  adminResponseAt?: string;
  adminResponseReadByBuyer: boolean;
  adminResponseReadAt?: string;
}

interface MessageStoreState {
  messages: BuyerMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addMessage: (msg: Omit<BuyerMessage, 'id' | 'createdAt' | 'readByBuyer' | 'readByAdmin' | 'adminResponseReadByBuyer' | 'propertyId'> & { propertyId: string | null }) => Promise<BuyerMessage>;
  loadMessages: (filters?: MessageFilters) => Promise<void>;
  // Buyer-specific loader that respects RLS
  loadBuyerMessages: (buyerId: string) => Promise<void>;
  // Admin view marking (kept for admin components)
  markRead: (id: string) => Promise<void>;
  // Buyer view marking
  markReadByBuyer: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  markAdminResponseAsRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  addAdminResponse: (id: string, response: string) => Promise<void>;
  
  // Computed
  unreadCount: () => number;
  unreadAdminResponsesCount: () => number;
  getUnreadCount: () => Promise<number>;
  getUnreadAdminResponsesCount: (buyerId: string) => Promise<number>;
}

// Helper function to convert database message to store message
const convertDatabaseMessage = (dbMsg: DatabaseBuyerMessage): BuyerMessage => ({
  id: dbMsg.id,
  propertyId: dbMsg.property_id,
  propertyTitle: dbMsg.property_title,
  buyerId: dbMsg.buyer_id,
  buyerName: dbMsg.buyer_name,
  buyerEmail: dbMsg.buyer_email,
  buyerPhone: dbMsg.buyer_phone,
  content: dbMsg.content,
  createdAt: dbMsg.created_at,
  readByBuyer: dbMsg.read_by_buyer,
  readByAdmin: dbMsg.read_by_admin,
  messageType: dbMsg.message_type,
  adminResponse: dbMsg.admin_response,
  adminResponseAt: dbMsg.admin_response_at,
  adminResponseReadByBuyer: dbMsg.admin_response_read_by_buyer,
  adminResponseReadAt: dbMsg.admin_response_read_at,
});

export const useMessageStore = create<MessageStoreState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      error: null,

      addMessage: async (msgInput) => {
        set({ isLoading: true, error: null });
        
        try {
          const createData: CreateMessageData = {
            property_id: msgInput.propertyId,
            property_title: msgInput.propertyTitle,
            buyer_id: msgInput.buyerId,
            buyer_name: msgInput.buyerName,
            buyer_email: msgInput.buyerEmail,
            buyer_phone: msgInput.buyerPhone,
            content: msgInput.content,
            message_type: msgInput.messageType || 'inquiry',
          };

          const dbMessage = await createMessage(createData);
          const newMessage = convertDatabaseMessage(dbMessage);
          
          set((state) => ({ 
            messages: [newMessage, ...state.messages],
            isLoading: false 
          }));
          
          return newMessage;
        } catch (error) {
          console.error('Failed to add message:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add message',
            isLoading: false 
          });
          throw error;
        }
      },

      loadMessages: async (filters = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Loading messages with filters:', filters);
          const response = await getMessages(filters);
          console.log('Messages response:', response);
          const messages = response.messages.map(convertDatabaseMessage);
          console.log('Converted messages:', messages);
          
          set({ 
            messages,
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to load messages:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load messages',
            isLoading: false 
          });
        }
      },

      // Strictly loads messages for a specific buyer using the client SDK (RLS enforced)
      loadBuyerMessages: async (buyerId: string) => {
        set({ isLoading: true, error: null });
        try {
          const buyerMessages = await getBuyerMessages(buyerId);
          const messages = buyerMessages.map(convertDatabaseMessage);
          set({ messages, isLoading: false });
        } catch (error) {
          console.error('Failed to load buyer messages:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load messages',
            isLoading: false 
          });
        }
      },

      markRead: async (id) => {
        try {
          await updateMessage(id, { read_by_admin: true });
          set((state) => ({
            messages: state.messages.map((m) => (m.id === id ? { ...m, readByAdmin: true } : m)),
          }));
        } catch (error) {
          console.error('Failed to mark message as read:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to mark message as read' });
        }
      },

      // Buyer flow: mark as read by buyer
      markReadByBuyer: async (id) => {
        try {
          await markMessageAsReadByBuyer(id);
          set((state) => ({
            messages: state.messages.map((m) => (m.id === id ? { ...m, readByBuyer: true } : m)),
          }));
        } catch (error) {
          console.error('Failed to mark message as read by buyer:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to mark message as read' });
        }
      },

      markAdminResponseAsRead: async (id) => {
        try {
          await markAdminResponseAsRead(id);
          set((state) => ({
            messages: state.messages.map((m) => (m.id === id ? { ...m, adminResponseReadByBuyer: true } : m)),
          }));
        } catch (error) {
          console.error('Failed to mark admin response as read:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to mark admin response as read' });
        }
      },

      markAllRead: async () => {
        try {
          const unreadMessages = get().messages.filter(m => !m.readByAdmin);
          await Promise.all(unreadMessages.map(msg => updateMessage(msg.id, { read_by_admin: true })));
          
          set((state) => ({
            messages: state.messages.map((m) => ({ ...m, readByAdmin: true })),
          }));
        } catch (error) {
          console.error('Failed to mark all messages as read:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to mark all messages as read' });
        }
      },

      deleteMessage: async (id) => {
        try {
          await deleteMessage(id);
        set((state) => ({
            messages: state.messages.filter((m) => m.id !== id),
          }));
        } catch (error) {
          console.error('Failed to delete message:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to delete message' });
        }
      },

      addAdminResponse: async (id, response) => {
        try {
          const updatedMessage = await addAdminResponse(id, response);
          const convertedMessage = convertDatabaseMessage(updatedMessage);
          
        set((state) => ({
            messages: state.messages.map((m) => (m.id === id ? convertedMessage : m)),
          }));
        } catch (error) {
          console.error('Failed to add admin response:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to add admin response' });
        }
      },

      unreadCount: () => get().messages.filter((m) => !m.readByBuyer).length,

      unreadAdminResponsesCount: () => get().messages.filter((m) => m.adminResponse && !m.adminResponseReadByBuyer).length,

      getUnreadCount: async () => {
        try {
          return await getUnreadMessagesCount();
        } catch (error) {
          console.error('Failed to get unread count:', error);
          return 0;
        }
      },

      getUnreadAdminResponsesCount: async (buyerId: string) => {
        try {
          return await getUnreadAdminResponsesCount(buyerId);
        } catch (error) {
          console.error('Failed to get unread admin responses count:', error);
          return 0;
        }
      },
    }),
    {
      name: 'mukamba-message-store',
      partialize: (state) => ({ 
        messages: state.messages,
        // Don't persist loading states and errors
      }),
    }
  )
);