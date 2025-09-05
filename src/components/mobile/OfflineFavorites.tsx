'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOfflineFavorites } from '@/hooks/useOfflineFavorites';
import { Button } from '@/components/ui/button';
import { PropertyListing } from '@/types/property';
import { SwipeablePropertyCard } from './SwipeablePropertyCard';

interface OfflineFavoritesProps {
  userId?: string;
  onPropertySelect: (property: PropertyListing) => void;
}

export const OfflineFavorites: React.FC<OfflineFavoritesProps> = ({
  userId,
  onPropertySelect
}) => {
  const {
    favorites,
    isLoading,
    error,
    removeFavorite,
    syncFavorites
  } = useOfflineFavorites();

  const [isOnline, setIsOnline] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!userId || !isOnline) return;
    
    setIsSyncing(true);
    try {
      await syncFavorites(userId);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Heart className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 text-center mb-4">
          {error}
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Online/Offline Status */}
      <div className="sticky top-0 z-10">
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-yellow-50 border-b border-yellow-100"
            >
              <div className="flex items-center justify-center gap-2 py-2 px-4">
                <WifiOff className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  You're offline. Changes will sync when you're back online.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sync Status */}
      {userId && isOnline && (
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">
              Connected
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      )}

      {/* Favorites List */}
      <div className="p-4 space-y-4">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Heart className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 text-center">
              Start adding properties to your favorites to view them offline.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <SwipeablePropertyCard
                key={favorite.id}
                property={favorite.property}
                onSwipeLeft={() => removeFavorite(favorite.id)}
                onSwipeRight={() => onPropertySelect(favorite.property)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
