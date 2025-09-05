import { PropertyListing } from '@/types/property';

// Unified property interface that works for both components
export interface UnifiedProperty {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  originalPrice?: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number;
  propertyType: 'house' | 'apartment' | 'townhouse' | 'land' | 'commercial';
  purchaseType: 'rent-to-own' | 'traditional' | 'both';
  imageUrl?: string;
  isSaved?: boolean;
  isViewed?: boolean;
  rating?: number;
  reviewCount?: number;
  availableFrom?: string;
  description: string;
  features: string[];
  // Additional fields for enhanced features
  country?: 'ZW' | 'SA';
  currency?: 'USD' | 'ZAR' | 'GBP';
  monthlyInstallment?: number;
  paymentDuration?: number;
  rentCreditPercentage?: number;
  seller?: {
    name: string;
    isVerified: boolean;
  };
  views?: number;
  savedBy?: number;
  inquiries?: number;
}

// Centralized mock data that both components can use
export const unifiedPropertyData: UnifiedProperty[] = [
  {
    id: 'p1',
    title: 'Modern 3BR House',
    address: '123 Oak Street',
    city: 'Sandton',
    country: 'SA',
    price: 1800000,
    originalPrice: 1950000,
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    area: 180,
    propertyType: 'house',
    purchaseType: 'rent-to-own',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    isSaved: false,
    isViewed: true,
    rating: 4.8,
    reviewCount: 12,
    availableFrom: '2024-03-01',
    description: 'Beautiful modern house with open plan living, perfect for families.',
    features: ['Garden', 'Security', 'Pool', 'Garage'],
    currency: 'ZAR',
    monthlyInstallment: 8500,
    paymentDuration: 120,
    rentCreditPercentage: 25,
    seller: {
      name: 'John Smith',
      isVerified: true
    },
    views: 245,
    savedBy: 18,
    inquiries: 12
  },
  {
    id: 'p2',
    title: 'Luxury 2BR Apartment',
    address: '456 Pine Avenue',
    city: 'Rosebank',
    country: 'SA',
    price: 1250000,
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    area: 95,
    propertyType: 'apartment',
    purchaseType: 'traditional',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    isSaved: true,
    isViewed: false,
    rating: 4.6,
    reviewCount: 8,
    availableFrom: '2024-02-15',
    description: 'High-end apartment with city views and modern amenities.',
    features: ['Balcony', 'Gym', 'Security', 'Parking'],
    currency: 'ZAR',
    seller: {
      name: 'Maria Johnson',
      isVerified: true
    },
    views: 189,
    savedBy: 23,
    inquiries: 8
  },
  {
    id: 'p3',
    title: 'Family 4BR House',
    address: '789 Maple Drive',
    city: 'Bryanston',
    country: 'SA',
    price: 2650000,
    bedrooms: 4,
    bathrooms: 3,
    parking: 3,
    area: 240,
    propertyType: 'house',
    purchaseType: 'both',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
    isSaved: false,
    isViewed: true,
    rating: 4.9,
    reviewCount: 15,
    availableFrom: '2024-04-01',
    description: 'Spacious family home with large garden and entertainment area.',
    features: ['Garden', 'Pool', 'Security', 'Garage', 'Study'],
    currency: 'ZAR',
    monthlyInstallment: 12000,
    paymentDuration: 180,
    rentCreditPercentage: 30,
    seller: {
      name: 'David Wilson',
      isVerified: true
    },
    views: 312,
    savedBy: 45,
    inquiries: 18
  },
  {
    id: 'p4',
    title: 'Cozy 1BR Apartment',
    address: '321 Elm Street',
    city: 'Melville',
    country: 'SA',
    price: 850000,
    bedrooms: 1,
    bathrooms: 1,
    parking: 0,
    area: 65,
    propertyType: 'apartment',
    purchaseType: 'rent-to-own',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    isSaved: false,
    isViewed: false,
    rating: 4.4,
    reviewCount: 6,
    availableFrom: '2024-02-01',
    description: 'Perfect starter home in a vibrant neighborhood.',
    features: ['Balcony', 'Security', 'Near Transport'],
    currency: 'ZAR',
    monthlyInstallment: 4500,
    paymentDuration: 96,
    rentCreditPercentage: 20,
    seller: {
      name: 'Sarah Brown',
      isVerified: false
    },
    views: 156,
    savedBy: 12,
    inquiries: 5
  },
  {
    id: 'p5',
    title: 'Executive 3BR Townhouse',
    address: '567 Cedar Lane',
    city: 'Sandton',
    country: 'SA',
    price: 2200000,
    bedrooms: 3,
    bathrooms: 2.5,
    parking: 2,
    area: 200,
    propertyType: 'townhouse',
    purchaseType: 'traditional',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    isSaved: false,
    isViewed: false,
    rating: 4.7,
    reviewCount: 9,
    availableFrom: '2024-03-15',
    description: 'Elegant townhouse with modern finishes and private garden.',
    features: ['Garden', 'Security', 'Garage', 'Study', 'Patio'],
    currency: 'ZAR',
    seller: {
      name: 'Michael Davis',
      isVerified: true
    },
    views: 203,
    savedBy: 31,
    inquiries: 14
  },
  {
    id: 'p6',
    title: 'Investment Land Plot',
    address: '890 Birch Road',
    city: 'Midrand',
    country: 'SA',
    price: 950000,
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    area: 500,
    propertyType: 'land',
    purchaseType: 'traditional',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    isSaved: true,
    isViewed: true,
    rating: 4.5,
    reviewCount: 3,
    availableFrom: '2024-01-01',
    description: 'Prime development land with excellent growth potential.',
    features: ['Zoned Residential', 'Water Access', 'Road Access', 'Flat Terrain'],
    currency: 'ZAR',
    seller: {
      name: 'Land Development Co.',
      isVerified: true
    },
    views: 89,
    savedBy: 7,
    inquiries: 3
  },
  // Zimbabwe Properties
  {
    id: 'zw1',
    title: 'Modern Family Home in Borrowdale',
    address: '123 Borrowdale Road',
    city: 'Harare',
    country: 'ZW',
    price: 350000,
    originalPrice: 380000,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    area: 2000,
    propertyType: 'house',
    purchaseType: 'rent-to-own',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    isSaved: false,
    isViewed: true,
    rating: 4.8,
    reviewCount: 12,
    availableFrom: '2024-03-01',
    description: 'Spacious 4-bedroom home in upscale Borrowdale. Features include a swimming pool, staff quarters, and borehole.',
    features: ['Swimming Pool', 'Borehole', 'Staff Quarters', 'Electric Fence'],
    currency: 'USD',
    monthlyInstallment: 1500,
    paymentDuration: 240,
    rentCreditPercentage: 30,
    seller: {
      name: 'John Moyo',
      isVerified: true
    },
    views: 245,
    savedBy: 18,
    inquiries: 12
  },
  {
    id: 'zw2',
    title: 'Luxury Apartment in Mount Pleasant',
    address: '456 Mount Pleasant Drive',
    city: 'Harare',
    country: 'ZW',
    price: 280000,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    area: 180,
    propertyType: 'apartment',
    purchaseType: 'rent-to-own',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    isSaved: true,
    isViewed: false,
    rating: 4.6,
    reviewCount: 8,
    availableFrom: '2024-02-15',
    description: 'Modern 3-bedroom apartment with stunning city views. Located in the prestigious Mount Pleasant area.',
    features: ['City Views', 'Modern Kitchen', 'Built-in Wardrobes', 'Balcony'],
    currency: 'USD',
    monthlyInstallment: 1200,
    paymentDuration: 180,
    rentCreditPercentage: 25,
    seller: {
      name: 'Maria Chikomba',
      isVerified: true
    },
    views: 189,
    savedBy: 23,
    inquiries: 8
  }
];

