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
  SlidersHorizontal,
  Map,
  SortAsc,
  SortDesc,
  Save,
  GitCompare,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  Sliders,
  Building,
  Car,
  TreePine,
  Waves,
  Wifi,
  Shield,
  Zap,
  Users,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { BuyerPhoneVerificationModal } from '@/components/forms/BuyerPhoneVerificationModal';
import { BuyerSignupModal } from '@/components/forms/BuyerSignupModal';
import { useAuthStore } from '@/lib/store';

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

// Local interface to ensure type compatibility for property status
interface LocalPropertyWithStatus {
  status: 'active' | 'under_offer' | 'sold' | 'rented' | 'pending' | 'draft';
}
import { getPropertiesFromSupabase } from '@/lib/property-services-supabase';

interface PropertyListingsProps {
  initialFilters?: PropertySearchFilters;
  onPropertySelect?: (property: PropertyListing) => void;
  user?: User;
  onSignUpPrompt?: () => void;
}

const defaultFilters: PropertySearchFilters = {
  country: 'ZW',
  sortBy: 'date-newest'
};

export const PropertyListings: React.FC<PropertyListingsProps> = ({
  initialFilters,
  onPropertySelect,
  user,
  onSignUpPrompt
}) => {
  const router = useRouter();
  const [filters, setFilters] = React.useState<PropertySearchFilters>(
    initialFilters ? { ...defaultFilters, ...initialFilters } : defaultFilters
  );
  const [properties, setProperties] = React.useState<PropertyListing[]>([]);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [savedProperties, setSavedProperties] = React.useState<Set<string>>(new Set());
  
  // Phone verification modal state
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState<PropertyListing | null>(null);
  
  // Buyer signup modal state
  const [showBuyerSignupModal, setShowBuyerSignupModal] = React.useState(false);
  const [selectedPropertyForSignup, setSelectedPropertyForSignup] = React.useState<PropertyListing | null>(null);
  const [userBuyerType, setUserBuyerType] = React.useState<'cash' | 'installment' | undefined>(undefined);
  
  // Get updateUser function from auth store
  const { updateUser } = useAuthStore();

  // Parse URL query parameters and apply as initial filters (only once on mount)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlFilters: Partial<PropertySearchFilters> = {};
      
      // Parse propertyType array
      const propertyTypes = urlParams.getAll('propertyType');
      if (propertyTypes.length > 0) {
        urlFilters.propertyType = propertyTypes as PropertyType[];
      }
      
      // Parse listingType
      const listingType = urlParams.get('listingType');
      if (listingType) {
        urlFilters.listingType = listingType as any;
      }
      
      // Parse priceRange
      const priceMin = urlParams.get('priceRange.min');
      const priceMax = urlParams.get('priceRange.max');
      if (priceMin || priceMax) {
        urlFilters.priceRange = {
          min: priceMin ? Number(priceMin) : 0,
          max: priceMax ? Number(priceMax) : 999999999
        };
      }
      
      // Parse location
      const city = urlParams.get('city');
      const suburb = urlParams.get('suburb');
      if (city || suburb) {
        urlFilters.location = {
          city: city || undefined,
          suburb: suburb || undefined
        };
      }
      
      // Apply URL filters if any exist and filters haven't been initialized yet
      if (Object.keys(urlFilters).length > 0) {
        setFilters(prev => {
          // Only apply URL filters if this is the initial load
          const hasInitialFilters = prev.propertyType || prev.listingType || prev.priceRange || prev.location;
          if (!hasInitialFilters) {
            return { ...prev, ...urlFilters };
          }
          return prev;
        });
      }
    }
  }, []); // Empty dependency array ensures this only runs once on mount

  // Load properties from Supabase only
  React.useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        const supabaseProperties = await getPropertiesFromSupabase();
        setProperties(supabaseProperties);
      } catch (error) {
        console.error('Error loading properties:', error);
        // Don't fallback to mock data - just show empty state
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []); // Only run once on mount

  // Debounced filter update to prevent excessive re-renders
  const updateFilter = React.useCallback((key: keyof PropertySearchFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Debounced filter update for price range to prevent excessive API calls
  const updatePriceFilter = React.useCallback((key: 'min' | 'max', value: number | undefined) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        min: prev.priceRange?.min || 0,
        max: prev.priceRange?.max,
        [key]: value
      }
    }));
  }, []);

  // Filter properties based on current filters
  const filteredProperties = React.useMemo(() => {
    return properties.filter(property => {
      // Property type filter
      if (filters.propertyType && filters.propertyType.length > 0) {
        if (!filters.propertyType.includes(property.details.type)) {
          return false;
        }
      }

      // Price range filter
      if (filters.priceRange) {
        const price = property.financials.price;
        if (filters.priceRange.min !== undefined && filters.priceRange.min > 0 && price < filters.priceRange.min) {
          return false;
        }
        if (filters.priceRange.max !== undefined && price > filters.priceRange.max) {
          return false;
        }
      }

      // Bedrooms filter
      if (filters.bedrooms !== undefined && filters.bedrooms !== null) {
        if (property.details.bedrooms !== filters.bedrooms) {
          return false;
        }
      }

      // Listing type filter
      if (filters.listingType) {
        if (property.listingType !== filters.listingType) {
          return false;
        }
      }

      // Location filter
      if (filters.location) {
        if (filters.location.city && !property.location.city.toLowerCase().includes(filters.location.city.toLowerCase())) {
          return false;
        }
        if (filters.location.suburb && !property.location.suburb.toLowerCase().includes(filters.location.suburb.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [properties, filters]);

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const toggleSaveProperty = (propertyId: string) => {
    if (!user) {
      onSignUpPrompt?.();
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

  // Buyer signup handlers
  const handleBuyerSignup = (property: PropertyListing) => {
    setSelectedPropertyForSignup(property);
    setShowBuyerSignupModal(true);
  };

  // Phone verification handlers
  const handlePhoneVerification = (property: PropertyListing) => {
    if (!user) {
      onSignUpPrompt?.();
      return;
    }
    
    setSelectedProperty(property);
    setShowPhoneVerificationModal(true);
  };

  const handlePhoneVerificationComplete = async (phoneNumber: string) => {
    try {
      // Update user in store with phone verification
      if (user) {
        updateUser({
          ...user,
          phone: phoneNumber,
          is_phone_verified: true,
          kyc_level: 'phone'
        });
      }
      
      setShowPhoneVerificationModal(false);
      setSelectedProperty(null);
      
      // Show success message
      console.log('Phone verification completed successfully');
      
      // You could also show a toast notification here
      alert('Phone verification completed! You can now contact sellers.');
    } catch (error) {
      console.error('Error completing phone verification:', error);
      alert('Error completing phone verification. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const PropertyCard: React.FC<{ property: PropertyListing; index: number }> = React.memo(({ property, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="group cursor-pointer"
      onClick={() => {
        if (user) {
          // User is authenticated - allow property selection
          onPropertySelect?.(property);
        } else {
          // User not authenticated - show signup prompt
          onSignUpPrompt?.();
        }
      }}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Property Image */}
        <div className="relative h-48 sm:h-64 overflow-hidden">
          {property.media?.mainImage && property.media.mainImage !== '/placeholder-property.jpg' ? (
            <img
              src={property.media.mainImage}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.src = '/placeholder-property.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200">
              <div className="text-center text-slate-500">
                <div className="w-16 h-16 mx-auto mb-2">
                  <svg className="w-full h-full text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm">Image unavailable</p>
              </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {property.listingType === 'installment' && (
              <Badge className="bg-green-500 text-white">
                Installments
              </Badge>
            )}
            {property.listingType === 'sale' && (
              <Badge className="bg-blue-500 text-white">
                Cash Sale
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
            {(property as LocalPropertyWithStatus).status === 'under_offer' && (
              <Badge className="bg-orange-500 text-white">
                Under Offer
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
              {property.financials.monthlyInstallment && (
                <div className="text-sm text-slate-600">
                  {formatCurrency(property.financials.monthlyInstallment)}/month
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Title and Location */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-1 group-hover:text-red-600 transition-colors">
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

            {/* Action Buttons */}
            <div className="pt-2">
              {/* View Details Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (user) {
                    // User is authenticated - navigate to property details
                    router.push(`/property/${property.id}`);
                  } else {
                    // User not authenticated - show buyer signup modal
                    handleBuyerSignup(property);
                  }
                }}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                size="sm"
              >
                {user ? 'View Details' : 'Sign Up to View Details'}
              </Button>
            </div>
          </div>
        </CardContent>
             </Card>
     </motion.div>
   ));
   
   PropertyCard.displayName = 'PropertyCard';

  const FilterPanel: React.FC = () => {
    // Local state for input fields to prevent focus loss
    const [minPrice, setMinPrice] = React.useState('');
    const [maxPrice, setMaxPrice] = React.useState('');
    const [bedrooms, setBedrooms] = React.useState('');

    // Update local state when filters change
    React.useEffect(() => {
      setMinPrice(filters.priceRange?.min !== undefined ? filters.priceRange.min.toString() : '');
      setMaxPrice(filters.priceRange?.max !== undefined ? filters.priceRange.max.toString() : '');
      setBedrooms(filters.bedrooms?.toString() || '');
    }, [filters.priceRange?.min, filters.priceRange?.max, filters.bedrooms]);

    // Debounced update for price inputs
    const updateMinPrice = React.useCallback(
      React.useMemo(() => {
        let timeoutId: NodeJS.Timeout;
        return (value: string) => {
          setMinPrice(value);
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            const numValue = value === '' ? undefined : Number(value);
            updatePriceFilter('min', numValue);
          }, 500);
        };
      }, [updatePriceFilter]),
      [updatePriceFilter]
    );

    const updateMaxPrice = React.useCallback(
      React.useMemo(() => {
        let timeoutId: NodeJS.Timeout;
        return (value: string) => {
          setMaxPrice(value);
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            const numValue = value === '' ? undefined : Number(value);
            updatePriceFilter('max', numValue);
          }, 500);
        };
      }, [updatePriceFilter]),
      [updatePriceFilter]
    );

    const updateBedrooms = React.useCallback(
      React.useMemo(() => {
        let timeoutId: NodeJS.Timeout;
        return (value: string) => {
          setBedrooms(value);
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            const numValue = value === '' ? undefined : Number(value);
            updateFilter('bedrooms', numValue);
          }, 500);
        };
      }, [updateFilter]),
      [updateFilter]
    );

    return (
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
                placeholder="Min price"
                type="number"
                value={minPrice}
                onChange={(e) => updateMinPrice(e.target.value)}
              />
              <Input
                placeholder="Max price"
                type="number"
                value={maxPrice}
                onChange={(e) => updateMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <Input
              placeholder="Number of bedrooms"
              type="number"
              value={bedrooms}
              onChange={(e) => updateBedrooms(e.target.value)}
            />
          </div>

          {/* Listing Type */}
          <div className="space-y-2">
            <Label>Listing Type</Label>
            <Select value={filters.listingType || ''} onValueChange={(value) => updateFilter('listingType', value === 'all' ? undefined : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent-to-buy">Rent-to-Buy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={filters.sortBy || ''} onValueChange={(value) => updateFilter('sortBy', value === 'default' ? 'date-newest' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="date-newest">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="date-oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Back to Home Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
              
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Property Listings
                </h2>
                <p className="text-slate-600">
                  {filteredProperties.length} properties found
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center border rounded-lg">
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

              {/* Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Filter Sidebar - Mobile Drawer */}
            <div className="lg:hidden">
              <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
                  showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setShowFilters(false)}
              />
              <div
                className={`fixed inset-y-0 left-0 w-full max-w-xs bg-white z-50 transform transition-transform duration-300 ease-in-out ${
                  showFilters ? 'translate-x-0' : '-translate-x-full'
                }`}
              >
                <div className="h-full overflow-y-auto">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <FilterPanel />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Sidebar - Desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-8">
                <FilterPanel />
              </div>
            </div>

            {/* Properties Grid */}
            <div className="lg:col-span-3">
              <AnimatePresence>
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-slate-200 h-48 sm:h-64 rounded-lg mb-4"></div>
                        <div className="space-y-2 px-1">
                          <div className="bg-slate-200 h-4 rounded w-3/4"></div>
                          <div className="bg-slate-200 h-4 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredProperties.length > 0 ? (
                  <div className={`grid gap-4 sm:gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {filteredProperties.map((property, index) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        index={index}
                      />
                    ))}
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
      </div>

      {/* Phone Verification Modal */}
      <BuyerPhoneVerificationModal
        isOpen={showPhoneVerificationModal}
        onClose={() => {
          setShowPhoneVerificationModal(false);
          setSelectedProperty(null);
        }}
        onVerificationComplete={handlePhoneVerificationComplete}
        buyerType={user?.buyer_type}
        userEmail={user?.email}
      />

      {/* Buyer Signup Modal */}
      <BuyerSignupModal
        isOpen={showBuyerSignupModal}
        onClose={() => {
          setShowBuyerSignupModal(false);
          setSelectedPropertyForSignup(null);
        }}
        onSignupComplete={async (email, buyerType) => {
          setShowBuyerSignupModal(false);
          
          // Store buyer type for future use
          setUserBuyerType(buyerType);
          
          // Show success message
          alert(`Account created successfully! Please check your email (${email}) for confirmation. You can now view property details.`);
          
          // Show property details after signup (user now has email-level access)
          if (selectedPropertyForSignup) {
            router.push(`/property/${selectedPropertyForSignup.id}`);
          }
          
          // Reset state
          setSelectedPropertyForSignup(null);
        }}
        propertyTitle={selectedPropertyForSignup?.title}
      />
    </div>
  );
};