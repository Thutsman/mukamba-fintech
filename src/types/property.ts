export type PropertyCountry = 'ZW' | 'SA';

export type PropertyType = 'house' | 'apartment' | 'townhouse' | 'land' | 'commercial';

export type ListingType = 'rent-to-buy' | 'sale' | 'installment';

export interface PropertyLocation {
  country: PropertyCountry;
  city: string;
  suburb: string;
  streetAddress: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PropertyDetails {
  size: number; // in square meters
  type: PropertyType; // property type (villa, apartment, etc.)
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  features: string[];
  amenities: string[];
}

export interface PropertyFinancials {
  price: number;
  currency: 'USD' | 'ZAR' | 'GBP';
  rentToBuyDeposit?: number;
  monthlyInstallment?: number;
  paymentDuration?: number;
  rentCreditPercentage?: number;
}

export interface PropertyMedia {
  mainImage: string;
  images: string[];
  virtualTour?: string;
  floorPlan?: string;
}

export interface PropertyListing {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  location: PropertyLocation;
  details: PropertyDetails;
  financials: PropertyFinancials;
  media: PropertyMedia;
  seller: {
    id: string;
    name: string;
    isVerified: boolean;
    contactInfo: {
      phone?: string;
      email: string;
    };
  };
  status: 'draft' | 'pending' | 'active' | 'under_offer' | 'sold' | 'rented';
  createdAt: Date;
  updatedAt: Date;
  views: number;
  savedBy: number;
  inquiries: number;
}

export interface PropertySearchFilters {
  country: PropertyCountry;
  listingType?: ListingType;
  propertyType?: PropertyType[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  location?: {
    city?: string;
    suburb?: string;
  };
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  amenities?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'date-newest' | 'date-oldest';
}

export interface PropertyStats {
  totalListings: number;
  averagePrice: number;
  popularCities: Array<{
    city: string;
    listingCount: number;
  }>;
  listingsByType: Record<PropertyType, number>;
  recentSales: number;
  activeRentToBuy: number;
}

export interface PropertyInquiry {
  id: string;
  propertyId: string;
  userId: string;
  type: 'viewing' | 'information' | 'offer';
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedProperty {
  userId: string;
  propertyId: string;
  savedAt: Date;
  notes?: string;
}

export interface PropertyAlert {
  userId: string;
  filters: PropertySearchFilters;
  frequency: 'daily' | 'weekly';
  enabled: boolean;
  lastSent?: Date;
}; 