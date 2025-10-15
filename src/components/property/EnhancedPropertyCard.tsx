'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Heart, 
  Share2, 
  GitCompare, 
  Eye, 
  Star, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  Building,
  TreePine,
  Car,
  Wifi,
  Snowflake,
  Dumbbell,
  TrendingUp,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { PropertyListing } from '@/types/property';
import { User } from '@/types/auth';

interface EnhancedPropertyCardProps {
  property: PropertyListing;
  index: number;
  user?: User;
  onPropertySelect: (property: PropertyListing) => void;
  onAddToComparison?: (property: PropertyListing) => void;
  onContactSeller?: (property: PropertyListing) => void;
  onSignUpPrompt?: () => void;
  isInComparison?: boolean;
  showComparisonButton?: boolean;
}

// Property status configuration
const PROPERTY_STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    icon: Clock
  },
  pending: {
    label: 'Pending',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    icon: Clock
  },
  active: {
    label: 'Available',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: CheckCircle
  },
  sold: {
    label: 'Sold',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: CheckCircle
  },
  rented: {
    label: 'Rented',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    icon: CheckCircle
  }
};

// Property type icons
const PROPERTY_TYPE_ICONS = {
  villa: Home,
  apartment: Building,
  townhouse: Building,
  house: Home,
  land: TreePine,
  commercial: Building
};

// Amenity icons
const AMENITY_ICONS = {
  parking: Car,
  wifi: Wifi,
  ac: Snowflake,
  gym: Dumbbell,
  pool: TreePine,
  garden: TreePine
};