// Utility functions for data transformation
export function convertToPropertyListing(unifiedProperty: UnifiedProperty): PropertyListing {
  return {
    id: unifiedProperty.id,
    title: unifiedProperty.title,
    description: unifiedProperty.description,
    propertyType: unifiedProperty.propertyType,
    listingType: unifiedProperty.purchaseType === 'rent-to-own' ? 'rent-to-buy' : 'sale',
    location: {
      country: unifiedProperty.country || 'SA',
      city: unifiedProperty.city,
      suburb: unifiedProperty.city, // Using city as suburb for now
      streetAddress: unifiedProperty.address,
    },
    details: {
      size: unifiedProperty.area,
      type: unifiedProperty.propertyType as any,
      bedrooms: unifiedProperty.bedrooms,
      bathrooms: unifiedProperty.bathrooms,
      parking: unifiedProperty.parking,
      features: unifiedProperty.features,
      amenities: unifiedProperty.features // Using features as amenities for now
    },
    financials: {
      price: unifiedProperty.price,
      currency: unifiedProperty.currency || 'ZAR',
      rentToBuyDeposit: unifiedProperty.monthlyInstallment ? unifiedProperty.monthlyInstallment * 12 : undefined,
      monthlyInstallment: unifiedProperty.monthlyInstallment,
      paymentDuration: unifiedProperty.paymentDuration,
      rentCreditPercentage: unifiedProperty.rentCreditPercentage
    },
    media: {
      mainImage: unifiedProperty.imageUrl || '',
      images: unifiedProperty.imageUrl ? [unifiedProperty.imageUrl] : []
    },
    seller: {
      id: `seller-${unifiedProperty.id}`,
      name: unifiedProperty.seller?.name || 'Unknown Seller',
      isVerified: unifiedProperty.seller?.isVerified || false,
      contactInfo: {
        email: `seller-${unifiedProperty.id}@example.com`
      }
    },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    views: unifiedProperty.views || 0,
    savedBy: unifiedProperty.savedBy || 0,
    inquiries: unifiedProperty.inquiries || 0
  };
}

