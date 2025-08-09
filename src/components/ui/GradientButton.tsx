import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  gradient?: string;
}

const defaultGradient = 'from-primary-500 via-primary-600 to-primary-700';

export const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, gradient = defaultGradient, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          `relative inline-flex items-center justify-center px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r ${gradient} shadow-lg transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-primary-400 cursor-pointer`,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GradientButton.displayName = 'GradientButton'; 