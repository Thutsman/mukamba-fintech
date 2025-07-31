'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  MessageCircle,
  Clock,
  CheckCircle2,
  Plus
} from 'lucide-react';

interface Message {
  id: string;
  sender: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  isUnread: boolean;
  channel: 'email' | 'sms' | 'whatsapp' | 'internal';
}

interface CommunicationCenterProps {
  messages: Message[];
  onSendMessage: (message: string, recipientId: string) => void;
  onMarkAsRead: (messageId: string) => void;
}

const MessageCard: React.FC<{ message: Message }> = ({ message }) => {
  const channelIcons = {
    email: <Mail className="w-4 h-4" />,
    sms: <MessageSquare className="w-4 h-4" />,
    whatsapp: <MessageCircle className="w-4 h-4" />,
    internal: <MessageSquare className="w-4 h-4" />
  };

  const channelColors = {
    email: 'bg-blue-100 text-blue-800',
    sms: 'bg-purple-100 text-purple-800',
    whatsapp: 'bg-green-100 text-green-800',
    internal: 'bg-gray-100 text-gray-800'
  };

  return (
    <Card className={`mb-4 ${message.isUnread ? 'border-l-4 border-blue-500' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {message.sender.avatar ? (
              <img
                src={message.sender.avatar}
                alt={message.sender.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {message.sender.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold">{message.sender.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{message.timestamp}</span>
              </div>
            </div>
          </div>
          <Badge className={channelColors[message.channel]}>
            {channelIcons[message.channel]}
          </Badge>
        </div>
        <p className="mt-4 text-gray-700">{message.content}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Reply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const CommunicationCenter: React.FC<CommunicationCenterProps> = ({
  messages,
  onSendMessage,
  onMarkAsRead
}) => {
  const [newMessage, setNewMessage] = React.useState('');
  const [selectedRecipient, setSelectedRecipient] = React.useState('');

  const unreadCount = messages.filter(m => m.isUnread).length;

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedRecipient) {
      onSendMessage(newMessage, selectedRecipient);
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-sm text-gray-500">Across all channels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-sm text-gray-500">Within 2 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Channel Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
                             <div className="flex items-center justify-between">
                 <span className="flex items-center">
                   <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                   WhatsApp
                 </span>
                 <CheckCircle2 className="w-4 h-4 text-green-600" />
               </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-blue-600" />
                  Email
                </span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
                  SMS
                </span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map(message => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reply */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quick Reply</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Open new message modal
                console.log('Open new message modal');
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_1">John Smith</SelectItem>
                  <SelectItem value="lead_2">Sarah Johnson</SelectItem>
                  <SelectItem value="lead_3">Michael Brown</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim() || !selectedRecipient}>
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};