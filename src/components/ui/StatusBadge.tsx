import * as React from 'react';
import { cn } from '@/lib/utils';

export type StatusType = 'success' | 'warning' | 'error' | 'info';

const statusStyles: Record<StatusType, string> = {
  success: 'bg-success-500 text-white',
  warning: 'bg-warning-500 text-white',
  error: 'bg-primary-500 text-white',
  info: 'bg-slate-500 text-white',
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  children?: React.ReactNode;
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
        statusStyles[status],
        className
      )}
      role="status"
      aria-label={status}
      {...props}
    >
      {children ?? status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
);
StatusBadge.displayName = 'StatusBadge'; 