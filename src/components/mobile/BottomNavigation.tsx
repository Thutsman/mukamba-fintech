'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Heart, User, Plus, MapPin } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

interface BottomNavigationProps {
  user?: any;
  onAddProperty?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  user,
  onAddProperty
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: MapPin, label: 'Map', path: '/map' },
    { icon: Heart, label: 'Saved', path: '/saved', badge: 3 },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  return (
    <>
      {/* Main Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40"
      >
        <nav className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.path}
                className="relative flex flex-col items-center justify-center w-16 h-16"
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push(item.path)}
              >
                <div
                  className={`flex flex-col items-center justify-center ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.label}</span>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full"
                  />
                )}

                {/* Badge */}
                {item.badge && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </div>
                )}
              </motion.button>
            );
          })}
        </nav>
      </motion.div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="fixed bottom-20 right-4 z-50"
      >
        <Button
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          onClick={onAddProperty}
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </motion.div>

      {/* Safe Area Spacer for iOS */}
      <div className="h-safe-bottom" />
    </>
  );
};
