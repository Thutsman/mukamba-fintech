'use client';

import * as React from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Search, 
  Calculator, 
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
  TrendingUp as TrendingUpIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyListings } from './PropertyListings';
import { RentToBuyCalculator } from '@/components/ui/RentToBuyCalculator';
import { PropertyListing as Property, PropertySearchFilters, PropertyCountry } from '@/types/property';
import { getPropertyStats, getPopularCities, getFeaturedProperties } from '@/lib/property-services';
import { User as UserType } from '@/types/auth';
import { CountryToggle } from '@/components/ui/country-toggle';
import { BasicSignupModal } from '@/components/forms/BasicSignupModal';
import { BasicSigninModal } from '@/components/forms/BasicSigninModal';
import { AgentOnboardingModal } from '@/components/agent/AgentOnboardingModal';
import Image from 'next/image';

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

export const PropertyDashboard: React.FC<PropertyDashboardProps> = ({
  user,
  onPropertySelect
}) => {
  const [activeTab, setActiveTab] = React.useState('explore');
  const [quickSearchQuery, setQuickSearchQuery] = React.useState('');
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
  const [selectedCountry, setSelectedCountry] = React.useState<PropertyCountry>('ZW');
  const [stats, setStats] = React.useState(getPropertyStats(selectedCountry));
  const [popularCities, setPopularCities] = React.useState(getPopularCities(selectedCountry));
  const [featuredProperties, setFeaturedProperties] = React.useState<Property[]>([]);
  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const [showSigninModal, setShowSigninModal] = React.useState(false);
  const [showAgentModal, setShowAgentModal] = React.useState(false);
  const [isSearchLoading, setIsSearchLoading] = React.useState(false);
  const [isDataLoading, setIsDataLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = React.useState<Set<string>>(new Set());
  
  // New state for floating navigation and enhanced search
  const [showFloatingNav, setShowFloatingNav] = React.useState(false);
  const [showQuickSearch, setShowQuickSearch] = React.useState(false);
  const [searchFilters, setSearchFilters] = React.useState({
    priceRange: '',
    bedrooms: '',
    propertyType: '',
    listingType: 'rent-to-buy'
  });
  const [searchSuggestions, setSearchSuggestions] = React.useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = React.useState(false);

  React.useEffect(() => {
    setFeaturedProperties(getFeaturedProperties(selectedCountry));
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
        setFeaturedProperties(getFeaturedProperties(selectedCountry));
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

  // Scroll detection for floating navigation
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = 600; // Approximate hero section height
      setShowFloatingNav(scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search suggestions logic
  React.useEffect(() => {
    if (quickSearchQuery.length > 2) {
      const cities = popularCities.map(city => city.city);
      const suggestions = cities.filter(city => 
        city.toLowerCase().includes(quickSearchQuery.toLowerCase())
      );
      setSearchSuggestions(suggestions.slice(0, 5));
      setShowSearchSuggestions(suggestions.length > 0);
    } else {
      setShowSearchSuggestions(false);
    }
  }, [quickSearchQuery, popularCities]);

  const handleQuickSearch = () => {
    if (quickSearchQuery.trim()) {
      setIsSearchLoading(true);
      setActiveTab('listings');
      
      // Analytics tracking
      trackEvent('search_performed', {
        search_query: quickSearchQuery,
        search_category: 'property_search',
        event_category: 'search_interaction'
      });
      
      // Simulate search loading
      setTimeout(() => {
        setIsSearchLoading(false);
      }, 800);
      
      // The PropertyListings component will handle the search through its own filters
    }
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    onPropertySelect?.(property);
    
    // Analytics tracking
    trackEvent('property_view', {
      property_id: property.id,
      property_title: property.title,
      property_location: `${property.location.city}, ${property.location.country}`,
      property_price: property.financials.monthlyRental,
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
                      {imageLoadErrors.has(property.media.mainImage) ? (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Home className="w-4 h-4 text-gray-400" />
                        </div>
                      ) : (
                        <Image
                          src={property.media.mainImage}
                          alt={property.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                          onError={() => {
                            setImageLoadErrors(prev => new Set(prev).add(property.media.mainImage));
                          }}
                        />
                      )}
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
            {imageLoadErrors.has(images[currentImageIndex]) ? (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <Home className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">Image unavailable</p>
                </div>
              </div>
            ) : (
              <Image
                src={images[currentImageIndex]}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                onError={() => {
                  setImageLoadErrors(prev => new Set(prev).add(images[currentImageIndex]));
                }}
                priority={index < 2} // Prioritize first 2 images
              />
            )}
            
            {/* Image Navigation */}
            {images.length > 1 && (
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
              <Badge className="bg-red-500 text-white text-xs">
                Featured
              </Badge>
              {property.listingType === 'rent-to-buy' && (
                <Badge className="bg-green-500 text-white text-xs">
                  Rent-to-Buy
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
                    // Calculate payment action
                  }}
                >
                  <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </motion.div>
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
                  {property.location.streetAddress}, {property.location.city}
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
                    {formatCurrency(property.financials.monthlyRental || 0)}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">/month</div>
                </div>
                
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2"
                  onClick={(e) => {
                    e.stopPropagation();
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
  const handleSearchSuggestionClick = (suggestion: string) => {
    setQuickSearchQuery(suggestion);
    setShowSearchSuggestions(false);
    handleQuickSearch();
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleQuickSearchToggle = () => {
    console.log('handleQuickSearchToggle called, current state:', showQuickSearch);
    setShowQuickSearch(!showQuickSearch);
    if (!showQuickSearch) {
      // Analytics tracking for quick search expansion
      trackEvent('quick_search_expanded', {
        event_category: 'search_interaction'
      });
    }
  };

  const handleCloseQuickSearch = () => {
    console.log('handleCloseQuickSearch called, current state:', showQuickSearch);
    setShowQuickSearch(false);
    console.log('setShowQuickSearch(false) called');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Floating Navigation */}
      <AnimatePresence>
        {showFloatingNav && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
          >
            {/* Quick Search Toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button
                size="icon"
                className="w-12 h-12 bg-red-600 hover:bg-red-700 shadow-lg"
                onClick={handleQuickSearchToggle}
              >
                <Search className="w-5 h-5" />
              </Button>
              
              {/* Expanded Quick Search */}
              <AnimatePresence mode="wait">
                {showQuickSearch && (
                  <motion.div
                    key="quick-search"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="absolute bottom-full right-0 mb-3 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">Quick Search</h3>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 hover:bg-slate-100 rounded-full transition-colors duration-200 z-10 relative"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Close button clicked');
                            handleCloseQuickSearch();
                          }}
                          aria-label="Close quick search"
                        >
                          <X className="w-5 h-5 text-slate-600 hover:text-slate-800" />
                        </Button>
                      </div>
                      
                      {/* Search Input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          type="text"
                          placeholder="Search properties..."
                          value={quickSearchQuery}
                          onChange={(e) => setQuickSearchQuery(e.target.value)}
                          className="pl-10 pr-4"
                        />
                        
                        {/* Search Suggestions */}
                        <AnimatePresence>
                          {showSearchSuggestions && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 z-10"
                            >
                              {searchSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm"
                                  onClick={() => handleSearchSuggestionClick(suggestion)}
                                >
                                  <MapPin className="w-4 h-4 inline mr-2 text-slate-400" />
                                  {suggestion}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Quick Filters */}
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={searchFilters.priceRange}
                          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                          className="text-xs border border-slate-200 rounded px-2 py-1"
                        >
                          <option value="">Price Range</option>
                          <option value="0-50000">$0 - $50K</option>
                          <option value="50000-100000">$50K - $100K</option>
                          <option value="100000-200000">$100K - $200K</option>
                          <option value="200000+">$200K+</option>
                        </select>
                        
                        <select
                          value={searchFilters.bedrooms}
                          onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                          className="text-xs border border-slate-200 rounded px-2 py-1"
                        >
                          <option value="">Bedrooms</option>
                          <option value="1">1 Bed</option>
                          <option value="2">2 Beds</option>
                          <option value="3">3 Beds</option>
                          <option value="4+">4+ Beds</option>
                        </select>
                      </div>
                      
                      <Button
                        onClick={handleQuickSearch}
                        disabled={isSearchLoading}
                        className="w-full bg-red-600 hover:bg-red-700 text-sm"
                      >
                        {isSearchLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4 mr-2" />
                        )}
                        Search Properties
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* View All Properties Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                className="w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg"
                onClick={() => {
                  setActiveTab('listings');
                  scrollToSection('listings-section');
                  trackEvent('floating_nav_clicked', {
                    action: 'view_all_properties',
                    event_category: 'navigation'
                  });
                }}
              >
                <Eye className="w-5 h-5" />
              </Button>
            </motion.div>
            
            {/* Back to Top */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                className="w-12 h-12 bg-slate-600 hover:bg-slate-700 shadow-lg"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  trackEvent('back_to_top_clicked', {
                    event_category: 'navigation'
                  });
                }}
              >
                <ArrowRight className="w-5 h-5 rotate-[-90deg]" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900">
        {/* Full-bleed property background image */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/propertyimage.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center sm:object-[50%_40%] brightness-[0.9] contrast-110"
            sizes="100vw"
          />
        </div>
        {/* Subtle gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 sm:from-black/20 sm:to-black/45" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Main Headline */}
            <motion.h1 
              className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-[-0.02em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] px-2 mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Skip the Down Payment,
              <br />
              <span className="text-blue-300">Own Your Home Faster</span>
            </motion.h1>
            
            
            {/* Subheadline */}
            <motion.div 
              className="text-center px-4 space-y-2 mb-6 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="text-lg md:text-xl text-white font-medium">
                Buy, Sell, or Rent-to-Own Properties
              </p>
              <p className="text-base md:text-lg text-gray-200">
                Comprehensive real estate solutions across Zimbabwe and South Africa.
              </p>
            </motion.div>
            
            {/* Statistics Ticker */}
            <motion.div 
              className="grid grid-cols-1 gap-4 px-6 mb-8 sm:grid-cols-3 sm:gap-4 md:flex md:flex-wrap md:justify-center md:gap-8 md:mb-0 md:px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center sm:bg-black/35 sm:rounded-xl sm:px-5 sm:py-3 inline-block">
                <div className="text-2xl font-bold text-white mb-1 sm:text-3xl md:text-4xl sm:font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">500+</div>
                <div className="text-gray-200 text-sm sm:text-sm md:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">Pre-Approved Properties</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center sm:bg-black/35 sm:rounded-xl sm:px-5 sm:py-3 inline-block">
                <div className="text-2xl font-bold text-white mb-1 sm:text-3xl md:text-4xl sm:font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">2,000+</div>
                <div className="text-gray-200 text-sm sm:text-sm md:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">Families Who Owned Their Home</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center sm:bg-black/35 sm:rounded-xl sm:px-5 sm:py-3 inline-block">
                <div className="text-2xl font-bold text-white mb-1 sm:text-3xl md:text-4xl sm:font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">25+</div>
                <div className="text-gray-200 text-sm sm:text-sm md:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">Cities with Zero Down Payment</div>
              </div>
            </motion.div>
            
            {/* CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button 
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-5 sm:px-8 py-4 text-base sm:text-lg font-semibold w-full sm:w-auto shadow-[0_4px_14px_rgba(220,38,38,0.3)] transition-transform duration-200 will-change-transform hover:-translate-y-0.5"
                onClick={() => setActiveTab('listings')}
                suppressHydrationWarning
              >
                <Search className="w-5 h-5 mr-2" />
                Find Zero-Down Properties
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20 hover:text-white px-5 sm:px-8 py-4 text-base sm:text-lg font-semibold bg-white/15 backdrop-blur-md w-full sm:w-auto"
                suppressHydrationWarning
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Sell Your Property
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20 hover:text-white px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold bg-white/15 backdrop-blur-md w-full sm:w-auto"
                onClick={() => {
                  setShowSigninModal(true);
                  // Analytics tracking for signin modal
                  trackEvent('signin_modal_opened', {
                    source: 'hero_section',
                    event_category: 'conversion'
                  });
                }}
                suppressHydrationWarning
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </motion.div>
            
            {/* Enhanced Search Bar */}
            <motion.div 
              className="max-w-4xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="bg-white/30 backdrop-blur-xl rounded-xl p-6 border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
                <div className="space-y-4">
                  {/* Main Search Input */}
              <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search properties by location, type, or features..."
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                      className="pl-12 pr-4 h-14 text-lg bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:bg-white focus:border-slate-400"
                    />
                    
                    {/* Search Suggestions */}
                    <AnimatePresence>
                      {showSearchSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-2 z-20"
                        >
                          {searchSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 text-slate-700 border-b border-slate-100 last:border-b-0"
                              onClick={() => handleSearchSuggestionClick(suggestion)}
                            >
                              <MapPin className="w-4 h-4 inline mr-3 text-slate-400" />
                              {suggestion}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
            </div>
            
                  {/* Quick Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <CountryToggle
                  value={selectedCountry}
                  onChange={setSelectedCountry}
                />
                    
                    <select
                      value={searchFilters.priceRange}
                      onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                      className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-500 focus:border-slate-400"
                    >
                      <option value="" className="text-slate-700">Price Range</option>
                      <option value="0-50000" className="text-slate-700">$0 - $50K</option>
                      <option value="50000-100000" className="text-slate-700">$50K - $100K</option>
                      <option value="100000-200000" className="text-slate-700">$100K - $200K</option>
                      <option value="200000+" className="text-slate-700">$200K+</option>
                    </select>
                    
                    <select
                      value={searchFilters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-500 focus:border-slate-400"
                    >
                      <option value="" className="text-slate-700">Bedrooms</option>
                      <option value="1" className="text-slate-700">1 Bed</option>
                      <option value="2" className="text-slate-700">2 Beds</option>
                      <option value="3" className="text-slate-700">3 Beds</option>
                      <option value="4+" className="text-slate-700">4+ Beds</option>
                    </select>
                    
              <Button
                onClick={handleQuickSearch}
                disabled={isSearchLoading}
                      className="bg-red-600 hover:bg-red-700 px-6 py-2"
              >
                {isSearchLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Search className="w-4 h-4 mr-2" />
                      )}
                    Search
                    </Button>
                  </div>
                </div>
              </div>
                  </motion.div>

            {/* Quick Property Preview */}
            <motion.div 
              className="max-w-6xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                  Featured Opportunities
                </h3>
                <p className="text-blue-200 text-sm sm:text-base">
                  Start browsing these pre-approved rent-to-buy properties
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">
                {featuredProperties.slice(0, 4).map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group cursor-pointer"
                    onClick={() => handlePropertySelect(property)}
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300">
                      {/* Property Image */}
                      <div className="relative h-32 overflow-hidden">
                        {imageLoadErrors.has(property.media.mainImage) ? (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <Home className="w-8 h-8 text-white/50" />
                          </div>
                        ) : (
                          <Image
                            src={property.media.mainImage}
                            alt={property.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            onError={() => {
                              setImageLoadErrors(prev => new Set(prev).add(property.media.mainImage));
                            }}
                          />
                        )}
                        
                        {/* Property Badges */}
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge className="bg-red-500 text-white text-xs">
                            Featured
                          </Badge>
                          {property.listingType === 'rent-to-buy' && (
                            <Badge className="bg-green-500 text-white text-xs">
                              Rent-to-Buy
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Property Details */}
                      <div className="p-3">
                        <h4 className="font-semibold text-white text-sm mb-1 truncate">
                          {property.title}
                        </h4>
                        <p className="text-blue-200 text-xs mb-2 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {property.location.city}
                        </p>
                        <div className="flex items-center justify-between">
                                                     <div className="text-white font-bold text-sm">
                             {formatCurrency(property.financials.monthlyRental || 0)}/mo
                           </div>
                          <div className="flex items-center gap-2 text-blue-200 text-xs">
                            <span>{property.details.bedrooms} bed</span>
                            <span>{property.details.bathrooms} bath</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-900"
                  onClick={() => setActiveTab('listings')}
                  suppressHydrationWarning
                >
                  View All Properties
                  <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100 text-xs sm:text-sm font-medium">KYC Verified</span>
          </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100 text-xs sm:text-sm font-medium">Secure Transactions</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100 text-xs sm:text-sm font-medium">Licensed Platform</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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
                        setFeaturedProperties(getFeaturedProperties(selectedCountry));
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

        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value);
            // Analytics tracking for tab changes
            trackEvent('tab_changed', {
              tab_name: value,
              event_category: 'navigation'
            });
          }} 
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="explore" className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Explore
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center">
              <Search className="w-4 h-4 mr-2" />
              All Listings
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center" disabled={!user}>
              <Bookmark className="w-4 h-4 mr-2" />
              Saved {!user && <span className="text-xs ml-1">(Sign up required)</span>}
            </TabsTrigger>
          </TabsList>

          {/* Explore Tab */}
          <TabsContent value="explore">
            <div className="space-y-8">
              {/* Market Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 px-4 sm:px-0">Market Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
                  {isDataLoading ? (
                    // Loading skeleton
                    Array.from({ length: 4 }).map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 min-h-[120px] sm:min-h-[140px]"
                      >
                        <div className="animate-pulse space-y-3">
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                          </div>
                          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          <div className="flex justify-between items-center">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <>
                                        <MarketStatsCard
                    title="Zero-down properties"
                    value={stats.totalListings}
                    subtitle="Pre-Approved Listings"
                    description="Properties ready for immediate rent-to-buy"
                    trend="+12%"
                    icon={Home}
                    color="bg-blue-500"
                        onViewProperties={() => {
                          setActiveTab('listings');
                          scrollToSection('listings-section');
                        }}
                        propertyThumbnails={featuredProperties.slice(0, 3)}
                  />
                  <MarketStatsCard
                    title="Rent-to-buy available"
                    value={stats.activeRentToBuy}
                    subtitle="No Down Payment Required"
                    description="Start with just your monthly rent payment"
                    trend="+25%"
                    icon={TrendingUp}
                    color="bg-green-500"
                        onViewProperties={() => {
                          setActiveTab('listings');
                          scrollToSection('listings-section');
                        }}
                        propertyThumbnails={featuredProperties.slice(0, 3)}
                  />
                  <MarketStatsCard
                    title="Average monthly payment"
                    value={formatCurrency(stats.averagePrice)}
                    subtitle="Affordable Payments"
                    description="Lower than traditional mortgage payments"
                    trend="+3%"
                    icon={DollarSign}
                    color="bg-purple-500"
                        onViewProperties={() => {
                          setActiveTab('listings');
                          scrollToSection('listings-section');
                        }}
                        propertyThumbnails={featuredProperties.slice(0, 3)}
                  />
                  <MarketStatsCard
                    title="New opportunities"
                    value="Growing Fast"
                    subtitle="Expanding Market"
                    description="More properties added every week"
                    trend="+18%"
                    icon={BarChart3}
                    color="bg-orange-500"
                        onViewProperties={() => {
                          setActiveTab('listings');
                          scrollToSection('listings-section');
                        }}
                        propertyThumbnails={featuredProperties.slice(0, 3)}
                  />
                    </>
                  )}
                </div>
              </motion.div>

              {/* Popular Cities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Popular Cities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {popularCities.map((city, index) => (
                        <motion.div
                          key={city.city}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="cursor-pointer"
                          onClick={() => {
                            setActiveTab('listings');
                            // Pass city filter to listings
                          }}
                        >
                          <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <h3 className="font-semibold text-slate-800">{city.city}</h3>
                            <p className="text-sm text-slate-600">{city.listingCount} properties</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Featured Properties */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 px-4 sm:px-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-0">Featured Properties</h2>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('listings')}
                    className="flex items-center w-full sm:w-auto"
                    suppressHydrationWarning
                  >
                    View All {featuredProperties.length} Properties
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
                  {isDataLoading ? (
                    // Skeleton loading for featured properties
                    Array.from({ length: 4 }).map((_, index) => (
                      <PropertyCardSkeleton key={index} index={index} />
                    ))
                  ) : (
                    featuredProperties.slice(0, 4).map((property, index) => (
                      <FeaturedPropertyCard
                        key={property.id}
                        property={property}
                        index={index}
                      />
                    ))
                  )}
                </div>
              </motion.div>

              {/* Trust & Social Proof Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {/* Customer Testimonials */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900">What Our Customers Say</h2>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            TD
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-slate-800">Thulani Dube</h4>
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Verified
                              </Badge>
                            </div>
                            <p className="text-slate-600 text-sm mb-2">
                              "Mukamba made my rent-to-buy journey seamless. The verification process was quick and the support team was incredibly helpful."
                            </p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                            SM
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-slate-800">Sarah Moyo</h4>
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Verified
                              </Badge>
                            </div>
                            <p className="text-slate-600 text-sm mb-2">
                              "Found my dream home through Mukamba's rent-to-buy program. The process was transparent and the financial calculations were spot on."
                            </p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Why Choose Mukamba */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900">Why Choose Mukamba</h2>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Shield className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-1">Bank-Level Security</h4>
                          <p className="text-sm text-slate-600">Your data is protected with enterprise-grade encryption and secure protocols.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-1">Document Verification</h4>
                          <p className="text-sm text-slate-600">All properties and sellers are thoroughly verified to ensure authenticity.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Scale className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-1">Legal Compliance</h4>
                          <p className="text-sm text-slate-600">Full compliance with Zimbabwe and South Africa real estate regulations.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process Timeline & Success Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Process Timeline */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">How It Works</h3>
                    <div className="space-y-4">
                      {[
                        { step: 1, title: "Sign Up", description: "Create your account in minutes" },
                        { step: 2, title: "Verify", description: "Complete KYC verification" },
                        { step: 3, title: "Browse", description: "Explore verified properties" },
                        { step: 4, title: "Apply", description: "Submit your application" },
                        { step: 5, title: "Move In", description: "Start your rent-to-buy journey" }
                      ].map((item, index) => (
                        <div key={item.step} className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {item.step}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{item.title}</h4>
                            <p className="text-sm text-slate-600">{item.description}</p>
                          </div>
                          {index < 4 && (
                            <div className="w-px h-8 bg-slate-200 mx-4"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Success Metrics */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Success Metrics</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                        <div className="text-sm text-slate-600">Approval Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">30 Days</div>
                        <div className="text-sm text-slate-600">Average Process Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">2,000+</div>
                        <div className="text-sm text-slate-600">Happy Families</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="space-y-6">
                  <div className="text-center px-4 sm:px-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Quick Actions</h2>
                    <p className="text-slate-600">Get started with these popular tools</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
                    {/* Primary Action - Calculate Rent-to-Buy */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05, y: -8 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="group cursor-pointer"
                      onClick={() => setActiveTab('calculator')}
                      viewport={{ once: true }}
                    >
                      <div className="relative bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300">
                        {/* Popular Badge */}
                        <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                          Most Popular
                        </div>
                        
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                            <Calculator className="w-8 h-8 text-white" />
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-bold mb-2">Calculate Your Savings</h3>
                            <p className="text-red-100 text-sm mb-4">
                              See how much you'll save vs. traditional home buying
                            </p>
                            
                            {/* Preview */}
                            <div className="bg-white/10 rounded-lg p-3 text-left">
                              <div className="text-xs text-red-200 mb-1">Preview:</div>
                              <div className="text-xs space-y-1">
                                <div>• Monthly payment: $1,200</div>
                                <div>• Rent credit: $300/month</div>
                                <div>• Time to ownership: 5 years</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Advanced Search */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                      className="group cursor-pointer"
                      onClick={() => setActiveTab('listings')}
                      viewport={{ once: true }}
                    >
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-green-300">
                        <div className="text-center space-y-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                            <Filter className="w-6 h-6 text-green-600" />
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-slate-800 mb-2">Find Your Perfect Home</h3>
                            <p className="text-slate-600 text-sm mb-3">
                              Search by location, budget, and preferences
                            </p>
                            
                            {/* Preview */}
                            <div className="bg-slate-50 rounded-lg p-3 text-left">
                              <div className="text-xs text-slate-500 mb-1">Preview:</div>
                              <div className="text-xs space-y-1 text-slate-600">
                                <div>• Location: Harare, Zimbabwe</div>
                                <div>• Price: $50K - $200K</div>
                                <div>• Type: 3+ bedrooms</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Saved Properties */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                      className="group cursor-pointer"
                      onClick={() => setActiveTab('saved')}
                      viewport={{ once: true }}
                    >
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-purple-300">
                        <div className="text-center space-y-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                            <Bookmark className="w-6 h-6 text-purple-600" />
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-slate-800 mb-2">Track Your Favorites</h3>
                            <p className="text-slate-600 text-sm mb-3">
                              Save and compare your top choices
                            </p>
                            
                            {/* Preview */}
                            <div className="bg-slate-50 rounded-lg p-3 text-left">
                              <div className="text-xs text-slate-500 mb-1">Preview:</div>
                              <div className="text-xs space-y-1 text-slate-600">
                                <div>• 3 properties saved</div>
                                <div>• Last viewed: 2 hours ago</div>
                                <div>• Price alerts: 2 active</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" id="listings-section">
            <PropertyListings
              initialFilters={{ country: selectedCountry }}
              onPropertySelect={handlePropertySelect}
              showFeatured={false}
              user={user}
              onSignUpPrompt={() => {
                alert('Sign up to save properties and get personalized recommendations!');
              }}
            />
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Rent-to-Buy Calculator
                </h2>
                <p className="text-slate-600">
                  Calculate your potential savings and path to homeownership
                </p>
              </div>

              {selectedProperty ? (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">
                            Calculating for: {selectedProperty.title}
                          </h3>
                          <p className="text-slate-600">{selectedProperty.location.streetAddress}, {selectedProperty.location.city}</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedProperty(null)}
                          suppressHydrationWarning
                        >
                          Change Property
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <RentToBuyCalculator property={selectedProperty} />
                </div>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-600 mb-2">
                        Select a Property to Calculate
                      </h3>
                      <p className="text-slate-500 mb-6">
                        Browse our listings and select a rent-to-buy property to see your potential savings
                      </p>
                      <Button
                        onClick={() => setActiveTab('listings')}
                        className="bg-red-600 hover:bg-red-700"
                        suppressHydrationWarning
                      >
                        Browse Properties
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Generic Calculator */}
                  <RentToBuyCalculator />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved">
            {user ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">
                    No Saved Properties Yet
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Start browsing properties and save your favorites for easy access later
                  </p>
                  <Button
                    onClick={() => setActiveTab('listings')}
                    className="bg-red-600 hover:bg-red-700"
                    suppressHydrationWarning
                  >
                    Browse Properties
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">
                    Sign Up to Save Properties
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Create an account to save your favorite properties and get personalized recommendations
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="bg-red-600 hover:bg-red-700" suppressHydrationWarning>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-red-300 text-red-700" 
                      onClick={() => {
                        setShowSigninModal(true);
                        // Analytics tracking for signin modal
                        trackEvent('signin_modal_opened', {
                          source: 'saved_tab',
                          event_category: 'conversion'
                        });
                      }}
                      suppressHydrationWarning
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </div>
                  
                  {/* Real Estate Agent Registration */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-sm text-slate-500 mb-3">Are you a Real Estate Agent?</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50" 
                      onClick={() => {
                        setShowAgentModal(true);
                        trackEvent('agent_registration_opened', {
                          source: 'saved_tab',
                          event_category: 'conversion'
                        });
                      }}
                      suppressHydrationWarning
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Register as Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Call-to-Action Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Ready to Own Your Home?
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                Join <span className="text-red-400 font-bold">1,000+ families</span> who skipped the down payment and own their home
              </p>
            </motion.div>

            {/* How it Works Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="col-span-full mb-8"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">How Rent-to-Buy Works</h3>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                  Get the keys to your home in 3 simple steps - no down payment required
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center"
                >
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl font-bold">1</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Find Your Property</h4>
                  <p className="text-slate-300 text-sm">
                    Browse pre-approved properties in your preferred location and budget
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center"
                >
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl font-bold">2</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Start Renting</h4>
                  <p className="text-slate-300 text-sm">
                    Move in immediately and start building equity with each rent payment
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center"
                >
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl font-bold">3</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Own Your Home</h4>
                  <p className="text-slate-300 text-sm">
                    Convert to full ownership when you're ready - no additional costs
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 px-4 sm:px-0"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Zero Down Payment</h3>
                <p className="text-slate-300 text-sm">
                  Start with just your monthly rent - no large upfront costs required
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Build Equity Monthly</h3>
                <p className="text-slate-300 text-sm">
                  Each rent payment builds your ownership stake in the property
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Pre-Approved Properties</h3>
                <p className="text-slate-300 text-sm">
                  All properties are verified and ready for immediate rent-to-buy
                </p>
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="col-span-full mb-8"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Frequently Asked Questions</h3>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                  Everything you need to know about rent-to-buy properties
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                >
                  <h4 className="text-lg font-semibold text-white mb-3">Do I need a down payment?</h4>
                  <p className="text-slate-300 text-sm">
                    No! Rent-to-buy properties require zero down payment. You start with just your monthly rent payment.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                >
                  <h4 className="text-lg font-semibold text-white mb-3">How long until I own the property?</h4>
                  <p className="text-slate-300 text-sm">
                    Typically 3-5 years, but you can convert to full ownership anytime during the rent period.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                >
                  <h4 className="text-lg font-semibold text-white mb-3">What if I can&apos;t afford the payments?</h4>
                  <p className="text-slate-300 text-sm">
                    You can walk away anytime during the rent period with no penalty - it's just like regular renting.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                >
                  <h4 className="text-lg font-semibold text-white mb-3">Are all properties verified?</h4>
                  <p className="text-slate-300 text-sm">
                    Yes! Every property is pre-approved and verified by our team before listing.
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold w-full sm:w-auto"
                onClick={() => setActiveTab('listings')}
                suppressHydrationWarning
              >
                <Search className="w-5 h-5 mr-2" />
                Find Zero-Down Properties
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-900 px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold bg-white/10 backdrop-blur-sm w-full sm:w-auto"
                suppressHydrationWarning
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Sell Your Property
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-900 px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold bg-white/10 backdrop-blur-sm w-full sm:w-auto"
                onClick={() => {
                  setShowSigninModal(true);
                  // Analytics tracking for signin modal
                  trackEvent('signin_modal_opened', {
                    source: 'hero_section',
                    event_category: 'conversion'
                  });
                }}
                suppressHydrationWarning
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </motion.div>

            {/* Enhanced Search Bar */}
            <motion.div
              className="max-w-4xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="space-y-4">
                  {/* Main Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search properties by location, type, or features..."
                      value={quickSearchQuery}
                      onChange={(e) => setQuickSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                      className="pl-12 pr-4 h-14 text-lg bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white/30 focus:border-white/50"
                    />
                    
                    {/* Search Suggestions */}
                    <AnimatePresence>
                      {showSearchSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-2 z-20"
                        >
                          {searchSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 text-slate-700 border-b border-slate-100 last:border-b-0"
                              onClick={() => handleSearchSuggestionClick(suggestion)}
                            >
                              <MapPin className="w-4 h-4 inline mr-3 text-slate-400" />
                              {suggestion}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
              </div>

                  {/* Quick Filters */}
                  <div className="flex flex-wrap gap-3">
                                         <CountryToggle
                       value={selectedCountry}
                       onChange={setSelectedCountry}
                     />
                    
                    <select
                      value={searchFilters.priceRange}
                      onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                      className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:bg-white/30 focus:border-white/50"
                    >
                      <option value="" className="text-slate-700">Price Range</option>
                      <option value="0-50000" className="text-slate-700">$0 - $50K</option>
                      <option value="50000-100000" className="text-slate-700">$50K - $100K</option>
                      <option value="100000-200000" className="text-slate-700">$100K - $200K</option>
                      <option value="200000+" className="text-slate-700">$200K+</option>
                    </select>
                    
                    <select
                      value={searchFilters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:bg-white/30 focus:border-white/50"
                    >
                      <option value="" className="text-slate-700">Bedrooms</option>
                      <option value="1" className="text-slate-700">1 Bed</option>
                      <option value="2" className="text-slate-700">2 Beds</option>
                      <option value="3" className="text-slate-700">3 Beds</option>
                      <option value="4+" className="text-slate-700">4+ Beds</option>
                    </select>
                    
                    <Button
                      onClick={handleQuickSearch}
                      disabled={isSearchLoading}
                      className="bg-red-600 hover:bg-red-700 px-6 py-2"
                    >
                      {isSearchLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      Search
                    </Button>
                </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Property Preview */}
            <motion.div 
              className="max-w-6xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                  Featured Opportunities
                </h3>
                <p className="text-blue-200 text-sm sm:text-base">
                  Start browsing these pre-approved rent-to-buy properties
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
                {featuredProperties.slice(0, 4).map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group cursor-pointer"
                    onClick={() => handlePropertySelect(property)}
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300">
                      {/* Property Image */}
                      <div className="relative h-32 overflow-hidden">
                        {imageLoadErrors.has(property.media.mainImage) ? (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <Home className="w-8 h-8 text-white/50" />
                </div>
                        ) : (
                          <Image
                            src={property.media.mainImage}
                            alt={property.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            onError={() => {
                              setImageLoadErrors(prev => new Set(prev).add(property.media.mainImage));
                            }}
                          />
                        )}
                        
                        {/* Property Badges */}
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge className="bg-red-500 text-white text-xs">
                            Featured
                          </Badge>
                          {property.listingType === 'rent-to-buy' && (
                            <Badge className="bg-green-500 text-white text-xs">
                              Rent-to-Buy
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Property Details */}
                      <div className="p-3">
                        <h4 className="font-semibold text-white text-sm mb-1 truncate">
                          {property.title}
                        </h4>
                        <p className="text-blue-200 text-xs mb-2 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {property.location.city}
                        </p>
                        <div className="flex items-center justify-between">
                                                     <div className="text-white font-bold text-sm">
                             {formatCurrency(property.financials.monthlyRental || 0)}/mo
                           </div>
                          <div className="flex items-center gap-2 text-blue-200 text-xs">
                            <span>{property.details.bedrooms} bed</span>
                            <span>{property.details.bathrooms} bath</span>
                          </div>
                        </div>
                      </div>
              </div>
            </motion.div>
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-900"
                  onClick={() => setActiveTab('listings')}
                  suppressHydrationWarning
                >
                  View All Properties
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100 text-xs sm:text-sm font-medium">KYC Verified</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100 text-xs sm:text-sm font-medium">Secure Transactions</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100 text-xs sm:text-sm font-medium">Licensed Platform</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Basic Signup Modal */}
      <BasicSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowSigninModal(true);
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
}; 