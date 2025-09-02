import { PropertyListing as Property, PropertySearchFilters, PropertyStats, PropertyCountry } from '@/types/property';

// Mock property data for Zimbabwe
const zwProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Family Home in Borrowdale',
    description: 'Spacious 4-bedroom home in upscale Borrowdale. Features include a swimming pool, staff quarters, and borehole.',
    propertyType: 'house',
    listingType: 'rent-to-buy',
    location: {
      country: 'ZW',
      city: 'Harare',
      suburb: 'Borrowdale',
      streetAddress: '123 Borrowdale Road',
    },
    details: {
      size: 2000,
      type: 'house',
      bedrooms: 4,
      bathrooms: 3,
      parking: 2,
      features: ['Swimming Pool', 'Borehole', 'Staff Quarters', 'Electric Fence'],
      amenities: ['Solar Power', 'Generator', 'Garden', 'Security System']
    },
    financials: {
      price: 350000,
      currency: 'USD',
      rentToBuyDeposit: 35000,
      monthlyRental: 1500,
      rentCreditPercentage: 30
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller1',
      name: 'John Moyo',
      isVerified: true,
      contactInfo: {
        email: 'john.moyo@email.com'
      }
    },
    status: 'available',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    views: 245,
    savedBy: 18,
    inquiries: 12
  },
  {
    id: '2',
    title: 'Luxury Apartment in Mount Pleasant',
    description: 'Modern 3-bedroom apartment with stunning city views. Located in the prestigious Mount Pleasant area.',
    propertyType: 'apartment',
    listingType: 'rent-to-buy',
    location: {
      country: 'ZW',
      city: 'Harare',
      suburb: 'Mount Pleasant',
      streetAddress: '456 Mount Pleasant Drive',
    },
    details: {
      size: 180,
      type: 'apartment',
      bedrooms: 3,
      bathrooms: 2,
      parking: 1,
      features: ['City Views', 'Modern Kitchen', 'Built-in Wardrobes', 'Balcony'],
      amenities: ['24/7 Security', 'Gym', 'Pool', 'Parking', 'Concierge']
    },
    financials: {
      price: 280000,
      currency: 'USD',
      rentToBuyDeposit: 28000,
      monthlyRental: 1200,
      rentCreditPercentage: 25
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller2',
      name: 'Maria Chikomba',
      isVerified: true,
      contactInfo: {
        email: 'maria.chikomba@email.com'
      }
    },
    status: 'available',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    views: 189,
    savedBy: 12,
    inquiries: 8
  },
  {
    id: '3',
    title: 'Townhouse in Highlands',
    description: 'Beautiful 3-bedroom townhouse with garden and garage. Perfect for families.',
    propertyType: 'townhouse',
    listingType: 'rent-to-buy',
    location: {
      country: 'ZW',
      city: 'Harare',
      suburb: 'Highlands',
      streetAddress: '789 Highlands Avenue',
    },
    details: {
      size: 250,
      type: 'townhouse',
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      features: ['Garden', 'Garage', 'Modern Kitchen', 'Built-in Wardrobes'],
      amenities: ['Security System', 'Garden', 'Parking', 'Storage']
    },
    financials: {
      price: 220000,
      currency: 'USD',
      rentToBuyDeposit: 22000,
      monthlyRental: 1000,
      rentCreditPercentage: 20
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller3',
      name: 'David Ndlovu',
      isVerified: false,
      contactInfo: {
        email: 'david.ndlovu@email.com'
      }
    },
    status: 'available',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    views: 156,
    savedBy: 9,
    inquiries: 5
  },
  {
    id: '4',
    title: 'Commercial Space in CBD',
    description: 'Prime commercial space in the heart of Harare CBD. Perfect for retail or office use.',
    propertyType: 'commercial',
    listingType: 'sale',
    location: {
      country: 'ZW',
      city: 'Harare',
      suburb: 'CBD',
      streetAddress: '321 Samora Machel Avenue',
    },
    details: {
      size: 500,
      type: 'commercial',
      bedrooms: 0,
      bathrooms: 2,
      parking: 5,
      features: ['High Traffic Location', 'Modern Facilities', 'Security System', 'Parking'],
      amenities: ['24/7 Security', 'Parking', 'Loading Bay', 'Storage']
    },
    financials: {
      price: 800000,
      currency: 'USD',
      monthlyRental: 8000
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller4',
      name: 'Commercial Properties Ltd',
      isVerified: true,
      contactInfo: {
        email: 'info@commercialproperties.co.zw'
      }
    },
    status: 'available',
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-01-30'),
    views: 89,
    savedBy: 6,
    inquiries: 3
  },
  {
    id: '5',
    title: 'Land for Development in Chisipite',
    description: 'Prime residential land in Chisipite. Ready for development with all utilities available.',
    propertyType: 'land',
    listingType: 'sale',
    location: {
      country: 'ZW',
      city: 'Harare',
      suburb: 'Chisipite',
      streetAddress: '654 Chisipite Road',
    },
    details: {
      size: 2000,
      type: 'land',
      bedrooms: 0,
      bathrooms: 0,
      parking: 0,
      features: ['Flat Terrain', 'All Utilities Available', 'Road Access', 'Security'],
      amenities: ['Water', 'Electricity', 'Road Access', 'Security']
    },
    financials: {
      price: 150000,
      currency: 'USD'
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller5',
      name: 'Land Development Co',
      isVerified: true,
      contactInfo: {
        email: 'sales@landdev.co.zw'
      }
    },
    status: 'available',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    views: 67,
    savedBy: 4,
    inquiries: 2
  },
  {
    id: '6',
    title: 'New Villa in Glen Lorne',
    description: 'Brand new 5-bedroom villa with modern amenities and stunning views.',
    propertyType: 'house',
    listingType: 'rent-to-buy',
    location: {
      country: 'ZW',
      city: 'Harare',
      suburb: 'Glen Lorne',
      streetAddress: '987 Glen Lorne Drive',
    },
    details: {
      size: 350,
      type: 'house',
      bedrooms: 5,
      bathrooms: 4,
      parking: 3,
      features: ['New Construction', 'Modern Design', 'Swimming Pool', 'Garden'],
      amenities: ['Solar Power', 'Generator', 'Garden', 'Security System', 'Staff Quarters']
    },
    financials: {
      price: 450000,
      currency: 'USD',
      rentToBuyDeposit: 45000,
      monthlyRental: 2000,
      rentCreditPercentage: 35
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller6',
      name: 'Premium Properties',
      isVerified: true,
      contactInfo: {
        email: 'info@premiumproperties.co.zw'
      }
    },
    status: 'new',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
    views: 123,
    savedBy: 15,
    inquiries: 10
  }
];

