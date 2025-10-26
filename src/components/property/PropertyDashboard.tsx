'use client';

import * as React from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  MapPin, 
  Filter,
  Home,
  DollarSign,
  Users,
  Star,
  ArrowRight,
  PlusCircle,
  BarChart3,
  Bookmark,
  Settings,
  User,
  UserPlus,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Heart,
  Bed,
  Bath,
  Square,
  Shield,
  CheckCircle,
  Scale,
  Phone,
  Clock,
  Mail,
  MessageCircle,
  Loader2,
  Building,
  X,
  Eye,
  Zap,
  Target,
  TrendingUp as TrendingUpIcon,
  FileText
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { PropertyListings } from './PropertyListings';
import { EnhancedPropertyCard } from './EnhancedPropertyCard';
import { EnhancedPropertyCardSkeleton } from './EnhancedPropertyCardSkeleton';

import { PropertyListing as Property, PropertySearchFilters, PropertyCountry } from '@/types/property';
import { getPropertyStats, getPopularCities, getFeaturedProperties } from '@/lib/property-services';
import { getPropertiesFromSupabase } from '@/lib/property-services-supabase';
import { User as UserType } from '@/types/auth';
import { useAuthStore } from '@/lib/store';
import { UnifiedSignupModal } from '@/components/forms/UnifiedSignupModal';
import { BasicSigninModal } from '@/components/forms/BasicSigninModal';
import { AgentOnboardingModal } from '@/components/agent/AgentOnboardingModal';
import { SellerOnboardingModal } from '@/components/forms/SellerOnboardingModal';
import { BuyerPhoneVerificationModal } from '@/components/forms/BuyerPhoneVerificationModal';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Analytics tracking function
const trackEvent = (eventName: string, parameters: Record<string, any>) => {
  // Track user interactions for analytics
  console.log('Analytics Event:', eventName, parameters);
  
  // In a real app, you would send this to your analytics service
  // Example: Google Analytics, Mixpanel, etc.
  // This is a placeholder for actual analytics implementation
};

interface PropertyDashboardProps {
  user?: UserType;
  onPropertySelect?: (property: Property) => void;
}

