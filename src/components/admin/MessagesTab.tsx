"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMessageStore } from '@/lib/message-store';
import { Mail, MessageCircle, CheckCircle, Search } from 'lucide-react';

export const MessagesTab: React.FC = () => {
  const { messages, markRead, markAllRead } = useMessageStore();
  const [query, setQuery] = React.useState('');

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
          <Button variant="outline" onClick={markAllRead}>Mark all read</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Inbox
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {filtered.length === 0 && (
            <div className="text-sm text-slate-600 py-10 text-center">No messages found.</div>
          )}
          {filtered.map((m) => (
            <div key={m.id} className="py-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 truncate">{m.buyerName}</span>
                  {!m.read && <Badge className="text-[10px] bg-red-100 text-red-700">NEW</Badge>}
                </div>
                <div className="text-sm text-slate-700 truncate max-w-3xl">{m.content}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(m.createdAt).toLocaleString()} • {m.propertyTitle}
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
                <Button size="sm" variant={m.read ? 'secondary' : 'default'} onClick={() => markRead(m.id)}>
                  <CheckCircle className="w-4 h-4 mr-1" /> {m.read ? 'Read' : 'Mark read'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};


