'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, Eye, MoreHorizontal, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  status: 'active' | 'pending' | 'draft' | 'rejected' | 'sold';
  type: 'residential' | 'commercial' | 'mixed';
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  listedBy: string;
  listedAt: string;
}

interface RecentPropertiesFeedProps {
  properties: Property[];
  onViewProperty?: (propertyId: string) => void;
  onViewAll?: () => void;
}

export const RecentPropertiesFeed: React.FC<RecentPropertiesFeedProps> = ({ 
  properties, 
  onViewProperty,
  onViewAll 
}) => {
  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'sold':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: Property['type']) => {
    switch (type) {
      case 'residential':
        return 'bg-blue-100 text-blue-700';
      case 'commercial':
        return 'bg-purple-100 text-purple-700';
      case 'mixed':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Home className="w-5 h-5 mr-2" />
            Recent Properties
          </CardTitle>
          {onViewAll && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewAll}
              suppressHydrationWarning
            >
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors gap-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Home className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 truncate">{property.title}</p>
                  <p className="text-sm text-slate-600 flex items-center truncate">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{property.location}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                    <Badge className={`${getStatusColor(property.status)} text-xs`}>
                      {property.status}
                    </Badge>
                    <Badge className={`${getTypeColor(property.type)} text-xs`}>
                      {property.type}
                    </Badge>
                    {property.bedrooms && property.bathrooms && (
                      <span className="text-xs text-slate-500">
                        {property.bedrooms} bed, {property.bathrooms} bath
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-2">
                <div className="text-right">
                  <p className="font-medium text-slate-900">
                    ${property.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">{property.listedAt}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {onViewProperty && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProperty(property.id)}
                      className="h-8 w-8 p-0"
                      suppressHydrationWarning
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    suppressHydrationWarning
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {properties.length === 0 && (
          <div className="text-center py-8">
            <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No recent properties</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 