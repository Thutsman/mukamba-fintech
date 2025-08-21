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
  Bell,
  Building
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

interface NavTabProps {
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  count?: number | null;
  active: boolean;
  onClick: () => void;
  hasPendingActions?: boolean;
}

// Reusable NavTab Component
const NavTab: React.FC<NavTabProps> = ({ 
  label, 
  icon: Icon, 
  count, 
  active, 
  onClick, 
  hasPendingActions = false 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
        ${active 
          ? 'bg-blue-50/80 border-b-2 border-blue-500 text-blue-700 font-semibold shadow-sm' 
          : 'text-slate-600 hover:bg-slate-50/80 hover:text-slate-800'
        }
        ${hasPendingActions && !active ? 'bg-amber-50/60 border-l-2 border-amber-400' : ''}
      `}
      whileHover={{ 
        scale: 1.02, 
        y: -1,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      suppressHydrationWarning
    >
      {/* Icon */}
      <div className="relative">
        <Icon 
          size={20} 
          className={`transition-colors duration-200 ${
            active ? 'text-blue-600' : 'text-slate-500'
          }`} 
        />
        {hasPendingActions && !active && (
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>

      {/* Label */}
      <span className="font-medium text-sm whitespace-nowrap">{label}</span>

      {/* Notification Badge */}
      {count && count > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30 
          }}
          className="relative"
        >
          <Badge 
            className={`
              rounded-full text-xs font-semibold px-2 py-0.5 min-w-[20px] h-[20px] flex items-center justify-center
              ${active 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-red-500 text-white shadow-lg shadow-red-500/25 animate-pulse'
              }
            `}
          >
            {count}
          </Badge>
          
          {/* Tooltip */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap"
            >
              You have {count} new {label.toLowerCase()}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.button>
  );
};

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, badge: null },
  { id: 'listings', label: 'Listings', icon: FileText, badge: 12 },
  { id: 'kyc', label: 'KYC', icon: Shield, badge: 8 },
  { id: 'properties', label: 'Properties', icon: Building, badge: null },
  { id: 'escrow', label: 'Escrow', icon: DollarSign, badge: 3 },
  { id: 'users', label: 'Users', icon: Users, badge: null },
  { id: 'reports', label: 'Reports', icon: TrendingUp, badge: null },
  { id: 'settings', label: 'Settings', icon: Settings, badge: null }
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

  const hasPendingActions = (tab: AdminTab) => {
    return getPendingCount(tab) > 0;
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Enhanced Navigation Tabs */}
          <nav className="flex-1">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
              {navigationItems.map((item) => {
                const isActive = activeTab === item.id;
                const pendingCount = getPendingCount(item.id as AdminTab);
                const displayBadge = pendingCount > 0 ? pendingCount : item.badge;
                const hasPending = hasPendingActions(item.id as AdminTab);

                return (
                  <NavTab
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    count={displayBadge}
                    active={isActive}
                    onClick={() => onTabChange(item.id as AdminTab)}
                    hasPendingActions={hasPending}
                  />
                );
              })}
            </div>
          </nav>

          {/* Enhanced Notifications */}
          {notifications > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30,
                delay: 0.2
              }}
              className="flex items-center space-x-2 ml-4"
            >
              <motion.button
                className="relative p-2 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200 hover:from-red-100 hover:to-red-200 transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={() => console.log('Show notifications')}
                whileHover={{ 
                  scale: 1.05,
                  y: -1,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
                suppressHydrationWarning
              >
                <Bell className="w-5 h-5 text-red-600" />
                
                {/* Enhanced notification badge */}
                <motion.div
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full shadow-lg border-2 border-white"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    transition: { 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  {notifications}
                  
                  {/* Pulse effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-400"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 0, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}; 