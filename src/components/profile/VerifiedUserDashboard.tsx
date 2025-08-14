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
  Search
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
  const isVerified = isFullyVerified(user);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [activeSection, setActiveSection] = React.useState<'overview' | 'searches' | 'saved' | 'applications' | 'messages' | 'documents' | 'financing' | 'profile' | 'settings'>('overview');

  // Mock data for metrics and lists
  interface BuyerStats {
    savedCount: number;
    activeApps: number;
    viewsThisMonth: number;
    viewsGrowthPct: number;
    budgetApproved: number;
  }
  interface RecentActivityItem { text: string; time: string }
  interface PreviewProperty { id: string; title: string; address: string; price: number; beds: number; baths: number; area: number; imageUrl?: string }

  const stats: BuyerStats = {
    savedCount: 8,
    activeApps: 2,
    viewsThisMonth: 745,
    viewsGrowthPct: 15,
    budgetApproved: 2500000,
  };

  const recentActivities: RecentActivityItem[] = [
    { text: 'Property viewed: 3BR House in Sandton', time: '2 hours ago' },
    { text: 'Application submitted for property in Rosebank', time: '5 hours ago' },
    { text: 'New property matching your criteria available', time: '1 day ago' },
    { text: 'Financing pre-approval updated', time: '2 days ago' },
  ];

  const previews: PreviewProperty[] = [
    { id: 'p1', title: '3BR House', address: 'Sandton, Johannesburg', price: 1800000, beds: 3, baths: 2, area: 180 },
    { id: 'p2', title: '2BR Apartment', address: 'Rosebank, Johannesburg', price: 1250000, beds: 2, baths: 1, area: 95 },
    { id: 'p3', title: '4BR House', address: 'Bryanston, Johannesburg', price: 2650000, beds: 4, baths: 3, area: 240 },
  ];

  if (!isVerified) {
    return null; // This component is only for verified users
  }

  // Sidebar navigation removed per request

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Sidebar */}
      <aside className="hidden md:block fixed left-6 top-24 z-30 w-72 h-[calc(100vh-8rem)] bg-white border border-slate-200 rounded-2xl shadow-lg overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex flex-col items-center text-center">
          <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={user.firstName} />
            <AvatarFallback className="bg-red-600 text-white text-lg font-semibold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
          <div className="mt-2">
            <div className="text-slate-900 font-semibold">{user.firstName} {user.lastName}</div>
            <div className="text-xs text-slate-500 truncate max-w-[12rem]">{user.email}</div>
            <Badge className="mt-2 bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Verified Buyer</Badge>
          </div>
        </div>
        <div className="px-3 py-3 border-b border-slate-200">
          <div className="text-xs font-medium text-slate-500 mb-2">Quick Settings</div>
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-2">
            <div className="flex items-center gap-2 text-slate-700"><SunIcon className="w-4 h-4"/>Dark Mode</div>
            <button onClick={()=>setDarkModeEnabled(v=>!v)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${darkModeEnabled?'bg-red-600':'bg-slate-300'}`}
              aria-pressed={darkModeEnabled}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${darkModeEnabled?'translate-x-5':'translate-x-1'}`}/>
            </button>
          </div>
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-slate-700"><Bell className="w-4 h-4"/>Notifications</div>
            <button onClick={()=>setNotificationsEnabled(v=>!v)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notificationsEnabled?'bg-red-600':'bg-slate-300'}`}
              aria-pressed={notificationsEnabled}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${notificationsEnabled?'translate-x-5':'translate-x-1'}`}/>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {[
            {key:'overview', label:'Overview', icon:Home},
            {key:'searches', label:'Property Searches', icon:Search},
            {key:'saved', label:'Saved Properties', icon:Bookmark},
            {key:'applications', label:'Applications', icon:FileText},
            {key:'messages', label:'Messages', icon:MessageCircle},
            {key:'documents', label:'Documents', icon:FileText},
            {key:'financing', label:'Financing', icon:Calculator},
            {key:'profile', label:'Profile', icon:UserIcon},
            {key:'settings', label:'Settings', icon:SettingsIcon},
          ].map((item:any)=>{
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={()=>setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeSection===item.key?'bg-red-50 text-red-700 border border-red-200':'text-slate-700 hover:bg-slate-50'}`}> 
                <Icon className={activeSection===item.key?'w-4 h-4 text-red-600':'w-4 h-4 text-slate-500'}/>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="dashboard-main flex-1 md:ml-[19rem] w-full px-4 md:px-6 lg:px-8 pb-10 space-y-8 overflow-x-hidden">
        {/* Header */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><UserIcon className="w-5 h-5 text-blue-700"/></div>
            <div>
              <div className="text-slate-800 font-semibold">Welcome, Verified Buyer</div>
              <div className="text-xs text-slate-500">{user.email}</div>
          </div>
        </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/>Verified</Badge>
            <Button className="bg-red-600 hover:bg-red-700" size="sm" onClick={onStartNewApplication}>Start New Search</Button>
        </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 px-1 md:px-0">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wide text-slate-600">Saved Properties</div>
                <Bookmark className="w-4 h-4 text-blue-600"/>
              </div>
              <div className="text-2xl font-bold">{stats.savedCount}</div>
              <div className="text-xs text-slate-500">Properties Bookmarked • +2 this month</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wide text-slate-600">Active Applications</div>
                <FileText className="w-4 h-4 text-emerald-600"/>
              </div>
              <div className="text-2xl font-bold">{stats.activeApps}</div>
              <div className="text-xs text-slate-500">Under Review • Pending</div>
        </CardContent>
      </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wide text-slate-600">Property Views</div>
                <Eye className="w-4 h-4 text-purple-600"/>
              </div>
              <div className="text-2xl font-bold">{stats.viewsThisMonth}</div>
              <div className="text-xs text-slate-500">This Month • +{stats.viewsGrowthPct}% from last month</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wide text-slate-600">Budget Approved</div>
                <DollarSign className="w-4 h-4 text-green-700"/>
              </div>
              <div className="text-2xl font-bold">R{stats.budgetApproved.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Financing Pre-approved • Verified by Bank</div>
        </CardContent>
      </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Button variant="outline" className="flex items-center gap-2" onClick={onStartNewApplication}><Home className="w-4 h-4"/>Browse Properties</Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={()=>setActiveSection('applications')}><FileText className="w-4 h-4"/>View Applications</Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={()=>setActiveSection('messages')}><MessageCircle className="w-4 h-4"/>Messages</Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={()=>setActiveSection('financing')}><Calculator className="w-4 h-4"/>Financing</Button>
            </div>
          </CardContent>
        </Card>

        {/* Recently Viewed Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recently Viewed Properties</span>
              <Button size="sm" variant="outline" onClick={onStartNewApplication}>View All Properties</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {previews.map((p)=> (
                <div key={p.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="h-36 bg-slate-200 w-full"/>
                  <div className="p-3">
                    <div className="font-semibold text-slate-800 text-sm truncate" title={`${p.title} • ${p.address}`}>{p.title} • {p.address}</div>
                    <div className="text-xs text-slate-500 mb-1">R{p.price.toLocaleString()}</div>
                    <div className="text-xs text-slate-500 mb-2 flex gap-3">
                      <span>{p.beds} Beds</span>
                      <span>{p.baths} Baths</span>
                      <span>{p.area} m²</span>
                    </div>
                    <Button size="sm" className="w-full" onClick={()=>onViewProperty(p.id)}>View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
              {recentActivities.map((a, idx)=> (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{a.text}</span>
                  <span className="text-slate-500">{a.time}</span>
          </div>
                ))}
          </div>
        </CardContent>
      </Card>
      </main>
    </div>
  );
}; 