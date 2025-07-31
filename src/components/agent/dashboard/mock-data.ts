import { addDays, format, subDays } from 'date-fns';

// Helper function to generate dates
const getDate = (daysFromNow: number) => {
  const date = daysFromNow >= 0 ? addDays(new Date(), daysFromNow) : subDays(new Date(), Math.abs(daysFromNow));
  return format(date, 'yyyy-MM-dd');
};

// Performance Metrics Mock Data
export const performanceMetrics = {
  responseTime: { current: '1.5 hours', trend: 'down' as const, percentage: 15 },
  conversionRate: { leadToViewing: 35, viewingToApplication: 60 },
  monthlyEarnings: { amount: 45000, currency: 'R', growth: 12 },
  satisfactionScore: { rating: 4.8, totalReviews: 42 },
  activeLeads: { count: 28, urgent: 5 },
  viewingsScheduled: { thisWeek: 8, nextWeek: 12 }
};

// Lead Management Mock Data
export const leads = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+27 123 456 789',
    status: 'new' as const,
    isVerified: true,
    propertyInterest: '3 Bedroom House in Sandton',
    lastContact: '2024-03-10',
    nextFollowUp: '2024-03-15',
    urgency: 'high' as const
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+27 987 654 321',
    status: 'contacted' as const,
    isVerified: true,
    propertyInterest: 'Luxury Apartment in Rosebank',
    lastContact: '2024-03-12',
    nextFollowUp: '2024-03-16',
    urgency: 'medium' as const
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '+27 555 123 456',
    status: 'viewing' as const,
    isVerified: false,
    propertyInterest: 'Townhouse in Fourways',
    lastContact: '2024-03-13',
    nextFollowUp: '2024-03-18',
    urgency: 'low' as const
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    phone: '+27 777 888 999',
    status: 'application' as const,
    isVerified: true,
    propertyInterest: 'Penthouse in Sandton',
    lastContact: '2024-03-14',
    nextFollowUp: '2024-03-20',
    urgency: 'high' as const
  },
  {
    id: '5',
    name: 'David Thompson',
    email: 'david@example.com',
    phone: '+27 111 222 333',
    status: 'closed' as const,
    isVerified: true,
    propertyInterest: 'Studio in Rosebank',
    lastContact: '2024-03-08',
    nextFollowUp: '2024-03-22',
    urgency: 'low' as const
  }
];

// Property Analytics Mock Data
export const propertyAnalytics = {
  viewTrends: Array.from({ length: 7 }, (_, i) => ({
    date: getDate(-i),
    views: Math.floor(Math.random() * 50) + 20,
    inquiries: Math.floor(Math.random() * 10) + 5
  })).reverse(),
  
  popularFeatures: [
    { feature: 'Pool', count: 45 },
    { feature: 'Security', count: 38 },
    { feature: 'Garden', count: 32 },
    { feature: 'Garage', count: 28 },
    { feature: 'Modern Kitchen', count: 25 }
  ],
  
  priceAnalysis: [
    { propertyType: 'Apartment', yourPrice: 1200000, marketAverage: 1150000 },
    { propertyType: 'House', yourPrice: 2500000, marketAverage: 2600000 },
    { propertyType: 'Townhouse', yourPrice: 1800000, marketAverage: 1750000 }
  ],
  
  performanceMetrics: [
    { metric: 'Views/Listing', value: 45, change: 12 },
    { metric: 'Avg. Days Listed', value: 28, change: -5 },
    { metric: 'Inquiry Rate', value: 15, change: 8 },
    { metric: 'Conversion Rate', value: 35, change: 10 }
  ]
};

// Communication Center Mock Data
export const messages = [
  {
    id: '1',
    sender: {
      name: 'Michael Brown',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
    },
    content: "Hi, I'm interested in viewing the property this weekend. Is Saturday morning available?",
    timestamp: "10:30 AM",
    isUnread: true,
    channel: 'whatsapp' as const
  },
  {
    id: '2',
    sender: {
      name: 'Emma Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    },
    content: 'Thank you for the virtual tour. Could you provide more information about the security features?',
    timestamp: 'Yesterday',
    isUnread: false,
    channel: 'email' as const
  },
  // Add more mock messages as needed
];

// Calendar Widget Mock Data
export const appointments = [
  {
    id: '1',
    title: 'Property Viewing - Sandton Apartment',
    date: getDate(0), // Today
    time: '10:00 AM',
    location: '123 Rivonia Road, Sandton',
    client: {
      name: 'David Thompson',
      phone: '+27 123 456 789',
      email: 'david@example.com'
    },
    propertyId: 'prop_123',
    status: 'scheduled' as const
  },
  {
    id: '2',
    title: 'Property Viewing - Rosebank Penthouse',
    date: getDate(2), // In 2 days
    time: '2:00 PM',
    location: '456 Oxford Road, Rosebank',
    client: {
      name: 'Lisa Anderson',
      phone: '+27 987 654 321',
      email: 'lisa@example.com'
    },
    propertyId: 'prop_456',
    status: 'scheduled' as const
  },
  // Add more mock appointments as needed
];

// Export all mock data
export const mockData = {
  performanceMetrics,
  leads,
  propertyAnalytics,
  messages,
  appointments
};