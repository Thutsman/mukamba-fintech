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
        bg-white border-r border-slate-200
        fixed lg:sticky top-0 inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        h-[calc(100vh-4rem)]
      `}
      role="navigation"
      aria-label="Admin sidebar navigation"
    >
      <div className="h-14 px-3 flex items-center justify-between lg:hidden border-b border-slate-200">
        <div className="font-semibold text-slate-900">Menu</div>
        <button aria-label="Close menu" onClick={onMobileToggle} className="p-2 rounded hover:bg-slate-100">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3 space-y-4 overflow-y-auto h-[calc(100%-3.5rem)]">
        {/* Notifications button */}
        <div className="flex items-center justify-between px-2">
          <div className="text-xs font-semibold text-slate-500 uppercase">Navigation</div>
          {notifications > 0 && (
            <button
              className="relative p-2 rounded-lg hover:bg-slate-50"
              aria-label={`You have ${notifications} notifications`}
            >
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" aria-hidden />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500" aria-hidden />
            </button>
          )}
        </div>

        {groups.map((group) => (
          <div key={group.id}>
            <button
              className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:text-slate-800"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={openGroups[group.id]}
            >
              <span>{group.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openGroups[group.id] ? 'rotate-180' : ''}`} />
            </button>
            <motion.div
              initial={false}
              animate={{ height: openGroups[group.id] ? 'auto' : 0, opacity: openGroups[group.id] ? 1 : 0 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const count = pendingActions[item.id] || 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`
                        group w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm
                        ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="relative">
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                        {renderDot(count)}
                      </div>
                      <span className="flex-1 text-left">{item.label}</span>
                      {count > 0 && (
                        <Badge className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5" title={`${count} new`}>
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