'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SwipeablePropertyCard } from '@/components/mobile/SwipeablePropertyCard';
import { BottomSheetFilters } from '@/components/mobile/BottomSheetFilters';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { BottomNavigation } from '@/components/mobile/BottomNavigation';
import { LocationSearch } from '@/components/mobile/LocationSearch';
import { useOfflineFavorites } from '@/hooks/useOfflineFavorites';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { PropertyListing, PropertySearchFilters } from '@/types/property';
import { User } from '@/types/auth';

interface MobilePropertyListingsProps {
  properties: PropertyListing[];
  filters: PropertySearchFilters;
  onFilterChange: (filters: PropertySearchFilters) => void;
  onPropertySelect?: (property: PropertyListing) => void;
  onRefresh: () => Promise<void>;
  user?: User;
  onSignUpPrompt?: () => void;
}

export const MobilePropertyListings: React.FC<MobilePropertyListingsProps> = ({
  properties,
  filters,
  onFilterChange,
  onPropertySelect,
  onRefresh,
  user,
  onSignUpPrompt
}) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useOfflineFavorites();
  const { isSupported: isPushSupported, requestPermission } = usePushNotifications(user?.id);

  const handleSwipeRight = async (property: PropertyListing) => {
    if (!user) {
      onSignUpPrompt?.();
      return;
    }

    // Add to favorites
    await addFavorite(property);

    // Request push notification permission if supported
    if (isPushSupported) {
      const granted = await requestPermission();
      if (granted) {
        // Update user preferences in your backend
      }
    }
  };

  const handleSwipeLeft = async (property: PropertyListing) => {
    if (isFavorite(property.id)) {
      await removeFavorite(property.id);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    // Extract city and suburb from address if possible
    const addressParts = location.address.split(',');
    const city = addressParts[addressParts.length - 2]?.trim();
    const suburb = addressParts[addressParts.length - 3]?.trim();
    
    onFilterChange({
      ...filters,
      location: {
        city: city || undefined,
        suburb: suburb || undefined
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Location Search */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <LocationSearch onLocationSelect={handleLocationSelect} />
      </div>

      {/* Pull to Refresh Container */}
      <PullToRefresh onRefresh={onRefresh}>
        <div className="p-4 space-y-4">
          {properties.map((property, index) => (
            <SwipeablePropertyCard
              key={property.id}
              property={property}
              onSwipeLeft={() => handleSwipeLeft(property)}
              onSwipeRight={() => handleSwipeRight(property)}
              onPropertySelect={() => onPropertySelect?.(property)}
              user={user}
            />
          ))}
        </div>
      </PullToRefresh>

      {/* Bottom Sheet Filters */}
      <BottomSheetFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFilterChange={(key, value) => {
          onFilterChange({
            ...filters,
            [key]: value
          });
        }}
        onApplyFilters={() => setShowFilters(false)}
        onResetFilters={() => {
          onFilterChange({
            country: 'ZW',
            sortBy: 'date-newest'
          });
        }}
      />

      {/* Bottom Navigation */}
      <BottomNavigation
        user={user}
        onAddProperty={() => {
          if (!user) {
            onSignUpPrompt?.();
          } else {
            // Handle add property
          }
        }}
      />
    </div>
  );
};
