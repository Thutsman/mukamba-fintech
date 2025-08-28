'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Eye, 
  Bed, 
  Bath, 
  Car, 
  MapPin, 
  Star, 
  Calendar,
  DollarSign,
  Building,
  Home,
  Tag,
  MessageCircle,
  Phone
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnifiedProperty } from '@/lib/property-data';
import { User } from '@/types/auth';

interface PropertyCardProps {
  property: UnifiedProperty;
  viewMode: 'grid' | 'list';
  onView: () => void;
  onSave: () => void;
  user?: User;
  onContactSeller?: (property: UnifiedProperty) => void;
  onPhoneVerification?: (property: UnifiedProperty) => void;
  onBuyerSignup?: (property: UnifiedProperty) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  viewMode,
  onView,
  onSave,
  user,
  onContactSeller,
  onPhoneVerification,
  onBuyerSignup
}) => {
  const [isSaved, setIsSaved] = React.useState(property.isSaved || false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave();
  };

  const handleContactSeller = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      // User not authenticated - show buyer signup modal
      onBuyerSignup?.(property);
    } else if (!user.is_phone_verified) {
      // User authenticated but needs phone verification
      onPhoneVerification?.(property);
    } else {
      // User authenticated and phone verified - show contact info
      onContactSeller?.(property);
    }
  };

  const getContactButtonText = () => {
    if (!user) {
      return 'Sign Up to Contact';
    } else if (!user.is_phone_verified) {
      return 'Verify Phone to Contact';
    } else {
      return 'Message Seller';
    }
  };

  const getContactButtonIcon = () => {
    if (!user) {
      return <MessageCircle className="w-4 h-4" />;
    } else if (!user.is_phone_verified) {
      return <Phone className="w-4 h-4" />;
    } else {
      return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getContactButtonVariant = () => {
    if (!user) {
      return 'outline' as const;
    } else if (!user.is_phone_verified) {
      return 'default' as const;
    } else {
      return 'default' as const;
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'house':
        return Home;
      case 'apartment':
        return Building;
      case 'townhouse':
        return Home;
      case 'land':
        return MapPin;
      default:
        return Home;
    }
  };

  const getPurchaseTypeBadge = (type: string) => {
    switch (type) {
      case 'rent-to-own':
        return { label: 'Rent-to-Own', color: 'bg-blue-100 text-blue-800' };
      case 'traditional':
        return { label: 'Traditional', color: 'bg-green-100 text-green-800' };
      case 'both':
        return { label: 'Both Options', color: 'bg-purple-100 text-purple-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const PropertyTypeIcon = getPropertyTypeIcon(property.propertyType);
  const purchaseTypeBadge = getPurchaseTypeBadge(property.purchaseType);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
        onClick={onView}
      >
        <div className="flex">
          {/* Image */}
          <div className="w-48 h-32 bg-slate-200 flex-shrink-0 relative">
            {property.imageUrl ? (
              <img 
                src={property.imageUrl} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PropertyTypeIcon className="w-8 h-8 text-slate-400" />
              </div>
            )}
            
            {/* Save button */}
            <button
              onClick={handleSave}
              className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
            >
              <Heart 
                className={`w-3 h-3 ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} 
              />
            </button>

            {/* Viewed indicator */}
            {property.isViewed && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  <Eye className="w-2 h-2 mr-1" />
                  Viewed
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-lg mb-1 line-clamp-1">
                  {property.title}
                </h3>
                <p className="text-slate-600 text-sm mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {property.address}, {property.city}
                </p>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button 
                  size="sm" 
                  variant={getContactButtonVariant()}
                  onClick={handleContactSeller}
                  className={!user ? 'border-red-600 text-red-600 hover:bg-red-50' : 
                            !user?.is_phone_verified ? 'bg-blue-600 hover:bg-blue-700' : 
                            'bg-green-600 hover:bg-green-700'}
                >
                  {getContactButtonIcon()}
                  <span className="ml-1">{getContactButtonText()}</span>
                </Button>
                
                <Button 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={onView}
                >
                  View Details
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                {property.bedrooms}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                {property.bathrooms}
              </span>
              <span className="flex items-center gap-1">
                <Car className="w-4 h-4" />
                {property.parking}
              </span>
              <span>{property.area} m²</span>
            </div>

            <p className="text-slate-500 text-sm mb-3 line-clamp-2">
              {property.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {property.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{property.rating}</span>
                    <span className="text-slate-500">({property.reviewCount})</span>
                  </div>
                )}
                
                <div className="text-lg font-bold text-slate-900">
                  R{property.price.toLocaleString()}
                </div>
                {property.originalPrice && property.originalPrice > property.price && (
                  <div className="text-sm text-slate-500 line-through">
                    R{property.originalPrice.toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge className={purchaseTypeBadge.color}>
                  {purchaseTypeBadge.label}
                </Badge>
              </div>
            </div>

            {/* Features */}
            {property.features.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {property.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {property.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{property.features.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={onView}
    >
      {/* Image */}
      <div className="relative h-48 bg-slate-200">
        {property.imageUrl ? (
          <img 
            src={property.imageUrl} 
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PropertyTypeIcon className="w-12 h-12 text-slate-400" />
          </div>
        )}
        
        {/* Save button */}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
        >
          <Heart 
            className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} 
          />
        </button>

        {/* Viewed indicator */}
        {property.isViewed && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Viewed
            </Badge>
          </div>
        )}

        {/* Purchase type badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className={purchaseTypeBadge.color}>
            {purchaseTypeBadge.label}
          </Badge>
        </div>

        {/* Price */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1">
          <div className="text-lg font-bold text-slate-900">
            R{property.price.toLocaleString()}
          </div>
          {property.originalPrice && property.originalPrice > property.price && (
            <div className="text-xs text-slate-500 line-through">
              R{property.originalPrice.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-lg mb-1 line-clamp-1">
          {property.title}
        </h3>
        <p className="text-slate-600 text-sm mb-2 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {property.address}, {property.city}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
          <span className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Car className="w-4 h-4" />
            {property.parking}
          </span>
          <span>{property.area} m²</span>
        </div>

        <p className="text-slate-500 text-sm mb-3 line-clamp-2">
          {property.description}
        </p>

        <div className="flex items-center justify-between">
          {property.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium">{property.rating}</span>
              <span className="text-slate-500">({property.reviewCount})</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={getContactButtonVariant()}
              onClick={handleContactSeller}
              className={!user ? 'border-red-600 text-red-600 hover:bg-red-50' : 
                        !user?.is_phone_verified ? 'bg-blue-600 hover:bg-blue-700' : 
                        'bg-green-600 hover:bg-green-700'}
            >
              {getContactButtonIcon()}
              <span className="ml-1">{getContactButtonText()}</span>
            </Button>
            
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700"
              onClick={onView}
            >
              View Details
            </Button>
          </div>
        </div>

        {/* Features */}
        {property.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {property.features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {property.features.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{property.features.length - 2} more
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
