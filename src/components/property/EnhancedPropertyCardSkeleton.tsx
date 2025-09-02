'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface EnhancedPropertyCardSkeletonProps {
  index: number;
}

export const EnhancedPropertyCardSkeleton: React.FC<EnhancedPropertyCardSkeletonProps> = ({ index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Property Image Skeleton */}
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
          
          {/* Badges Skeleton */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <div className="w-16 h-6 bg-slate-200 rounded animate-pulse" />
            <div className="w-20 h-6 bg-slate-200 rounded animate-pulse" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
          </div>

          {/* Price Badge Skeleton */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="w-24 h-6 bg-slate-200 rounded animate-pulse mb-1" />
              <div className="w-20 h-4 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Property Details Skeleton */}
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Title and Location Skeleton */}
            <div>
              <div className="w-3/4 h-6 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="flex items-center">
                <div className="w-4 h-4 bg-slate-200 rounded mr-2 animate-pulse" />
                <div className="w-2/3 h-4 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Property Stats Skeleton */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-slate-200 rounded mr-1 animate-pulse" />
                <div className="w-12 h-4 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-slate-200 rounded mr-1 animate-pulse" />
                <div className="w-12 h-4 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-slate-200 rounded mr-1 animate-pulse" />
                <div className="w-16 h-4 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Features Skeleton */}
            <div className="flex flex-wrap gap-2">
              <div className="w-16 h-6 bg-slate-200 rounded animate-pulse" />
              <div className="w-20 h-6 bg-slate-200 rounded animate-pulse" />
              <div className="w-14 h-6 bg-slate-200 rounded animate-pulse" />
            </div>

            {/* Owner Info Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-slate-200 rounded-full mr-2 animate-pulse" />
                <div className="w-20 h-4 bg-slate-200 rounded animate-pulse" />
                <div className="w-4 h-4 bg-slate-200 rounded ml-1 animate-pulse" />
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 bg-slate-200 rounded mr-1 animate-pulse" />
                <div className="w-8 h-3 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="pt-2 space-y-2">
              <div className="w-full h-9 bg-slate-200 rounded animate-pulse" />
              <div className="w-full h-9 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
