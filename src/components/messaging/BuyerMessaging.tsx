'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  User,
  Building,
  Calendar,
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  Phone,
  Mail,
  Star,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageThread } from './MessageThread';
import { MessageComposer } from './MessageComposer';

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  adminId: string; // Always routed through admin
  propertyId?: string;
  content: string;
  status: 'pending_admin_review' | 'sent_to_recipient' | 'delivered';
  timestamp: Date;
  messageType: 'inquiry' | 'application_related' | 'negotiation';
}

export interface MessageThread {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyImage?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
  status: 'active' | 'archived' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

interface BuyerMessagingProps {
  userId: string;
  onBack: () => void;
  onViewProperty?: (propertyId: string) => void;
}

export const BuyerMessaging: React.FC<BuyerMessagingProps> = ({
  userId,
  onBack,
  onViewProperty
}) => {
  const [selectedThread, setSelectedThread] = React.useState<MessageThread | null>(null);
  const [showComposer, setShowComposer] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | 'inquiry' | 'application_related' | 'negotiation'>('all');
  const [showArchived, setShowArchived] = React.useState(false);

  // Mock data for message threads
  const mockThreads: MessageThread[] = [
    {
      id: 'thread-1',
      propertyId: 'prop-1',
      propertyTitle: 'Modern 3BR House in Sandton',
      propertyImage: '/api/placeholder/400/300',
      sellerId: 'seller-1',
      sellerName: 'John Smith',
      sellerAvatar: '/api/placeholder/100/100',
      lastMessage: {
        id: 'msg-1',
        fromUserId: userId,
        toUserId: 'seller-1',
        adminId: 'admin-1',
        propertyId: 'prop-1',
        content: 'Hi, I\'m interested in viewing this property. What\'s the best time to schedule a viewing?',
        status: 'delivered',
        timestamp: new Date('2024-01-15T10:30:00'),
        messageType: 'inquiry'
      },
      unreadCount: 0,
      status: 'active',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15T10:30:00')
    },
    {
      id: 'thread-2',
      propertyId: 'prop-2',
      propertyTitle: 'Luxury Apartment in Rosebank',
      propertyImage: '/api/placeholder/400/300',
      sellerId: 'seller-2',
      sellerName: 'Sarah Johnson',
      sellerAvatar: '/api/placeholder/100/100',
      lastMessage: {
        id: 'msg-2',
        fromUserId: 'seller-2',
        toUserId: userId,
        adminId: 'admin-1',
        propertyId: 'prop-2',
        content: 'Thank you for your application. We\'re reviewing it and will get back to you within 48 hours.',
        status: 'delivered',
        timestamp: new Date('2024-01-14T15:45:00'),
        messageType: 'application_related'
      },
      unreadCount: 1,
      status: 'active',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-14T15:45:00')
    },
    {
      id: 'thread-3',
      propertyId: 'prop-3',
      propertyTitle: 'Family Home in Pretoria',
      propertyImage: '/api/placeholder/400/300',
      sellerId: 'seller-3',
      sellerName: 'Mike Wilson',
      sellerAvatar: '/api/placeholder/100/100',
      lastMessage: {
        id: 'msg-3',
        fromUserId: userId,
        toUserId: 'seller-3',
        adminId: 'admin-1',
        propertyId: 'prop-3',
        content: 'Is there any flexibility on the asking price? I\'m very interested but it\'s slightly above my budget.',
        status: 'pending_admin_review',
        timestamp: new Date('2024-01-13T09:15:00'),
        messageType: 'negotiation'
      },
      unreadCount: 0,
      status: 'active',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-13T09:15:00')
    }
  ];

  const filteredThreads = React.useMemo(() => {
    let threads = mockThreads.filter(thread => 
      showArchived ? thread.status === 'archived' : thread.status === 'active'
    );

    if (searchQuery) {
      threads = threads.filter(thread =>
        thread.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      threads = threads.filter(thread =>
        thread.lastMessage.messageType === filterType
      );
    }

    return threads.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [mockThreads, searchQuery, filterType, showArchived]);

  const handleThreadSelect = (thread: MessageThread) => {
    setSelectedThread(thread);
    setShowComposer(false);
  };

  const handleNewMessage = () => {
    setSelectedThread(null);
    setShowComposer(true);
  };

  const handleBackToThreads = () => {
    setSelectedThread(null);
    setShowComposer(false);
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'pending_admin_review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'sent_to_recipient':
        return <Check className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMessageTypeBadge = (type: Message['messageType']) => {
    const config = {
      inquiry: { color: 'bg-blue-100 text-blue-800', label: 'Inquiry' },
      application_related: { color: 'bg-green-100 text-green-800', label: 'Application' },
      negotiation: { color: 'bg-purple-100 text-purple-800', label: 'Negotiation' }
    };
    const configItem = config[type];
    return <Badge className={`${configItem.color} text-xs`}>{configItem.label}</Badge>;
  };

  if (selectedThread) {
    return (
      <MessageThread
        thread={selectedThread}
        userId={userId}
        onBack={handleBackToThreads}
        onViewProperty={onViewProperty}
      />
    );
  }

  if (showComposer) {
    return (
      <MessageComposer
        userId={userId}
        onBack={handleBackToThreads}
        onMessageSent={(threadId) => {
          console.log('Message sent, thread created:', threadId);
          setShowComposer(false);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-10 w-10 sm:h-8 sm:w-8 p-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">Messages</h1>
              <p className="text-xs sm:text-sm text-slate-500 truncate">Admin-mediated communication</p>
            </div>
          </div>
          <Button
            onClick={handleNewMessage}
            className="bg-red-600 hover:bg-red-700 h-10 px-3 sm:px-4"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">New Message</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search messages, sellers, or properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm bg-white h-10"
            >
              <option value="all">All Types</option>
              <option value="inquiry">Inquiries</option>
              <option value="application_related">Applications</option>
              <option value="negotiation">Negotiations</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className={`h-10 px-3 ${showArchived ? 'bg-slate-100' : ''}`}
            >
              {showArchived ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Message Threads */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {showArchived ? 'No Archived Messages' : 'No Messages Yet'}
            </h3>
            <p className="text-slate-500 mb-4">
              {showArchived 
                ? 'You don\'t have any archived message threads.'
                : 'Start a conversation with property sellers to get help with your inquiries.'
              }
            </p>
            {!showArchived && (
              <Button onClick={handleNewMessage} className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Start New Message
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-3 sm:p-4">
            {filteredThreads.map((thread) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handleThreadSelect(thread)}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarImage src={thread.sellerAvatar} alt={thread.sellerName} />
                    <AvatarFallback className="bg-slate-200 text-slate-600 text-sm sm:text-base">
                      {thread.sellerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                          {thread.sellerName}
                        </h4>
                        {thread.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs flex-shrink-0">
                            {thread.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                        {getStatusIcon(thread.lastMessage.status)}
                        <span className="hidden sm:inline">{thread.lastMessage.timestamp.toLocaleDateString()}</span>
                        <span className="sm:hidden">{thread.lastMessage.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    {thread.propertyTitle && (
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-slate-600 truncate">
                          {thread.propertyTitle}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      {getMessageTypeBadge(thread.lastMessage.messageType)}
                      <span className="text-xs sm:text-sm text-slate-600 truncate">
                        {thread.lastMessage.content}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {thread.lastMessage.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span className="hidden sm:inline">Admin Mediated</span>
                        <span className="sm:hidden">Admin</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 flex-shrink-0" />
            <span className="text-center sm:text-left">All messages are reviewed by our admin team for quality and safety</span>
          </div>
          <span className="text-center sm:text-right">{filteredThreads.length} {filteredThreads.length === 1 ? 'conversation' : 'conversations'}</span>
        </div>
      </div>
    </div>
  );
};
