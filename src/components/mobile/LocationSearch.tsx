'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from '@/hooks/useLocation';

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { latitude, longitude, error, isLoading } = useLocation();
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Replace with your actual geocoding service
        const response = await fetch(
          `https://api.example.com/geocode?query=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setSuggestions(data.results);
      } catch (error) {
        console.error('Geocoding error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reverse geocode current location
  useEffect(() => {
    if (latitude && longitude) {
      const fetchAddress = async () => {
        try {
          // Replace with your actual reverse geocoding service
          const response = await fetch(
            `https://api.example.com/reverse-geocode?lat=${latitude}&lng=${longitude}`
          );
          const data = await response.json();
          setCurrentAddress(data.address);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
        }
      };

      fetchAddress();
    }
  }, [latitude, longitude]);

  const handleUseCurrentLocation = () => {
    if (latitude && longitude && currentAddress) {
      onLocationSelect({
        lat: latitude,
        lng: longitude,
        address: currentAddress
      });
    }
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 h-12"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
        )}
      </div>

      {/* Current Location Button */}
      <Button
        variant="outline"
        className="mt-2 w-full flex items-center justify-center gap-2"
        onClick={handleUseCurrentLocation}
        disabled={isLoading || !!error}
      >
        <Navigation className="w-5 h-5" />
        {isLoading ? (
          'Getting location...'
        ) : error ? (
          'Location access denied'
        ) : (
          'Use current location'
        )}
      </Button>

      {/* Search Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg overflow-hidden z-50"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.id}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onLocationSelect({
                    lat: suggestion.lat,
                    lng: suggestion.lng,
                    address: suggestion.address
                  });
                  setSearchQuery('');
                  setSuggestions([]);
                }}
              >
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">
                    {suggestion.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {suggestion.address}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-red-500"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};
