'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Home,
  Shield,
  DollarSign,
  Settings,
  FileText,
  Users,
  Building,
  TrendingUp,
  Bell,
  LucideIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface NavigationTab {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number | null;
  color?: string;
  disabled?: boolean;
}

interface EnhancedNavigationTabsProps {
  tabs: NavigationTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'compact' | 'full';
  className?: string;
}

const defaultColors = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  indigo: 'from-indigo-500 to-indigo-600',
  red: 'from-red-500 to-red-600',
  teal: 'from-teal-500 to-teal-600',
  gray: 'from-gray-500 to-gray-600'
};

const getTabColor = (index: number, customColor?: string) => {
  if (customColor) return customColor;
  
  const colors = Object.values(defaultColors);
  return colors[index % colors.length];
};

export const EnhancedNavigationTabs: React.FC<EnhancedNavigationTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  className = ''
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'py-1',
          tab: 'py-1.5 px-2 text-xs space-x-1',
          icon: 'w-5 h-5',
          label: 'text-xs'
        };
      case 'full':
        return {
          container: 'py-2',
          tab: 'py-3 px-5 text-sm space-x-2.5',
          icon: 'w-8 h-8',
          label: 'text-sm font-medium'
        };
      default:
        return {
          container: 'py-1',
          tab: 'py-2 px-3 text-sm space-x-1.5',
          icon: 'w-6 h-6',
          label: 'text-sm font-medium'
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <nav className={`enhanced-navigation bg-white border-b border-slate-200 shadow-sm relative ${className}`}>
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-blue-50/30 opacity-60" />
      
      <div className="relative">
        <div className={`nav-tabs-container flex space-x-1 lg:space-x-2 overflow-x-auto scrollbar-hide ${variantClasses.container}`}>
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const isDisabled = tab.disabled;
            const tabColor = getTabColor(index, tab.color);
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => !isDisabled && onTabChange(tab.id)}
                                 className={`
                   nav-tab group relative flex items-center ${variantClasses.tab}
                   font-medium transition-all duration-300 ease-out
                   whitespace-nowrap rounded-xl min-w-fit border-2
                   ${isDisabled 
                     ? 'border-transparent text-slate-400 cursor-not-allowed opacity-50' 
                     : `cursor-pointer ${isActive 
                       ? `bg-gradient-to-br ${tabColor.replace('from-', 'bg-').replace('to-', '').split(' ')[0]}-50 border-${tabColor.split('-')[1]}-200 text-${tabColor.split('-')[1]}-700 shadow-lg shadow-slate-200/50` 
                       : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 hover:border-slate-200'
                     }`
                   }
                 `}
                whileHover={!isDisabled ? { 
                  scale: 1.02,
                  y: -1,
                  transition: { duration: 0.2 }
                } : {}}
                whileTap={!isDisabled ? { 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                } : {}}
                disabled={isDisabled}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="tab-content flex items-center">
                  {/* Enhanced Icon */}
                  <div                    className={`
                     tab-icon relative flex items-center justify-center ${variantClasses.icon} rounded-md transition-all duration-300
                     ${isActive 
                       ? `bg-gradient-to-br ${tabColor} text-white shadow-lg` 
                       : isDisabled
                         ? 'text-slate-400'
                         : 'text-slate-400 group-hover:text-slate-600'
                     }
                   `}>
                     <tab.icon className={`w-3 h-3 lg:w-4 lg:h-4`} />
                    
                    {/* Active state glow effect */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span className={`tab-label ${variantClasses.label} transition-colors duration-300 ${
                    isActive 
                      ? `text-${tabColor.split('-')[1]}-700` 
                      : isDisabled
                        ? 'text-slate-400'
                        : 'text-slate-700 group-hover:text-slate-900'
                  }`}>
                    {tab.label}
                  </span>

                  {/* Enhanced Badge */}
                  {tab.badge && tab.badge > 0 && (
                    <motion.div
                      className="tab-badge relative"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30,
                        delay: 0.1
                      }}
                    >
                      <Badge
                                                 className={`
                           badge-count ml-1 text-xs font-bold px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center
                           ${isActive
                             ? `bg-gradient-to-r ${tabColor} text-white shadow-md`
                             : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                           }
                           transition-all duration-300 hover:scale-110
                         `}
                      >
                        {tab.badge}
                        
                        {/* Badge glow effect */}
                        <motion.div
                          className={`absolute inset-0 rounded-full ${
                            isActive ? 'bg-white/20' : 'bg-white/30'
                          }`}
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0, 0.5]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </Badge>
                    </motion.div>
                  )}
                </div>

                                 {/* Active indicator with enhanced animation */}
                 {isActive && (
                   <motion.div
                     layoutId="activeTab"
                     className={`tab-indicator absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r ${tabColor} rounded-full shadow-lg`}
                     initial={false}
                     transition={{ 
                       type: "spring", 
                       stiffness: 500, 
                       damping: 30,
                       duration: 0.5
                     }}
                   />
                 )}

                                 {/* Hover effect overlay */}
                 {!isDisabled && (
                   <motion.div
                     className={`absolute inset-0 rounded-lg ${
                       isActive ? 'bg-gradient-to-br from-white/20 to-transparent' : 'bg-slate-100/50'
                     }`}
                     initial={{ opacity: 0 }}
                     whileHover={{ opacity: 1 }}
                     transition={{ duration: 0.2 }}
                   />
                 )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

// Predefined tab configurations for common use cases
export const createAdminTabs = (pendingActions: { listings?: number; kyc?: number; escrow?: number } = {}) => [
  { id: 'overview', label: 'Overview', icon: BarChart3, badge: null },
  { id: 'listings', label: 'Listings', icon: FileText, badge: pendingActions.listings || null },
  { id: 'kyc', label: 'KYC', icon: Shield, badge: pendingActions.kyc || null },
  { id: 'properties', label: 'Properties', icon: Building, badge: null },
  { id: 'escrow', label: 'Escrow', icon: DollarSign, badge: pendingActions.escrow || null },
  { id: 'users', label: 'Users', icon: Users, badge: null },
  { id: 'reports', label: 'Reports', icon: TrendingUp, badge: null },
  { id: 'settings', label: 'Settings', icon: Settings, badge: null }
];

export const createUserTabs = () => [
  { id: 'overview', label: 'Overview', icon: Home, badge: null },
  { id: 'searches', label: 'Property Searches', icon: BarChart3, badge: null },
  { id: 'saved', label: 'Saved Properties', icon: FileText, badge: null },
  { id: 'applications', label: 'Applications', icon: Shield, badge: null },
  { id: 'messages', label: 'Messages', icon: Bell, badge: null },
  { id: 'documents', label: 'Documents', icon: FileText, badge: null },
  { id: 'profile', label: 'Profile', icon: Users, badge: null },
  { id: 'settings', label: 'Settings', icon: Settings, badge: null }
];

export const createAgentTabs = (pendingLeads?: number) => [
  { id: 'overview', label: 'Overview', icon: BarChart3, badge: null },
  { id: 'leads', label: 'Leads', icon: Users, badge: pendingLeads || null },
  { id: 'properties', label: 'Properties', icon: Building, badge: null },
  { id: 'earnings', label: 'Earnings', icon: DollarSign, badge: null },
  { id: 'messages', label: 'Messages', icon: Bell, badge: null },
  { id: 'reports', label: 'Reports', icon: TrendingUp, badge: null },
  { id: 'settings', label: 'Settings', icon: Settings, badge: null }
];
