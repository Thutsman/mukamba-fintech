'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Share2,
  Eye,
  Star,
  Calendar,
  Phone,
  MessageCircle,
  GitCompare
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  showComparisonButton?: boolean;
}

export const EnhancedPropertyCard: React.FC<EnhancedPropertyCardProps> = ({
  property,
  index,
  user,
  onPropertySelect,
  onAddToComparison,
  onContactSeller,
  onSignUpPrompt,
  showComparisonButton = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: property.financials.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group cursor-pointer"
      onClick={() => onPropertySelect(property)}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Property Image */}
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img
            src={property.media.mainImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {property.listingType === 'installment' && (
              <Badge className="bg-green-500 text-white text-xs">
                Installments
              </Badge>
            )}
            {property.seller.isVerified && (
              <Badge className="bg-blue-500 text-white text-xs">
                <Star className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {property.status === 'available' && (
              <Badge className="bg-emerald-500 text-white text-xs">
                Available
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="icon"
              variant="secondary"
              className="w-8 h-8 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                // Save functionality
              }}
            >
              <Heart className="w-4 h-4 text-slate-600" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="w-8 h-8 bg-white/90 hover:bg-white"
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
            <div className="pt-2 space-y-2">
              {/* View Details Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onPropertySelect(property);
                }}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                size="sm"
              >
                View Details
              </Button>
              
              {/* Contact Seller Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!user) {
                    onSignUpPrompt?.();
                  } else if (!user.is_phone_verified) {
                    // Show phone verification prompt
                    alert('Please verify your phone number to contact sellers.');
                  } else {
                    onContactSeller?.(property);
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                {!user ? 'Sign Up to Contact' : 
                 !user.is_phone_verified ? 'Verify Phone to Contact' : 
                 'Contact Seller'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
