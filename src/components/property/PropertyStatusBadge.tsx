'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle, Home } from 'lucide-react';

interface PropertyStatusBadgeProps {
  status: 'draft' | 'pending' | 'active' | 'under_offer' | 'sold' | 'rented';
  className?: string;
}

export const PropertyStatusBadge: React.FC<PropertyStatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Available'
        };
      case 'under_offer':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Clock,
          label: 'Under Offer'
        };
      case 'sold':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Sold'
        };
      case 'rented':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Home,
          label: 'Rented'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertCircle,
          label: 'Pending'
        };
      case 'draft':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          label: 'Draft'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge 
      className={`${config.color} flex items-center gap-1 border ${className}`}
      variant="outline"
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};