// Mock property data for South Africa
const saProperties: Property[] = [
  {
    id: 'sa1',
    title: 'Modern Apartment in Sandton',
    description: 'Luxury 2-bedroom apartment in the heart of Sandton. Walking distance to shopping and business district.',
    propertyType: 'apartment',
    listingType: 'rent-to-buy',
    location: {
      country: 'SA',
      city: 'Johannesburg',
      suburb: 'Sandton',
      streetAddress: '123 Sandton Drive',
    },
    details: {
      size: 120,
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      features: ['City Views', 'Modern Kitchen', 'Built-in Wardrobes', 'Balcony'],
      amenities: ['24/7 Security', 'Gym', 'Pool', 'Parking', 'Concierge']
    },
    financials: {
      price: 1800000,
      currency: 'ZAR',
      rentToBuyDeposit: 180000,
      monthlyRental: 15000,
      rentCreditPercentage: 25
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'sa-seller1',
      name: 'Sandton Properties',
      isVerified: true,
      contactInfo: {
        email: 'info@sandtonproperties.co.za'
      }
    },
    status: 'available',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    views: 189,
    savedBy: 12,
    inquiries: 8
  }
];

// Combine all properties
const allProperties = [...zwProperties, ...saProperties];

// Property statistics
const getPropertyStats = (country: PropertyCountry): PropertyStats => {
  const countryProperties = country === 'ZW' ? zwProperties : saProperties;
  
  return {
    totalListings: countryProperties.length,
    averagePrice: Math.round(countryProperties.reduce((sum, p) => sum + p.financials.price, 0) / countryProperties.length),
    popularCities: [
      { city: 'Harare', listingCount: 5 },
      { city: 'Johannesburg', listingCount: 1 }
    ],
    listingsByType: {
      house: countryProperties.filter(p => p.propertyType === 'house').length,
      apartment: countryProperties.filter(p => p.propertyType === 'apartment').length,
      townhouse: countryProperties.filter(p => p.propertyType === 'townhouse').length,
      land: countryProperties.filter(p => p.propertyType === 'land').length,
      commercial: countryProperties.filter(p => p.propertyType === 'commercial').length
    },
    recentSales: 2,
    activeRentToBuy: countryProperties.filter(p => p.listingType === 'rent-to-buy').length
  };
};

// Get popular cities
const getPopularCities = (country: PropertyCountry) => {
  return [
    { city: 'Harare', listingCount: 5 },
    { city: 'Johannesburg', listingCount: 1 }
  ];
};

// Get featured properties
const getFeaturedProperties = (country: PropertyCountry): Property[] => {
  const countryProperties = country === 'ZW' ? zwProperties : saProperties;
  return countryProperties.filter(p => p.status === 'available' || p.status === 'new').slice(0, 6);
};

// Search properties
const searchProperties = (filters: PropertySearchFilters): Property[] => {
  let results = allProperties.filter(property => {
    // Country filter
    if (property.location.country !== filters.country) return false;
    
    // Listing type filter
    if (filters.listingType && property.listingType !== filters.listingType) return false;
    
    // Property type filter
    if (filters.propertyType && !filters.propertyType.includes(property.propertyType)) return false;
    
    // Price range filter
    if (filters.priceRange) {
      if (property.financials.price < filters.priceRange.min || property.financials.price > filters.priceRange.max) return false;
    }
    
    // Location filter
    if (filters.location?.city && property.location.city.toLowerCase() !== filters.location.city.toLowerCase()) return false;
    if (filters.location?.suburb && property.location.suburb.toLowerCase() !== filters.location.suburb.toLowerCase()) return false;
    
    // Bedrooms filter
    if (filters.bedrooms && property.details.bedrooms && property.details.bedrooms < filters.bedrooms) return false;
    
    // Bathrooms filter
    if (filters.bathrooms && property.details.bathrooms && property.details.bathrooms < filters.bathrooms) return false;
    
    return true;
  });
  
  // Sort results
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-asc':
        results.sort((a, b) => a.financials.price - b.financials.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.financials.price - a.financials.price);
        break;
      case 'date-newest':
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'date-oldest':
        results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }
  }
  
  return results;
};

// Get property by ID
const getPropertyById = (id: string): Property | undefined => {
  return allProperties.find(property => property.id === id);
};

export {
  getPropertyStats,
  getPopularCities,
  getFeaturedProperties,
  searchProperties,
  getPropertyById,
  allProperties
};
