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
  Plus
} from 'lucide-react';
import { Camera as CameraIcon, Sun as SunIcon, LogOut as LogOutIcon, Pencil as PencilIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PropertyListings } from '@/components/property/PropertyListings';
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
                    R{recommendation.propertyData.price.toLocaleString()}
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
  onViewProperty,
  onViewApplication,
  onStartNewApplication,
  onViewMarketInsights
}) => {
  const verificationStatus = getVerificationStatus(user);
  const isVerified = isFullyVerified(user);
  const [showCongratulations, setShowCongratulations] = React.useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = React.useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [isLoadingOverview, setIsLoadingOverview] = React.useState(true);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = React.useState(true);
  const [showMapView, setShowMapView] = React.useState(false);
  const [savedPropertyIds, setSavedPropertyIds] = React.useState<string[]>([]);
  const [uploadingDocs, setUploadingDocs] = React.useState(false);
  const [paymentPrincipal, setPaymentPrincipal] = React.useState<number>(mockFinancialProfile.preApprovedAmount);
  const [paymentRateAnnual, setPaymentRateAnnual] = React.useState<number>(12);
  const [paymentTermYears, setPaymentTermYears] = React.useState<number>(20);

  // Check if user has seen the congratulations message - only once on mount
  React.useEffect(() => {
    if (isVerified && !hasCheckedStorage) {
      const hasSeenCongratulations = localStorage.getItem(`congratulations-${user.id}`);
      if (!hasSeenCongratulations) {
        setShowCongratulations(true);
        localStorage.setItem(`congratulations-${user.id}`, 'true');
      }
      setHasCheckedStorage(true);
    }
  }, [isVerified, user.id, hasCheckedStorage]);

  const handleCloseCongratulations = () => {
    setShowCongratulations(false);
  };

  // Temporary debug function - remove this after testing
  const resetCongratulations = () => {
    localStorage.removeItem(`congratulations-${user.id}`);
    setHasCheckedStorage(false);
    setShowCongratulations(false);
    console.log('Congratulations state reset');
  };

  // Debug logging
  React.useEffect(() => {
    if (isVerified) {
      const hasSeen = localStorage.getItem(`congratulations-${user.id}`);
      console.log('Verification check:', { 
        isVerified, 
        hasSeenCongratulations: hasSeen, 
        userId: user.id 
      });
    }
  }, [isVerified, user.id]);

  // Simulated loading states
  React.useEffect(() => {
    const t1 = setTimeout(() => setIsLoadingOverview(false), 500);
    const t2 = setTimeout(() => setIsLoadingDiscovery(false), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const monthlyPaymentEstimate = React.useMemo(() => {
    const principal = paymentPrincipal;
    const monthlyRate = paymentRateAnnual / 100 / 12;
    const n = paymentTermYears * 12;
    if (monthlyRate === 0 || n === 0) return 0;
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, n);
    const denominator = Math.pow(1 + monthlyRate, n) - 1;
    return Math.round(numerator / denominator);
  }, [paymentPrincipal, paymentRateAnnual, paymentTermYears]);

  if (!isVerified) {
    return null; // This component is only for verified users
  }

  // Sidebar navigation removed per request

  return (
    <div className="min-h-screen bg-slate-50 pl-80 overflow-x-hidden">
      {/* Left Sidebar */}
      <aside className="hidden md:block fixed left-0 top-24 z-30 w-80 h-[calc(100vh-8rem)] bg-white border border-slate-200 rounded-2xl shadow-lg overflow-y-auto">
        <div className="flex flex-col">
        {/* Profile Section */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" alt={user.firstName} />
                <AvatarFallback className="bg-red-600 text-white text-xl font-semibold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow">
                <CameraIcon className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-slate-900 font-semibold text-lg">{user.firstName} {user.lastName}</div>
              <div className="text-sm text-slate-500 truncate max-w-[14rem]">{user.email}</div>
            </div>
          </div>
        </div>

        {/* KYC Progress */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Verified Member</span>
          </div>
          <Progress value={75} className="h-2" />
          <div className="text-xs text-slate-600 mt-2">
            You can contact sellers and list properties
          </div>
        </div>

        {/* Quick Settings */}
        <div className="px-4 py-3 border-b border-slate-200 space-y-3">
          <div className="text-xs font-medium text-slate-500">Quick Settings</div>
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-slate-700">
              <SunIcon className="w-4 h-4" />
              <span>Dark Mode</span>
            </div>
            <button
              onClick={() => setDarkModeEnabled((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${darkModeEnabled ? 'bg-red-600' : 'bg-slate-300'}`}
              aria-pressed={darkModeEnabled}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${darkModeEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
            <button
              onClick={() => setNotificationsEnabled((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notificationsEnabled ? 'bg-red-600' : 'bg-slate-300'}`}
              aria-pressed={notificationsEnabled}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${notificationsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Account Overview */}
        <div className="px-4 py-3 border-b border-slate-200 space-y-3">
          <div className="text-xs font-medium text-slate-500">Account Overview</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="text-xs text-green-700">Verifications</div>
              <div className="text-lg font-semibold text-green-700">3/3</div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="text-xs text-blue-700">KYC Status</div>
              <div className="text-lg font-semibold text-blue-700">Approved</div>
            </div>
          </div>
          <Button className="w-full bg-red-600 hover:bg-red-700">
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </Button>
            <Button variant="outline" className="w-full">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
          </div>
          <Button variant="ghost" className="text-red-600 justify-start">
            <LogOutIcon className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Navigation removed */}
        
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main w-full px-6 lg:px-8 pb-8 space-y-8">
      {/* Congratulations Popup - Only shows once */}
      <AnimatePresence>
        {showCongratulations && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white rounded-lg shadow-xl border border-green-400 p-4 max-w-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Full Verification Complete!</h3>
                  <Trophy className="w-4 h-4 text-yellow-300" />
                </div>
                <p className="text-sm text-green-100 mb-2">
                  You now have access to all platform features
                </p>
                <div className="flex items-center gap-2 text-xs text-green-200">
                  <CheckCircle className="w-3 h-3" />
                  <span>Premium membership status</span>
                </div>
              </div>
              <button
                onClick={handleCloseCongratulations}
                className="text-green-100 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Header */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <div className="text-slate-800 font-semibold">Welcome back, {user.firstName}</div>
            <div className="text-xs text-slate-500">You're fully verified. Explore properties and manage your journey.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="Notifications"
            className="relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onStartNewApplication}>
            Continue Application
          </Button>
          <Button size="sm" variant="outline" onClick={() => onViewMarketInsights()}>Market Insights</Button>
        </div>
        </div>

      {/* Hero Section: Financial Overview & Quick Actions */}
      <div className="buying-power-section grid grid-cols-1 xl:grid-cols-3 gap-8" aria-label="Financial overview">
        <div className="xl:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center justify-between">
                <span>Buying Power</span>
                <Badge className="bg-blue-50 text-blue-700 border border-blue-200">Updated {new Date().toLocaleDateString()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingOverview ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-slate-200 rounded" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-2 bg-slate-200 rounded" />
                </div>
              ) : (
              <div className="space-y-4">
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                    R{mockFinancialProfile.preApprovedAmount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600">Pre-approved amount</div>
                  <Progress value={65} className="h-2" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-slate-500">Available Credit</div>
                      <div className="text-lg font-semibold text-green-700">R{(mockFinancialProfile.preApprovedAmount * 0.35).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Cash Balance</div>
                      <div className="text-lg font-semibold text-blue-700">R{(mockFinancialProfile.disposableIncome * 3).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Credit Score</div>
                      <div className="text-lg font-semibold text-emerald-700">{mockFinancialProfile.creditScore}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">DTI Ratio</div>
                      <div className="text-lg font-semibold text-slate-800">{Math.round(mockFinancialProfile.debtToIncomeRatio * 100)}%</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onStartNewApplication()}>Browse Properties</Button>
                    <Button size="sm" variant="outline" onClick={() => onStartNewApplication()}>Make Offer</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowMapView(true)}>Map View</Button>
                  </div>
              </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="xl:col-span-1">
          <FinancialSummaryCard profile={mockFinancialProfile} />
        </div>
      </div>

      {/* Property Discovery Hub */}
      <Card className="property-discovery w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Discover Properties</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant={showMapView ? 'default' : 'outline'} onClick={() => setShowMapView((v) => !v)} aria-pressed={showMapView}>
                {showMapView ? 'Show List' : 'Show Map'}
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onStartNewApplication}>View All Properties</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingDiscovery ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-40 bg-slate-200 rounded" />
                  <div className="h-3 bg-slate-200 rounded mt-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Featured Carousel */}
              <div className="overflow-x-auto -mx-2 px-2 w-full">
                <div className="flex gap-4" role="list">
                  {mockRecommendations.filter(r => r.type === 'property' && r.propertyData).map((r) => (
                    <div key={r.id} role="listitem" className="min-w-[260px] bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <div className="h-36 bg-slate-200 relative">
                        <img src={r.propertyData!.imageUrl} alt={r.title} className="w-full h-full object-cover" loading="lazy" />
                        <Badge className="absolute top-2 left-2 bg-emerald-600 text-white">Featured</Badge>
                      </div>
                      <div className="p-3">
                        <div className="font-semibold text-slate-800 text-sm">{r.propertyData!.address}</div>
                        <div className="text-xs text-slate-500">R{r.propertyData!.price.toLocaleString()}</div>
                        <div className="pt-2">
                          <Button size="sm" className="w-full" onClick={() => onViewProperty(r.propertyData!.id)}>View</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onAction={() => {
                  if (recommendation.propertyData) {
                    onViewProperty(recommendation.propertyData.id);
                  } else {
                    console.log('Action clicked:', recommendation.id);
                  }
                }}
              />
            ))}
          </div>

              {/* Embedded listings (compact) */}
              {!showMapView && (
                <div className="pt-2 w-full">
                  <PropertyListings
                    user={user as any}
                    showFeatured={true}
                    onPropertySelect={(p) => onViewProperty(p.id)}
                    onSignUpPrompt={() => {}}
                  />
                </div>
              )}

              {showMapView && (
                <div className="h-72 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 w-full">
                  Map view coming soon
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Transactions Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Active Transactions
            <Badge className="ml-2">{mockApplications.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {mockApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onView={() => onViewApplication(application.id)}
                />
              ))}
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-800 mb-2">Upcoming Payment</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-slate-900">R8,500</div>
                  <div className="text-xs text-slate-500">Due on {new Date(Date.now() + 1000*60*60*24*7).toLocaleDateString()}</div>
                </div>
                <Progress value={40} className="h-2 mt-3" />
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1">Pay Now</Button>
                  <Button size="sm" variant="outline" className="flex-1">View Schedule</Button>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-800 mb-2">Payment History</div>
                <div className="space-y-2 text-sm">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-slate-600">Payment {i}</span>
                      <span className="text-slate-800 font-medium">R8,500</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => console.log('Download statements')}>Download Statements</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Avg Price -2%', 'New Listings +5%', 'Days on Market -3', 'Interest Rate 12%'].map((t) => (
                <div key={t} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700">{t}</div>
              ))}
            </div>
            <div className="mt-4 h-40 bg-gradient-to-r from-blue-50 to-green-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500">
              Trend chart coming soon
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Affordability & Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Principal</span>
                <input aria-label="Principal" type="number" className="w-28 border rounded px-2 py-1 text-right" value={paymentPrincipal} onChange={(e) => setPaymentPrincipal(Math.max(0, Number(e.target.value) || 0))} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Rate (APR %)</span>
                <input aria-label="Rate" type="number" className="w-28 border rounded px-2 py-1 text-right" value={paymentRateAnnual} onChange={(e) => setPaymentRateAnnual(Math.max(0, Number(e.target.value) || 0))} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Term (years)</span>
                <input aria-label="Term" type="number" className="w-28 border rounded px-2 py-1 text-right" value={paymentTermYears} onChange={(e) => setPaymentTermYears(Math.max(1, Number(e.target.value) || 1))} />
              </div>
              <div className="pt-2">
                <div className="text-xs text-slate-500">Estimated Payment</div>
                <div className="text-xl font-bold text-slate-900">R{monthlyPaymentEstimate.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

      {/* Quick Access Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-slate-800">Saved Properties</div>
                <Badge>{savedPropertyIds.length}</Badge>
              </div>
              <div className="text-sm text-slate-600">Quickly access your favorites</div>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => onStartNewApplication()}>View</Button>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="font-semibold text-slate-800 mb-2">Recent Views</div>
              <div className="space-y-2 text-sm text-slate-600">
                {['123 Oak St', '456 Pine Ave', '789 Maple Dr'].map((addr) => (<div key={addr} className="flex items-center justify-between"><span>{addr}</span><span className="text-xs text-slate-500">Today</span></div>))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="font-semibold text-slate-800 mb-2">Documents</div>
              <div className="text-sm text-slate-600">Upload purchase requirements</div>
              <div className="mt-3">
                <label className="inline-flex items-center justify-center px-3 py-2 border rounded cursor-pointer text-sm bg-slate-50 hover:bg-slate-100">
                  <input type="file" className="hidden" onChange={() => { setUploadingDocs(true); setTimeout(() => setUploadingDocs(false), 1200); }} aria-label="Upload document" />
                  {uploadingDocs ? 'Uploading...' : 'Upload PDF'}
                </label>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="font-semibold text-slate-800 mb-2">Messages</div>
              <div className="space-y-2">
                {[{ from: 'Agent Nia', text: 'New viewing slots available' }, { from: 'Seller Tom', text: 'Offer received' }].map((m, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="font-medium text-slate-700">{m.from}</div>
                    <div className="text-slate-500">{m.text}</div>
          </div>
                ))}
        </div>
              <Button size="sm" variant="outline" className="mt-3">Open Inbox</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </main>
    </div>
  );
}; 