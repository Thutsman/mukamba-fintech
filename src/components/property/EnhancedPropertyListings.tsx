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
  CheckCircle,
  Shield,
  Users,
  Clock,
  TrendingUp,
  Calculator,
  Phone,
  Mail,
  ArrowRight,
  AlertCircle,
  Lock,
  Zap,
  Award,
  Target
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyListing, PropertySearchFilters, PropertyType } from '@/types/property';
import { User, getUserLevel, getUserPermissions } from '@/types/auth';
import { searchProperties as searchPropertiesService, getFeaturedProperties as getFeaturedPropertiesService } from '@/lib/property-services';

import { useAuthStore } from '@/lib/store';
import { convertToPropertyListing, getAllProperties, getPropertiesByCountry, searchProperties as searchUnifiedProperties, getFeaturedProperties as getFeaturedUnifiedProperties } from '@/lib/property-data';

// Enhanced types for verification-based features
interface VerificationLevel {
  level: 0 | 1 | 2 | 3;
  label: string;
  description: string;
  color: string;
  benefits: string[];
}

interface UserEngagement {
  propertyId: string;
  viewedAt: Date;
  savedAt?: Date;
  inquiredAt?: Date;
  viewedCount: number;
}

interface PropertyInsights {
  verifiedBuyersViewing: number;
  averageTimeOnMarket: number;
  priceHistory: Array<{ date: Date; price: number }>;
  similarProperties: PropertyListing[];
  marketTrends: {
    priceChange: number;
    demandChange: number;
    supplyChange: number;
  };
}

interface EnhancedPropertyListing extends PropertyListing {
  insights?: PropertyInsights;
  userEngagement?: UserEngagement;
}

interface EnhancedPropertyListingsProps {
  initialFilters?: PropertySearchFilters;
  onPropertySelect?: (property: PropertyListing) => void;
  showFeatured?: boolean;
  user?: User;
  onSignUpPrompt?: () => void;
  onVerificationPrompt?: () => void;
}

// Verification levels configuration
const VERIFICATION_LEVELS: Record<number, VerificationLevel> = {
  0: {
    level: 0,
    label: 'Unverified',
    description: 'Basic property viewing only',
    color: 'bg-gray-100 text-gray-600',
    benefits: ['View property listings', 'Basic search and filter']
  },
  1: {
    level: 1,
    label: 'Identity Verified',
    description: 'Enhanced access with ID verification',
    color: 'bg-blue-100 text-blue-700',
    benefits: ['Enhanced photos access', 'Contact property owners', 'Schedule viewings']
  },
  2: {
    level: 2,
    label: 'Financially Qualified',
    description: 'Pre-approved for rent-to-buy financing',
    color: 'bg-green-100 text-green-700',
    benefits: ['Personalized affordability calculator', 'Pre-approval status', 'Priority applications']
  },
  3: {
    level: 3,
    label: 'Fully Verified',
    description: 'Complete verification with priority access',
    color: 'bg-emerald-100 text-emerald-700',
    benefits: ['Priority actions', 'Fast-track applications', 'Exclusive insights', 'One-click applications']
  }
};

// Default filter values
const defaultFilters: PropertySearchFilters = {
  country: 'ZW',
  sortBy: 'date-newest'
};