export function convertFromPropertyListing(propertyListing: PropertyListing): UnifiedProperty {
  return {
    id: propertyListing.id,
    title: propertyListing.title,
    address: propertyListing.location.streetAddress,
    city: propertyListing.location.city,
    country: propertyListing.location.country,
    price: propertyListing.financials.price,
    bedrooms: propertyListing.details.bedrooms || 0,
    bathrooms: propertyListing.details.bathrooms || 0,
    parking: propertyListing.details.parking || 0,
    area: propertyListing.details.size,
    propertyType: propertyListing.propertyType,
    purchaseType: propertyListing.listingType === 'rent-to-buy' ? 'rent-to-own' : 'traditional',
    imageUrl: propertyListing.media.mainImage,
    description: propertyListing.description,
    features: propertyListing.details.features,
    currency: propertyListing.financials.currency,
    monthlyInstallment: propertyListing.financials.monthlyInstallment,
    paymentDuration: propertyListing.financials.paymentDuration,
    rentCreditPercentage: propertyListing.financials.rentCreditPercentage,
    seller: {
      name: propertyListing.seller.name,
      isVerified: propertyListing.seller.isVerified
    },
    views: propertyListing.views,
    savedBy: propertyListing.savedBy,
    inquiries: propertyListing.inquiries
  };
}

// Service functions for property data
export function getAllProperties(): UnifiedProperty[] {
  return unifiedPropertyData;
}

export function getPropertiesByCountry(country: 'ZW' | 'SA'): UnifiedProperty[] {
  return unifiedPropertyData.filter(property => property.country === country);
}

export function getPropertiesByType(propertyType: string): UnifiedProperty[] {
  return unifiedPropertyData.filter(property => property.propertyType === propertyType);
}

export function getPropertiesByPriceRange(minPrice: number, maxPrice: number): UnifiedProperty[] {
  return unifiedPropertyData.filter(property => 
    property.price >= minPrice && property.price <= maxPrice
  );
}

export function searchProperties(query: string): UnifiedProperty[] {
  const lowercaseQuery = query.toLowerCase();
  return unifiedPropertyData.filter(property =>
    property.title.toLowerCase().includes(lowercaseQuery) ||
    property.address.toLowerCase().includes(lowercaseQuery) ||
    property.city.toLowerCase().includes(lowercaseQuery) ||
    property.description.toLowerCase().includes(lowercaseQuery)
  );
}

export function getFeaturedProperties(count: number = 6): UnifiedProperty[] {
  return unifiedPropertyData
    .filter(property => property.rating && property.rating >= 4.5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, count);
}

export function getRecentlyViewedProperties(userId?: string): UnifiedProperty[] {
  // Mock implementation - in real app, this would fetch from user's viewing history
  return unifiedPropertyData
    .filter(property => property.isViewed)
    .slice(0, 6);
}

export function getSavedProperties(userId?: string): UnifiedProperty[] {
  // Mock implementation - in real app, this would fetch from user's saved properties
  return unifiedPropertyData
    .filter(property => property.isSaved)
    .slice(0, 10);
}
