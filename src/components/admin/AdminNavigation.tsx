'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Home,
  Users,
  Shield,
  DollarSign,
  Settings,
  FileText,
  TrendingUp,
  Bell
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AdminTab } from '@/types/admin';
import { theme, getColor } from '@/lib/theme';

interface AdminNavigationProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  notifications?: number;
  pendingActions?: {
    listings: number;
    kyc: number;
    escrow: number;
  };
}

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'bg-blue-100 text-blue-600' },
  { id: 'listings', label: 'Listings', icon: FileText, color: 'bg-green-100 text-green-600' },
  { id: 'kyc', label: 'KYC', icon: Shield, color: 'bg-purple-100 text-purple-600' },
  { id: 'properties', label: 'Properties', icon: Home, color: 'bg-orange-100 text-orange-600' },
  { id: 'escrow', label: 'Escrow', icon: DollarSign, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'users', label: 'Users', icon: Users, color: 'bg-red-100 text-red-600' },
  { id: 'reports', label: 'Reports', icon: TrendingUp, color: 'bg-teal-100 text-teal-600' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'bg-gray-100 text-gray-600' }
] as const;

export const AdminNavigation: React.FC<AdminNavigationProps> = ({
  activeTab,
  onTabChange,
  notifications = 0,
  pendingActions = { listings: 0, kyc: 0, escrow: 0 }
}) => {
  const getPendingCount = (tab: AdminTab) => {
    switch (tab) {
      case 'listings':
        return pendingActions.listings;
      case 'kyc':
        return pendingActions.kyc;
      case 'escrow':
        return pendingActions.escrow;
      default:
        return 0;
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Navigation Tabs */}
          <div className="flex space-x-1 lg:space-x-2 overflow-x-auto scrollbar-hide">
            {navigationItems.map((item) => {
              const isActive = activeTab === item.id;
              const pendingCount = getPendingCount(item.id as AdminTab);

              return (
                <motion.button
                  key={item.id}
                  onClick={() => onTabChange(item.id as AdminTab)}
                  className={`
                    flex items-center space-x-1 lg:space-x-2 py-3 sm:py-4 px-2 sm:px-3 lg:px-4 
                    font-medium text-xs lg:text-sm transition-all duration-150 
                    relative whitespace-nowrap rounded-md min-w-fit
                    ${isActive 
                      ? 'text-blue-600 bg-blue-50/50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  suppressHydrationWarning
                >
                  <item.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{item.label}</span>

                  {/* Pending Count Badge */}
                  {pendingCount > 0 && (
                    <Badge
                      className={`ml-1 text-xs ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {pendingCount}
                    </Badge>
                  )}

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-px left-0 right-0 h-0.5 bg-blue-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Notifications */}
          {notifications > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-2"
            >
              <button
                className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-50 transition-colors duration-150 relative"
                onClick={() => console.log('Show notifications')}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center rounded-full">
                  {notifications}
                </Badge>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}; 