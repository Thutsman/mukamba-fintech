'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { PropertySearchFilters, PropertyType } from '@/types/property';

interface BottomSheetFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PropertySearchFilters;
  onFilterChange: (key: string, value: any) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export const BottomSheetFilters: React.FC<BottomSheetFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 touch-none"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 max-h-[90vh] overflow-hidden"
          >
            {/* Handle and Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />
              <div className="px-4 pb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-gray-600" />
                  <h3 className="text-lg font-semibold">Filters</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetFilters}
                  className="text-sm text-blue-600"
                >
                  Reset All
                </Button>
              </div>
            </div>

            {/* Filters Content */}
            <div className="overflow-y-auto p-4 space-y-6">
              {/* Price Range */}
              <div className="space-y-4">
                <Label className="text-base">Price Range</Label>
                <div className="px-2">
                  <Slider
                    value={[filters.priceRange?.min || 0, filters.priceRange?.max || 1000000]}
                    min={0}
                    max={1000000}
                    step={5000}
                    onValueChange={(value) => {
                      onFilterChange('priceRange', {
                        min: value[0],
                        max: value[1]
                      });
                    }}
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>{formatCurrency(filters.priceRange?.min || 0)}</span>
                    <span>{formatCurrency(filters.priceRange?.max || 1000000)}</span>
                  </div>
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-4">
                <Label className="text-base">Property Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['house', 'apartment', 'townhouse', 'land', 'commercial'].map((type) => (
                    <div
                      key={type}
                      className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg"
                    >
                      <Checkbox
                        id={type}
                        checked={filters.propertyType?.includes(type as PropertyType)}
                        onCheckedChange={(checked) => {
                          const currentTypes = filters.propertyType || [];
                          if (checked) {
                            onFilterChange('propertyType', [...currentTypes, type]);
                          } else {
                            onFilterChange(
                              'propertyType',
                              currentTypes.filter((t) => t !== type)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={type}
                        className="text-sm font-medium capitalize cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="space-y-4">
                <Label className="text-base">Bedrooms & Bathrooms</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Beds</Label>
                    <Input
                      type="number"
                      value={filters.bedrooms || ''}
                      onChange={(e) => onFilterChange('bedrooms', Number(e.target.value))}
                      min={0}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Baths</Label>
                    <Input
                      type="number"
                      value={filters.bathrooms || ''}
                      onChange={(e) => onFilterChange('bathrooms', Number(e.target.value))}
                      min={0}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* More Filters */}
              <div className="space-y-4">
                <Label className="text-base">Additional Features</Label>
                <div className="space-y-3">
                  {['parking', 'pool', 'garden', 'security', 'furnished'].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={filters.features?.includes(feature)}
                        onCheckedChange={(checked) => {
                          const currentFeatures = filters.features || [];
                          if (checked) {
                            onFilterChange('features', [...currentFeatures, feature]);
                          } else {
                            onFilterChange(
                              'features',
                              currentFeatures.filter((f) => f !== feature)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={feature}
                        className="text-sm font-medium capitalize cursor-pointer"
                      >
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                onClick={() => {
                  onApplyFilters();
                  onClose();
                }}
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
