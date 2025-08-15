'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3X3,
  List,
  Filter,
  Search,
  MapPin,
  Home,
  Building,
  Star,
  Eye,
  Heart,
  ArrowLeft,
  SlidersHorizontal
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PropertyCard } from './PropertyCard';
import { UnifiedProperty, getAllProperties, getPropertiesByCountry, searchProperties } from '@/lib/property-data';

interface PropertyGridProps {
  onViewProperty: (propertyId: string) => void;
  onSaveProperty: (propertyId: string) => void;
  onBackToDashboard: () => void;
  country?: 'ZW' | 'SA';
  searchQuery?: string;
}

// Use centralized property data - match EnhancedPropertyListings behavior
const getProperties = (country?: 'ZW' | 'SA', searchQuery?: string): UnifiedProperty[] => {
  let properties = getAllProperties();
  
  // If we have a search query, search across all properties first
  if (searchQuery) {
    properties = searchProperties(searchQuery);
  }
  
  // Only filter by country if we have a search query, to match EnhancedPropertyListings behavior
  // When no search query is provided, show all properties like EnhancedPropertyListings does
  if (country && searchQuery) {
    properties = properties.filter(property => property.country === country);
  }
  
  return properties;
};

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  onViewProperty,
  onSaveProperty,
  onBackToDashboard,
  country,
  searchQuery: initialSearchQuery
}) => {
  const [searchQuery, setSearchQuery] = React.useState(initialSearchQuery || '');
  const [selectedCity, setSelectedCity] = React.useState<string>('');
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 10000000]);
  const [propertyTypes, setPropertyTypes] = React.useState<string[]>([]);
  const [purchaseTypes, setPurchaseTypes] = React.useState<string[]>([]);
  const [bedrooms, setBedrooms] = React.useState<string>('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<string>('relevance');
  const [currentPage, setCurrentPage] = React.useState(1);
  const propertiesPerPage = 12;

  // Get properties from centralized data
  const allProperties = React.useMemo(() => getProperties(country, searchQuery), [country, searchQuery]);

  // Filter properties based on search criteria
  const filteredProperties = React.useMemo(() => {
    return allProperties.filter(property => {
      // Search query
      if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !property.address.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !property.city.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // City filter
      if (selectedCity && property.city !== selectedCity) {
        return false;
      }

      // Price range
      if (property.price < priceRange[0] || property.price > priceRange[1]) {
        return false;
      }

      // Property types
      if (propertyTypes.length > 0 && !propertyTypes.includes(property.propertyType)) {
        return false;
      }

      // Purchase types
      if (purchaseTypes.length > 0 && !purchaseTypes.includes(property.purchaseType)) {
        return false;
      }

      // Bedrooms
      if (bedrooms) {
        const bedCount = parseInt(bedrooms);
        if (property.bedrooms !== bedCount) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCity, priceRange, propertyTypes, purchaseTypes, bedrooms]);

  // Sort properties
  const sortedProperties = React.useMemo(() => {
    const sorted = [...filteredProperties];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.availableFrom || '').getTime() - new Date(a.availableFrom || '').getTime());
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'bedrooms':
        return sorted.sort((a, b) => b.bedrooms - a.bedrooms);
      default:
        return sorted;
    }
  }, [filteredProperties, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProperties.length / propertiesPerPage);
  const paginatedProperties = sortedProperties.slice(
    (currentPage - 1) * propertiesPerPage,
    currentPage * propertiesPerPage
  );

  const cities = React.useMemo(() => {
    const uniqueCities = [...new Set(allProperties.map(p => p.city))];
    return uniqueCities.sort();
  }, [allProperties]);

  const handleSaveProperty = (propertyId: string) => {
    onSaveProperty(propertyId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setPriceRange([0, 10000000]);
    setPropertyTypes([]);
    setPurchaseTypes([]);
    setBedrooms('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <h1 className="text-xl font-semibold text-slate-900">All Properties</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {Object.values({ searchQuery, selectedCity, priceRange, propertyTypes, purchaseTypes, bedrooms }).some(v => 
                  Array.isArray(v) ? v.length > 0 && (v[0] !== 0 || v[1] !== 10000000) : v
                ) && (
                  <Badge className="ml-1 bg-red-100 text-red-700 text-xs">Active</Badge>
                )}
              </Button>
              
              <div className="flex items-center border border-slate-200 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:w-80"
              >
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Filters</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Search */}
                    <div className="space-y-2">
                      <Label>Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Search properties..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Cities</SelectItem>
                          {cities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                      <Label>Price Range</Label>
                      <div className="px-2">
                        <Slider
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          max={10000000}
                          step={100000}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                          <span>R{priceRange[0].toLocaleString()}</span>
                          <span>R{priceRange[1].toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Property Types */}
                    <div className="space-y-2">
                      <Label>Property Type</Label>
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
                                checked={propertyTypes.includes(type.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setPropertyTypes([...propertyTypes, type.value]);
                                  } else {
                                    setPropertyTypes(propertyTypes.filter(t => t !== type.value));
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
                    <div className="space-y-2">
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
                              checked={purchaseTypes.includes(type.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setPurchaseTypes([...purchaseTypes, type.value]);
                                } else {
                                  setPurchaseTypes(purchaseTypes.filter(t => t !== type.value));
                                }
                              }}
                            />
                            <Label htmlFor={type.value} className="text-sm">{type.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bedrooms */}
                    <div className="space-y-2">
                      <Label>Bedrooms</Label>
                      <Select value={bedrooms} onValueChange={setBedrooms}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any bedrooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any bedrooms</SelectItem>
                          {[1, 2, 3, 4, 5].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} bedroom{num > 1 ? 's' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {sortedProperties.length} properties found
                </h2>
                {Object.values({ searchQuery, selectedCity, priceRange, propertyTypes, purchaseTypes, bedrooms }).some(v => 
                  Array.isArray(v) ? v.length > 0 && (v[0] !== 0 || v[1] !== 10000000) : v
                ) && (
                  <p className="text-sm text-slate-500 mt-1">Filters applied</p>
                )}
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="bedrooms">Most Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Grid/List */}
            {paginatedProperties.length > 0 ? (
              <>
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {paginatedProperties.map(property => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      viewMode={viewMode}
                      onView={() => onViewProperty(property.id)}
                      onSave={() => handleSaveProperty(property.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-10 h-10"
                        >
                          {page}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No properties found</h3>
                  <p className="text-slate-500 mb-4">
                    Try adjusting your search criteria or filters to find more properties.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