export const EnhancedPropertyCard: React.FC<EnhancedPropertyCardProps> = ({
  property,
  index,
  user,
  onPropertySelect,
  onAddToComparison,
  onContactSeller,
  onSignUpPrompt,
  isInComparison = false,
  showComparisonButton = true
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [imageLoadErrors, setImageLoadErrors] = React.useState<Set<string>>(new Set());
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const [showQuickContact, setShowQuickContact] = React.useState(false);

  // Get all images for carousel
  const images = React.useMemo(() => {
    const allImages = [property.media.mainImage, ...(property.media.images || [])];
    return allImages.filter((img, index, arr) => arr.indexOf(img) === index); // Remove duplicates
  }, [property.media]);

  // Check if current image is a placeholder
  const currentImage = images[currentImageIndex];
  const isPlaceholder = currentImage === '/placeholder-property.jpg' || 
                       currentImage?.includes('placeholder') ||
                       !currentImage ||
                       currentImage === '';

  // Set initial loading state based on whether image is a placeholder
  React.useEffect(() => {
    if (isPlaceholder) {
      setIsImageLoading(false);
    } else {
      setIsImageLoading(true);
    }
  }, [isPlaceholder]);

  // Property status
  const statusConfig = PROPERTY_STATUS_CONFIG[property.status as keyof typeof PROPERTY_STATUS_CONFIG] || PROPERTY_STATUS_CONFIG.active;
  const StatusIcon = statusConfig.icon;

  // Property type icon
  const PropertyTypeIcon = PROPERTY_TYPE_ICONS[property.details.type as keyof typeof PROPERTY_TYPE_ICONS] || Home;



  // Financing options
  const financingOptions = React.useMemo(() => {
    const options = [];
    
    // Show payment type based on actual listing type
    if (property.listingType === 'sale') {
      options.push('Cash');
    } else if (property.listingType === 'installment') {
      options.push('Installment');
    }
    
    return options;
  }, [property.listingType]);



  // Image carousel navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle image load errors
  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors(prev => new Set(prev).add(imageUrl));
  };

  // Handle image load success
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle property selection
  const handlePropertyClick = () => {
    if (user) {
      onPropertySelect(property);
    } else {
      onSignUpPrompt?.();
    }
  };

  // Handle comparison toggle
  const handleComparisonToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onSignUpPrompt?.();
      return;
    }
    onAddToComparison?.(property);
  };

  // Handle contact seller
  const handleContactSeller = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onSignUpPrompt?.();
      return;
    }
    if (!user.is_phone_verified) {
      alert('Please verify your phone number to contact sellers.');
      return;
    }
    onContactSeller?.(property);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
      onClick={handlePropertyClick}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
        {/* Image Carousel Section */}
        <div className="relative h-64 overflow-hidden">
          {/* Loading Skeleton - only show if not a placeholder */}
          {isImageLoading && !isPlaceholder && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          )}

          {/* Property Image */}
          {isPlaceholder || imageLoadErrors.has(currentImage) ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Home className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Image unavailable</p>
              </div>
            </div>
          ) : (
            <Image
              src={currentImage}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => handleImageError(currentImage)}
              onLoad={handleImageLoad}
              priority={index < 3}
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {/* Status Badge */}
            <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>

            {/* Property Type Badge */}
            <Badge className="bg-blue-100 text-blue-700 border-0">
              <PropertyTypeIcon className="w-3 h-3 mr-1" />
              {property.details.type}
            </Badge>

            {/* Installment Badge */}
            {property.listingType === 'installment' && (
              <Badge className="bg-green-100 text-green-700 border-0">
                Installments
              </Badge>
            )}
          </div>

          {/* Top Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Comparison Button */}
            {showComparisonButton && (
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white/90 hover:bg-white"
                onClick={handleComparisonToggle}
              >
                <Heart className={`w-4 h-4 ${isInComparison ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
            )}

            {/* Share Button */}
            <Button
              size="icon"
              variant="secondary"
              className="w-8 h-8 bg-white/90 hover:bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </Button>
          </div>

          {/* Image Navigation */}
          {images.length > 1 && !isPlaceholder && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
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

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(property.financials.price)}
              </div>
              {property.financials.monthlyInstallment && (
                <div className="text-sm text-gray-600">
                  {formatCurrency(property.financials.monthlyInstallment)}/mo
                </div>
              )}
            </div>
          </div>

          {/* Seller Verification Badge */}
          {property.seller.isVerified && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-blue-500 text-white border-0">
                <Shield className="w-3 h-3 mr-1" />
                Verified Seller
              </Badge>
            </div>
          )}
        </div>

        {/* Property Details */}
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title and Location */}
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                {property.title}
              </h3>
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                <span className="line-clamp-1">{property.location.suburb}, {property.location.city}</span>
              </div>
            </div>

            {/* Property Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  {property.details.bedrooms} bed
                </div>
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  {property.details.bathrooms} bath
                </div>
                <div className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  {property.details.size?.toLocaleString()} m²
                </div>
              </div>
            </div>

            {/* Property Highlights */}
            <div className="flex flex-wrap gap-1">
              {property.details.features?.slice(0, 3).map((feature, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {property.details.features && property.details.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{property.details.features.length - 3} more
                </Badge>
              )}
            </div>



            {/* Financing Options */}
            <div className="flex flex-wrap gap-1">
              {financingOptions.map((option, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {option}
                </Badge>
              ))}
            </div>

            {/* Installment Preview */}
            {property.listingType === 'installment' && property.financials.monthlyInstallment && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-green-800">Installment Preview</div>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-lg font-bold text-green-900">
                  {formatCurrency(property.financials.monthlyInstallment)}/month
                </div>
                <div className="text-xs text-green-600">
                  Flexible payment plan • Contact seller for terms
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="flex-1 bg-[#7F1518] hover:bg-[#6a1215] text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  if (user) {
                    onPropertySelect(property);
                  } else {
                    onSignUpPrompt?.();
                  }
                }}
              >
                {user ? 'View Details' : 'Sign Up to View Details'}
              </Button>

              {/* Quick Contact Button */}
              {user && user.is_phone_verified && (
                <Button
                  size="sm"
                  variant="outline"
                  className="px-3"
                  onClick={handleContactSeller}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Seller Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center">
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
              
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                <span>{property.views || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

