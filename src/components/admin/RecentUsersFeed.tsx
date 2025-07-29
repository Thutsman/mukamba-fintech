'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Users, User, Eye, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { AdminUser } from '@/types/admin';

interface User extends AdminUser {}

interface RecentUsersFeedProps {
  users: User[];
  onViewUser?: (userId: string) => void;
  onViewAll?: () => void;
}

export const RecentUsersFeed: React.FC<RecentUsersFeedProps> = ({ 
  users, 
  onViewUser,
  onViewAll 
}) => {
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'suspended':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'buyer':
        return 'bg-blue-100 text-blue-700';
      case 'seller':
        return 'bg-purple-100 text-purple-700';
      case 'both':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Recent Users
          </CardTitle>
          {onViewAll && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewAll}
              suppressHydrationWarning
            >
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">{user.joined}</span>
                {onViewUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewUser(user.id)}
                    className="h-8 w-8 p-0"
                    suppressHydrationWarning
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  suppressHydrationWarning
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No recent users</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 