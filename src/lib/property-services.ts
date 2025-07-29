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
    status: 'active',
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
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    views: 189,
    savedBy: 12,
    inquiries: 9
  },
  {
    id: '3',
    title: 'Charming Cottage in Avondale',
    description: 'Cozy 2-bedroom cottage perfect for small families or couples. Features a beautiful garden and modern amenities.',
    propertyType: 'house',
    listingType: 'rent-to-buy',
    location: {
      country: 'ZW',
      city: 'Harare',
      suburb: 'Avondale',
      streetAddress: '321 Avondale Road',
    },
    details: {
      size: 100,
      bedrooms: 2,
      bathrooms: 1,
      parking: 1,
      features: ['Garden', 'Modern Kitchen', 'Fireplace', 'Patio'],
      amenities: ['Security System', 'Garden', 'Parking']
    },
    financials: {
      price: 180000,
      currency: 'USD',
      rentToBuyDeposit: 18000,
      monthlyRental: 800,
      rentCreditPercentage: 15
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller3',
      name: 'Sarah Johnson',
      isVerified: true,
      contactInfo: {
        email: 'sarah.johnson@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    views: 134,
    savedBy: 6,
    inquiries: 4
  },
  {
    id: '4',
    title: 'Modern Apartment in CBD',
    description: 'Contemporary 3-bedroom apartment in the heart of Harare CBD. Perfect for professionals and small families.',
    propertyType: 'apartment',
    listingType: 'rent-to-buy',
    location: {
      country: 'ZW',
      city: 'Harare',
      suburb: 'CBD',
      streetAddress: '567 Samora Machel Avenue',
    },
    details: {
      size: 120,
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      features: ['City Views', 'Modern Kitchen', 'Built-in Wardrobes', 'Balcony'],
      amenities: ['24/7 Security', 'Gym', 'Pool', 'Parking']
    },
    financials: {
      price: 85000,
      currency: 'USD',
      rentToBuyDeposit: 8500,
      monthlyRental: 850,
      rentCreditPercentage: 18
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller4',
      name: 'Michael Banda',
      isVerified: true,
      contactInfo: {
        email: 'michael.banda@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    views: 167,
    savedBy: 10,
    inquiries: 7
  },
  {
    id: '5',
    title: 'Luxury Villa in Chisipite',
    description: 'Exclusive 5-bedroom villa with stunning views and premium amenities. Located in the prestigious Chisipite area.',
    propertyType: 'house',
    listingType: 'rent-to-buy',
    location: {
      country: 'ZW',
      city: 'Harare',
      suburb: 'Chisipite',
      streetAddress: '890 Chisipite Road',
    },
    details: {
      size: 350,
      bedrooms: 5,
      bathrooms: 4,
      parking: 3,
      features: ['Swimming Pool', 'Tennis Court', 'Staff Quarters', 'Wine Cellar'],
      amenities: ['Solar Power', 'Generator', 'Garden', 'Security System', 'Staff']
    },
    financials: {
      price: 650000,
      currency: 'USD',
      rentToBuyDeposit: 65000,
      monthlyRental: 2800,
      rentCreditPercentage: 35
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
      id: 'seller5',
      name: 'Patricia Moyo',
      isVerified: true,
      contactInfo: {
        email: 'patricia.moyo@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
    views: 298,
    savedBy: 25,
    inquiries: 18
  },
  {
    id: '6',
    title: 'Cozy Studio in Greendale',
    description: 'Perfect starter home or investment property. Modern studio with all amenities included.',
    propertyType: 'apartment',
    listingType: 'rent-to-buy',
    location: {
      country: 'ZW',
      city: 'Harare',
      suburb: 'Greendale',
      streetAddress: '234 Greendale Avenue',
    },
    details: {
      size: 45,
      bedrooms: 1,
      bathrooms: 1,
      parking: 1,
      features: ['Modern Kitchen', 'Built-in Wardrobes', 'Balcony'],
      amenities: ['24/7 Security', 'Gym', 'Pool', 'Parking']
    },
    financials: {
      price: 45000,
      currency: 'USD',
      rentToBuyDeposit: 4500,
      monthlyRental: 450,
      rentCreditPercentage: 12
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller6',
      name: 'Thomas Chikomba',
      isVerified: true,
      contactInfo: {
        email: 'thomas.chikomba@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date('2024-02-08'),
    views: 89,
    savedBy: 4,
    inquiries: 3
  },
  {
    id: '7',
    title: 'Family Home in Glen Lorne',
    description: 'Spacious 4-bedroom family home with large garden and modern amenities. Perfect for growing families.',
    propertyType: 'house',
    listingType: 'rent-to-buy',
    location: {
      country: 'ZW',
      city: 'Harare',
      suburb: 'Glen Lorne',
      streetAddress: '456 Glen Lorne Road',
    },
    details: {
      size: 280,
      bedrooms: 4,
      bathrooms: 3,
      parking: 2,
      features: ['Large Garden', 'Modern Kitchen', 'Fireplace', 'Study'],
      amenities: ['Security System', 'Garden', 'Parking', 'Storage']
    },
    financials: {
      price: 420000,
      currency: 'USD',
      rentToBuyDeposit: 42000,
      monthlyRental: 1800,
      rentCreditPercentage: 28
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller7',
      name: 'Grace Ndlovu',
      isVerified: true,
      contactInfo: {
        email: 'grace.ndlovu@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-02-12'),
    views: 203,
    savedBy: 15,
    inquiries: 11
  },
  {
    id: '8',
    title: 'Townhouse in Highlands',
    description: 'Beautiful 3-bedroom townhouse with garden and garage. Perfect for families in the quiet Highlands neighborhood.',
    propertyType: 'townhouse',
    listingType: 'rent-to-buy',
    location: {
      country: 'ZW',
      city: 'Harare',
      suburb: 'Highlands',
      streetAddress: '789 Highlands Avenue',
    },
    details: {
      size: 150,
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      features: ['Garden', 'Garage', 'Modern Kitchen', 'Fireplace'],
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
      mainImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller8',
      name: 'David Ndlovu',
      isVerified: true,
      contactInfo: {
        email: 'david.ndlovu@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    views: 156,
    savedBy: 8,
    inquiries: 6
  }
];

// Mock property data for South Africa
const saProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Apartment in Sandton',
    description: 'Luxurious 2-bedroom apartment in the heart of Sandton. 24-hour security and amazing city views.',
    propertyType: 'apartment',
    listingType: 'rent-to-buy',
    location: {
      country: 'SA',
      city: 'Johannesburg',
      suburb: 'Sandton',
      streetAddress: '123 Rivonia Road',
    },
    details: {
      size: 120,
      bedrooms: 2,
      bathrooms: 2,
      parking: 2,
      features: ['City Views', 'Modern Kitchen', 'Built-in Wardrobes'],
      amenities: ['24/7 Security', 'Gym', 'Pool', 'Parking']
    },
    financials: {
      price: 2500000,
      currency: 'ZAR',
      rentToBuyDeposit: 250000,
      monthlyRental: 15000,
      rentCreditPercentage: 25
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller1',
      name: 'Sarah van der Merwe',
      isVerified: true,
      contactInfo: {
        email: 'sarah.vdm@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    views: 180,
    savedBy: 15,
    inquiries: 8
  },
  {
    id: '2',
    title: 'Family Home in Cape Town',
    description: 'Spacious 4-bedroom family home in the beautiful suburbs of Cape Town. Ocean views and modern amenities.',
    propertyType: 'house',
    listingType: 'rent-to-buy',
    location: {
      country: 'SA',
      city: 'Cape Town',
      suburb: 'Newlands',
      streetAddress: '456 Newlands Avenue',
    },
    details: {
      size: 250,
      bedrooms: 4,
      bathrooms: 3,
      parking: 3,
      features: ['Ocean Views', 'Swimming Pool', 'Garden', 'Modern Kitchen'],
      amenities: ['Security System', 'Garden', 'Pool', 'Parking', 'Staff Quarters']
    },
    financials: {
      price: 4500000,
      currency: 'ZAR',
      rentToBuyDeposit: 450000,
      monthlyRental: 22000,
      rentCreditPercentage: 30
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller2',
      name: 'Michael Botha',
      isVerified: true,
      contactInfo: {
        email: 'michael.botha@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    views: 220,
    savedBy: 20,
    inquiries: 14
  },
  {
    id: '3',
    title: 'Luxury Penthouse in Durban',
    description: 'Exclusive 3-bedroom penthouse with panoramic ocean views. Located in the heart of Durban\'s Golden Mile.',
    propertyType: 'apartment',
    listingType: 'rent-to-buy',
    location: {
      country: 'SA',
      city: 'Durban',
      suburb: 'Golden Mile',
      streetAddress: '789 Marine Parade',
    },
    details: {
      size: 200,
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      features: ['Ocean Views', 'Private Balcony', 'Modern Kitchen', 'Built-in Wardrobes'],
      amenities: ['24/7 Security', 'Gym', 'Pool', 'Parking', 'Concierge', 'Spa']
    },
    financials: {
      price: 3200000,
      currency: 'ZAR',
      rentToBuyDeposit: 320000,
      monthlyRental: 18000,
      rentCreditPercentage: 28
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller3',
      name: 'Lisa Naidoo',
      isVerified: true,
      contactInfo: {
        email: 'lisa.naidoo@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
    views: 195,
    savedBy: 16,
    inquiries: 11
  },
  {
    id: '4',
    title: 'Charming Cottage in Berea',
    description: 'A cozy cottage perfect for small families or couples. Features a beautiful garden and modern amenities.',
    propertyType: 'house',
    listingType: 'rent-to-buy',
    location: {
      country: 'SA',
      city: 'Durban',
      suburb: 'Berea',
      streetAddress: '321 Berea Road',
    },
    details: {
      size: 100,
      bedrooms: 2,
      bathrooms: 1,
      parking: 1,
      features: ['Garden', 'Modern Kitchen', 'Fireplace', 'Patio'],
      amenities: ['Security System', 'Garden', 'Parking']
    },
    financials: {
      price: 950000,
      currency: 'ZAR',
      rentToBuyDeposit: 95000,
      monthlyRental: 8500,
      rentCreditPercentage: 15
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller4',
      name: 'Sarah Johnson',
      isVerified: true,
      contactInfo: {
        email: 'sarah.johnson@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    views: 145,
    savedBy: 8,
    inquiries: 6
  },
  {
    id: '5',
    title: 'Modern Townhouse in Pretoria',
    description: 'Beautiful 3-bedroom townhouse with garden and garage. Perfect for families in the quiet suburbs.',
    propertyType: 'townhouse',
    listingType: 'rent-to-buy',
    location: {
      country: 'SA',
      city: 'Pretoria',
      suburb: 'Brooklyn',
      streetAddress: '567 Brooklyn Avenue',
    },
    details: {
      size: 180,
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      features: ['Garden', 'Garage', 'Modern Kitchen', 'Fireplace'],
      amenities: ['Security System', 'Garden', 'Parking', 'Storage']
    },
    financials: {
      price: 1800000,
      currency: 'ZAR',
      rentToBuyDeposit: 180000,
      monthlyRental: 12000,
      rentCreditPercentage: 22
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller5',
      name: 'David van der Walt',
      isVerified: true,
      contactInfo: {
        email: 'david.vdw@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28'),
    views: 167,
    savedBy: 12,
    inquiries: 9
  },
  {
    id: '6',
    title: 'Luxury Villa in Stellenbosch',
    description: 'Exclusive 5-bedroom villa with stunning mountain views and premium amenities. Wine country living at its finest.',
    propertyType: 'house',
    listingType: 'rent-to-buy',
    location: {
      country: 'SA',
      city: 'Stellenbosch',
      suburb: 'Dennesig',
      streetAddress: '890 Dennesig Road',
    },
    details: {
      size: 400,
      bedrooms: 5,
      bathrooms: 4,
      parking: 3,
      features: ['Mountain Views', 'Swimming Pool', 'Wine Cellar', 'Staff Quarters'],
      amenities: ['Solar Power', 'Generator', 'Garden', 'Security System', 'Staff']
    },
    financials: {
      price: 5800000,
      currency: 'ZAR',
      rentToBuyDeposit: 580000,
      monthlyRental: 28000,
      rentCreditPercentage: 35
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
      id: 'seller6',
      name: 'Patricia van der Merwe',
      isVerified: true,
      contactInfo: {
        email: 'patricia.vdm@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    views: 312,
    savedBy: 28,
    inquiries: 20
  },
  {
    id: '7',
    title: 'Studio Apartment in Rosebank',
    description: 'Perfect starter home or investment property. Modern studio with all amenities included.',
    propertyType: 'apartment',
    listingType: 'rent-to-buy',
    location: {
      country: 'SA',
      city: 'Johannesburg',
      suburb: 'Rosebank',
      streetAddress: '234 Rosebank Avenue',
    },
    details: {
      size: 50,
      bedrooms: 1,
      bathrooms: 1,
      parking: 1,
      features: ['Modern Kitchen', 'Built-in Wardrobes', 'Balcony'],
      amenities: ['24/7 Security', 'Gym', 'Pool', 'Parking']
    },
    financials: {
      price: 850000,
      currency: 'ZAR',
      rentToBuyDeposit: 85000,
      monthlyRental: 6500,
      rentCreditPercentage: 12
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller7',
      name: 'Thomas Botha',
      isVerified: true,
      contactInfo: {
        email: 'thomas.botha@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
    views: 98,
    savedBy: 5,
    inquiries: 4
  },
  {
    id: '8',
    title: 'Family Home in Port Elizabeth',
    description: 'Spacious 4-bedroom family home with large garden and modern amenities. Perfect for growing families.',
    propertyType: 'house',
    listingType: 'rent-to-buy',
    location: {
      country: 'SA',
      city: 'Port Elizabeth',
      suburb: 'Mill Park',
      streetAddress: '456 Mill Park Road',
    },
    details: {
      size: 280,
      bedrooms: 4,
      bathrooms: 3,
      parking: 2,
      features: ['Large Garden', 'Modern Kitchen', 'Fireplace', 'Study'],
      amenities: ['Security System', 'Garden', 'Parking', 'Storage']
    },
    financials: {
      price: 2200000,
      currency: 'ZAR',
      rentToBuyDeposit: 220000,
      monthlyRental: 15000,
      rentCreditPercentage: 25
    },
    media: {
      mainImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
      ]
    },
    seller: {
      id: 'seller8',
      name: 'Grace Naidoo',
      isVerified: true,
      contactInfo: {
        email: 'grace.naidoo@email.com'
      }
    },
    status: 'active',
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date('2024-02-08'),
    views: 187,
    savedBy: 14,
    inquiries: 10
  }
];

// Helper function to get properties by country
const getPropertiesByCountry = (country: PropertyCountry): Property[] => {
  return country === 'ZW' ? zwProperties : saProperties;
};

export const searchProperties = (filters: PropertySearchFilters): Property[] => {
  const properties = getPropertiesByCountry(filters.country);
  
  return properties.filter(property => {
    if (filters.listingType && property.listingType !== filters.listingType) return false;
    if (filters.propertyType && !filters.propertyType.includes(property.propertyType)) return false;
    if (filters.priceRange) {
      if (property.financials.price < filters.priceRange.min || property.financials.price > filters.priceRange.max) return false;
    }
    if (filters.location?.city && property.location.city.toLowerCase() !== filters.location.city.toLowerCase()) return false;
    if (filters.location?.suburb && property.location.suburb.toLowerCase() !== filters.location.suburb.toLowerCase()) return false;
    if (filters.bedrooms && property.details?.bedrooms && property.details.bedrooms < filters.bedrooms) return false;
    if (filters.bathrooms && property.details?.bathrooms && property.details.bathrooms < filters.bathrooms) return false;
    if (filters.features?.length) {
      if (!filters.features.every(f => property.details.features.includes(f))) return false;
    }
    if (filters.amenities?.length) {
      if (!filters.amenities.every(a => property.details.amenities.includes(a))) return false;
    }
    return true;
  });
};

export const getPropertyById = (id: string, country: PropertyCountry): Property | undefined => {
  const properties = getPropertiesByCountry(country);
  return properties.find(p => p.id === id);
};

export const getFeaturedProperties = (country: PropertyCountry): Property[] => {
  const properties = getPropertiesByCountry(country);
  // Return top 6 properties by views
  return properties
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);
};

export const getPopularCities = (country: PropertyCountry): { city: string; listingCount: number }[] => {
  const properties = getPropertiesByCountry(country);
  const cityCounts = properties.reduce((acc, property) => {
    const city = property.location.city;
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(cityCounts)
    .map(([city, count]) => ({ city, listingCount: count }))
    .sort((a, b) => b.listingCount - a.listingCount)
    .slice(0, 6);
};

export const getPropertyStats = (country: PropertyCountry): PropertyStats => {
  const properties = getPropertiesByCountry(country);
  
  const listingsByType = properties.reduce((acc, property) => {
    acc[property.propertyType] = (acc[property.propertyType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalListings = properties.length;
  const averagePrice = properties.reduce((sum, p) => sum + p.financials.price, 0) / totalListings;
  const recentSales = properties.filter(p => p.status === 'sold').length;
  const activeRentToBuy = properties.filter(p => p.listingType === 'rent-to-buy' && p.status === 'active').length;

  return {
    totalListings,
    averagePrice,
    popularCities: getPopularCities(country),
    listingsByType,
    recentSales,
    activeRentToBuy
  };
};

// Rent-to-buy calculation function (original)
export const calculateRentToBuy = (
  monthlyRent: number,
  purchasePrice: number,
  rentCreditPercentage: number = 25,
  timeframe: number = 36
) => {
  const totalRentPaid = monthlyRent * timeframe;
  const rentCredit = totalRentPaid * (rentCreditPercentage / 100);
  const remainingBalance = purchasePrice - rentCredit;
  const equityBuilt = rentCredit;
  const percentageOwned = (rentCredit / purchasePrice) * 100;

  return {
    totalRentPaid,
    rentCredit,
    remainingBalance,
    equityBuilt,
    percentageOwned,
    monthlyRent,
    purchasePrice,
    timeframe
  };
};

// Enhanced rent-to-buy calculation function
export const calculateRentToBuyEnhanced = (params: {
  monthlyRent: number;
  propertyPrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
}) => {
  const { monthlyRent, propertyPrice, downPayment, interestRate, loanTerm } = params;
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  const totalRentYear = monthlyRent * 12;
  const totalMortgageYear = monthlyMortgage * 12;
  return {
    monthlyMortgage,
    totalRentYear,
    totalMortgageYear,
    savingsPerYear: totalRentYear - totalMortgageYear,
    breakEvenPoint: downPayment / Math.max(totalRentYear - totalMortgageYear, 1)
  };
}; 