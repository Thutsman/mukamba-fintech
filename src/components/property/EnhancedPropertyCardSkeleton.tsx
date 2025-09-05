'use client';

import * as React from 'react';
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
      <Card className="overflow-hidden border-0 shadow-lg bg-white">
        {/* Image Skeleton */}
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gray-200 animate-pulse">
            {/* Top Badges Skeleton */}
            <div className="absolute top-3 left-3 flex gap-2">
              <div className="w-16 h-6 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-20 h-6 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
            
            {/* Top Action Buttons Skeleton */}
            <div className="absolute top-3 right-3 flex gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
            
            {/* Price Badge Skeleton */}
            <div className="absolute bottom-3 left-3">
              <div className="bg-gray-300 rounded-lg px-3 py-2 animate-pulse">
                <div className="w-20 h-5 bg-gray-400 rounded mb-1"></div>
                <div className="w-16 h-4 bg-gray-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title and Location Skeleton */}
            <div>
              <div className="w-3/4 h-5 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Property Stats Skeleton */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Property Highlights Skeleton */}
            <div className="flex gap-2">
              <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-14 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* Property Stats Grid Skeleton */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-100 rounded-lg p-2">
                <div className="w-12 h-3 bg-gray-300 rounded mb-1 animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="bg-gray-100 rounded-lg p-2">
                <div className="w-8 h-3 bg-gray-300 rounded mb-1 animate-pulse"></div>
                <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="bg-gray-100 rounded-lg p-2">
                <div className="w-8 h-3 bg-gray-300 rounded mb-1 animate-pulse"></div>
                <div className="w-14 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="bg-gray-100 rounded-lg p-2">
                <div className="w-16 h-3 bg-gray-300 rounded mb-1 animate-pulse"></div>
                <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Financing Options Skeleton */}
            <div className="flex gap-2">
              <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* Installment Preview Skeleton */}
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="w-20 h-5 bg-gray-300 rounded mb-1 animate-pulse"></div>
              <div className="w-32 h-3 bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-2 pt-2">
              <div className="flex-1 h-9 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-9 h-9 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Seller Info Skeleton */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-200 rounded mr-1 animate-pulse"></div>
                <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

