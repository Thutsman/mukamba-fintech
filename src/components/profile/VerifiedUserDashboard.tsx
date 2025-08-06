'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  TrendingUp, 
  Home, 
  DollarSign, 
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
  Zap,
  Sparkles,
  Trophy,
  Gift,
  Lightbulb,
  Plus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4 hover:shadow-lg transition-all duration-300"
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
          <div className="bg-white rounded-lg p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
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
  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-green-800">
        <TrendingUp className="w-5 h-5" />
        Financial Summary
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {profile.creditScore}
          </div>
          <div className="text-xs text-green-700">Credit Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            R{profile.preApprovedAmount.toLocaleString()}
          </div>
          <div className="text-xs text-blue-700">Pre-Approved Amount</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Monthly Income:</span>
          <span className="font-medium">R{profile.monthlyIncome.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Monthly Expenses:</span>
          <span className="font-medium">R{profile.monthlyExpenses.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm border-t pt-2">
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

  if (!isVerified) {
    return null; // This component is only for verified users
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user.firstName}! 🎉</h2>
            <p className="text-purple-100">You're fully verified and ready to find your dream home</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge className="bg-green-500 text-white border-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Fully Verified
          </Badge>
          <Badge className="bg-blue-500 text-white border-blue-400">
            <Star className="w-3 h-3 mr-1" />
            Premium Access
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Summary */}
        <div className="lg:col-span-1">
          <FinancialSummaryCard profile={mockFinancialProfile} />
        </div>

        {/* Active Applications */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Active Applications
                <Badge className="ml-2">{mockApplications.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onView={() => onViewApplication(application.id)}
                  />
                ))}
                
                <Button
                  onClick={onStartNewApplication}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Smart Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Smart Recommendations
            <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500">
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onAction={() => {
                  if (recommendation.propertyData) {
                    onViewProperty(recommendation.propertyData.id);
                  } else {
                    // Handle other action types
                    console.log('Action clicked:', recommendation.id);
                  }
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center gap-2"
          onClick={onViewMarketInsights}
        >
          <BarChart3 className="w-6 h-6" />
          <span>Market Insights</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center gap-2"
        >
          <Heart className="w-6 h-6" />
          <span>Saved Properties</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center gap-2"
        >
          <MessageCircle className="w-6 h-6" />
          <span>Messages</span>
        </Button>
      </div>
    </div>
  );
}; 