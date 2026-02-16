'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Home,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  Loader2,
  Send,
  Reply,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { useMessageStore } from '@/lib/message-store';
import { BuyerMessage } from '@/lib/message-services';
import { createClient } from '@/lib/supabase';
import { GeneralInquiryModal } from '@/components/messaging/GeneralInquiryModal';

interface BuyerMessagesProps {
  user: any;
  onBack: () => void;
  onViewProperty: (propertyId: string) => void;
}

export const BuyerMessages: React.FC<BuyerMessagesProps> = ({ user, onBack, onViewProperty }) => {
  const {
    messages,
    isLoading,
    error,
    loadBuyerMessages,
    markReadByBuyer,
    markAdminResponseAsRead,
    addMessage,
    unreadAdminResponsesCount
  } = useMessageStore();

  const [refreshing, setRefreshing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [folder, setFolder] = useState<'all' | 'inbox' | 'sent'>('all');

  const sentMessages = messages; // every row is a buyer-sent message in this schema
  const inboxMessages = React.useMemo(
    () => messages.filter((m) => Boolean(m.adminResponse)),
    [messages]
  );

  const unreadInboxCount = unreadAdminResponsesCount();

  const folderLabel = React.useMemo(() => {
    switch (folder) {
      case 'inbox':
        return unreadInboxCount > 0
          ? `Inbox (replies) • ${unreadInboxCount} unread`
          : 'Inbox (replies)';
      case 'sent':
        return 'Sent';
      case 'all':
      default:
        return 'All';
    }
  }, [folder, unreadInboxCount]);

  const displayedMessages = React.useMemo(() => {
    switch (folder) {
      case 'inbox':
        return inboxMessages;
      case 'sent':
        return sentMessages;
      case 'all':
      default:
        return messages;
    }
  }, [folder, inboxMessages, sentMessages, messages]);

  useEffect(() => {
    // Load only this buyer's messages (RLS enforced)
    if (user?.id) {
      loadBuyerMessages(user.id);
    }
  }, [user?.id, loadBuyerMessages]);

  // Realtime updates: refresh when admin responds or new message is created
  useEffect(() => {
    if (!user?.id) return;

    const supabase = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      // small debounce to coalesce rapid updates
      refreshTimer = setTimeout(() => {
        loadBuyerMessages(user.id);
      }, 250);
    };

    const channel = supabase
      .channel(`buyer_messages_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buyer_messages',
          filter: `buyer_id=eq.${user.id}`,
        },
        () => scheduleRefresh()
      )
      .subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadBuyerMessages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?.id) {
        await loadBuyerMessages(user.id);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markReadByBuyer(messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleMarkAdminResponseAsRead = async (messageId: string) => {
    try {
      await markAdminResponseAsRead(messageId);
    } catch (error) {
      console.error('Error marking admin response as read:', error);
    }
  };

  const handleStartReply = (messageId: string) => {
    setReplyingTo(messageId);
    setReplyContent('');
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  const handleSendReply = async () => {
    if (!replyingTo || !replyContent.trim() || !user?.id) return;

    setSendingReply(true);
    try {
      const originalMessage = messages.find(m => m.id === replyingTo);
      if (!originalMessage) return;

      await addMessage({
        propertyId: originalMessage.propertyId,
        propertyTitle: originalMessage.propertyTitle,
        buyerId: user.id,
        buyerName: `${user.firstName} ${user.lastName}`,
        buyerEmail: user.email,
        buyerPhone: user.phone,
        content: replyContent.trim(),
        messageType: 'inquiry'
      });

      // Clear reply form and refresh messages
      setReplyingTo(null);
      setReplyContent('');
      await loadBuyerMessages(user.id);
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'inquiry': return 'bg-blue-100 text-blue-800';
      case 'offer_related': return 'bg-green-100 text-green-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'inquiry': return 'Property Inquiry';
      case 'offer_related': return 'Offer Related';
      case 'general': return 'General';
      default: return 'Message';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading messages...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load messages: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto px-3 sm:px-4 space-y-6 max-w-3xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to dashboard
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Messages</h2>
            <p className="text-gray-600">Messages you’ve sent and replies from our team. Each card is one conversation.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {unreadAdminResponsesCount() > 0 && (
            <Badge variant="destructive" className="flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {unreadAdminResponsesCount()} unread
            </Badge>
          )}
          <Button
            size="sm"
            onClick={() => setShowNewMessageModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Folder Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFolder('all')}
          className={folder === 'all' ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700' : ''}
          aria-pressed={folder === 'all'}
        >
          All ({messages.length})
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFolder('inbox')}
          className={folder === 'inbox' ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700' : ''}
          aria-pressed={folder === 'inbox'}
          title="Conversations with a reply from our team. Number is unread replies."
        >
          Inbox ({unreadAdminResponsesCount()})
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFolder('sent')}
          className={folder === 'sent' ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700' : ''}
          aria-pressed={folder === 'sent'}
        >
          Sent ({sentMessages.length})
        </Button>
      </div>

      <div className="text-sm text-slate-600">
        <span className="font-medium text-slate-900">Viewing:</span> {folderLabel} • Showing {displayedMessages.length} conversation{displayedMessages.length === 1 ? '' : 's'}
      </div>

      {/* Messages List */}
      {displayedMessages.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {folder === 'inbox' ? 'No Replies Yet' : 'No Messages Yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {folder === 'inbox'
                  ? 'When our team replies to your messages, they’ll appear here.'
                  : 'When you send messages about properties, they’ll appear here.'}
              </p>
              <Button
                onClick={() => setShowNewMessageModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedMessages.map((message) => (
            <Card key={message.id} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-lg">{message.propertyTitle}</CardTitle>
                      <Badge className={getMessageTypeColor(message.messageType || 'inquiry')}>
                        {getMessageTypeLabel(message.messageType || 'inquiry')}
                      </Badge>
                      {!message.adminResponse && (
                        <Badge variant="secondary">Waiting for reply</Badge>
                      )}
                      {message.adminResponse && !message.adminResponseReadByBuyer && (
                        <Badge variant="destructive">New reply</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(message.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Home className="w-4 h-4 mr-1" />
                        {message.propertyTitle}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Your Message */}
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">Your Message</span>
                        <span className="text-sm text-gray-500">{formatDate(message.createdAt)}</span>
                      </div>
                      <p className="text-gray-700">{message.content}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Response */}
                {message.adminResponse && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-green-900">Admin Response</span>
                            <span className="text-sm text-green-600">
                              {message.adminResponseAt && formatDate(message.adminResponseAt)}
                            </span>
                          </div>
                          {!message.adminResponseReadByBuyer && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAdminResponseAsRead(message.id)}
                              className="text-green-700 border-green-300 hover:bg-green-100"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark as Read
                            </Button>
                          )}
                        </div>
                        <p className="text-green-800">{message.adminResponse}</p>
                        {!message.adminResponseReadByBuyer && (
                          <div className="mt-2">
                            <Badge variant="destructive" className="text-xs">
                              New Response
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reply Section */}
                <div className="border-t pt-4">
                  {/* Only allow follow-up once admin has replied (avoids \"reply to myself\" confusion) */}
                  {message.adminResponse ? (
                    replyingTo === message.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Reply className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">Send a follow-up</span>
                      </div>
                      <Textarea
                        placeholder="Type your follow-up message here..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[80px] resize-none"
                        disabled={sendingReply}
                      />
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={handleSendReply}
                          disabled={!replyContent.trim() || sendingReply}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {sendingReply ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          {sendingReply ? 'Sending...' : 'Send Reply'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelReply}
                          disabled={sendingReply}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                    ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartReply(message.id)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Follow up
                    </Button>
                    )
                  ) : (
                    <div className="text-sm text-slate-500">
                      You can send another message using <span className="font-medium">New Message</span> above while you wait for a reply.
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{message.buyerEmail || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{message.buyerPhone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>

      <GeneralInquiryModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        user={user}
      />
    </div>
  );
};
