import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressRingProps extends React.HTMLAttributes<SVGSVGElement> {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const ProgressRing = React.forwardRef<SVGSVGElement, ProgressRingProps>(
  (
    {
      value,
      size = 48,
      strokeWidth = 6,
      color = '#ef4444',
      className,
      ...props
    },
    ref
  ) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        className={cn('block', className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
    );
  }
);
ProgressRing.displayName = 'ProgressRing'; 