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
  BookmarkCheck,
  UserPlus
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { BuyerPhoneVerificationModal } from '@/components/forms/BuyerPhoneVerificationModal';
import { BuyerSignupModal } from '@/components/forms/BuyerSignupModal';
import { useAuthStore } from '@/lib/store';
import { navigateWithScrollToTop } from '@/utils/navigation';

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
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group cursor-pointer h-full"
      onClick={() => {
        // Ungated: always allow property selection to navigate to details
        onPropertySelect?.(property);
      }}
    >
      <Card className="overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-xl h-full flex flex-col">
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
            {/* Available Status Badge - Show for all properties unless they have a specific non-available status */}
            {(!property.status || property.status === 'active' || (property.status !== 'under_offer' && property.status !== 'sold' && property.status !== 'rented')) && (
              <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm px-3 py-1 text-xs font-semibold rounded-full">
                <CheckCircle className="w-3 h-3 mr-1" />
                Available
              </Badge>
            )}
            {(property as LocalPropertyWithStatus).status === 'under_offer' && (
              <Badge className="bg-orange-100 text-orange-800 border border-orange-300 shadow-sm px-3 py-1 text-xs font-semibold rounded-full">
                <Clock className="w-3 h-3 mr-1" />
                Under Offer
              </Badge>
            )}
            {(property as LocalPropertyWithStatus).status === 'sold' && (
              <Badge className="bg-red-100 text-red-800 border border-red-300 shadow-sm px-3 py-1 text-xs font-semibold rounded-full">
                <X className="w-3 h-3 mr-1" />
                Sold
              </Badge>
            )}
            {(property as LocalPropertyWithStatus).status === 'rented' && (
              <Badge className="bg-purple-100 text-purple-800 border border-purple-300 shadow-sm px-3 py-1 text-xs font-semibold rounded-full">
                <Users className="w-3 h-3 mr-1" />
                Rented
              </Badge>
            )}
            
            {/* Property Type Badge */}
            <Badge className="bg-blue-100 text-blue-800 border border-blue-300 shadow-sm px-3 py-1 text-xs font-semibold rounded-full">
              {property.details.type === 'house' ? (
                <>
                  <Home className="w-3 h-3 mr-1" />
                  house
                </>
              ) : property.details.type === 'land' ? (
                <>
                  <TreePine className="w-3 h-3 mr-1" />
                  land
                </>
              ) : (
                <>
                  <Building className="w-3 h-3 mr-1" />
                  {property.details.type}
                </>
              )}
            </Badge>
            
            {/* Payment Type Badge */}
            {property.listingType === 'installment' && (
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-0 px-3 py-1 text-xs font-semibold">
                Installments
              </Badge>
            )}
            {property.listingType === 'sale' && (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-0 px-3 py-1 text-xs font-semibold">
                Cash Sale
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/95 hover:bg-white shadow-md backdrop-blur-sm border border-slate-200"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveProperty(property.id);
                }}
              >
                <Heart className={`w-4 h-4 ${savedProperties.has(property.id) ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/95 hover:bg-white shadow-md backdrop-blur-sm border border-slate-200"
                onClick={(e) => {
                  e.stopPropagation();
                  // Share functionality
                }}
              >
                <Share2 className="w-4 h-4 text-slate-600" />
              </Button>
            </motion.div>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-gradient-to-br from-white via-white to-slate-50 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-slate-200">
              <div className="text-xl font-bold text-slate-900">
                {formatCurrency(property.financials.price)}
              </div>
              {property.financials.monthlyInstallment && (
                <div className="text-sm text-slate-600 font-medium">
                  {formatCurrency(property.financials.monthlyInstallment)}<span className="text-xs">/month</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            {/* Title and Location */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-[#7F1518] transition-colors line-clamp-2 leading-tight">
                {property.title}
              </h3>
              <div className="flex items-center text-slate-600">
                <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-slate-500" />
                <span className="text-sm font-medium">{property.location.suburb}, {property.location.city}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100"></div>

            {/* Property Stats */}
            <div className="flex items-center justify-between text-sm bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4 text-slate-600" />
                <span className="font-semibold text-slate-800">{property.details.bedrooms || 0}</span>
                <span className="text-slate-600 text-xs">bed{(property.details.bedrooms || 0) !== 1 ? 's' : ''}</span>
              </div>
              <div className="w-px h-4 bg-slate-300"></div>
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4 text-slate-600" />
                <span className="font-semibold text-slate-800">{property.details.bathrooms || 0}</span>
                <span className="text-slate-600 text-xs">bath{(property.details.bathrooms || 0) !== 1 ? 's' : ''}</span>
              </div>
              <div className="w-px h-4 bg-slate-300"></div>
              <div className="flex items-center gap-1">
                <Square className="w-4 h-4 text-slate-600" />
                <span className="font-semibold text-slate-800">{property.details.size.toLocaleString()}</span>
                <span className="text-slate-600 text-xs">m²</span>
              </div>
            </div>

            {/* Features */}
            {property.details.features && property.details.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {property.details.features?.slice(0, 3).map((feature: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs border-slate-300 text-slate-700 bg-white hover:bg-slate-50">
                    {feature}
                  </Badge>
                ))}
                {property.details.features && property.details.features.length > 3 && (
                  <Badge variant="outline" className="text-xs border-slate-300 text-slate-700 bg-white">
                    +{property.details.features.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Owner Info */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-8 h-8 bg-gradient-to-br from-[#7F1518] to-[#6A1214] rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">
                    {property.seller.name[0]}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800">{property.seller.name}</span>
                  {property.seller.isVerified && (
                    <span className="flex items-center text-xs text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified Seller
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                <Eye className="w-3 h-3" />
                <span className="text-xs font-medium">{property.views}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 mt-auto">
            {/* View Details Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                // Ungated: always navigate to property details
                router.push(`/property/${property.id}`);
              }}
              className="w-full bg-gradient-to-r from-[#7F1518] to-[#6A1214] hover:from-[#6A1214] hover:to-[#5A0F11] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
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
      <Card className="sticky top-4 border-slate-200 shadow-md bg-white">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-slate-800">
              <SlidersHorizontal className="w-5 h-5 mr-2 text-[#7F1518]" />
              Filters
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-slate-600 hover:text-[#7F1518] hover:bg-red-50"
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              {/* Back to Home Button - Mukamba Brand Color */}
              <Button
                size="sm"
                onClick={() => navigateWithScrollToTop(router, '/')}
                className="bg-[#7F1518] hover:bg-[#6A1214] text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
              
              <div className="border-l border-slate-300 pl-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  Property Listings
                </h2>
                <p className="text-slate-600 text-sm sm:text-base">
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border-slate-300 hover:border-[#7F1518] hover:bg-red-50 hover:text-[#7F1518] transition-all duration-200"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters && <ChevronDown className="w-3 h-3 rotate-180 transition-transform" />}
                {!showFilters && <ChevronDown className="w-3 h-3 transition-transform" />}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="animate-pulse border-slate-200 shadow-md bg-white rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-br from-slate-200 to-slate-300 h-48 sm:h-64"></div>
                        <CardContent className="p-6 space-y-4">
                          <div className="space-y-2">
                            <div className="bg-slate-200 h-5 rounded w-3/4"></div>
                            <div className="bg-slate-200 h-4 rounded w-1/2"></div>
                          </div>
                          <div className="bg-slate-100 h-12 rounded-lg"></div>
                          <div className="flex gap-2">
                            <div className="bg-slate-200 h-6 rounded flex-1"></div>
                            <div className="bg-slate-200 h-6 rounded flex-1"></div>
                          </div>
                          <div className="bg-slate-200 h-10 rounded"></div>
                        </CardContent>
                      </Card>
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
                  <Card className="border-slate-200 shadow-md bg-white">
                    <CardContent className="p-12 text-center">
                      <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Home className="w-12 h-12 text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-3">
                        No Properties Found
                      </h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        We couldn't find any properties matching your criteria. Try adjusting your filters or search again.
                      </p>
                      <Button 
                        onClick={clearFilters}
                        className="bg-[#7F1518] hover:bg-[#6A1214] text-white font-semibold px-6 py-3 shadow-md hover:shadow-lg"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear All Filters
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
          
          // Show success message using the auth store
          const { showSuccessMessage } = useAuthStore.getState();
          showSuccessMessage({
            email: email,
            title: "Account Created Successfully! 🎉",
            message: "Your account has been created! Please check your email and click the confirmation link to activate your account. You can now view property details."
          });
          
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