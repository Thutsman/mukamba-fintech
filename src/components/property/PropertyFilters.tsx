'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Filter,
  X,
  MapPin,
  Home,
  Building,
  DollarSign,
  Bed,
  Bath,
  Car,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface FilterCriteria {
  searchQuery: string;
  selectedCity: string;
  selectedArea: string;
  priceRange: [number, number];
  propertyTypes: string[];
  purchaseTypes: string[];
  bedrooms: string;
  bathrooms: string;
  parking: string;
  areaRange: [number, number];
  availabilityDate: string;
  minRating: number;
  features: string[];
  sortBy: string;
}

interface PropertyFiltersProps {
  filters: FilterCriteria;
  onFiltersChange: (filters: FilterCriteria) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_CITIES = [
  'Sandton', 'Rosebank', 'Bryanston', 'Melville', 'Midrand', 
  'Pretoria', 'Centurion', 'Johannesburg', 'Randburg', 'Fourways'
];

const AVAILABLE_AREAS = [
  'Sandton Central', 'Rosebank Mall', 'Bryanston', 'Melville', 'Midrand',
  'Pretoria East', 'Centurion', 'Johannesburg CBD', 'Randburg', 'Fourways'
];

const PROPERTY_FEATURES = [
  'Garden', 'Pool', 'Security', 'Garage', 'Balcony', 'Gym', 'Study',
  'Home Theater', 'Wine Cellar', 'Smart Home', 'Near Transport', 'Water Access',
  'Road Access', 'Flat Terrain', 'Mountain View', 'City View', 'Patio'
];

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyFilters,
  isOpen,
  onClose
}) => {
  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.searchQuery ||
      filters.selectedCity ||
      filters.selectedArea ||
      filters.priceRange[0] !== 0 ||
      filters.priceRange[1] !== 10000000 ||
      filters.propertyTypes.length > 0 ||
      filters.purchaseTypes.length > 0 ||
      filters.bedrooms ||
      filters.bathrooms ||
      filters.parking ||
      filters.areaRange[0] !== 0 ||
      filters.areaRange[1] !== 1000 ||
      filters.availabilityDate ||
      filters.minRating > 0 ||
      filters.features.length > 0
    );
  }, [filters]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      className="fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 shadow-xl overflow-y-auto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Active Filters Badge */}
        {hasActiveFilters && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Active Filters</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {filters.searchQuery && (
                <Badge variant="outline" className="text-xs">
                  Search: {filters.searchQuery}
                </Badge>
              )}
              {filters.selectedCity && (
                <Badge variant="outline" className="text-xs">
                  City: {filters.selectedCity}
                </Badge>
              )}
              {filters.propertyTypes.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.propertyTypes.length} type{filters.propertyTypes.length > 1 ? 's' : ''}
                </Badge>
              )}
              {filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000000 ? (
                <Badge variant="outline" className="text-xs">
                  Price: R{filters.priceRange[0].toLocaleString()} - R{filters.priceRange[1].toLocaleString()}
                </Badge>
              ) : null}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Properties</Label>
            <Input
              placeholder="Search by title, address, or city..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm">City</Label>
                <Select value={filters.selectedCity} onValueChange={(value) => updateFilter('selectedCity', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    {AVAILABLE_CITIES.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Area</Label>
                <Select value={filters.selectedArea} onValueChange={(value) => updateFilter('selectedArea', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Areas</SelectItem>
                    {AVAILABLE_AREAS.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Price Range
            </Label>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value)}
                max={10000000}
                step={100000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>R{filters.priceRange[0].toLocaleString()}</span>
                <span>R{filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Property Types */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Property Type
            </Label>
            <div className="space-y-2">
              {[
                { value: 'house', label: 'House', icon: Home },
                { value: 'apartment', label: 'Apartment', icon: Building },
                { value: 'townhouse', label: 'Townhouse', icon: Home },
                { value: 'land', label: 'Land', icon: MapPin }
              ].map(type => {
                const Icon = type.icon;
                return (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      checked={filters.propertyTypes.includes(type.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('propertyTypes', [...filters.propertyTypes, type.value]);
                        } else {
                          updateFilter('propertyTypes', filters.propertyTypes.filter(t => t !== type.value));
                        }
                      }}
                    />
                    <Label htmlFor={type.value} className="flex items-center gap-2 text-sm">
                      <Icon className="w-4 h-4" />
                      {type.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Purchase Types */}
          <div className="space-y-3">
            <Label>Purchase Type</Label>
            <div className="space-y-2">
              {[
                { value: 'rent-to-own', label: 'Rent-to-Own' },
                { value: 'traditional', label: 'Traditional Purchase' },
                { value: 'both', label: 'Both Options' }
              ].map(type => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={filters.purchaseTypes.includes(type.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilter('purchaseTypes', [...filters.purchaseTypes, type.value]);
                      } else {
                        updateFilter('purchaseTypes', filters.purchaseTypes.filter(t => t !== type.value));
                      }
                    }}
                  />
                  <Label htmlFor={type.value} className="text-sm">{type.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <Label>Property Details</Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Bedrooms</Label>
                <Select value={filters.bedrooms} onValueChange={(value) => updateFilter('bedrooms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}+</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Bathrooms</Label>
                <Select value={filters.bathrooms} onValueChange={(value) => updateFilter('bathrooms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {[1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}+</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm">Parking</Label>
              <Select value={filters.parking} onValueChange={(value) => updateFilter('parking', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {[1, 2, 3, 4].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}+</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Area Range */}
          <div className="space-y-3">
            <Label>Area (m²)</Label>
            <div className="px-2">
              <Slider
                value={filters.areaRange}
                onValueChange={(value) => updateFilter('areaRange', value)}
                max={1000}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>{filters.areaRange[0]} m²</span>
                <span>{filters.areaRange[1]} m²</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Available From
            </Label>
            <Input
              type="date"
              value={filters.availabilityDate}
              onChange={(e) => updateFilter('availabilityDate', e.target.value)}
            />
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Minimum Rating
            </Label>
            <div className="px-2">
              <Slider
                value={[filters.minRating]}
                onValueChange={(value) => updateFilter('minRating', value[0])}
                max={5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Any</span>
                <span>{filters.minRating}+ stars</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <Label>Features</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {PROPERTY_FEATURES.map(feature => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={filters.features.includes(feature)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilter('features', [...filters.features, feature]);
                      } else {
                        updateFilter('features', filters.features.filter(f => f !== feature));
                      }
                    }}
                  />
                  <Label htmlFor={feature} className="text-sm">{feature}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <Label>Sort By</Label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="bedrooms">Most Bedrooms</SelectItem>
                <SelectItem value="area">Largest Area</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-slate-200">
          <Button 
            onClick={onApplyFilters}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Apply Filters
          </Button>
          
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="w-full"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
