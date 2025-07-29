'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Share2,
  Eye,
  Star,
  DollarSign,
  Home,
  Calendar,
  ChevronDown,
  X,
  SlidersHorizontal
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PropertyListing, PropertySearchFilters, PropertyType } from '@/types/property';
import { User } from '@/types/auth';
import { searchProperties, getFeaturedProperties } from '@/lib/property-services';

interface PropertyListingsProps {
  initialFilters?: PropertySearchFilters;
  onPropertySelect?: (property: PropertyListing) => void;
  showFeatured?: boolean;
  user?: User; // User from auth system
  onSignUpPrompt?: () => void;
}

// Default filter values
const defaultFilters: PropertySearchFilters = {
  country: 'ZW', // Default to Zimbabwe
  sortBy: 'date-newest'
};

export const PropertyListings: React.FC<PropertyListingsProps> = ({
  initialFilters,
  onPropertySelect,
  showFeatured = true,
  user,
  onSignUpPrompt
}) => {
  const [filters, setFilters] = React.useState<PropertySearchFilters>(
    initialFilters ? { ...defaultFilters, ...initialFilters } : defaultFilters
  );
  const [properties, setProperties] = React.useState<PropertyListing[]>([]);
  const [featuredProperties, setFeaturedProperties] = React.useState<PropertyListing[]>([]);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [savedProperties, setSavedProperties] = React.useState<Set<string>>(new Set());

  // Load properties
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const results = searchProperties(filters);
      setProperties(results);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Load featured properties
  React.useEffect(() => {
    if (showFeatured) {
      setFeaturedProperties(getFeaturedProperties(filters.country));
    }
  }, [showFeatured, filters.country]);

  const updateFilter = (key: keyof PropertySearchFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const toggleSaveProperty = (propertyId: string) => {
    if (!user) {
      // Show signup prompt for unauthenticated users
      onSignUpPrompt?.() || alert('Please sign up to save properties!');
      return;
    }

    setSavedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const PropertyCard: React.FC<{ property: PropertyListing; index: number }> = ({ property, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="group cursor-pointer"
      onClick={() => onPropertySelect?.(property)}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Property Image */}
        <div className="relative overflow-hidden">
          <img
            src={property.media.mainImage}
            alt={property.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {property.listingType === 'rent-to-buy' && (
              <Badge className="bg-green-500 text-white">
                Rent-to-Buy
              </Badge>
            )}
            {property.seller.isVerified && (
              <Badge className="bg-blue-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {property.status === 'active' && (
              <Badge className="bg-emerald-500 text-white">
                Available
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveProperty(property.id);
              }}
            >
              <Heart className={`w-4 h-4 ${savedProperties.has(property.id) ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                // Share functionality
              }}
            >
              <Share2 className="w-4 h-4 text-slate-600" />
            </Button>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="text-lg font-bold text-slate-800">
                {formatCurrency(property.financials.price)}
              </div>
              {property.financials.monthlyRental && (
                <div className="text-sm text-slate-600">
                  {formatCurrency(property.financials.monthlyRental)}/month
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Title and Location */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-red-600 transition-colors">
                {property.title}
              </h3>
              <div className="flex items-center text-slate-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{property.location.streetAddress}, {property.location.city}</span>
              </div>
            </div>

            {/* Property Stats */}
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                {property.details.bedrooms || 0} bed{(property.details.bedrooms || 0) !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                {property.details.bathrooms || 0} bath{(property.details.bathrooms || 0) !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-1" />
                {property.details.size.toLocaleString()} m²
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2">
              {property.details.features?.slice(0, 3).map((feature: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {property.details.features && property.details.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{property.details.features.length - 3} more
                </Badge>
              )}
            </div>

            {/* Rent-to-Buy Info */}
            {property.listingType === 'rent-to-buy' && property.financials.rentCreditPercentage && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm text-green-700 font-medium mb-1">
                  Rent-to-Buy Available
                </div>
                <div className="text-xs text-green-600">
                  {property.financials.rentCreditPercentage}% rent credit • 36 month option
                </div>
              </div>
            )}

            {/* Owner Info */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-slate-600">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-medium text-red-600">
                    {property.seller.name[0]}
                  </span>
                </div>
                <span>{property.seller.name}</span>
                {property.seller.isVerified && (
                  <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              
              <div className="flex items-center text-slate-500">
                <Eye className="w-3 h-3 mr-1" />
                <span className="text-xs">{property.views}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const FilterPanel: React.FC = () => (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Type */}
        <div className="space-y-2">
          <Label>Property Type</Label>
          <div className="space-y-2">
            {['house', 'apartment', 'townhouse', 'land', 'commercial'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={filters.propertyType?.includes(type as PropertyType) || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilter('propertyType', [...(filters.propertyType || []), type]);
                    } else {
                      updateFilter('propertyType', (filters.propertyType || []).filter(t => t !== type));
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

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min"
              type="number"
              value={filters.priceRange?.min || ''}
              onChange={(e) => updateFilter('priceRange', {
                ...filters.priceRange,
                min: Number(e.target.value) || 0
              })}
            />
            <Input
              placeholder="Max"
              type="number"
              value={filters.priceRange?.max || ''}
              onChange={(e) => updateFilter('priceRange', {
                ...filters.priceRange,
                max: Number(e.target.value) || 999999999
              })}
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div className="space-y-2">
          <Label>Bedrooms</Label>
          <Input
            placeholder="Number of bedrooms"
            type="number"
            value={filters.bedrooms || ''}
            onChange={(e) => updateFilter('bedrooms', Number(e.target.value) || undefined)}
          />
        </div>

        {/* Listing Type */}
        <div className="space-y-2">
          <Label>Listing Type</Label>
          <Select value={filters.listingType || ''} onValueChange={(value) => updateFilter('listingType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent-to-buy">Rent-to-Buy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select value={filters.sortBy || ''} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rent-asc">Rent: Low to High</SelectItem>
              <SelectItem value="rent-desc">Rent: High to Low</SelectItem>
              <SelectItem value="sqft-desc">Largest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {showFeatured && properties.length === 0 ? 'Featured Properties' : 'Property Listings'}
          </h2>
          <p className="text-slate-600">
            {properties.length} properties found
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <FilterPanel />
        </div>

        {/* Properties Grid */}
        <div className="lg:col-span-3">
          <AnimatePresence>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-200 h-64 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="bg-slate-200 h-4 rounded w-3/4"></div>
                      <div className="bg-slate-200 h-4 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {properties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                  />
                ))}
              </div>
            ) : showFeatured && featuredProperties.length > 0 ? (
              <div>
                <h3 className="text-xl font-semibold mb-4">Featured Properties</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {featuredProperties.map((property, index) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">
                    No Properties Found
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Try adjusting your search filters to find more properties.
                  </p>
                  <Button onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}; 