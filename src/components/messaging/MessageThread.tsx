'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  Phone,
  Mail,
  Building,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  Shield,
  MoreVertical,
  User,
  Star,
  Calendar,
  MapPin
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message, MessageThread as MessageThreadType } from './BuyerMessaging';

interface MessageThreadProps {
  thread: MessageThreadType;
  userId: string;
  onBack: () => void;
  onViewProperty?: (propertyId: string) => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  thread,
  userId,
  onBack,
  onViewProperty
}) => {
  const [newMessage, setNewMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Mock messages for this thread
  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      fromUserId: userId,
      toUserId: thread.sellerId,
      adminId: 'admin-1',
      propertyId: thread.propertyId,
      content: 'Hi, I\'m interested in viewing this property. What\'s the best time to schedule a viewing?',
      status: 'delivered',
      timestamp: new Date('2024-01-15T10:30:00'),
      messageType: 'inquiry'
    },
    {
      id: 'msg-2',
      fromUserId: thread.sellerId,
      toUserId: userId,
      adminId: 'admin-1',
      propertyId: thread.propertyId,
      content: 'Hello! Thank you for your interest. I\'m available for viewings on weekdays between 2-6 PM and weekends 10 AM-4 PM. What works best for you?',
      status: 'delivered',
      timestamp: new Date('2024-01-15T11:15:00'),
      messageType: 'inquiry'
    },
    {
      id: 'msg-3',
      fromUserId: userId,
      toUserId: thread.sellerId,
      adminId: 'admin-1',
      propertyId: thread.propertyId,
      content: 'Weekend would be perfect. Can we schedule for Saturday at 2 PM? Also, could you tell me more about the neighborhood and any recent renovations?',
      status: 'delivered',
      timestamp: new Date('2024-01-15T14:20:00'),
      messageType: 'inquiry'
    },
    {
      id: 'msg-4',
      fromUserId: thread.sellerId,
      toUserId: userId,
      adminId: 'admin-1',
      propertyId: thread.propertyId,
      content: 'Saturday at 2 PM works great! The neighborhood is very family-friendly with excellent schools nearby. The kitchen was renovated last year with new appliances. I\'ll send you the exact address and my contact details.',
      status: 'delivered',
      timestamp: new Date('2024-01-15T16:45:00'),
      messageType: 'inquiry'
    },
    {
      id: 'msg-5',
      fromUserId: userId,
      toUserId: thread.sellerId,
      adminId: 'admin-1',
      propertyId: thread.propertyId,
      content: 'Perfect! I\'m looking forward to seeing it. Is there parking available for visitors?',
      status: 'pending_admin_review',
      timestamp: new Date('2024-01-16T09:30:00'),
      messageType: 'inquiry'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [mockMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Mock sending message
    console.log('Sending message:', newMessage);
    setNewMessage('');
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'pending_admin_review':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'sent_to_recipient':
        return <Check className="w-3 h-3 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-green-500" />;
      default:
        return <AlertCircle className="w-3 h-3 text-gray-400" />;
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-10 w-10 sm:h-8 sm:w-8 p-0 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4" />
            </Button>
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={thread.sellerAvatar} alt={thread.sellerName} />
              <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                {thread.sellerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{thread.sellerName}</h2>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500">
                <Shield className="w-3 h-3 flex-shrink-0" />
                <span className="hidden sm:inline">Admin Mediated</span>
                <span className="sm:hidden">Admin</span>
                <span className="hidden sm:inline">•</span>
                <span>Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="h-10 w-10 sm:h-8 sm:w-8 p-0">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-10 w-10 sm:h-8 sm:w-8 p-0">
              <Mail className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-10 w-10 sm:h-8 sm:w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Property Info */}
        {thread.propertyTitle && (
          <Card className="mt-3 bg-slate-50 border-slate-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 text-xs sm:text-sm truncate">{thread.propertyTitle}</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">Sandton, Johannesburg</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>Listed 2 weeks ago</span>
                    </span>
                  </div>
                </div>
                {onViewProperty && thread.propertyId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProperty(thread.propertyId!)}
                    className="h-8 px-2 sm:px-3 text-xs sm:text-sm flex-shrink-0"
                  >
                    <span className="hidden sm:inline">View Property</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        <AnimatePresence>
          {mockMessages.map((message, index) => {
            const isOwnMessage = message.fromUserId === userId;
            const showDate = index === 0 || 
              formatDate(message.timestamp) !== formatDate(mockMessages[index - 1].timestamp);

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-2"
              >
                {/* Date Separator */}
                {showDate && (
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="text-xs">
                      {formatDate(message.timestamp)}
                    </Badge>
                  </div>
                )}

                {/* Message */}
                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] sm:max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isOwnMessage && (
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                        <AvatarImage src={thread.sellerAvatar} alt={thread.sellerName} />
                        <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                          {thread.sellerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-lg px-3 py-2 sm:px-4 sm:py-2 max-w-full ${
                        isOwnMessage 
                          ? 'bg-red-600 text-white' 
                          : 'bg-white border border-slate-200 text-slate-900'
                      }`}>
                        <div className="flex items-start gap-1 sm:gap-2 mb-1">
                          {getMessageTypeBadge(message.messageType)}
                          {!isOwnMessage && (
                            <span className="text-xs opacity-70">{thread.sellerName}</span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      <div className={`flex items-center gap-1 mt-1 text-xs text-slate-500 ${
                        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {isOwnMessage && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={thread.sellerAvatar} alt={thread.sellerName} />
                <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                  {thread.sellerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-slate-200 p-3 sm:p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setIsTyping(e.target.value.length > 0);
              }}
              onKeyPress={handleKeyPress}
              className="min-h-[40px] max-h-32 resize-none"
              multiline
            />
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-10 w-10 p-0">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-10 w-10 p-0">
              <Smile className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="h-10 w-10 p-0 bg-red-600 hover:bg-red-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Admin Review Notice */}
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <Shield className="w-3 h-3 flex-shrink-0" />
            <span className="text-center sm:text-left">Your message will be reviewed by our admin team before being sent to {thread.sellerName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
