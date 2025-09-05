'use client';

import React from 'react';
import { 
  SlidersHorizontal, 
  Save, 
  X,
  GitCompare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { PropertyType } from '@/types/property';

interface AdvancedFiltersProps {
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  onSaveSearch: () => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onSaveSearch
}) => {
  const availableAmenities = [
    { id: 'pool', label: 'Swimming Pool' },
    { id: 'garden', label: 'Garden' },
    { id: 'parking', label: 'Parking' },
    { id: 'wifi', label: 'WiFi' },
    { id: 'security', label: 'Security System' },
    { id: 'backup-power', label: 'Backup Power' },
    { id: 'staff-quarters', label: 'Staff Quarters' },
    { id: 'furnished', label: 'Furnished' }
  ];

  const financingOptions = [
    { id: 'cash-only', label: 'Cash Only', description: 'Immediate purchase' },
    { id: 'installments', label: 'Installments Available', description: 'Flexible payment plans' },
    { id: 'rent-to-buy', label: 'Rent-to-Buy', description: 'Rent with option to buy' }
  ];

  const propertyStatuses = [
    { id: 'active', label: 'Available', color: 'bg-green-500' },
    { id: 'pending', label: 'Pending', color: 'bg-orange-500' },
    { id: 'draft', label: 'Draft', color: 'bg-gray-500' },
    { id: 'sold', label: 'Sold', color: 'bg-red-500' },
    { id: 'rented', label: 'Rented', color: 'bg-purple-500' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Advanced Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="px-2">
            <Slider
              value={filters.priceRange || [0, 1000000]}
              onValueChange={(value) => onFilterChange('priceRange', value)}
              max={1000000}
              min={0}
              step={10000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{formatCurrency(filters.priceRange?.[0] || 0)}</span>
              <span>{formatCurrency(filters.priceRange?.[1] || 1000000)}</span>
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label>Property Type</Label>
          <div className="space-y-2">
            {['house', 'apartment', 'townhouse', 'land', 'commercial'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={filters.propertyType?.includes(type) || false}
                  onCheckedChange={(checked) => {
                    const currentTypes = filters.propertyType || [];
                    if (checked) {
                      onFilterChange('propertyType', [...currentTypes, type]);
                    } else {
                      onFilterChange('propertyType', currentTypes.filter((t: PropertyType) => t !== type));
                    }
                  }}
                />
                <Label htmlFor={type} className="capitalize text-sm">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.bedrooms?.[0] || ''}
                onChange={(e) => onFilterChange('bedrooms', [Number(e.target.value), filters.bedrooms?.[1] || 10])}
                className="w-full"
              />
              <span className="text-slate-400">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.bedrooms?.[1] || ''}
                onChange={(e) => onFilterChange('bedrooms', [filters.bedrooms?.[0] || 0, Number(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.bathrooms?.[0] || ''}
                onChange={(e) => onFilterChange('bathrooms', [Number(e.target.value), filters.bathrooms?.[1] || 10])}
                className="w-full"
              />
              <span className="text-slate-400">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.bathrooms?.[1] || ''}
                onChange={(e) => onFilterChange('bathrooms', [filters.bathrooms?.[0] || 0, Number(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Size Range */}
        <div className="space-y-2">
          <Label>Size Range (m²)</Label>
          <div className="px-2">
            <Slider
              value={filters.sizeRange || [0, 1000]}
              onValueChange={(value) => onFilterChange('sizeRange', value)}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{filters.sizeRange?.[0] || 0} m²</span>
              <span>{filters.sizeRange?.[1] || 1000} m²</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-2">
          <Label>Amenities</Label>
          <div className="grid grid-cols-2 gap-2">
            {availableAmenities.map(amenity => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.id}
                  checked={filters.amenities?.includes(amenity.id) || false}
                  onCheckedChange={(checked) => {
                    const currentAmenities = filters.amenities || [];
                    if (checked) {
                      onFilterChange('amenities', [...currentAmenities, amenity.id]);
                    } else {
                      onFilterChange('amenities', currentAmenities.filter((a: string) => a !== amenity.id));
                    }
                  }}
                />
                <Label htmlFor={amenity.id} className="text-xs">
                  {amenity.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Financing Options */}
        <div className="space-y-2">
          <Label>Financing Options</Label>
          <div className="space-y-2">
            {financingOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={filters.financingOptions?.includes(option.id) || false}
                  onCheckedChange={(checked) => {
                    const currentOptions = filters.financingOptions || [];
                    if (checked) {
                      onFilterChange('financingOptions', [...currentOptions, option.id]);
                    } else {
                      onFilterChange('financingOptions', currentOptions.filter((f: string) => f !== option.id));
                    }
                  }}
                />
                <div>
                  <Label htmlFor={option.id} className="text-sm font-medium">
                    {option.label}
                  </Label>
                  <p className="text-xs text-slate-500">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Property Status */}
        <div className="space-y-2">
          <Label>Property Status</Label>
          <div className="space-y-2">
            {propertyStatuses.map(status => (
              <div key={status.id} className="flex items-center space-x-2">
                <Checkbox
                  id={status.id}
                  checked={filters.propertyStatus?.includes(status.id) || false}
                  onCheckedChange={(checked) => {
                    const currentStatuses = filters.propertyStatus || [];
                    if (checked) {
                      onFilterChange('propertyStatus', [...currentStatuses, status.id]);
                    } else {
                      onFilterChange('propertyStatus', currentStatuses.filter((s: string) => s !== status.id));
                    }
                  }}
                />
                <Label htmlFor={status.id} className="text-sm">
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Save Search */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onSaveSearch}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
