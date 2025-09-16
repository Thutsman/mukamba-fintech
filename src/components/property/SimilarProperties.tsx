'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Star,
  Eye,
  TrendingUp,
  Home
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropertyListing } from '@/types/property';
import { User } from '@/types/auth';
import { getPropertiesFromSupabase } from '@/lib/property-services-supabase';

interface SimilarPropertiesProps {
  currentProperty: PropertyListing;
  user?: User;
  onPropertySelect: (property: PropertyListing) => void;
}

export const SimilarProperties: React.FC<SimilarPropertiesProps> = ({
  currentProperty,
  user,
  onPropertySelect
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [similarProperties, setSimilarProperties] = React.useState<PropertyListing[]>([]);

  // Load similar properties from Supabase
  React.useEffect(() => {
    const loadSimilarProperties = async () => {
      setIsLoading(true);
      try {
        const allProperties = await getPropertiesFromSupabase();
        
        // Filter out the current property and find similar ones
        const filtered = allProperties.filter(property => 
          property.id !== currentProperty.id && 
          property.status === 'active'
        );
        
        // Sort by similarity (same city, then same property type, then by price proximity)
        const sorted = filtered.sort((a, b) => {
          // Same city gets priority
          const aSameCity = a.location.city === currentProperty.location.city ? 1 : 0;
          const bSameCity = b.location.city === currentProperty.location.city ? 1 : 0;
          if (aSameCity !== bSameCity) return bSameCity - aSameCity;
          
          // Same property type gets priority
          const aSameType = a.details.type === currentProperty.details.type ? 1 : 0;
          const bSameType = b.details.type === currentProperty.details.type ? 1 : 0;
          if (aSameType !== bSameType) return bSameType - aSameType;
          
          // Then by price proximity
          const aPriceDiff = Math.abs(a.financials.price - currentProperty.financials.price);
          const bPriceDiff = Math.abs(b.financials.price - currentProperty.financials.price);
          return aPriceDiff - bPriceDiff;
        });
        
        // Take the top 2 most similar properties
        setSimilarProperties(sorted.slice(0, 2));
      } catch (error) {
        console.error('Error loading similar properties:', error);
        setSimilarProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSimilarProperties();
  }, [currentProperty.id, currentProperty.location.city, currentProperty.details.type, currentProperty.financials.price]);

  // Handle View All button click
  const handleViewAll = () => {
    // Navigate to PropertyListings without any filters to show all properties
    router.push('/listings');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentProperty.financials.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const PropertyCard: React.FC<{ property: PropertyListing; index: number }> = ({ property, index }) => (
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
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.media.mainImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
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
            {property.seller.isVerified && (
              <Badge className="bg-blue-500 text-white text-xs">
                <Star className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

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
        </div>

                 {/* Property Details */}
         <CardContent className="p-4">
           <div className="space-y-3">
             {/* Title and Location */}
             <div>
               <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                 {property.title}
               </h3>
               <div className="flex items-center text-gray-600 text-sm">
                 <MapPin className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0" />
                 <span className="truncate">{property.location.streetAddress}</span>
               </div>
             </div>

                         {/* Property Stats */}
             <div className="flex items-center gap-3 text-sm text-gray-600">
               <div className="flex items-center">
                 <Bed className="w-4 h-4 mr-1 flex-shrink-0" />
                 <span className="truncate">{property.details.bedrooms || 0} bed</span>
               </div>
               <div className="flex items-center">
                 <Bath className="w-4 h-4 mr-1 flex-shrink-0" />
                 <span className="truncate">{property.details.bathrooms || 0} bath</span>
               </div>
               <div className="flex items-center">
                 <Square className="w-4 h-4 mr-1 flex-shrink-0" />
                 <span className="truncate">{property.details.size?.toLocaleString()} m²</span>
               </div>
             </div>

                         {/* Property Highlights */}
             <div className="flex flex-wrap gap-1">
               {property.details.features?.slice(0, 1).map((feature, idx) => (
                 <Badge key={idx} variant="outline" className="text-xs">
                   {feature}
                 </Badge>
               ))}
               {property.details.features && property.details.features.length > 1 && (
                 <Badge variant="outline" className="text-xs">
                   +{property.details.features.length - 1} more
                 </Badge>
               )}
             </div>

            {/* Property Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center min-w-0">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <span className="text-xs font-medium text-red-600">
                    {property.seller.name[0]}
                  </span>
                </div>
                <span className="truncate">{property.seller.name}</span>
                {property.seller.isVerified && (
                  <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex items-center flex-shrink-0">
                <Eye className="w-3 h-3 mr-1" />
                <span>{property.views}</span>
              </div>
            </div>

            {/* Action Button */}
            <Button
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Similar Properties</h3>
          <p className="text-gray-600">
            Other properties you might be interested in
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleViewAll}>
          <TrendingUp className="w-4 h-4 mr-2" />
          View All
        </Button>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="space-y-2 px-1">
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : similarProperties.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {similarProperties.map((property, index) => (
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
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Similar Properties Found
            </h3>
            <p className="text-gray-500 mb-4">
              We couldn't find similar properties in this area. Try expanding your search criteria.
            </p>
            <Button onClick={handleViewAll}>
              Browse All Properties
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
