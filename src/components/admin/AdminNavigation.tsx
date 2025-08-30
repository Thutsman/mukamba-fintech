'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  FileText,
  Briefcase,
  Shield,
  Building,
  CreditCard,
  TrendingUp,
  Users,
  Settings,
  Bell,
  ChevronDown,
  Menu
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AdminTab } from '@/types/admin';

interface AdminNavigationProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  notifications?: number;
  pendingActions?: Partial<Record<AdminTab, number>> & {
    listings?: number;
    offers?: number;
    kyc?: number;
    payments?: number;
    reports?: number;
    users?: number;
  };
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

type GroupId = 'platform' | 'transactions' | 'admin';

const groups: { id: GroupId; label: string; items: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }>; }[] }[] = [
  {
    id: 'platform',
    label: 'Platform',
    items: [
      { id: 'overview', label: 'Overview', icon: Home },
      { id: 'listings', label: 'Listings', icon: FileText },
      { id: 'offers', label: 'Offers', icon: Briefcase },
      { id: 'kyc', label: 'KYC', icon: Shield },
      { id: 'properties', label: 'Properties', icon: Building }
    ]
  },
  {
    id: 'transactions',
    label: 'Transactions',
    items: [
      { id: 'payments', label: 'Payment Tracking', icon: CreditCard },
      { id: 'reports', label: 'Reports', icon: TrendingUp }
    ]
  },
  {
    id: 'admin',
    label: 'Admin',
    items: [
      { id: 'users', label: 'Users', icon: Users },
      { id: 'settings', label: 'Settings', icon: Settings }
    ]
  }
];

export const AdminNavigation: React.FC<AdminNavigationProps> = ({
  activeTab,
  onTabChange,
  notifications = 0,
  pendingActions = {},
  isMobileOpen = false,
  onMobileToggle
}) => {
  const [openGroups, setOpenGroups] = React.useState<Record<GroupId, boolean>>({
    platform: true,
    transactions: true,
    admin: true
  });

  const toggleGroup = (groupId: GroupId) => {
    setOpenGroups((g) => ({ ...g, [groupId]: !g[groupId] }));
  };

  const renderDot = (count?: number) => (
    <div className="relative" aria-hidden>
      {count && count > 0 ? (
        <span
          className="absolute -top-1 -right-1 inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"
          title={`${count} new updates`}
        />
      ) : null}
    </div>
  );

                return (
    <aside
      className={`
        bg-white/95 backdrop-blur-xl border-r border-slate-200/80
        fixed lg:sticky top-0 inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        h-[calc(100vh-4rem)] shadow-lg shadow-slate-200/20
      `}
      role="navigation"
      aria-label="Admin sidebar navigation"
    >
      <div className="h-14 px-4 flex items-center justify-between lg:hidden border-b border-slate-200/80">
        <div className="font-semibold text-slate-900">Menu</div>
        <button 
          aria-label="Close menu" 
          onClick={onMobileToggle} 
          className="p-2 rounded-lg hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 transition-colors duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
            </div>

      <div className="p-4 space-y-6 h-[calc(100%-3.5rem)]">
        {/* Notifications button */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">Navigation</div>
          {notifications > 0 && (
                         <button
               className="relative p-2 rounded-lg hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 transition-all duration-200 group"
               aria-label={`You have ${notifications} notifications`}
             >
               <div className="relative p-1.5 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-slate-100 group-hover:to-slate-200 transition-all duration-200 shadow-sm">
                 <Bell className="w-4 h-4" />
               </div>
               <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" aria-hidden />
               <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" aria-hidden />
             </button>
          )}
        </div>

        {groups.map((group) => (
          <div key={group.id}>
            <button
              className="w-full flex items-center justify-between px-2 py-2 text-xs font-medium text-slate-600 uppercase tracking-wider hover:text-slate-800 transition-colors duration-200"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={openGroups[group.id]}
            >
              <span>{group.label}</span>
                             <div className={`p-1 rounded-md transition-all duration-200 ${
                 openGroups[group.id] 
                   ? 'bg-slate-100 text-slate-700' 
                   : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
               }`}>
                 <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openGroups[group.id] ? 'rotate-180' : ''}`} />
               </div>
            </button>
                <motion.div
              initial={false}
                  animate={{ 
                height: openGroups[group.id] ? 'auto' : 0, 
                opacity: openGroups[group.id] ? 1 : 0 
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const count = pendingActions[item.id] || 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`
                        group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200 relative
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10' 
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="relative flex items-center">
                        {isActive && (
                  <motion.div
                            layoutId="activeIndicator"
                            className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                                                 <div className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                           isActive 
                             ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-sm shadow-blue-500/10' 
                             : 'text-slate-500 group-hover:text-slate-700 group-hover:bg-gradient-to-br group-hover:from-slate-50 group-hover:to-slate-100'
                         }`}>
                           <item.icon className="w-4 h-4" />
        </div>
                        {renderDot(count)}
      </div>
                      <span className="flex-1 text-left">{item.label}</span>
                      {count > 0 && (
                        <Badge 
                          className={`
                            text-[10px] px-1.5 py-0.5 font-medium
                            ${isActive 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-slate-100 text-slate-700'
                            }
                          `} 
                          title={`${count} new`}
                        >
                          {count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        ))}
    </div>
    </aside>
  );
}; 