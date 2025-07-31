'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  DollarSign,
  Star,
  UserCheck,
  Calendar
} from 'lucide-react';

/**
 * Interface representing the performance metrics data structure
 * @interface PerformanceMetrics
 */
interface PerformanceMetrics {
  responseTime: { current: string; trend: 'up' | 'down'; percentage: number };
  conversionRate: { leadToViewing: number; viewingToApplication: number };
  monthlyEarnings: { amount: number; currency: string; growth: number };
  satisfactionScore: { rating: number; totalReviews: number };
  activeLeads: { count: number; urgent: number };
  viewingsScheduled: { thisWeek: number; nextWeek: number };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down';
  trendValue?: number;
  icon: React.ReactNode;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  trend,
  trendValue,
  icon,
  className
}) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
      {trend && (
        <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {trendValue}%
        </div>
      )}
    </CardContent>
  </Card>
);

interface PerformanceMetricsGridProps {
  metrics: PerformanceMetrics;
}

/**
 * PerformanceMetricsGrid Component
 * 
 * Displays a grid of performance metrics cards showing various KPIs for real estate agents.
 * Each metric card shows the current value, trend (if applicable), and additional context.
 * 
 * @component
 * @param {PerformanceMetricsGridProps} props - Component props
 * @param {PerformanceMetrics} props.metrics - The metrics data to display
 * @returns {React.ReactElement} A grid of metric cards
 */
export const PerformanceMetricsGrid: React.FC<PerformanceMetricsGridProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        title="Response Time"
        value={metrics.responseTime.current}
        trend={metrics.responseTime.trend}
        trendValue={metrics.responseTime.percentage}
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
      />
      
      <MetricCard
        title="Lead to Viewing"
        value={`${metrics.conversionRate.leadToViewing}%`}
        subValue="Conversion Rate"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />

      <MetricCard
        title="Monthly Earnings"
        value={`${metrics.monthlyEarnings.currency} ${metrics.monthlyEarnings.amount.toLocaleString()}`}
        trend={metrics.monthlyEarnings.growth > 0 ? 'up' : 'down'}
        trendValue={Math.abs(metrics.monthlyEarnings.growth)}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />

      <MetricCard
        title="Satisfaction Score"
        value={metrics.satisfactionScore.rating.toFixed(1)}
        subValue={`Based on ${metrics.satisfactionScore.totalReviews} reviews`}
        icon={<Star className="h-4 w-4 text-yellow-500" />}
      />

      <MetricCard
        title="Active Leads"
        value={metrics.activeLeads.count}
        subValue={`${metrics.activeLeads.urgent} urgent`}
        icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
      />

      <MetricCard
        title="Viewings Scheduled"
        value={metrics.viewingsScheduled.thisWeek}
        subValue={`${metrics.viewingsScheduled.nextWeek} next week`}
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
};