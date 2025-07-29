import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  change: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  trend: number[]; // For mini sparkline
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorMap = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
  },
  green: {
    gradient: 'from-emerald-500 to-emerald-600',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100',
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-100',
  },
};

export const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  color,
}) => {
  // Normalize trend data to fit in the available space
  const normalizedTrend = React.useMemo(() => {
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min;
    return trend.map(value => ((value - min) / (range || 1)) * 40); // 40 is the height of our chart
  }, [trend]);

  // Generate sparkline path
  const sparklinePath = React.useMemo(() => {
    const points = normalizedTrend.map((value, index) => 
      `${(index / (normalizedTrend.length - 1)) * 100},${40 - value}`
    ).join(' ');
    return `M ${points}`;
  }, [normalizedTrend]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className={`
        relative overflow-hidden border-0 shadow-lg
        bg-gradient-to-br ${colorMap[color].gradient}
        hover:shadow-xl transition-all duration-300
      `}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="relative p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${colorMap[color].light} ${colorMap[color].text}
              shadow-lg shadow-current/20
            `}>
              {icon}
            </div>
            <div className="flex items-center space-x-1">
              {change.type === 'increase' ? (
                <TrendingUp className="w-4 h-4 text-emerald-300" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-300" />
              )}
              <span className={`
                text-sm font-medium
                ${change.type === 'increase' ? 'text-emerald-300' : 'text-red-300'}
              `}>
                {change.value}%
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <h3 className="text-lg font-medium text-white/80">{title}</h3>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-white/60">vs. {change.period}</p>
          </div>

          {/* Sparkline */}
          <div className="h-10 mt-4">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              <line
                x1="0"
                y1="20"
                x2="100"
                y2="20"
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeDasharray="2 2"
              />
              {/* Sparkline */}
              <path
                d={sparklinePath}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
              {/* Dots for data points */}
              {normalizedTrend.map((value, index) => (
                <circle
                  key={index}
                  cx={`${(index / (normalizedTrend.length - 1)) * 100}`}
                  cy={40 - value}
                  r="1.5"
                  className="fill-current transition-all duration-300"
                />
              ))}
            </svg>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}; 