export const EnhancedPropertyListings: React.FC<EnhancedPropertyListingsProps> = ({
  initialFilters,
  onPropertySelect,
  showFeatured = true,
  user,
  onSignUpPrompt,
  onVerificationPrompt
}) => {
  const [filters, setFilters] = React.useState<PropertySearchFilters>(
    initialFilters ? { ...defaultFilters, ...initialFilters } : defaultFilters
  );
  const [properties, setProperties] = React.useState<EnhancedPropertyListing[]>([]);
  const [featuredProperties, setFeaturedProperties] = React.useState<EnhancedPropertyListing[]>([]);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [savedProperties, setSavedProperties] = React.useState<Set<string>>(new Set());
  const [selectedProperty, setSelectedProperty] = React.useState<EnhancedPropertyListing | null>(null);
  const [showPropertyDetails, setShowPropertyDetails] = React.useState(false);

  const { user: authUser } = useAuthStore();
  const currentUser = user || authUser;

  // Get user verification level and permissions
  const userLevel = currentUser ? getUserLevel(currentUser) : 'guest';
  const userPermissions = currentUser ? getUserPermissions(currentUser) : {
    canBrowseProperties: true,
    canSaveProperties: false,
    canContactSellers: false,
    canScheduleViewings: false,
    canApplyForFinancing: false,
    canListProperties: false,
    canReceiveApplications: false,
    canProcessTransactions: false,
    canAccessAdminPanel: false,
    canManageUsers: false,
    canManageProperties: false,
    canViewAnalytics: false,
    canManageSystemSettings: false
  };

  // Determine verification level
  const getVerificationLevel = (): number => {
    if (!currentUser) return 0;
    if (currentUser.isFinanciallyVerified && currentUser.isIdentityVerified) return 3;
    if (currentUser.isFinanciallyVerified) return 2;
    if (currentUser.isIdentityVerified) return 1;
    return 0;
  };

  const verificationLevel = getVerificationLevel();
  const verificationConfig = VERIFICATION_LEVELS[verificationLevel];

  // Load properties
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      // Use centralized property data and convert to PropertyListing format
      const unifiedResults = searchUnifiedProperties(filters.location?.city || '');
      const results = unifiedResults.map(convertToPropertyListing);
      // Enhance properties with mock insights for verified users
      const enhancedResults = results.map((property: PropertyListing) => ({
        ...property,
        insights: verificationLevel >= 1 ? {
          verifiedBuyersViewing: Math.floor(Math.random() * 5) + 1,
          averageTimeOnMarket: Math.floor(Math.random() * 30) + 7,
          priceHistory: [],
          similarProperties: [],
          marketTrends: {
            priceChange: Math.random() * 10 - 5,
            demandChange: Math.random() * 20 - 10,
            supplyChange: Math.random() * 15 - 7
          }
        } : undefined,
        userEngagement: currentUser ? {
          propertyId: property.id,
          viewedAt: new Date(),
          viewedCount: Math.floor(Math.random() * 10) + 1
        } : undefined
      }));
      setProperties(enhancedResults);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, verificationLevel, currentUser]);

  // Load featured properties
  React.useEffect(() => {
    if (showFeatured) {
      const unifiedFeatured = getFeaturedUnifiedProperties(6);
      const featured = unifiedFeatured.map(convertToPropertyListing);
      const enhancedFeatured = featured.map((property: PropertyListing) => ({
        ...property,
        insights: verificationLevel >= 1 ? {
          verifiedBuyersViewing: Math.floor(Math.random() * 3) + 1,
          averageTimeOnMarket: Math.floor(Math.random() * 20) + 5,
          priceHistory: [],
          similarProperties: [],
          marketTrends: {
            priceChange: Math.random() * 8 - 4,
            demandChange: Math.random() * 15 - 7,
            supplyChange: Math.random() * 10 - 5
          }
        } : undefined
      }));
      setFeaturedProperties(enhancedFeatured);
    }
  }, [showFeatured, filters.country, verificationLevel]);

  const updateFilter = (key: keyof PropertySearchFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const toggleSaveProperty = (propertyId: string) => {
    if (!currentUser) {
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePropertyClick = (property: EnhancedPropertyListing) => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
    onPropertySelect?.(property);
  };

  const handleScheduleViewing = (property: EnhancedPropertyListing) => {
    if (!currentUser) {
      onSignUpPrompt?.();
      return;
    }
    
    if (verificationLevel < 1) {
      onVerificationPrompt?.();
      return;
    }
    
    console.log('Scheduling viewing for property:', property.id);
  };

  const handleMakeOffer = (property: EnhancedPropertyListing) => {
    if (!currentUser) {
      onSignUpPrompt?.();
      return;
    }
    
    if (verificationLevel < 2) {
      onVerificationPrompt?.();
      return;
    }
    
    console.log('Making offer for property:', property.id);
  };

  const handleQuickApply = (property: EnhancedPropertyListing) => {
    if (!currentUser) {
      onSignUpPrompt?.();
      return;
    }
    
    if (verificationLevel < 3) {
      onVerificationPrompt?.();
      return;
    }
    
    console.log('Quick applying for property:', property.id);
  };

  // Verification Status Banner Component
  const VerificationStatusBanner: React.FC = () => (
    <div className={`${verificationConfig.color} border rounded-lg p-4 mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {verificationLevel >= 1 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
            <div>
              <h3 className="font-semibold">{verificationConfig.label}</h3>
              <p className="text-sm opacity-80">{verificationConfig.description}</p>
            </div>
          </div>
        </div>
        
        {verificationLevel < 3 && (
          <Button 
            onClick={onVerificationPrompt}
            variant="outline"
            size="sm"
            className="border-current text-current hover:bg-white/20"
          >
            Upgrade
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
      
      {verificationLevel >= 1 && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <div className="flex flex-wrap gap-2">
            {verificationConfig.benefits.map((benefit, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Enhanced Property Card Component
  const EnhancedPropertyCard: React.FC<{ property: EnhancedPropertyListing; index: number }> = ({ property, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
        <div className="relative">
          <img 
            src={property.media.mainImage} 
            alt={property.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Verification badges */}
          {verificationLevel >= 1 && (
            <div className="absolute top-3 left-3">
              <Badge className={verificationConfig.color}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {verificationConfig.label}
              </Badge>
            </div>
          )}
          
          {verificationLevel >= 2 && property.insights && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-500 text-white">
                <Users className="w-3 h-3 mr-1" />
                {property.insights.verifiedBuyersViewing} viewing
              </Badge>
            </div>
          )}
          
          <div className="absolute bottom-3 right-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveProperty(property.id);
              }}
              className={`bg-white/90 ${savedProperties.has(property.id) ? 'text-red-600 border-red-200' : ''}`}
            >
              <Heart className={`w-4 h-4 ${savedProperties.has(property.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-green-600 transition-colors">
                {property.title}
              </h3>
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {property.location.suburb}, {property.location.city}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  {property.details.bedrooms || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  {property.details.bathrooms || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <Square className="w-4 h-4" />
                  {property.details.size}m²
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">
                  {formatCurrency(property.financials.price)}
                </div>
                {property.financials.monthlyInstallment && (
                  <div className="text-xs text-slate-600">
                    {formatCurrency(property.financials.monthlyInstallment)}/month
                  </div>
                )}
              </div>
            </div>
            
            {/* Verification-based CTAs */}
            {verificationLevel >= 1 && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScheduleViewing(property);
                    }}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  {verificationLevel >= 2 && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMakeOffer(property);
                      }}
                    >
                      <Target className="w-3 h-3 mr-1" />
                      Offer
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Verification Status Banner */}
      <VerificationStatusBanner />
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search properties..."
              className="pl-10 w-64"
              onChange={(e) => updateFilter('location', { city: e.target.value })}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Property Type</Label>
                    <Select
                      value={filters.propertyType?.[0] || ''}
                      onValueChange={(value) => updateFilter('propertyType', [value as PropertyType])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Price Range</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        onChange={(e) => updateFilter('priceRange', { 
                          min: Number(e.target.value),
                          max: filters.priceRange?.max || 1000000
                        })}
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        onChange={(e) => updateFilter('priceRange', { 
                          min: filters.priceRange?.min || 0,
                          max: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Bedrooms</Label>
                    <Select
                      value={filters.bedrooms?.toString() || ''}
                      onValueChange={(value) => updateFilter('bedrooms', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Properties */}
      {showFeatured && featuredProperties.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Featured Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property, index) => (
              <EnhancedPropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* All Properties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Properties</h2>
          <span className="text-sm text-slate-600">{properties.length} properties found</span>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-slate-200 rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <div key={property.id} onClick={() => handlePropertyClick(property)}>
                <EnhancedPropertyCard property={property} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 