'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pullY = useMotionValue(0);
  const controls = useAnimation();

  const PULL_THRESHOLD = 80; // pixels to pull before triggering refresh
  const MAX_PULL = 120; // maximum pixels to pull
  const REFRESH_DURATION = 1500; // milliseconds for refresh animation

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isRefreshing) return;

    const touch = e.touches[0];
    const newY = Math.max(0, Math.min(touch.clientY - touch.clientY, MAX_PULL));
    pullY.set(newY);

    if (newY > 0) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging || isRefreshing) return;

    setIsDragging(false);
    const currentPull = pullY.get();

    if (currentPull >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      controls.start({
        y: PULL_THRESHOLD,
        transition: { type: 'spring', stiffness: 400, damping: 30 }
      });

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }

      // Animate back after refresh
      setTimeout(() => {
        controls.start({
          y: 0,
          transition: { type: 'spring', stiffness: 400, damping: 30 }
        });
        setIsRefreshing(false);
        pullY.set(0);
      }, REFRESH_DURATION);
    } else {
      // Animate back if not pulled enough
      controls.start({
        y: 0,
        transition: { type: 'spring', stiffness: 400, damping: 30 }
      });
      pullY.set(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <motion.div
        className="absolute left-0 right-0 flex justify-center -top-20"
        style={{ y: pullY }}
        animate={controls}
      >
        <motion.div
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white"
          animate={isRefreshing ? { rotate: 360 } : { rotate: pullY.get() * 2 }}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        >
          <RefreshCw className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: pullY }}
        animate={controls}
        className="min-h-screen bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
};
