'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface AnimatedCardProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  children: React.ReactNode;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(
        'rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-lg p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] backdrop-blur-md',
        className
      )}
      whileHover={{ scale: 1.02, y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
AnimatedCard.displayName = 'AnimatedCard'; 