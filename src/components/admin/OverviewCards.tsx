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
import type { RealAdminStats } from '@/lib/admin-stats-services';

interface OverviewCardsProps {
  stats: RealAdminStats;
}

// Mock trend data (replace with real data in production)
const generateTrendData = (base: number, variance: number, length: number = 7) => {
  return Array.from({ length }, (_, i) => {
    // Use a deterministic approach instead of Math.random()
    const seed = (base + i) % 1000;
    const pseudoRandom = ((seed * 9301 + 49297) % 233280) / 233280;
    const randomVariance = (pseudoRandom - 0.5) * variance;
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
  additionalInfo?: {
    label: string;
    value: string | number;
  }[];
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
      color: 'blue',
      additionalInfo: [
        { label: 'Active', value: Math.floor(stats.totalUsers * 0.85).toLocaleString() },
        { label: 'New', value: Math.floor(stats.totalUsers * 0.12).toLocaleString() }
      ]
    },
    {
      title: 'Active Properties',
      value: stats.activeProperties.toLocaleString(),
      change: {
        value: stats.propertyGrowth,
        type: stats.propertyGrowth >= 0 ? 'increase' as const : 'decrease' as const,
        period: 'last month'
      },
      trend: generateTrendData(stats.activeProperties * 0.9, stats.activeProperties * 0.1),
      icon: <Building2 className="w-6 h-6" />,
      color: 'green',
      additionalInfo: [
        { label: 'Pending', value: stats.pendingListings },
        { label: 'Rejected', value: stats.rejectedListings }
      ]
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
      color: 'orange',
      additionalInfo: [
        { label: 'Active', value: stats.activeRentToBuy },
        { label: 'Completed', value: Math.floor(stats.activeRentToBuy * 0.15) }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <EnhancedStatCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          trend={card.trend}
          icon={card.icon}
          color={card.color}
          additionalInfo={card.additionalInfo}
        />
      ))}
    </div>
  );
}; 