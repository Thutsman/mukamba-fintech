'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Loader2
} from 'lucide-react';
import { useMessageStore } from '@/lib/message-store';
import { BuyerMessage } from '@/lib/message-services';

export const BuyerMessages: React.FC = () => {
  const {
    messages,
    isLoading,
    error,
    loadMessages,
    markRead,
    markAdminResponseAsRead,
    unreadAdminResponsesCount
  } = useMessageStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMessages();
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markRead(messageId);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Messages</h2>
          <p className="text-gray-600">Communicate with our team about properties</p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadAdminResponsesCount() > 0 && (
            <Badge variant="destructive" className="flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {unreadAdminResponsesCount()} unread
            </Badge>
          )}
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

      {/* Messages List */}
      {messages.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
              <p className="text-gray-500">
                When you send messages about properties, they'll appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className={`${!message.readByBuyer ? 'border-blue-200 bg-blue-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-lg">{message.propertyTitle}</CardTitle>
                      <Badge className={getMessageTypeColor(message.messageType || 'inquiry')}>
                        {getMessageTypeLabel(message.messageType || 'inquiry')}
                      </Badge>
                      {!message.readByBuyer && (
                        <Badge variant="destructive">Unread</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(message.createdAt)}
                      </div>
                      {message.property && (
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-1" />
                          {message.property.location.suburb}, {message.property.location.city}
                        </div>
                      )}
                    </div>
                  </div>
                  {!message.readByBuyer && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(message.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark as Read
                    </Button>
                  )}
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
  );
};
