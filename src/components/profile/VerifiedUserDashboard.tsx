'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  TrendingUp, 
  Home, 
  Calendar,
  Star,
  Award,
  Target,
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  FileText,
  Clock,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Building,
  MapPin,
  Bed,
  Bath,
  Car,
  Users,
  User as UserIcon,
  Bell,
  Settings as SettingsIcon,
  Shield,
  HelpCircle,
  Zap,
  Sparkles,
  Trophy,
  Gift,
  Lightbulb,
  Plus,
  DollarSign,
  Calculator,
  Bookmark,
  Search,
  Folder,
  Menu,
  Square,
  TreePine
} from 'lucide-react';
import { Camera as CameraIcon, Sun as SunIcon, LogOut as LogOutIcon, Pencil as PencilIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PropertyListings } from '@/components/property/PropertyListings';
import { PropertySearch } from '@/components/property/PropertySearch';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { ApplicationForm, ApplicationStatus, ApplicationHistory } from '@/components/applications';
import { ApplicationStatus as AppStatus } from '@/components/applications/ApplicationForm';
import { BuyerMessaging } from '@/components/messaging';
import { BuyerOffers } from './BuyerOffers';
import { BuyerPortfolio } from './BuyerPortfolio';
import { BuyerMessages } from './BuyerMessages';
import { GeneralInquiryModal } from '@/components/messaging/GeneralInquiryModal';
import { PropertyDetailsPage } from '@/components/property/PropertyDetailsPage';
import { MakeOfferModal } from '@/components/property/MakeOfferModal';
import { PaymentModal } from '@/components/property/PaymentModal';
import { getRecentlyViewedProperties, getFeaturedProperties } from '@/lib/property-data';
import { getPropertiesFromSupabase, getSavedProperties, unsaveProperty } from '@/lib/property-services-supabase';
import { getPropertyOffers } from '@/lib/offer-services';
import { createClient, supabase } from '@/lib/supabase';
import { PropertyListing } from '@/types/property';
import { useMessageStore } from '@/lib/message-store';

// Local interface to ensure type compatibility
interface LocalProperty {
  id: string;
  title: string;
  location: {
    city: string;
    country: string;
  };
  financials: {
    price: number;
  };
  details: {
    bedrooms?: number;
    bathrooms?: number;
    size: number;
  };
  media?: {
    mainImage?: string;
    images?: string[];
  };
  status: 'active' | 'under_offer' | 'sold' | 'rented' | 'pending' | 'draft';
}
import { useRouter } from 'next/navigation';
import { navigateWithScrollToTop } from '@/utils/navigation';
import { 
  type User as UserType,
  type FinancialProfile,
  type PropertyApplication,
  type SmartRecommendation,
  getVerificationStatus,
  isFullyVerified
} from '@/types/auth';

interface VerifiedUserDashboardProps {
  user: UserType;
  activeSection?: 'overview' | 'portfolio' | 'saved' | 'offers' | 'messages' | 'documents' | 'financing' | 'settings';
  onViewProperty: (propertyId: string) => void;
  onViewApplication: (applicationId: string) => void;
  onStartNewApplication: () => void;
  onViewMarketInsights: () => void;
}

// Mock data for demonstration
const mockFinancialProfile: FinancialProfile = {
  creditScore: 745,
  monthlyIncome: 45000,
  monthlyExpenses: 18000,
  disposableIncome: 27000,
  debtToIncomeRatio: 0.15,
  preApprovedAmount: 1200000,
  riskLevel: 'Low',
  lastUpdated: new Date()
};

const mockApplications: PropertyApplication[] = [
  {
    id: 'app-1',
    propertyId: 'prop-1',
    propertyAddress: '123 Oak Street, Harare',
    propertyType: '3 Bedroom House',
    applicationDate: new Date('2024-01-15'),
    status: 'approved',
    rentAmount: 8500,
    rentCreditPercentage: 25,
    estimatedMoveInDate: new Date('2024-03-01'),
    documentsSubmitted: true,
    lastUpdated: new Date('2024-01-20')
  },
  {
    id: 'app-2',
    propertyId: 'prop-2',
    propertyAddress: '456 Pine Avenue, Bulawayo',
    propertyType: '2 Bedroom Apartment',
    applicationDate: new Date('2024-01-10'),
    status: 'under_review',
    rentAmount: 6500,
    rentCreditPercentage: 20,
    documentsSubmitted: true,
    lastUpdated: new Date('2024-01-18')
  }
];

const mockRecommendations: SmartRecommendation[] = [
  {
    id: 'rec-1',
    type: 'property',
    title: 'Perfect Match: 3BR House in Harare',
    description: 'Based on your credit score and income, this property offers excellent value',
    priority: 'high',
    matchScore: 92,
    estimatedMonthlyPayment: 8500,
    propertyData: {
      id: 'prop-3',
      address: '789 Maple Drive, Harare',
      bedrooms: 3,
      bathrooms: 2,
      price: 1200000,
      imageUrl: '/api/mock-property-1.jpg'
    }
  },
  {
    id: 'rec-2',
    type: 'action',
    title: 'Complete Your Profile',
    description: 'Add your employment details to unlock higher pre-approval amounts',
    priority: 'medium'
  },
  {
    id: 'rec-3',
    type: 'insight',
    title: 'Market Opportunity',
    description: 'Property prices in your preferred area have decreased by 5% this month',
    priority: 'low'
  }
];

const StatusBadge: React.FC<{ status: PropertyApplication['status'] }> = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { color: 'bg-green-100 text-green-800', icon: Check },
    rejected: { color: 'bg-red-100 text-red-800', icon: X },
    under_review: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  );
};

const ApplicationCard: React.FC<{
  application: PropertyApplication;
  onView: () => void;
}> = ({ application, onView }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-semibold text-slate-900 mb-1">{application.propertyAddress}</h4>
        <p className="text-sm text-slate-600 mb-2">{application.propertyType}</p>
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={application.status} />
          <span className="text-xs text-slate-500">
            Applied {application.applicationDate.toLocaleDateString()}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onView}
        className="text-blue-600 hover:text-blue-700"
      >
        <Eye className="w-4 h-4" />
      </Button>
    </div>
    
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-slate-500">Rent Amount:</span>
        <p className="font-medium">R{application.rentAmount.toLocaleString()}</p>
      </div>
      <div>
        <span className="text-slate-500">Rent Credit:</span>
        <p className="font-medium">{application.rentCreditPercentage}%</p>
      </div>
    </div>
  </motion.div>
);

