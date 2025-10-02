import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BuyerMessage {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  content: string;
  createdAt: string; // ISO string
  read: boolean;
}

interface MessageStoreState {
  messages: BuyerMessage[];
  addMessage: (msg: Omit<BuyerMessage, 'id' | 'createdAt' | 'read'>) => BuyerMessage;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

export const useMessageStore = create<MessageStoreState>()(
  persist(
    (set, get) => ({
      messages: [],

      addMessage: (msgInput) => {
        const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const newMsg: BuyerMessage = {
          id,
          createdAt: new Date().toISOString(),
          read: false,
          ...msgInput,
        };
        set((state) => ({ messages: [newMsg, ...state.messages] }));
        return newMsg;
      },

      markRead: (id) => {
        set((state) => ({
          messages: state.messages.map((m) => (m.id === id ? { ...m, read: true } : m)),
        }));
      },

      markAllRead: () => {
        set((state) => ({
          messages: state.messages.map((m) => ({ ...m, read: true })),
        }));
      },

      unreadCount: () => get().messages.filter((m) => !m.read).length,
    }),
    {
      name: 'mukamba-message-store',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);