export const PropertyDashboard: React.FC<PropertyDashboardProps> = React.memo(({
  user,
  onPropertySelect
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('explore');
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
  const [selectedCountry, setSelectedCountry] = React.useState<PropertyCountry>('ZW');
  const [stats, setStats] = React.useState(getPropertyStats(selectedCountry));
  const [popularCities, setPopularCities] = React.useState(getPopularCities(selectedCountry));
  const [featuredProperties, setFeaturedProperties] = React.useState<Property[]>([]);
  const [totalPropertiesCount, setTotalPropertiesCount] = React.useState(0);
  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const [showBuyerPhoneVerificationModal, setShowBuyerPhoneVerificationModal] = React.useState(false);
  const [selectedPropertyForSignup, setSelectedPropertyForSignup] = React.useState<Property | null>(null);
  const [selectedPropertyForContact, setSelectedPropertyForContact] = React.useState<Property | null>(null);
  const [userPhoneVerified, setUserPhoneVerified] = React.useState(user?.is_phone_verified || false);
  const [showSigninModal, setShowSigninModal] = React.useState(false);
  const [showAgentModal, setShowAgentModal] = React.useState(false);
  const [showSellerModal, setShowSellerModal] = React.useState(false);
  const [sellerIntent, setSellerIntent] = React.useState(false);
  const [isSearchLoading, setIsSearchLoading] = React.useState(false);
  const [isDataLoading, setIsDataLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = React.useState<Set<string>>(new Set());
  const [isClient, setIsClient] = React.useState(false);
  
  // Search filters state
  const [searchFilters, setSearchFilters] = React.useState({
    location: undefined as string | undefined,
    propertyType: undefined as string | undefined,
    priceRange: undefined as string | undefined,
  });
  


  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // SAFEGUARD: Never show signup modal when authenticated
  React.useEffect(() => {
    if (user && showSignupModal) {
      setShowSignupModal(false);
    }
  }, [user, showSignupModal]);

  React.useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        const supabaseProperties = await getPropertiesFromSupabase();
        // Store total count
        setTotalPropertiesCount(supabaseProperties.length);
        // Show first 6 properties as featured
        setFeaturedProperties(supabaseProperties.slice(0, 6));
      } catch (error) {
        console.error('Error loading featured properties:', error);
        // Fallback to mock data
        const mockProperties = getFeaturedProperties(selectedCountry);
        setTotalPropertiesCount(mockProperties.length);
        setFeaturedProperties(mockProperties);
      }
    };

    loadFeaturedProperties();
  }, [selectedCountry]);

  React.useEffect(() => {
    // Update stats and properties when country changes with loading state
    setIsDataLoading(true);
    setError(null);
    
    // Analytics tracking for country change
    trackEvent('country_changed', {
      country: selectedCountry,
      event_category: 'navigation'
    });
    
    const timer = setTimeout(() => {
      try {
        setStats(getPropertyStats(selectedCountry));
        // Featured properties are loaded separately via Supabase
        setPopularCities(getPopularCities(selectedCountry));
        setIsDataLoading(false);
      } catch (err) {
        console.error('Error loading property data:', err);
        setError('Failed to load property data. Please try again.');
        setIsDataLoading(false);
      }
    }, 300); // Simulate loading time

    return () => clearTimeout(timer);
  }, [selectedCountry]);





  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    onPropertySelect?.(property);
    
    // Navigate to property details page
    router.push(`/property/${property.id}`);
    
    // Analytics tracking
    trackEvent('property_view', {
      property_id: property.id,
      property_title: property.title,
      property_location: `${property.location.city}, ${property.location.country}`,
      property_price: property.financials.monthlyInstallment,
      event_category: 'property_interaction'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(selectedCountry === 'ZW' ? 'en-US' : 'en-ZA', {
      style: 'currency',
      currency: selectedCountry === 'ZW' ? 'USD' : 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle search functionality
  const handleSearch = React.useCallback(() => {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (searchFilters.location && searchFilters.location !== 'all') {
      queryParams.set('city', searchFilters.location);
    }
    
    if (searchFilters.propertyType && searchFilters.propertyType !== 'all') {
      queryParams.set('propertyType', searchFilters.propertyType);
    }
    
    if (searchFilters.priceRange && searchFilters.priceRange !== 'any') {
      const [min, max] = searchFilters.priceRange.split('-');
      if (min) queryParams.set('priceRange.min', min);
      if (max && max !== '+') queryParams.set('priceRange.max', max);
    }
    
    // Navigate to listings page with filters
    const queryString = queryParams.toString();
    const url = queryString ? `/listings?${queryString}` : '/listings';
    router.push(url);
    
    // Track analytics
    trackEvent('hero_search_clicked', {
      location: searchFilters.location,
      propertyType: searchFilters.propertyType,
      priceRange: searchFilters.priceRange,
      event_category: 'search'
    });
  }, [searchFilters, router]);

  // Skeleton component for property cards
  const PropertyCardSkeleton: React.FC<{ index: number }> = ({ index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Image skeleton */}
        <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
        </div>

        {/* Content skeleton */}
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Stats skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>

            {/* Price and button skeleton */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const MarketStatsCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    description?: string;
    trend?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    onViewProperties: () => void;
    propertyThumbnails: Property[];
  }> = ({ title, value, subtitle, description, trend, icon: Icon, color, onViewProperties, propertyThumbnails }) => {
    const [count, setCount] = React.useState(0);
    const [isHovered, setIsHovered] = React.useState(false);
    
    React.useEffect(() => {
      const numericValue = typeof value === 'number' ? value : parseInt(value.toString().replace(/[^\d]/g, ''));
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }, [value]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="group cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onViewProperties}
      >
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200 relative overflow-hidden min-h-[120px] sm:min-h-[140px] group-hover:border-blue-300">
          {/* Header with trend indicator */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                {subtitle}
                {trend && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />}
              </span>
            </div>
            {trend && (
              <div className="bg-green-50 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                {trend}
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
                {typeof value === 'number' ? count.toLocaleString() : value}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                {title}
              </p>
              {description && (
                <p className="text-xs text-gray-500 hidden sm:block">
                  {description}
                </p>
              )}
            </div>
            
            {/* Icon */}
            <motion.div 
              className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ml-3 sm:ml-4 ${color}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
          </div>

          {/* Property Thumbnails */}
          <AnimatePresence>
            {isHovered && propertyThumbnails.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 pt-4 border-t border-gray-100"
              >
                <div className="flex gap-2">
                  {propertyThumbnails.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative w-12 h-8 rounded overflow-hidden"
                    >
                      {(() => {
                        const mainImage = property.media.mainImage;
                        const isPlaceholder = mainImage === '/placeholder-property.jpg' || 
                                             mainImage?.includes('placeholder') ||
                                             !mainImage ||
                                             mainImage === '';
                        const hasImageError = imageLoadErrors.has(mainImage);
                        
                        return (isPlaceholder || hasImageError) ? (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Home className="w-4 h-4 text-gray-400" />
                          </div>
                        ) : (
                          <Image
                            src={mainImage}
                            alt={property.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                            onError={() => {
                              if (isClient) {
                                setImageLoadErrors(prev => new Set(prev).add(mainImage));
                              }
                            }}
                          />
                        );
                      })()}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProperties();
                    }}
                  >
                    See Properties
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const FeaturedPropertyCard: React.FC<{ property: Property; index: number }> = ({ property, index }) => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const images = property.media.images || [property.media.mainImage];

    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Check if the current image is a placeholder or has failed to load
    const currentImage = images[currentImageIndex];
    const isPlaceholder = currentImage === '/placeholder-property.jpg' || 
                         currentImage?.includes('placeholder') ||
                         !currentImage ||
                         currentImage === '';
    const hasImageError = imageLoadErrors.has(currentImage);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="group cursor-pointer"
        onClick={() => handlePropertySelect(property)}
      >
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
          {/* Image Carousel */}
          <div className="relative h-40 sm:h-48 overflow-hidden">
            {isPlaceholder || hasImageError ? (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <Home className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">Image unavailable</p>
                </div>
              </div>
            ) : (
              <Image
                src={currentImage}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                onError={() => {
                  if (isClient) {
                    setImageLoadErrors(prev => new Set(prev).add(currentImage));
                  }
                }}
                priority={index < 2} // Prioritize first 2 images
              />
            )}
            
            {/* Image Navigation */}
            {images.length > 1 && !isPlaceholder && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Property Badges */}
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1 sm:gap-2">
                          <Badge className="bg-blue-500 text-white text-xs">
                Featured
              </Badge>
              {property.listingType === 'installment' && (
                <Badge className="bg-green-500 text-white text-xs">
                  Installments
                </Badge>
              )}
              {property.listingType === 'sale' && (
                <Badge className="bg-blue-500 text-white text-xs">
                  Cash Sale
                </Badge>
              )}

            </div>

            {/* Quick Action Buttons */}
            <motion.div 
              className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              initial={{ opacity: 0, x: 20 }}
              whileHover={{ opacity: 1, x: 0 }}
            >

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Schedule viewing action
                  }}
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Save property action
                  }}
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Property Details */}
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              {/* Title and Location */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-1 group-hover:text-red-600 transition-colors text-sm sm:text-base">
                  {property.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {property.location.suburb}, {property.location.city}
                </p>
              </div>

              {/* Property Stats */}
              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center">
                    <Bed className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {property.details.bedrooms} bed{property.details.bedrooms !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {property.details.bathrooms} bath{property.details.bathrooms !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center">
                    <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {property.details.size?.toLocaleString() || 'N/A'} sqft
                  </div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base sm:text-lg font-bold text-slate-900">
                    {formatCurrency(property.financials.monthlyInstallment || 0)}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">/month</div>
                </div>
                
                <Button
                  size="sm"
                  className="bg-[#7F1518] hover:bg-[#6a1215] text-white text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Ungated: always navigate to property details
                    handlePropertySelect(property);
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Enhanced search handlers




  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Scroll to the top of the section with some offset for better UX
      const offset = 80; // Account for any fixed headers
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };



  // Enhanced Property Card Component - Now using the imported component
  const EnhancedPropertyCardWrapper: React.FC<{
    property: Property;
    index: number;
    onPropertySelect: (property: Property) => void;
    user: any;
  }> = ({ property, index, onPropertySelect, user }) => {
    return (
      <EnhancedPropertyCard
        property={property}
        index={index}
        user={user}
        onPropertySelect={onPropertySelect}
        onAddToComparison={(property) => {
          // Handle comparison logic
          console.log('Add to comparison:', property.title);
        }}
        onContactSeller={(property) => {
          // Handle contact seller logic
          console.log('Contact seller for:', property.title);
        }}
        onSignUpPrompt={() => {
          setShowSignupModal(true);
        }}
        showComparisonButton={true}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">


      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{ height: '85vh', minHeight: '600px' }}>
        {/* Premium property background with parallax effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hero-background.jpg')`,
            backgroundPosition: '50% 60%',
          }}
        >
          {/* Darker gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-900/65 to-slate-900/70"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
                      </div>
                      
        {/* Partner Logo - Top Right Corner of Hero Section */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
          <Image
            src="/partner-logo.svg"
            alt="Licensed Real Estate Partner"
            width={120}
            height={60}
            className="h-auto max-w-[80px] sm:max-w-[120px] drop-shadow-lg"
            priority
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          
          <div className="text-center space-y-4">
            {/* Logo and Main Headline */}
            <div className="flex flex-col items-center space-y-4">
              
              <h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight px-4 mb-4 text-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
              >
                Your Path to Home Ownership
              <br />
                <span className="text-white font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Begins Here</span>
              </h1>
            </div>
            
            
            {/* Subheadline */}
            <div className="text-center px-4 mb-4 max-w-5xl mx-auto">
              <p className="text-2xl sm:text-3xl lg:text-4xl text-white font-light leading-relaxed tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                Buy homes in Zimbabwe using this portal,<br />
                through installment payments, from anywhere in the world
              </p>
            </div>
            
            
            {/* Enhanced CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 justify-center px-4 mb-8 sm:mb-12 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
              <Button 
                size="lg"
                  className="bg-[#7f1518] hover:bg-[#6a1215] text-white px-8 sm:px-10 py-4 text-base sm:text-lg font-semibold shadow-2xl hover:shadow-red-500/25 transition-all duration-300 w-full sm:w-auto border-0"
                  onClick={() => {
                    // Track analytics
                    trackEvent('hero_sell_property_clicked', {
                      source: 'hero_section',
                      event_category: 'conversion',
                      user_status: user ? 'authenticated' : 'guest'
                    });
                    
                    // Smart routing based on authentication
                    if (user) {
                      // Authenticated user: Open seller onboarding
                      setShowSellerModal(true);
                    } else {
                      // Guest user: Open signup modal with seller intent
                      setSellerIntent(true);
                      setShowSignupModal(true);
                    }
                  }}
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Sell Your Property
              </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
              <Button 
                size="lg"
                variant="outline"
                  className="border-white/40 text-white hover:bg-white/20 hover:text-white px-8 sm:px-10 py-4 text-base sm:text-lg font-semibold bg-white/10 backdrop-blur-xl w-full sm:w-auto shadow-xl hover:shadow-white/25 transition-all duration-300"
                onClick={() => {
                // If already signed-in, go straight to profile; else open signin
                if (user) {
                  router.push('/?view=profile');
                } else {
                  setShowSigninModal(true);
                }
                  // Analytics tracking for signin modal
                  trackEvent('signin_modal_opened', {
                    source: 'hero_section',
                    event_category: 'conversion'
                  });
                }}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
              </motion.div>
            </motion.div>
            




            {/* Trust & Social Proof Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-8"
            >

                  </motion.div>

          </div>
        </div>
      </div>

      {/* Property Search Bar - Overlapping Section */}
      <motion.div
        className="relative z-20 max-w-4xl mx-auto px-4 -mt-4 sm:-mt-8 md:-mt-12 lg:-mt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-2xl max-w-screen-sm mx-auto">
          <div className="space-y-4">
            {/* Mobile: Vertical Layout, Desktop: Horizontal Layout */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-x-3">
              {/* Location Filter */}
              <div className="flex-1 min-w-0">
                <Select value={searchFilters.location || 'all'} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, location: value === 'all' ? undefined : value }))}>
                  <SelectTrigger className="bg-white border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 h-10 w-full">
                    <div className="flex items-center min-w-0">
                      <MapPin className="w-4 h-4 mr-2 text-slate-500 flex-shrink-0" />
                      <SelectValue placeholder="All Locations" className="truncate" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-lg">
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="harare">Harare</SelectItem>
                    <SelectItem value="bulawayo">Bulawayo</SelectItem>
                    <SelectItem value="victoria-falls">Victoria Falls</SelectItem>
                    <SelectItem value="mutare">Mutare</SelectItem>
                    <SelectItem value="gweru">Gweru</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type Filter */}
              <div className="flex-1 min-w-0">
                <Select value={searchFilters.propertyType || 'all'} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, propertyType: value === 'all' ? undefined : value }))}>
                  <SelectTrigger className="bg-white border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 h-10 w-full">
                    <div className="flex items-center min-w-0">
                      <Home className="w-4 h-4 mr-2 text-slate-500 flex-shrink-0" />
                      <SelectValue placeholder="All Types" className="truncate" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-lg">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="flex-1 min-w-0">
                <Select value={searchFilters.priceRange || 'any'} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, priceRange: value === 'any' ? undefined : value }))}>
                  <SelectTrigger className="bg-white border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 h-10 w-full">
                    <div className="flex items-center min-w-0">
                      <DollarSign className="w-4 h-4 mr-2 text-slate-500 flex-shrink-0" />
                      <SelectValue placeholder="Any Price" className="truncate" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-lg">
                    <SelectItem value="any">Any Price</SelectItem>
                    <SelectItem value="0-50000">Under $50,000</SelectItem>
                    <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100000-200000">$100,000 - $200,000</SelectItem>
                    <SelectItem value="200000-500000">$200,000 - $500,000</SelectItem>
                    <SelectItem value="500000+">$500,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Button - Full width on mobile, centered on desktop */}
            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-[#7f1518] hover:bg-[#6a1215] text-white font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 h-12 px-8 w-full sm:w-auto"
                onClick={handleSearch}
              >
                <Search className="w-5 h-5 mr-2" />
                Search Properties
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-2 pb-8 bg-gradient-to-br from-slate-100 to-slate-50">
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setIsDataLoading(true);
                    // Retry loading data
                    setTimeout(() => {
                      try {
                        setStats(getPropertyStats(selectedCountry));
                        // Featured properties are loaded separately via Supabase
                        setPopularCities(getPopularCities(selectedCountry));
                        setIsDataLoading(false);
                      } catch (err) {
                        setError('Failed to load property data. Please try again.');
                        setIsDataLoading(false);
                      }
                    }, 300);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content Area - Redesigned Featured Properties */}
        <div className="space-y-8">
          {/* Enhanced Featured Properties Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Header with Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 px-4 sm:px-0">
              <div className="mb-4 lg:mb-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Featured Properties</h2>
                <p className="text-slate-600 text-sm sm:text-base">Discover premium properties with flexible payment options</p>
              </div>
              
              {/* Filter Bar */}
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1.5 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                >
                  Featured
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1.5 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                >
                  Latest
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1.5 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                >
                  Price: Low-High
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1.5 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                >
                  Price: High-Low
                </Button>
              </div>
            </div>
            
            {/* Enhanced Property Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-0">
              {isDataLoading ? (
                // Enhanced skeleton loading
                Array.from({ length: 4 }).map((_, index) => (
                  <EnhancedPropertyCardSkeleton key={`skeleton-${index}`} index={index} />
                ))
              ) : (
                featuredProperties.slice(0, 4).map((property, index) => (
                  <EnhancedPropertyCardWrapper
                    key={`property-${property.id}`}
                    property={property}
                    index={index}
                    onPropertySelect={handlePropertySelect}
                    user={user}
                  />
                ))
              )}
            </div>
            
            {/* View All Button */}
            <div className="text-center mt-8">
              <Button
                size="lg"
                className="bg-[#7f1518] hover:bg-[#6a1215] text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  // Navigate to listings page; avoid any signup prompts if already authenticated
                  router.push('/listings');
                  // Track analytics
                  trackEvent('view_all_properties_clicked', {
                    source: 'featured_properties_main',
              event_category: 'navigation'
            });
          }} 
              >
                View All {totalPropertiesCount} Properties
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>



              {/* Why Mukamba Gateway */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-blue-50/20"></div>
                
                <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
                      <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                  >
                    <motion.h2 
                      className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      Why Mukamba Gateway
                    </motion.h2>
              <motion.div
                      className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0"
                initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <p>
                        Mukamba Gateway is a buyer-focused, fintech-enabled real estate platform for Zimbabwe (with South Africa to follow) that makes verified, installment-based and cash property purchases transparent, secure, and practical for local and diaspora buyers.
                      </p>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.2
                        }
                      }
                    }}
                  >
                    {[
                      {
                        icon: Home,
                        title: "Verified Listings",
                        description: "Every property is pre-checked and verified before it's listed. No scams. No surprises.",
                        gradient: "from-[#7f1518] to-[#7f1518]"
                      },
                      {
                        icon: DollarSign,
                        title: "Secure Payments",
                        description: "All deposits and instalments go into a regulated trust account — your money is protected.",
                        gradient: "from-[#7f1518] to-[#7f1518]"
                      },
                      {
                        icon: Building,
                        title: "Track Your Progress",
                        description: "Live dashboards let you see every step until title transfer. Total transparency.",
                        gradient: "from-[#7f1518] to-[#7f1518]"
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="group relative bg-white rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 ease-out hover:duration-300"
                        style={{
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        }}
                        whileHover={{
                          y: -8,
                          transition: { duration: 0.3, ease: "easeOut" }
                        }}
                      >
                        {/* Enhanced shadow on hover */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                        
                        {/* Card content */}
                        <div className="relative z-10">
              <motion.div
                            className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:shadow-lg transition-all duration-300 ease-out transform group-hover:scale-110`}
                            whileHover={{ 
                              rotate: 5,
                              transition: { duration: 0.3, ease: "easeOut" }
                            }}
                          >
                            <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

                          <motion.h3 
                            className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-red-600 transition-colors duration-300 ease-out"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                          >
                            {feature.title}
                          </motion.h3>
                          
                          <motion.p 
                            className="text-sm sm:text-base text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 ease-out"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                            viewport={{ once: true }}
                          >
                            {feature.description}
                          </motion.p>
                  </div>

                        {/* Focus ring for accessibility */}
                        <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-focus-within:ring-red-500/50 transition-all duration-300 ease-out"></div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>

              {/* How it Works */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 text-white py-16 px-4 sm:px-6 lg:px-8"
              >
                <div className="max-w-7xl mx-auto">
                    <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                  >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">
                      How it Works
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4 sm:px-0">
                      Mukamba Gateway is a property purchasing platform designed to serve Zimbabweans locally and in the diaspora. We make it easier to buy and manage the process completely online.
                    </p>
                    </motion.div>

                    <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.2
                        }
                      }
                    }}
                  >
                    {[
                      {
                        icon: User,
                        title: "Create Your Profile",
                        description: [
                          "Sign up with email address to unlock the first access level.",
                          "Browse through properties, and view full details."
                        ]
                      },
                      {
                        icon: Shield,
                        title: "Get Verified",
                        description: [
                          "Upload your ID, passport, or driver's license to verify your identity.",
                          "Allows you to make offers, payments and contact the team directly."
                        ]
                      },
                      {
                        icon: Home,
                        title: "Pick a Unit",
                        description: [
                          "After verification you can now select the property of your choice.",
                          "Prepare to bid!"
                        ]
                      },
                      {
                        icon: Building,
                        title: "Make an Offer",
                        description: [
                          "Make offer through your portal.",
                          "Choose payment terms",
                          "Upload supporting documents.",
                          "Track payments and transfer process through your dashboard"
                        ]
                      }
                    ].map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        viewport={{ once: true }}
                        className="bg-gray-900 rounded-xl p-4 sm:p-6 text-center group hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2"
                      >
                        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-full bg-[#7f1518] flex items-center justify-center group-hover:bg-[#6a1215] transition-all duration-300">
                          <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                          </div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 leading-tight">
                          {step.title}
                        </h3>
                        <div className="text-sm sm:text-base text-gray-300 leading-relaxed text-left">
                          {step.description.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-start mb-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span>{item}</span>
                              </div>
                          ))}
                      </div>
                    </motion.div>
                    ))}
              </motion.div>
      </div>
              </motion.div>


        </div>
        
      {/* What Our Users Say */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            className="text-center mb-16"
            >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
              What Our Users Say
              </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from people who have successfully found their path to homeownership with Mukamba Gateway.
              </p>
            </motion.div>

            <motion.div
            initial="hidden"
            whileInView="visible"
              viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
          >
            {[
              {
                quote: "After years of renting, I never thought I'd be able to own a home. Mukamba's installment program made it possible, and now I'm building equity with every payment.",
                author: "Tendai Moyo",
                location: "Harare"
              },
              {
                quote: "As a property owner, Mukamba has simplified the entire process. The payment tracking is seamless, and I love having tenants who are invested in taking care of the property.",
                author: "Rumbidzai Chikwavaire",
                location: "Bulawayo"
              },
              {
                quote: "Living abroad, I was worried about investing in property back home. Mukamba's platform gives me complete transparency and security. I can track my investment in real-time.",
                author: "Tatenda Muzenda",
                location: "Diaspora - London"
              }
            ].map((testimonial, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                <div className="flex items-start mb-4">
                  <div className="text-4xl text-gray-300 font-serif leading-none">"</div>
                  </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
                </motion.div>

      {/* Ready to Start Your Journey to Homeownership */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#7f1518] py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey to Homeownership?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied users who are building their future through Mukamba Gateway's innovative solutions.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-white text-[#7f1518] hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => {
                // Navigate to PropertyListings page
                router.push('/listings');
                // Track analytics
                trackEvent('browse_properties_cta_clicked', {
                  source: 'ready_to_start_section',
                  event_category: 'conversion'
                });
              }}
            >
              <Search className="w-5 h-5 mr-2" />
              Browse Properties
            </Button>
            
            <Button
              size="lg"
              className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => {
                setShowSignupModal(true);
                // Track analytics
                trackEvent('sign_up_now_cta_clicked', {
                  source: 'ready_to_start_section',
                  event_category: 'conversion'
                });
              }}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Sign Up Now
            </Button>
                </motion.div>
              </div>
            </motion.div>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <div className="mb-4">
                <Image
                  src="/logo-white.svg"
                  alt="Mukamba Gateway Logo"
                  width={200}
                  height={60}
                  className="h-auto"
                  priority
                />
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-6">
                Transforming property ownership in Southern Africa through innovative flexible installment plans.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/people/Mukamba-Gateway/61580417286014/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
                  aria-label="Follow us on Facebook"
                >
                  <span className="text-xs font-bold">f</span>
                </a>
                <a 
                  href="https://www.linkedin.com/company/mukamba-gateway/about/?viewAsMember=true" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
                  aria-label="Follow us on LinkedIn"
                >
                  <span className="text-xs font-bold">in</span>
                </a>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'About', href: '/about' },
                  { name: 'Properties', href: '/listings' }
                ].map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-white/80 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
                </motion.div>

            {/* Our Services */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">Our Services</h3>
              <ul className="space-y-2">
                {[
                  'Property Listing Management',
                  'Property Investment',
                  'Administration Oversight',
                  'Concierge Services',
                  'Secure Transfers'
                ].map((service, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="text-white/80 hover:text-white transition-colors text-sm"
                    >
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
                </motion.div>

            {/* Contact Us */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-white/80" />
                  <a 
                    href="mailto:hello@mukambagateway.com" 
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    hello@mukambagateway.com
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar */}
            <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="border-t border-white/20 mt-12 pt-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex flex-wrap gap-4 mb-4 sm:mb-0">
                <a href="/terms" className="text-white/60 hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </a>
                <a href="/privacy" className="text-white/60 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Insurance
                </a>
              </div>
              <p className="text-white/60 text-sm">
                © 2025 Mukamba Gateway. All rights reserved.
              </p>
              </div>
            </motion.div>
          </div>
      </footer>

      {/* Unified Signup Modal */}
      <UnifiedSignupModal
        isOpen={showSignupModal}
        onClose={() => {
          setShowSignupModal(false);
          setSellerIntent(false); // Reset seller intent when modal closes
          setSelectedPropertyForSignup(null);
        }}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setSellerIntent(false); // Reset seller intent when switching to login
          setShowSigninModal(true);
        }}
        sellerIntent={sellerIntent}
        onSellerSignupComplete={() => {
          // User completed signup with seller intent - open seller onboarding
          setSellerIntent(false); // Reset seller intent
          setTimeout(() => {
            setShowSellerModal(true); // Open seller onboarding modal
          }, 1000); // Small delay to let signup modal close gracefully
        }}
        propertyTitle={selectedPropertyForSignup?.title}
        onSignupComplete={async (email) => {
          setShowSignupModal(false);
          
          // Track successful buyer signup
          trackEvent('buyer_signup_completed', {
            email: email,
            property_id: selectedPropertyForSignup?.id,
            property_title: selectedPropertyForSignup?.title,
            source: 'property_details_gate',
            event_category: 'conversion'
          });
          
          console.log('Buyer signup completed:', { email, property: selectedPropertyForSignup });
          
          // Show success message using the auth store
          const { showSuccessMessage } = useAuthStore.getState();
          showSuccessMessage({
            email: email,
            title: "Account Created Successfully! 🎉",
            message: "Your account has been created! Please check your email and click the confirmation link to activate your account. You can now view property details."
          });
          
          // Show property details after signup (user now has email-level access)
          if (selectedPropertyForSignup) {
            handlePropertySelect(selectedPropertyForSignup);
          }
          
          // Reset state
          setSelectedPropertyForSignup(null);
        }}
      />

      {/* Basic Signin Modal */}
      <BasicSigninModal
        isOpen={showSigninModal}
        onClose={() => setShowSigninModal(false)}
        onSwitchToSignup={() => {
          setShowSigninModal(false);
          setShowSignupModal(true);
        }}
      />

      {/* Agent Onboarding Modal */}
      <AgentOnboardingModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        onComplete={() => {
          setShowAgentModal(false);
          // Show success message or redirect
          console.log('Agent registration completed');
        }}
      />

      {/* Seller Onboarding Modal */}
      <SellerOnboardingModal
        isOpen={showSellerModal}
        onClose={() => setShowSellerModal(false)}
        onComplete={(sellerData) => {
          setShowSellerModal(false);
          // Show success message or redirect
          console.log('Seller onboarding completed:', sellerData);
          // TODO: Navigate to seller dashboard or show success message
        }}
      />


      {/* Buyer Phone Verification Modal */}
      <BuyerPhoneVerificationModal
        isOpen={showBuyerPhoneVerificationModal}
        onClose={() => {
          setShowBuyerPhoneVerificationModal(false);
          setSelectedPropertyForContact(null);
        }}
        onVerificationComplete={(phoneNumber) => {
          setShowBuyerPhoneVerificationModal(false);
          setUserPhoneVerified(true);
          
          // Track successful phone verification
          trackEvent('buyer_phone_verified', {
            phone_number: phoneNumber,
            property_id: selectedPropertyForContact?.id,
            property_title: selectedPropertyForContact?.title,
            source: 'seller_contact_gate',
            event_category: 'conversion'
          });
          
          // TODO: Update user profile with phone verification in real implementation
          console.log('Phone verification completed:', { phoneNumber });
          
          // Show success message or redirect to seller contact
          alert(`Phone verified! You can now contact sellers directly. Feature coming soon.`);
          
          // Reset state
          setSelectedPropertyForContact(null);
        }}
        buyerType={undefined}
        userEmail={user?.email}
      />

      {/* Floating "Want to Sell?" Button - Show to all users with smart routing */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="fixed bottom-32 right-6 z-40"
      >
        <Button
          className="bg-[#7f1518] hover:bg-[#6a1215] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6 py-3"
          size="lg"
          onClick={() => {
            trackEvent('floating_sell_button_clicked', {
              source: 'property_dashboard',
              event_category: 'conversion',
              user_status: user ? 'authenticated' : 'guest'
            });
            
            // Smart routing based on authentication
            if (user) {
              // Authenticated user: Open seller onboarding
              setShowSellerModal(true);
            } else {
              // Guest user: Open signup modal with seller intent
              setSellerIntent(true);
              setShowSignupModal(true);
            }
          }}
        >
          <Home className="w-5 h-5 mr-2" />
          Want to Sell?
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSignupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            {/* Success particles could be added here */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Add display name for debugging
PropertyDashboard.displayName = 'PropertyDashboard';