const RecommendationCard: React.FC<{
  recommendation: SmartRecommendation;
  onAction: () => void;
}> = ({ recommendation, onAction }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 w-full hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {recommendation.type === 'property' && <Home className="w-4 h-4 text-blue-600" />}
          {recommendation.type === 'action' && <Target className="w-4 h-4 text-green-600" />}
          {recommendation.type === 'insight' && <Lightbulb className="w-4 h-4 text-yellow-600" />}
          <h4 className="font-semibold text-slate-900">{recommendation.title}</h4>
        </div>
        <p className="text-sm text-slate-600 mb-3">{recommendation.description}</p>
        
        {recommendation.propertyData && (
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{recommendation.propertyData.address}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Bed className="w-3 h-3" />
                    {recommendation.propertyData.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-3 h-3" />
                    {recommendation.propertyData.bathrooms}
                  </span>
                  <span className="font-medium text-slate-700">
                    ${recommendation.propertyData.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    
    <div className="flex items-center justify-between">
      {recommendation.matchScore && (
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium">{recommendation.matchScore}% Match</span>
        </div>
      )}
      <Button
        size="sm"
        onClick={onAction}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {recommendation.type === 'property' ? 'View Property' : 'Take Action'}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  </motion.div>
);

const FinancialSummaryCard: React.FC<{
  profile: FinancialProfile;
}> = ({ profile }) => (
  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 h-full">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-green-800 text-base sm:text-lg">
        <TrendingUp className="w-5 h-5" />
        Financial Summary
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-600 mb-0.5 leading-tight">
            {profile.creditScore}
          </div>
          <div className="text-[11px] sm:text-xs text-green-700">Credit Score</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-0.5 leading-tight break-words">
            R{profile.preApprovedAmount.toLocaleString()}
          </div>
          <div className="text-[11px] sm:text-xs text-blue-700">Pre-Approved Amount</div>
        </div>
      </div>
      
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-slate-600">Monthly Income:</span>
          <span className="font-medium">R{profile.monthlyIncome.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-slate-600">Monthly Expenses:</span>
          <span className="font-medium">R{profile.monthlyExpenses.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm border-t pt-2">
          <span className="text-slate-600">Disposable Income:</span>
          <span className="font-medium text-green-600">
            R{profile.disposableIncome.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Risk Level</span>
          <Badge className={
            profile.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
            profile.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }>
            {profile.riskLevel}
          </Badge>
        </div>
        <div className="text-xs text-slate-500">
          Last updated: {profile.lastUpdated.toLocaleDateString()}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const VerifiedUserDashboard: React.FC<VerifiedUserDashboardProps> = ({
  user,
  activeSection: initialActiveSection = 'overview',
  onViewProperty,
  onViewApplication,
  onStartNewApplication,
  onViewMarketInsights
}) => {
  const router = useRouter();
  const isVerified = isFullyVerified(user);
  const { getUnreadAdminResponsesCount } = useMessageStore();
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  // Keep theme in sync with document and localStorage
  React.useEffect(() => {
    try {
      const storedTheme = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null;
      if (storedTheme === 'dark') {
        setDarkModeEnabled(true);
      }
    } catch (_) {
      // ignore storage read errors
    }
  }, []);

  const applyTheme = React.useCallback((enabled: boolean) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('dark');
      root.classList.remove('light');
      try { window.localStorage.setItem('theme', 'dark'); } catch (_) {}
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      try { window.localStorage.setItem('theme', 'light'); } catch (_) {}
    }
  }, []);

  React.useEffect(() => {
    applyTheme(darkModeEnabled);
  }, [darkModeEnabled, applyTheme]);
  const [activeSection, setActiveSection] = React.useState<'overview' | 'portfolio' | 'saved' | 'offers' | 'messages' | 'documents' | 'financing' | 'settings'>(initialActiveSection);

  // Update activeSection when initialActiveSection prop changes
  React.useEffect(() => {
    setActiveSection(initialActiveSection);
  }, [initialActiveSection]);
  const [showPropertySearch, setShowPropertySearch] = React.useState(false);
  const [showPropertyGrid, setShowPropertyGrid] = React.useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = React.useState(false);
  const [showMakeOfferModal, setShowMakeOfferModal] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState<any>(null);
  const [showMobileNav, setShowMobileNav] = React.useState(false);
  const [showOfferDetailsModal, setShowOfferDetailsModal] = React.useState(false);
  const [selectedOffer, setSelectedOffer] = React.useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [selectedOfferForPayment, setSelectedOfferForPayment] = React.useState<any>(null);
  const [offersRefreshTrigger, setOffersRefreshTrigger] = React.useState(0);

  // Application management states
  const [showApplicationForm, setShowApplicationForm] = React.useState(false);
  const [showApplicationStatus, setShowApplicationStatus] = React.useState(false);
  const [showApplicationHistory, setShowApplicationHistory] = React.useState(false);
  const [selectedPropertyForApplication, setSelectedPropertyForApplication] = React.useState<any>(null);
  const [selectedApplicationId, setSelectedApplicationId] = React.useState<string>('');

  // Messaging state
  const [showMessaging, setShowMessaging] = React.useState(false);
  const [showBuyerMessages, setShowBuyerMessages] = React.useState(false);
  const [showGeneralInquiryModal, setShowGeneralInquiryModal] = React.useState(false);
  const [unreadInboxCount, setUnreadInboxCount] = React.useState(0);

  const refreshUnreadInboxCount = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const count = await getUnreadAdminResponsesCount(user.id);
      setUnreadInboxCount(count);
    } catch (e) {
      console.warn('Failed to refresh unread inbox count:', e);
      setUnreadInboxCount(0);
    }
  }, [user?.id, getUnreadAdminResponsesCount]);

  React.useEffect(() => {
    refreshUnreadInboxCount();
  }, [refreshUnreadInboxCount]);

  // Realtime: keep unread badge in sync with admin replies/read state
  React.useEffect(() => {
    if (!user?.id) return;

    const supabaseClient = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        refreshUnreadInboxCount();
      }, 250);
    };

    const channel = supabaseClient
      .channel(`buyer_messages_badge_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buyer_messages',
          filter: `buyer_id=eq.${user.id}`,
        },
        () => scheduleRefresh()
      )
      .subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      supabaseClient.removeChannel(channel);
    };
  }, [user?.id, refreshUnreadInboxCount]);

  // Stats for overview cards (real data from DB)
  interface BuyerStats {
    savedCount: number;
    activeApps: number;
  }
  interface RecentActivityItem { 
    text: string; 
    time: string;
    type: 'offer' | 'view' | 'other';
  }
  interface PreviewProperty { id: string; title: string; address: string; price: number; beds: number; baths: number; area: number; imageUrl?: string; status?: string }

  // State for recent activities
  const [recentActivities, setRecentActivities] = React.useState<RecentActivityItem[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = React.useState(true);
  const [activeOffersCount, setActiveOffersCount] = React.useState(0);

  // State for saved properties
  const [savedPropertiesCount, setSavedPropertiesCount] = React.useState(0);
  const [savedPropertiesList, setSavedPropertiesList] = React.useState<any[]>([]);
  const [isLoadingSavedProperties, setIsLoadingSavedProperties] = React.useState(true);

  const stats: BuyerStats = {
    savedCount: savedPropertiesCount,
    activeApps: activeOffersCount,
  };

  // State for live properties
  const [liveProperties, setLiveProperties] = React.useState<PreviewProperty[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = React.useState(true);

  // Fetch recent bidding activities from database (all offers, not just user's)
  const fetchRecentActivities = React.useCallback(async () => {
    try {
      setIsLoadingActivities(true);
      // Fetch all offers from the database (not filtered by buyer_id)
      const offers = await getPropertyOffers();
      
      // Convert offers to recent activities, showing only the most recent 4
      const activities: RecentActivityItem[] = offers
        .slice(0, 4)
        .map(offer => {
          const propertyName = offer.property?.title || 'Unknown Property';
          const offerPrice = offer.offer_price;
          const status = offer.status;
          
          let activityText = '';
          switch (status) {
            case 'pending':
              activityText = `New offer submitted: ${propertyName} - $${offerPrice.toLocaleString()}`;
              break;
            case 'approved':
              activityText = `Offer approved: ${propertyName} - $${offerPrice.toLocaleString()}`;
              break;
            case 'rejected':
              activityText = `Offer rejected: ${propertyName} - $${offerPrice.toLocaleString()}`;
              break;
            case 'expired':
              activityText = `Offer expired: ${propertyName} - $${offerPrice.toLocaleString()}`;
              break;
            default:
              activityText = `Offer ${status}: ${propertyName} - $${offerPrice.toLocaleString()}`;
          }
          
          // Calculate time ago
          const submittedDate = new Date(offer.submitted_at);
          const now = new Date();
          const diffInHours = Math.floor((now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60));
          const diffInDays = Math.floor(diffInHours / 24);
          
          let timeAgo = '';
          if (diffInHours < 1) {
            timeAgo = 'Just now';
          } else if (diffInHours < 24) {
            timeAgo = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
          } else if (diffInDays < 7) {
            timeAgo = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
          } else {
            timeAgo = submittedDate.toLocaleDateString();
          }
          
          return {
            text: activityText,
            time: timeAgo,
            type: 'offer' as const
          };
        });
      
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  }, []);

  // Fetch saved properties from database
  const fetchSavedProperties = React.useCallback(async () => {
    try {
      setIsLoadingSavedProperties(true);
      const savedProperties = await getSavedProperties(user.id);
      setSavedPropertiesCount(savedProperties.length);
      // Store the actual saved properties with property data
      setSavedPropertiesList(savedProperties);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
      setSavedPropertiesCount(0);
      setSavedPropertiesList([]);
    } finally {
      setIsLoadingSavedProperties(false);
    }
  }, [user.id]);

  // Count offers that still need user attention: pending approval, or approved but payment not yet verified
  const fetchOffersBadgeCount = React.useCallback(async () => {
    if (!user.id) {
      setActiveOffersCount(0);
      return;
    }
    try {
      const buyerOffers = await getPropertyOffers({ buyer_id: user.id });
      if (buyerOffers.length === 0) {
        setActiveOffersCount(0);
        return;
      }
      const offerIds = buyerOffers.map((o: any) => o.id);
      let completedByOffer: Record<string, boolean> = {};
      if (supabase) {
        const { data: payments } = await supabase
          .from('offer_payments')
          .select('offer_id, status')
          .eq('buyer_id', user.id)
          .in('offer_id', offerIds);
        (payments || []).forEach((p: { offer_id: string; status: string }) => {
          if (p.status === 'completed') completedByOffer[p.offer_id] = true;
        });
      }
      const needsAttention = buyerOffers.filter((o: any) => {
        if (o.status === 'pending') return true;
        if (o.status === 'approved' && !completedByOffer[o.id]) return true;
        return false;
      });
      setActiveOffersCount(needsAttention.length);
    } catch (e) {
      console.warn('Error fetching offers badge count:', e);
      setActiveOffersCount(0);
    }
  }, [user.id]);

  // Fetch live properties from database
  const fetchLiveProperties = React.useCallback(async () => {
    try {
      setIsLoadingProperties(true);
      const properties = await getPropertiesFromSupabase();
      
      // Filter for active and under_offer properties and limit to 3
      const activeProperties = properties
        .filter((property: LocalProperty) => property.status === 'active' || property.status === 'under_offer')
        .slice(0, 3);
      
      const previewProperties = activeProperties.map((property: LocalProperty) => ({
        id: property.id,
        title: property.title,
        address: `${property.location.city}, ${property.location.country === 'SA' ? 'South Africa' : 'Zimbabwe'}`,
        price: property.financials.price,
        beds: property.details.bedrooms || 0,
        baths: property.details.bathrooms || 0,
        area: property.details.size,
        imageUrl: property.media?.mainImage || property.media?.images?.[0] || '',
        status: property.status
      }));
      
      setLiveProperties(previewProperties);
    } catch (error) {
      console.error('Error fetching live properties:', error);
      // Fallback to mock data if live data fails
      const recentProperties = getRecentlyViewedProperties();
      const featuredProperties = getFeaturedProperties(3);
      const allProperties = [...recentProperties, ...featuredProperties];
      const uniqueProperties = allProperties.filter((property, index, self) => 
        index === self.findIndex(p => p.id === property.id)
      );
      
        setLiveProperties(uniqueProperties.slice(0, 3).map(property => ({
          id: property.id,
          title: property.title,
          address: `${property.city}, ${property.country === 'SA' ? 'South Africa' : 'Zimbabwe'}`,
          price: property.price,
          beds: property.bedrooms || 0,
          baths: property.bathrooms || 0,
          area: property.area,
          imageUrl: property.imageUrl || '',
          status: 'active' // Default status for mock data
        })));
    } finally {
      setIsLoadingProperties(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLiveProperties();
    fetchRecentActivities();
    fetchSavedProperties();
  }, [fetchLiveProperties, fetchRecentActivities, fetchSavedProperties]);

  React.useEffect(() => {
    fetchOffersBadgeCount();
  }, [fetchOffersBadgeCount, offersRefreshTrigger]);

  // Use live properties for previews
  const previews: PreviewProperty[] = liveProperties;

  if (!isVerified) {
    return null; // This component is only for verified users
  }

  const handleBackToDashboard = () => {
    setShowPropertySearch(false);
    setShowPropertyGrid(false);
    setShowPropertyDetails(false);
    setShowMakeOfferModal(false);
    setSelectedProperty(null);
    setActiveSection('overview');
  };

  const handleSaveProperty = (propertyId: string) => {
    // Mock save property functionality
    console.log('Saving property:', propertyId);
  };

  // Helper function to generate a UUID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleViewPropertyDetails = (previewProperty: any) => {
    // Convert preview property to full PropertyListing format
    const propertyListing = {
      id: previewProperty.id || generateUUID(), // Ensure we have a valid ID
      title: previewProperty.title,
      description: `Property located in ${previewProperty.address}`,
      propertyType: 'house' as const,
      listingType: 'rent-to-buy' as const,
      location: {
        country: previewProperty.address.includes('South Africa') ? 'SA' as const : 'ZW' as const,
        city: previewProperty.address.split(',')[1]?.trim() || 'Unknown',
        suburb: previewProperty.address.split(',')[0]?.trim() || 'Unknown',
        streetAddress: previewProperty.address
      },
      details: {
        size: previewProperty.area,
        type: 'house' as const,
        bedrooms: previewProperty.beds,
        bathrooms: previewProperty.baths,
        parking: 1,
        features: ['Modern Design', 'Well Maintained'],
        amenities: ['Garden', 'Security']
      },
      financials: {
        price: previewProperty.price,
        currency: 'USD' as const,
        rentToBuyDeposit: Math.round(previewProperty.price * 0.1),
        monthlyInstallment: Math.round(previewProperty.price * 0.005),
        paymentDuration: 240,
        rentCreditPercentage: 25
      },
      media: {
        mainImage: previewProperty.imageUrl || '',
        images: [previewProperty.imageUrl || '']
      },
      seller: {
        id: '', // No seller ID for admin-listed properties
        name: 'Admin Listed',
        isVerified: true,
        contactInfo: {
          email: 'owner@example.com'
        }
      },
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSelectedProperty(propertyListing);
    setShowPropertyDetails(true);
  };

  const handleMakeOffer = (previewProperty: any) => {
    // Convert preview property to full PropertyListing format
    const propertyListing = {
      id: previewProperty.id || generateUUID(), // Ensure we have a valid ID
      title: previewProperty.title,
      description: `Property located in ${previewProperty.address}`,
      propertyType: 'house' as const,
      listingType: 'rent-to-buy' as const,
      location: {
        country: previewProperty.address.includes('South Africa') ? 'SA' as const : 'ZW' as const,
        city: previewProperty.address.split(',')[1]?.trim() || 'Unknown',
        suburb: previewProperty.address.split(',')[0]?.trim() || 'Unknown',
        streetAddress: previewProperty.address
      },
      details: {
        size: previewProperty.area,
        type: 'house' as const,
        bedrooms: previewProperty.beds,
        bathrooms: previewProperty.baths,
        parking: 1,
        features: ['Modern Design', 'Well Maintained'],
        amenities: ['Garden', 'Security']
      },
      financials: {
        price: previewProperty.price,
        currency: 'USD' as const,
        rentToBuyDeposit: Math.round(previewProperty.price * 0.1),
        monthlyInstallment: Math.round(previewProperty.price * 0.005),
        paymentDuration: 240,
        rentCreditPercentage: 25
      },
      media: {
        mainImage: previewProperty.imageUrl || '',
        images: [previewProperty.imageUrl || '']
      },
      seller: {
        id: '', // No seller ID for admin-listed properties
        name: 'Admin Listed',
        isVerified: true,
        contactInfo: {
          email: 'owner@example.com'
        }
      },
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSelectedProperty(propertyListing);
    setShowMakeOfferModal(true);
  };

  // Application management functions
  const handleStartApplication = (propertyData?: any) => {
    setSelectedPropertyForApplication(propertyData || null);
    setShowApplicationForm(true);
  };

  const handleViewApplicationStatus = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setShowApplicationStatus(true);
  };

  const handleViewApplicationHistory = () => {
    setShowApplicationHistory(true);
  };

  // Payment handler functions
  const handleMakePayment = (offer: any) => {
    setSelectedOfferForPayment(offer);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      console.log('Payment submitted:', paymentData);
      setOffersRefreshTrigger((t) => t + 1);
      console.log('Payment proof submitted successfully');
    } catch (error) {
      console.error('Payment proof submission failed:', error);
    }
  };

  const handleCloseApplicationModals = () => {
    setShowApplicationForm(false);
    setShowApplicationStatus(false);
    setShowApplicationHistory(false);
    setSelectedPropertyForApplication(null);
    setSelectedApplicationId('');
  };

  const handleApplicationSubmitted = (applicationData: any) => {
    console.log('Application submitted:', applicationData);
    setShowApplicationForm(false);
    setSelectedPropertyForApplication(null);
    // Optionally show success message or redirect to application status
    setSelectedApplicationId(applicationData.id);
    setShowApplicationStatus(true);
  };

  // Mock application data for components
  const mockApplicationProperty = {
    id: 'prop-1',
    title: 'Modern 3BR House',
    address: '123 Oak Street, Harare',
    city: 'Harare',
    price: 850000,
    imageUrl: '/api/placeholder/400/300'
  };

  const mockApplications = [
    {
      id: 'app-1',
      propertyId: 'prop-1',
      propertyTitle: 'Modern 3BR House',
      propertyAddress: '123 Oak Street, Harare',
      propertyCity: 'Harare',
      propertyPrice: 850000,
      propertyImageUrl: '/api/placeholder/400/300',
      status: 'submitted' as any,
      submittedDate: new Date('2024-01-15'),
      lastUpdated: new Date('2024-01-20'),
      rentAmount: 8500,
      rentCreditPercentage: 25,
      estimatedReviewTime: 7,
      documentsSubmitted: true,
      agentName: 'John Smith',
      agentEmail: 'john@mukamba.com'
    }
  ];

  // Show property search or grid if active
  if (showPropertySearch) {
    return (
      <PropertySearch
        onViewProperty={onViewProperty}
        onSaveProperty={handleSaveProperty}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  if (showPropertyGrid) {
    return (
      <PropertyGrid
        onViewProperty={onViewProperty}
        onSaveProperty={handleSaveProperty}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }


  if (showPropertyDetails && selectedProperty) {
    return (
      <PropertyDetailsPage
        property={selectedProperty}
        user={user}
      />
    );
  }

  // Show application modals if active
  if (showApplicationForm) {
  return (
      <ApplicationForm
        property={selectedPropertyForApplication || mockApplicationProperty}
        onBack={handleCloseApplicationModals}
        onSubmit={handleApplicationSubmitted}
        onSaveDraft={(data) => console.log('Draft saved:', data)}
        userData={{
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          dateOfBirth: '', // Not available in User interface
          idNumber: '', // Not available in User interface
          // Financial data from KYC (if available)
          monthlyIncome: undefined, // Not available in User interface
          monthlyExpenses: undefined, // Not available in User interface
          creditScore: user.creditScore,
        }}
      />
    );
  }

  if (showApplicationStatus) {
    return (
      <ApplicationStatus
        applicationId={selectedApplicationId}
        property={mockApplicationProperty}
        status={AppStatus.SUBMITTED}
        submittedDate={new Date('2024-01-15')}
        estimatedReviewTime={7}
        onBack={handleCloseApplicationModals}
        onContactAgent={() => console.log('Contact agent')}
        onDownloadDocuments={() => console.log('Download documents')}
      />
    );
  }

  if (showApplicationHistory) {
    return (
      <ApplicationHistory
        applications={mockApplications}
        onBack={handleCloseApplicationModals}
        onViewApplication={handleViewApplicationStatus}
        onContactAgent={(applicationId) => console.log('Contact agent for:', applicationId)}
        onDownloadDocuments={(applicationId) => console.log('Download documents for:', applicationId)}
      />
    );
  }

  // Show messaging as full page
  if (showMessaging) {
    return (
      <BuyerMessaging
        userId={user.id}
        onBack={() => setShowMessaging(false)}
        onViewProperty={onViewProperty}
      />
    );
  }

  // Messages section is now rendered inline within the dashboard layout
  // No longer shown as a full page to maintain consistent design

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Sidebar */}
      <aside className="hidden md:block fixed left-6 top-24 z-30 w-72 h-[calc(100vh-8rem)] bg-white border border-slate-200 rounded-2xl shadow-lg overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex flex-col items-center text-center">
          <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={user.firstName} />
            <AvatarFallback className="bg-red-800 text-white text-lg font-semibold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
          <div className="mt-2">
            <div className="text-slate-900 font-semibold">{user.firstName} {user.lastName}</div>
            <div className="text-xs text-slate-500 truncate max-w-[12rem]">{user.email}</div>
            <Badge className="mt-2 bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Verified Buyer</Badge>
              </div>
            </div>
        

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {[
            {key:'overview', label:'Overview', icon:Home},
            {key:'portfolio', label:'Portfolio', icon:Folder},
            {key:'saved', label:'Saved Properties', icon:Bookmark, badge: savedPropertiesCount},
            {key:'offers', label:'Offers', icon:FileText, badge: stats.activeApps},
            {key:'messages', label:'Messages', icon:MessageCircle, badge: unreadInboxCount},
            {key:'documents', label:'Documents', icon:FileText},
            {key:'settings', label:'Settings', icon:SettingsIcon},
          ].map((item:any)=>{
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => {
                setActiveSection(item.key);
              }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeSection===item.key?'bg-red-100 text-red-800 border border-red-300':'text-slate-700 hover:bg-slate-50'}`}> 
                <Icon className={activeSection===item.key?'w-4 h-4 text-red-800':'w-4 h-4 text-slate-500'}/>
                <span className="font-medium flex-1">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {showMobileNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileNav(false)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Navigation</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileNav(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
          </div>
              
              <div className="p-4">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={user.firstName} />
                    <AvatarFallback className="bg-red-800 text-white text-sm font-semibold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-slate-900 font-semibold text-sm">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                    <Badge className="mt-1 bg-green-100 text-green-800 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1"/> Verified Buyer
                    </Badge>
          </div>
        </div>

                

                {/* Navigation Items */}
                <nav className="space-y-1">
                  {[
                    {key: 'overview', label: 'Overview', icon: Home},
                    {key: 'portfolio', label: 'Portfolio', icon: Folder},
                    {key: 'saved', label: 'Saved Properties', icon: Bookmark, badge: savedPropertiesCount},
                    {key: 'offers', label: 'Offers', icon: FileText, badge: stats.activeApps},
                    {key: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadInboxCount},
                    {key: 'documents', label: 'Documents', icon: FileText},
                    {key: 'settings', label: 'Settings', icon: SettingsIcon},
                  ].map((item: any) => {
                    const Icon = item.icon;
                    return (
              <button
                        key={item.key} 
                        onClick={() => {
                          setActiveSection(item.key);
                          setShowMobileNav(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === item.key ? 'bg-red-100 text-red-800 border border-red-300' : 'text-slate-700 hover:bg-slate-50'}`}
                      > 
                        <Icon className={activeSection === item.key ? 'w-4 h-4 text-red-800' : 'w-4 h-4 text-slate-500'}/>
                        <span className="font-medium flex-1">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
              </button>
                    );
                  })}
                </nav>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="dashboard-main flex-1 md:ml-[19rem] w-full px-4 md:px-6 lg:px-8 pb-10 space-y-10 overflow-x-hidden">
        {/* Header */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileNav(true)}
              className="md:hidden h-10 w-10 p-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><UserIcon className="w-5 h-5 text-blue-700"/></div>
          <div>
              <div className="text-slate-800 font-semibold">Welcome, {user.firstName || 'Verified Buyer'}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
          </div>
        <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/>Verified</Badge>
            <Button className="bg-red-800 hover:bg-red-900 text-white" size="sm" onClick={() => navigateWithScrollToTop(router, '/listings')}>Start New Search</Button>
          </div>
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <>
            {/* Metric Cards - real data only */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-1 md:px-0">
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs uppercase tracking-wide text-slate-600">Saved Properties</div>
                    <Bookmark className="w-4 h-4 text-blue-600"/>
                  </div>
                  {isLoadingSavedProperties ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 text-sm">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats.savedCount}</div>
                      <div className="text-xs text-slate-500">
                        {stats.savedCount === 0 
                          ? 'No properties saved yet' 
                          : `Properties Bookmarked${stats.savedCount > 1 ? 's' : ''}`
                        }
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs uppercase tracking-wide text-slate-600">Active Offers</div>
                    <FileText className="w-4 h-4 text-emerald-600"/>
                  </div>
                  <div className="text-2xl font-bold">{stats.activeApps}</div>
                  <div className="text-xs text-slate-500">Under Review • Pending</div>
                </CardContent>
              </Card>
            </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-red-100 border-red-300 text-red-800 hover:bg-red-200 hover:border-red-400 transition-colors duration-200" 
                onClick={() => navigateWithScrollToTop(router, '/listings')}
              >
                <Home className="w-4 h-4"/>
                Browse Properties
          </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={()=>setActiveSection('offers')}><FileText className="w-4 h-4"/>View Offers</Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setActiveSection('messages')}
              >
                <MessageCircle className="w-4 h-4"/>Messages
              </Button>
        </div>
        </CardContent>
      </Card>

        {/* Recently Viewed Properties */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recently Viewed Properties</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => navigateWithScrollToTop(router, '/listings')}
                className="bg-red-100 border-red-300 text-red-800 hover:bg-red-200 hover:border-red-400 transition-colors duration-200"
              >
                <Eye className="w-4 h-4 mr-1" />
                View All Properties
              </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProperties ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading properties...</span>
            </div>
          ) : previews.length === 0 ? (
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Available</h3>
              <p className="text-gray-600 mb-4">No active properties found at the moment.</p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigateWithScrollToTop(router, '/listings')}
              >
                Browse All Properties
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {previews.map((p)=> (
                <div key={p.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="relative h-36 bg-slate-200 w-full overflow-hidden">
                    {p.imageUrl ? (
                      <img 
                        src={p.imageUrl} 
                        alt={p.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 bg-slate-200 flex items-center justify-center ${p.imageUrl ? 'hidden' : 'flex'}`}>
                      <Building className="w-8 h-8 text-slate-400" />
              </div>
                    {/* Property badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {p.status === 'active' && (
                        <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>
                      )}
                      {p.status === 'under_offer' && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">Under Offer</Badge>
                      )}
                </div>
                </div>
                  <div className="p-3">
                    <div className="font-semibold text-slate-800 text-sm truncate mb-1" title={`${p.title} • ${p.address}`}>
                      {p.title} • {p.address}
              </div>
                    <div className="text-lg font-bold text-slate-900 mb-1">
                      ${p.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mb-3 flex gap-3">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3 h-3" />
                        {p.beds}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3 h-3" />
                        {p.baths}
                      </span>
                      <span className="flex items-center gap-1">
                        <Square className="w-3 h-3" />
                        {p.area} m²
                      </span>
              </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-red-800 hover:bg-red-900 text-white" 
                        onClick={() => router.push(`/property/${p.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300" 
                        onClick={() => handleMakeOffer(p)}
                      >
                        Make Offer
                      </Button>
          </div>
          </div>
        </div>
              ))}
            </div>
          )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingActivities ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading activities...</span>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Bidding Activity</h3>
              <p className="text-gray-600 mb-4">No recent property offers have been submitted by buyers.</p>
              <Button 
                className="bg-red-800 hover:bg-red-900 text-white"
                onClick={() => navigateWithScrollToTop(router, '/listings')}
              >
                Browse Properties
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a, idx)=> (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{a.text}</span>
                  <span className="text-slate-500">{a.time}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
          </>
        )}

        {/* Portfolio Section */}
        {activeSection === 'portfolio' && (
          <BuyerPortfolio
            user={user}
            refreshTrigger={offersRefreshTrigger}
            onBrowseProperties={() => navigateWithScrollToTop(router, '/listings')}
          />
        )}

      {/* Saved Properties Section */}
      {activeSection === 'saved' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Saved Properties</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => navigateWithScrollToTop(router, '/listings')}
                  className="bg-red-100 border-red-300 text-red-800 hover:bg-red-200 hover:border-red-400 transition-colors duration-200"
                >
                  <Search className="w-4 h-4 mr-1" />
                  Browse More Properties
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSavedProperties ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading saved properties...</span>
                </div>
              ) : savedPropertiesList.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Properties</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't saved any properties yet. Start browsing and save properties you're interested in.
                  </p>
                  <Button 
                    className="bg-red-800 hover:bg-red-900 text-white"
                    onClick={() => navigateWithScrollToTop(router, '/listings')}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Browse Properties
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {savedPropertiesList
                    .filter(saved => saved.property) // Only show properties that have data
                    .map((saved, index) => {
                      const property = saved.property;
                      if (!property) return null;

                      const formatCurrency = (amount: number) => {
                        return new Intl.NumberFormat('en-CA', {
                          style: 'currency',
                          currency: 'CAD',
                          minimumFractionDigits: 0,
                        }).format(amount);
                      };
                      
                      return (
                        <motion.div
                          key={saved.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -8, transition: { duration: 0.3 } }}
                          className="group cursor-pointer h-full"
                          onClick={() => router.push(`/property/${property.id}`)}
                        >
                          <Card className="overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-xl h-full flex flex-col">
                            {/* Property Image */}
                            <div className="relative h-48 sm:h-64 overflow-hidden">
                              {property.media?.mainImage && property.media.mainImage !== '/placeholder-property.jpg' ? (
                                <img
                                  src={property.media.mainImage}
                                  alt={property.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder-property.jpg';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                  <div className="text-center text-slate-500">
                                    <div className="w-16 h-16 mx-auto mb-2">
                                      <svg className="w-full h-full text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <p className="text-sm">Image unavailable</p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Badges */}
                              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                {/* Available Status Badge */}
                                {(!property.status || property.status === 'active' || (property.status !== 'under_offer' && property.status !== 'sold' && property.status !== 'rented')) && (
                                  <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm px-3 py-1 text-xs font-semibold rounded-full">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Available
                                  </Badge>
                                )}
                                {property.status === 'under_offer' && (
                                  <Badge className="bg-orange-100 text-orange-800 border border-orange-300 shadow-sm px-3 py-1 text-xs font-semibold rounded-full">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Under Offer
                                  </Badge>
                                )}
                                {property.status === 'sold' && (
                                  <Badge className="bg-red-100 text-red-800 border border-red-300 shadow-sm px-3 py-1 text-xs font-semibold rounded-full">
                                    <X className="w-3 h-3 mr-1" />
                                    Sold
                                  </Badge>
                                )}
                                {property.status === 'rented' && (
                                  <Badge className="bg-purple-100 text-purple-800 border border-purple-300 shadow-sm px-3 py-1 text-xs font-semibold rounded-full">
                                    <Users className="w-3 h-3 mr-1" />
                                    Rented
                                  </Badge>
                                )}
                                
                                {/* Property Type Badge */}
                                <Badge className="bg-blue-100 text-blue-800 border border-blue-300 shadow-sm px-3 py-1 text-xs font-semibold rounded-full">
                                  {property.details.type === 'house' ? (
                                    <>
                                      <Home className="w-3 h-3 mr-1" />
                                      house
                                    </>
                                  ) : property.details.type === 'land' ? (
                                    <>
                                      <TreePine className="w-3 h-3 mr-1" />
                                      land
                                    </>
                                  ) : (
                                    <>
                                      <Building className="w-3 h-3 mr-1" />
                                      {property.details.type}
                                    </>
                                  )}
                                </Badge>
                                
                                {/* Payment Type Badge */}
                                {property.listingType === 'installment' && (
                                  <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-0 px-3 py-1 text-xs font-semibold">
                                    Installments
                                  </Badge>
                                )}
                                {property.listingType === 'sale' && (
                                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-0 px-3 py-1 text-xs font-semibold">
                                    Cash Sale
                                  </Badge>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    size="icon"
                                    variant="secondary"
                                    className="bg-white/95 hover:bg-white shadow-md backdrop-blur-sm border border-slate-200"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const success = await unsaveProperty(user.id, property.id);
                                        if (success) {
                                          await fetchSavedProperties();
                                        }
                                      } catch (error) {
                                        console.error('Error unsaving property:', error);
                                      }
                                    }}
                                  >
                                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                                  </Button>
                                </motion.div>
                              </div>

                              {/* Price Badge */}
                              <div className="absolute bottom-4 left-4">
                                <div className="bg-gradient-to-br from-white via-white to-slate-50 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-slate-200">
                                  <div className="text-xl font-bold text-slate-900">
                                    {formatCurrency(property.financials.price)}
                                  </div>
                                  {property.financials.monthlyInstallment && (
                                    <div className="text-sm text-slate-600 font-medium">
                                      {formatCurrency(property.financials.monthlyInstallment)}<span className="text-xs">/month</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Property Details */}
                            <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
                              <div className="space-y-4 flex-1">
                                {/* Title and Location */}
                                <div className="space-y-2">
                                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-[#7F1518] transition-colors line-clamp-2 leading-tight">
                                    {property.title}
                                  </h3>
                                  <div className="flex items-center text-slate-600">
                                    <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-slate-500" />
                                    <span className="text-sm font-medium">{property.location.suburb}, {property.location.city}</span>
                                  </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100"></div>

                                {/* Property Stats */}
                                <div className="flex items-center justify-between text-sm bg-slate-50 rounded-lg p-3">
                                  <div className="flex items-center gap-1">
                                    <Bed className="w-4 h-4 text-slate-600" />
                                    <span className="font-semibold text-slate-800">{property.details.bedrooms || 0}</span>
                                    <span className="text-slate-600 text-xs">bed{(property.details.bedrooms || 0) !== 1 ? 's' : ''}</span>
                                  </div>
                                  <div className="w-px h-4 bg-slate-300"></div>
                                  <div className="flex items-center gap-1">
                                    <Bath className="w-4 h-4 text-slate-600" />
                                    <span className="font-semibold text-slate-800">{property.details.bathrooms || 0}</span>
                                    <span className="text-slate-600 text-xs">bath{(property.details.bathrooms || 0) !== 1 ? 's' : ''}</span>
                                  </div>
                                  <div className="w-px h-4 bg-slate-300"></div>
                                  <div className="flex items-center gap-1">
                                    <Square className="w-4 h-4 text-slate-600" />
                                    <span className="font-semibold text-slate-800">{property.details.size.toLocaleString()}</span>
                                    <span className="text-slate-600 text-xs">m²</span>
                                  </div>
                                </div>

                                {/* Features */}
                                {property.details.features && property.details.features.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {property.details.features.slice(0, 3).map((feature: string, idx: number) => (
                                      <Badge key={idx} variant="outline" className="text-xs border-slate-300 text-slate-700 bg-white hover:bg-slate-50">
                                        {feature}
                                      </Badge>
                                    ))}
                                    {property.details.features.length > 3 && (
                                      <Badge variant="outline" className="text-xs border-slate-300 text-slate-700 bg-white">
                                        +{property.details.features.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Owner Info */}
                                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <div className="w-8 h-8 bg-gradient-to-br from-[#7F1518] to-[#6A1214] rounded-full flex items-center justify-center shadow-sm">
                                      <span className="text-xs font-bold text-white">
                                        {property.seller.name[0]}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium text-slate-800">{property.seller.name}</span>
                                      {property.seller.isVerified && (
                                        <span className="flex items-center text-xs text-green-600">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Verified Seller
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                    <Eye className="w-3 h-3" />
                                    <span className="text-xs font-medium">{property.views}</span>
                                  </div>
                                </div>

                                {/* Saved Notes */}
                                {saved.notes && (
                                  <div className="pt-2 border-t border-slate-100">
                                    <p className="text-xs text-slate-600 italic">"{saved.notes}"</p>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="pt-4 mt-auto">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/property/${property.id}`);
                                  }}
                                  className="w-full bg-gradient-to-r from-[#7F1518] to-[#6A1214] hover:from-[#6A1214] hover:to-[#5A0F11] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                  size="sm"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Offers Section */}
      {activeSection === 'offers' && (
        <BuyerOffers
          user={user}
          refreshTrigger={offersRefreshTrigger}
          onViewOffer={(offer) => {
            // Show offer details modal with full offer data
            setSelectedOffer(offer);
            setShowOfferDetailsModal(true);
          }}
          onViewProperty={(propertyId) => {
            // Handle special case for browse properties
            if (propertyId === 'browse') {
              navigateWithScrollToTop(router, '/listings');
            } else {
              // Navigate to property details page
              router.push(`/property/${propertyId}`);
            }
          }}
          onMakePayment={(offer) => {
            // Open payment modal for approved offers
            handleMakePayment(offer);
          }}
        />
      )}

      {/* Messages Section */}
      {activeSection === 'messages' && (
        <BuyerMessages
          user={user}
          onViewProperty={onViewProperty}
        />
      )}



      {/* Documents Section */}
      {activeSection === 'documents' && (
        <Card>
          <CardHeader>
            <CardTitle>My Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">
              Here you can manage your uploaded documents, such as ID copies, bank statements, and proof of income.
              This feature is under development.
            </p>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Uploaded Documents</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                  <h5 className="text-sm font-medium text-slate-900 mb-1">ID Copy</h5>
                  <p className="text-xs text-slate-500">Uploaded on: 2023-10-20</p>
                  <p className="text-xs text-slate-500">Status: Verified</p>
        </div>
                <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                  <h5 className="text-sm font-medium text-slate-900 mb-1">Bank Statement</h5>
                  <p className="text-xs text-slate-500">Uploaded on: 2023-10-15</p>
                  <p className="text-xs text-slate-500">Status: Verified</p>
      </div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Upload New Document</h4>
              <p className="text-sm text-slate-500">
                You can upload your documents here to verify your identity and financial status.
                This will help streamline your property application process.
              </p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                Upload Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financing Section */}
      {activeSection === 'financing' && (
        <Card>
        <CardHeader>
            <CardTitle>Financing Pre-Approval</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-slate-500">
              Your current financing pre-approval status and details.
              This feature is under development.
            </p>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Your Pre-Approval Status</h4>
              <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-900 font-medium">R{mockFinancialProfile.preApprovedAmount.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Pre-Approved Amount</p>
                <p className="text-xs text-slate-500">Risk Level: {mockFinancialProfile.riskLevel}</p>
                <p className="text-xs text-slate-500">Last Updated: {mockFinancialProfile.lastUpdated.toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Financing Details</h4>
              <p className="text-sm text-slate-500">
                Your current financing pre-approval details, including your pre-approved amount,
                risk level, and last updated date. This information is crucial for property
                applications and will be used to determine your eligibility.
              </p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                View Financing Details
              </Button>
          </div>
        </CardContent>
      </Card>
      )}


      {/* Settings Section */}
      {activeSection === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">
              Manage your account settings, preferences, and notifications.
            </p>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Dark Mode</h4>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <SunIcon className="w-4 h-4" />
                <span>Enable Dark Mode</span>
                <input
                  type="checkbox"
                  checked={darkModeEnabled}
                  onChange={(e) => setDarkModeEnabled(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
          </div>
      </div>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Account</h4>
              <Button 
                className="w-full bg-red-800 hover:bg-red-900 text-white" 
                onClick={() => console.log('Logout clicked')}
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </main>

      {/* Make Offer Modal */}
      {showMakeOfferModal && selectedProperty && (
        <MakeOfferModal
          isOpen={showMakeOfferModal}
          onClose={() => {
            setShowMakeOfferModal(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
          user={user}
          onSubmit={async (offerData) => {
            console.log('Offer submitted:', offerData);
            // The modal handles the submission internally
            // Refresh the live properties to show updated status
            await fetchLiveProperties();
          }}
          onViewOffers={() => {
            setShowMakeOfferModal(false);
            setSelectedProperty(null);
            setActiveSection('offers');
          }}
        />
      )}

      {/* Offer Details Modal */}
      {showOfferDetailsModal && selectedOffer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-lg shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Offer Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowOfferDetailsModal(false);
                    setSelectedOffer(null);
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Property Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Property</h3>
                  <p className="text-gray-700">{selectedOffer.property?.title || 'Property Not Found'}</p>
                  <p className="text-sm text-gray-600">
                    {(selectedOffer.property?.location?.suburb ? `${selectedOffer.property.location.suburb}, ` : '')}{selectedOffer.property?.location?.city || 'Unknown City'}, {selectedOffer.property?.location?.country || 'Unknown Country'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-2">
                    Offer #: {selectedOffer.offer_reference || '—'}
                  </p>
                </div>

                {/* Offer Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Your Offer</h4>
                    <p className="text-2xl font-bold text-blue-800">
                      ${selectedOffer.offer_price?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Deposit</h4>
                    <p className="text-2xl font-bold text-green-800">
                      ${selectedOffer.deposit_amount?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
                    <p className="text-gray-700 capitalize">{selectedOffer.payment_method || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                    <p className="text-gray-700">
                      {selectedOffer.estimated_timeline === 'ready_to_pay_in_full' 
                        ? 'Ready to pay in full' 
                        : selectedOffer.estimated_timeline ? `${selectedOffer.estimated_timeline.replace('_months', '')} months` : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <Badge className={
                    selectedOffer.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedOffer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    selectedOffer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedOffer.status?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                </div>

                {/* Additional Notes */}
                {selectedOffer.additional_notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                      {selectedOffer.additional_notes}
                    </p>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedOffer.status === 'rejected' && selectedOffer.rejection_reason && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">Rejection Reason</h4>
                    <p className="text-red-800">{selectedOffer.rejection_reason}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Submitted: {selectedOffer.submitted_at ? new Date(selectedOffer.submitted_at).toLocaleDateString() : 'N/A'}</p>
                  {selectedOffer.admin_reviewed_at && (
                    <p className={selectedOffer.status === 'approved' ? 'text-green-700 font-medium' : ''}>
                      {selectedOffer.status === 'approved' ? 'Approved' : 'Reviewed'}: {new Date(selectedOffer.admin_reviewed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedOfferForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOfferForPayment(null);
          }}
          offer={selectedOfferForPayment}
          user={user}
          onSubmit={handlePaymentSubmit}
        />
      )}

      {/* General Inquiry Modal */}
      <GeneralInquiryModal
        isOpen={showGeneralInquiryModal}
        onClose={() => setShowGeneralInquiryModal(false)}
        user={user}
      />
    </div>
  );
}; 