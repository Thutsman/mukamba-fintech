import { EnhancedLead } from './LeadManagementTab';

export const mockEnhancedLeads: EnhancedLead[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+27 82 123 4567',
    leadScore: 75,
    priority: 'high',
    leadSource: 'website',
    budget: {
      min: 800000,
      max: 900000,
      currency: 'R'
    },
    location: 'Sandton, Johannesburg',
    preferredAreas: ['Sandton', 'Rosebank', 'Melville'],
    propertyTypes: ['House', 'Townhouse'],
    bedrooms: 3,
    lastContact: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    nextFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    isOverdue: false,
    totalInteractions: 3,
    responseRate: 85,
    conversionProbability: 75,
    timeInStage: 2,
    totalTimeInPipeline: 5,
    status: 'new',
    interestedProperties: ['prop_1', 'prop_2'],
    viewingsScheduled: 1,
    viewingsCompleted: 0,
    isPhoneVerified: true,
    isEmailVerified: true,
    kycStatus: 'verified',
    notes: 'Interested in family home with garden',
    tags: ['family', 'garden', 'high-budget']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+27 83 234 5678',
    leadScore: 90,
    priority: 'high',
    leadSource: 'referral',
    budget: {
      min: 1100000,
      max: 1300000,
      currency: 'R'
    },
    location: 'Cape Town, Western Cape',
    preferredAreas: ['Cape Town', 'Sea Point', 'Green Point'],
    propertyTypes: ['Apartment', 'Penthouse'],
    bedrooms: 2,
    lastContact: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    nextFollowUp: new Date(Date.now() + 3 * 60 * 60 * 1000), // today 3pm
    isOverdue: false,
    totalInteractions: 5,
    responseRate: 95,
    conversionProbability: 90,
    timeInStage: 1,
    totalTimeInPipeline: 3,
    status: 'contacted',
    interestedProperties: ['prop_3', 'prop_4'],
    viewingsScheduled: 2,
    viewingsCompleted: 1,
    isPhoneVerified: true,
    isEmailVerified: false,
    kycStatus: 'pending',
    notes: 'Looking for sea view property',
    tags: ['luxury', 'sea-view', 'urgent']
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.b@email.com',
    phone: '+27 84 345 6789',
    leadScore: 60,
    priority: 'medium',
    leadSource: 'social',
    budget: {
      min: 600000,
      max: 700000,
      currency: 'R'
    },
    location: 'Pretoria, Gauteng',
    preferredAreas: ['Pretoria', 'Centurion'],
    propertyTypes: ['Apartment', 'Studio'],
    bedrooms: 2,
    lastContact: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // friday
    isOverdue: false,
    totalInteractions: 2,
    responseRate: 70,
    conversionProbability: 60,
    timeInStage: 3,
    totalTimeInPipeline: 8,
    status: 'viewing',
    interestedProperties: ['prop_5'],
    viewingsScheduled: 1,
    viewingsCompleted: 1,
    isPhoneVerified: false,
    isEmailVerified: true,
    kycStatus: 'verified',
    notes: 'First-time buyer, needs guidance',
    tags: ['first-time', 'budget-conscious']
  },
  {
    id: '4',
    name: 'Lisa Davis',
    email: 'lisa.d@email.com',
    phone: '+27 85 456 7890',
    leadScore: 95,
    priority: 'high',
    leadSource: 'website',
    budget: {
      min: 900000,
      max: 1000000,
      currency: 'R'
    },
    location: 'Durban, KZN',
    preferredAreas: ['Durban', 'Umhlanga'],
    propertyTypes: ['Townhouse', 'House'],
    bedrooms: 3,
    lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // next week
    isOverdue: false,
    totalInteractions: 8,
    responseRate: 90,
    conversionProbability: 95,
    timeInStage: 5,
    totalTimeInPipeline: 12,
    status: 'qualified',
    interestedProperties: ['prop_6', 'prop_7'],
    viewingsScheduled: 3,
    viewingsCompleted: 3,
    isPhoneVerified: true,
    isEmailVerified: true,
    kycStatus: 'verified',
    notes: 'Ready to make offer',
    tags: ['ready-to-buy', 'high-conversion']
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.w@email.com',
    phone: '+27 86 567 8901',
    leadScore: 100,
    priority: 'low',
    leadSource: 'direct',
    budget: {
      min: 700000,
      max: 800000,
      currency: 'R'
    },
    location: 'Bloemfontein, Free State',
    preferredAreas: ['Bloemfontein'],
    propertyTypes: ['House'],
    bedrooms: 4,
    lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    nextFollowUp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isOverdue: false,
    totalInteractions: 12,
    responseRate: 100,
    conversionProbability: 100,
    timeInStage: 0,
    totalTimeInPipeline: 15,
    status: 'closed',
    interestedProperties: ['prop_8'],
    viewingsScheduled: 2,
    viewingsCompleted: 2,
    isPhoneVerified: true,
    isEmailVerified: true,
    kycStatus: 'verified',
    notes: 'Deal completed successfully',
    tags: ['completed', 'successful']
  }
]; 