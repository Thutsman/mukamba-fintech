"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMessageStore } from '@/lib/message-store';
import { Mail, MessageCircle, CheckCircle, Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const MessagesTab: React.FC = () => {
  const { 
    messages, 
    isLoading, 
    error, 
    markRead, 
    markAllRead, 
    loadMessages,
    deleteMessage,
    addAdminResponse 
  } = useMessageStore();
  const [query, setQuery] = React.useState('');
  const [showResponseForm, setShowResponseForm] = React.useState<string | null>(null);
  const [responseText, setResponseText] = React.useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = React.useState(false);

  // Load messages on component mount
  React.useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.propertyTitle.toLowerCase().includes(q) ||
        m.buyerName.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q)
    );
  }, [messages, query]);

  const handleRefresh = () => {
    loadMessages();
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch (error) {
      console.error('Failed to mark all messages as read:', error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(id);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  const handleSubmitResponse = async (messageId: string) => {
    if (!responseText.trim()) return;
    
    setIsSubmittingResponse(true);
    try {
      await addAdminResponse(messageId, responseText.trim());
      setResponseText('');
      setShowResponseForm(null);
    } catch (error) {
      console.error('Failed to add admin response:', error);
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Messages</h2>
          <p className="text-sm text-slate-600">Incoming messages from buyers and sellers</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search messages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleMarkAllRead} disabled={isLoading}>
            Mark all read
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Inbox
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {isLoading && filtered.length === 0 && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-slate-600">Loading messages...</span>
            </div>
          )}
          
          {!isLoading && filtered.length === 0 && (
            <div className="text-sm text-slate-600 py-10 text-center">No messages found.</div>
          )}
          
          {filtered.map((m) => (
            <div key={m.id} className="py-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-slate-900 truncate">{m.buyerName}</span>
                    {!m.readByAdmin && <Badge className="text-[10px] bg-red-100 text-red-700">NEW</Badge>}
                    {m.messageType && (
                      <Badge variant="outline" className="text-[10px]">
                        {m.messageType.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-700 mb-2">{m.content}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(m.createdAt).toLocaleString()} • {m.propertyTitle}
                    {m.buyerEmail && ` • ${m.buyerEmail}`}
                    {m.buyerPhone && ` • ${m.buyerPhone}`}
                  </div>
                </div>
                <div className="shrink-0 flex gap-2">
                  {m.buyerEmail && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${m.buyerEmail}`}>
                        <Mail className="w-4 h-4 mr-1" /> Email
                      </a>
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant={m.readByAdmin ? 'secondary' : 'default'} 
                    onClick={() => handleMarkRead(m.id)}
                    disabled={isLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> {m.readByAdmin ? 'Read' : 'Mark read'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowResponseForm(showResponseForm === m.id ? null : m.id)}
                  >
                    Reply
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteMessage(m.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Admin Response Section */}
              {m.adminResponse && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-medium mb-1">Admin Response</div>
                  <div className="text-sm text-blue-800">{m.adminResponse}</div>
                  {m.adminResponseAt && (
                    <div className="text-xs text-blue-600 mt-1">
                      {new Date(m.adminResponseAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Response Form */}
              {showResponseForm === m.id && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 font-medium mb-2">Add Admin Response</div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Type your response..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleSubmitResponse(m.id)}
                        disabled={!responseText.trim() || isSubmittingResponse}
                      >
                        {isSubmittingResponse ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Response'
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setShowResponseForm(null);
                          setResponseText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};


