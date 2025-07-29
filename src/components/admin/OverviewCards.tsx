'use client';

import * as React from 'react';
import {
  Users,
  Home,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Repeat,
  Building2,
  UserCheck
} from 'lucide-react';
import { EnhancedStatCard } from './EnhancedStatCard';
import type { AdminStats } from '@/types/admin';

interface OverviewCardsProps {
  stats: AdminStats;
}

// Mock trend data (replace with real data in production)
const generateTrendData = (base: number, variance: number, length: number = 7) => {
  return Array.from({ length }, (_, i) => {
    const randomVariance = (Math.random() - 0.5) * variance;
    return Math.max(0, base + randomVariance);
  });
};

// Add type for card data
type StatCardData = {
  title: string;
  value: string;
  change: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  trend: number[];
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
};

export const OverviewCards: React.FC<OverviewCardsProps> = ({ stats }) => {
  const cards: StatCardData[] = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: {
        value: stats.userGrowth,
        type: stats.userGrowth >= 0 ? 'increase' as const : 'decrease' as const,
        period: 'last month'
      },
      trend: generateTrendData(stats.totalUsers * 0.9, stats.totalUsers * 0.1),
      icon: <Users className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Active Properties',
      value: stats.totalProperties.toLocaleString(),
      change: {
        value: stats.propertyGrowth,
        type: stats.propertyGrowth >= 0 ? 'increase' as const : 'decrease' as const,
        period: 'last month'
      },
      trend: generateTrendData(stats.totalProperties * 0.9, stats.totalProperties * 0.1),
      icon: <Building2 className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Verification Rate',
      value: `${stats.verificationRate}%`,
      change: {
        value: 5.2,
        type: 'increase' as const,
        period: 'last month'
      },
      trend: generateTrendData(stats.verificationRate, 5),
      icon: <ShieldCheck className="w-6 h-6" />,
      color: 'purple'
    },
    {
      title: 'Rent-to-Buy',
      value: stats.activeRentToBuy.toLocaleString(),
      change: {
        value: 12.5,
        type: 'increase' as const,
        period: 'last month'
      },
      trend: generateTrendData(stats.activeRentToBuy * 0.9, stats.activeRentToBuy * 0.1),
      icon: <Repeat className="w-6 h-6" />,
      color: 'orange'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <EnhancedStatCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          trend={card.trend}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
}; 