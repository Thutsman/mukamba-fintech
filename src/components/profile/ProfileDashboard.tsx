'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  CreditCard, 
  Home, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Star,
  Lock,
  Unlock,
  ArrowLeft,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  X,
  Camera,
  Edit,
  Moon,
  Sun,
  HelpCircle,
  Loader2,
  Lightbulb,
  Target,
  Building,
  TrendingUp,
  Gift,
  Zap,
  Info,
  Play,
  ChevronRight,
  Trophy,
  Sparkles,
  MessageCircle,
  DollarSign,
  Clock,
  Calculator,
  BarChart3,
  FileText,
  PlusCircle,
  Headphones,
  Eye,
  Heart,
  Calendar,
  MapPin,
  Search,
  Percent,
  TrendingDown,
  AlertTriangle,
  CheckSquare,
  Activity,
  Users,
  Award,
  Briefcase,
  HomeIcon,
  ShoppingCart,
  BookOpen,
  Globe
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  getUserLevel, 
  getUserPermissions, 
  getBuyerVerificationSteps, 
  getSellerVerificationSteps,
  getVerificationStatus,
  isFullyVerified,
  type User as UserType,
  type UserRole,
  type VerificationStep
} from '@/types/auth';
import { useAuthStore } from '@/lib/store';

// Verification Modals
import { PhoneVerificationModal } from '@/components/forms/PhoneVerificationModal';
import { IdentityVerificationModal } from '@/components/forms/IdentityVerificationModal';
import { FinancialAssessmentModal } from '@/components/forms/FinancialAssessmentModal';
import { PropertyDocumentationModal } from '@/components/forms/PropertyDocumentationModal';
import { PropertyListingModal } from '@/components/forms/PropertyListingModal';

import { VerifiedUserDashboard } from './VerifiedUserDashboard';

interface ProfileDashboardProps {
  user: UserType;
  onStartVerification: (type: 'buyer' | 'seller', step: string) => void;
  onBackToHome?: () => void;
  onProfileSettings?: () => void;
  onLogout?: () => void;
  isNewUser?: boolean;
}

// Smart Recommendation System
const useSmartRecommendations = (user: UserType, selectedRole: 'buyer' | 'seller' | null) => {
  const userLevel = getUserLevel(user);
  const permissions = getUserPermissions(user);
  const buyerSteps = getBuyerVerificationSteps(user);
  const sellerSteps = getSellerVerificationSteps(user);

  const getRecommendations = () => {
    const recommendations = [];
    const kycLevel = user.kyc_level || 'none';
    const buyerType = user.buyer_type;
    const isSeller = user.roles.includes('seller');

    // Email-Only Users (KYC: 'email')
    if (kycLevel === 'email' || kycLevel === 'none') {
      recommendations.push({
        id: 'verify-phone',
        type: 'primary',
        title: 'Verify Your Phone Number',
        description: 'Enable direct communication with property owners',
        action: 'Start Phone Verification',
        priority: 1,
        icon: <Phone className="w-4 h-4" />,
        benefit: 'Unlock messaging and notifications',
        timeRequired: '2 minutes',
        difficulty: 'Easy',
        whatYoullUnlock: 'Access seller contact info',
        badge: 'Recommended for you'
      });


    }

    // Phone-Verified Users (KYC: 'phone')
    else if (kycLevel === 'phone') {
      recommendations.push({
        id: 'verify-identity',
        type: 'primary',
        title: 'Complete Identity Verification',
        description: 'Build trust and access premium features',
        action: 'Upload ID Document',
        priority: 1,
        icon: <Shield className="w-4 h-4" />,
        benefit: 'Access financing options and exclusive listings',
        timeRequired: '3 minutes',
        difficulty: 'Moderate',
        whatYoullUnlock: 'Apply for installment purchases',
        badge: 'Recommended for you'
      });

      recommendations.push({
        id: 'property-alerts',
        type: 'secondary',
        title: 'Start Property Search with Alerts',
        description: 'Get notified about new properties matching your criteria',
        action: 'Set Up Alerts',
        priority: 2,
        icon: <Bell className="w-4 h-4" />,
        benefit: 'Never miss your perfect property',
        timeRequired: '2 minutes',
        difficulty: 'Easy',
        whatYoullUnlock: 'Custom property notifications'
      });

      recommendations.push({
        id: 'contact-owners',
        type: 'secondary',
        title: 'Contact Property Owners Directly',
        description: 'You can now message sellers directly',
        action: 'Start Messaging',
        priority: 3,
        icon: <MessageCircle className="w-4 h-4" />,
        benefit: 'Direct communication with sellers',
        timeRequired: 'Available now',
        difficulty: 'Easy',
        whatYoullUnlock: 'Direct seller communication',
        badge: 'Unlocked'
      });
    }

    // Identity-Verified Users
    else if (kycLevel === 'identity') {
      if (buyerType === 'cash') {
        recommendations.push({
          id: 'browse-exclusive',
          type: 'primary',
          title: 'Browse Exclusive Properties',
          description: 'Access premium properties for cash buyers',
          action: 'View Exclusive Listings',
          priority: 1,
          icon: <Star className="w-4 h-4" />,
          benefit: 'Priority access to premium properties',
          timeRequired: 'Available now',
          difficulty: 'Easy',
          whatYoullUnlock: 'Exclusive property access',
          badge: 'Recommended for you'
        });

        recommendations.push({
          id: 'property-alerts-premium',
          type: 'secondary',
          title: 'Set Up Premium Property Alerts',
          description: 'Get notified about exclusive cash buyer opportunities',
          action: 'Configure Alerts',
          priority: 2,
          icon: <Bell className="w-4 h-4" />,
          benefit: 'First access to new listings',
          timeRequired: '2 minutes',
          difficulty: 'Easy',
          whatYoullUnlock: 'Premium alert system'
        });

        recommendations.push({
          id: 'cash-buyer-status',
          type: 'secondary',
          title: 'Apply for Premium Cash Buyer Status',
          description: 'Get priority treatment from sellers',
          action: 'Apply Now',
          priority: 3,
          icon: <Trophy className="w-4 h-4" />,
          benefit: 'Priority with property owners',
          timeRequired: '5 minutes',
          difficulty: 'Moderate',
          whatYoullUnlock: 'Premium buyer status'
        });
      } else if (buyerType === 'installment') {
        recommendations.push({
          id: 'financial-assessment',
          type: 'primary',
          title: 'Complete Financial Assessment',
          description: 'Get pre-approved for installment purchase options',
          action: 'Start Assessment',
          priority: 1,
          icon: <TrendingUp className="w-4 h-4" />,
          benefit: 'Access to installment purchase financing',
          timeRequired: '5 minutes',
          difficulty: 'Comprehensive',
          whatYoullUnlock: 'Pre-approval for financing',
          badge: 'Recommended for you'
        });

        recommendations.push({
          id: 'calculate-installments',
          type: 'secondary',
          title: 'Calculate Installment Options',
          description: 'See your payment options for different properties',
          action: 'Use Calculator',
          priority: 2,
          icon: <Calculator className="w-4 h-4" />,
          benefit: 'Understand your payment options',
          timeRequired: '2 minutes',
          difficulty: 'Easy',
          whatYoullUnlock: 'Payment calculator access'
        });

        recommendations.push({
          id: 'pre-approval',
          type: 'secondary',
          title: 'Get Pre-Approved for Financing',
          description: 'Secure your financing before making offers',
          action: 'Apply for Pre-Approval',
          priority: 3,
          icon: <CreditCard className="w-4 h-4" />,
          benefit: 'Confidence in your buying power',
          timeRequired: '10 minutes',
          difficulty: 'Comprehensive',
          whatYoullUnlock: 'Pre-approval certificate'
        });
      }
    }

    // Financial-Verified Users
    else if (kycLevel === 'financial') {
      recommendations.push({
        id: 'start-applications',
        type: 'primary',
        title: 'Start Property Applications',
        description: 'Apply for properties with confidence',
        action: 'Browse & Apply',
        priority: 1,
        icon: <Home className="w-4 h-4" />,
        benefit: 'Full access to all properties',
        timeRequired: 'Available now',
        difficulty: 'Easy',
        whatYoullUnlock: 'Complete application access',
        badge: 'Recommended for you'
      });

      recommendations.push({
        id: 'market-insights',
        type: 'secondary',
        title: 'Access Market Insights',
        description: 'Get detailed market analysis and trends',
        action: 'View Insights',
        priority: 2,
        icon: <BarChart3 className="w-4 h-4" />,
        benefit: 'Make informed decisions',
        timeRequired: 'Available now',
        difficulty: 'Easy',
        whatYoullUnlock: 'Market analytics access'
      });

      recommendations.push({
        id: 'premium-support',
        type: 'secondary',
        title: 'Premium Support Access',
        description: 'Get priority customer support',
        action: 'Contact Support',
        priority: 3,
        icon: <Headphones className="w-4 h-4" />,
        benefit: 'Faster response times',
        timeRequired: 'Available now',
        difficulty: 'Easy',
        whatYoullUnlock: 'Priority support access'
      });
    }

    // Sellers
    if (isSeller) {
      if (!user.isPropertyVerified) {
        recommendations.unshift({
          id: 'property-documents',
          type: 'primary',
          title: 'Upload Property Documents',
          description: 'Verify your properties to attract serious buyers',
          action: 'Upload Documents',
          priority: 1,
          icon: <FileText className="w-4 h-4" />,
          benefit: 'Increased visibility and buyer trust',
          timeRequired: '5 minutes',
          difficulty: 'Moderate',
          whatYoullUnlock: 'Verified property status',
          badge: 'Recommended for you'
        });
      } else {
        recommendations.unshift({
          id: 'list-property',
          type: 'primary',
          title: 'List Your Property',
          description: 'Start attracting buyers to your property',
          action: 'Create Listing',
          priority: 1,
          icon: <PlusCircle className="w-4 h-4" />,
          benefit: 'Reach qualified buyers',
          timeRequired: '10 minutes',
          difficulty: 'Moderate',
          whatYoullUnlock: 'Property listing access',
          badge: 'Recommended for you'
        });
      }
    }

    return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 4);
  };

  return getRecommendations();
};

// Tooltip Component
const Tooltip: React.FC<{
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap max-w-xs ${
              position === 'top' ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2' :
              position === 'bottom' ? 'top-full mt-2 left-1/2 transform -translate-x-1/2' :
              position === 'left' ? 'right-full mr-2 top-1/2 transform -translate-y-1/2' :
              'left-full ml-2 top-1/2 transform -translate-y-1/2'
            }`}
          >
            {content}
            <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full -mt-1 left-1/2 -translate-x-1/2' :
              position === 'bottom' ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2' :
              position === 'left' ? 'left-full -ml-1 top-1/2 -translate-y-1/2' :
              'right-full -mr-1 top-1/2 -translate-y-1/2'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Progress Celebration Component
const ProgressCelebration: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  achievement: {
    title: string;
    description: string;
    icon: React.ReactNode;
    reward?: string;
  };
}> = ({ isVisible, onClose, achievement }) => {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-2xl max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
                >
                  {achievement.icon}
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
                  <p className="text-sm opacity-90">{achievement.description}</p>
                  {achievement.reward && (
                    <p className="text-xs bg-white/20 rounded-full px-2 py-1 mt-2 inline-block">
                      🎁 {achievement.reward}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Guided Tour Component
const GuidedTour: React.FC<{
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}> = ({ isActive, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const tourSteps = [
    {
      target: 'welcome-header',
      title: 'Welcome to Mukamba!',
      content: 'This is your personal dashboard where you can manage your profile and track your verification progress.',
      position: 'bottom' as const
    },
    {
      target: 'account-level',
      title: 'Your Account Level',
      content: 'Track your verification progress here. Complete more steps to unlock additional features.',
      position: 'bottom' as const
    },
    {
      target: 'permissions-grid',
      title: 'Available Features',
      content: 'See what you can do right now and what requires additional verification.',
      position: 'top' as const
    },
    {
      target: 'role-selection',
      title: 'Choose Your Path',
      content: 'Select whether you want to buy/rent or sell/rent out properties to see relevant verification steps.',
      position: 'top' as const
    }
  ];

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isActive) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" />
      
      {/* Tour Popup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
      >
        <Card className="max-w-md shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
                {currentTourStep.title}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onSkip}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">{currentTourStep.content}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep ? 'bg-blue-500' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button size="sm" onClick={nextStep}>
                  {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

// Smart Recommendations Panel
const SmartRecommendations: React.FC<{
  recommendations: ReturnType<typeof useSmartRecommendations>;
  onActionClick: (id: string) => void;
}> = ({ recommendations, onActionClick }) => {
  const [showAll, setShowAll] = React.useState(false);
  
  if (recommendations.length === 0) return null;

  const primaryRecommendation = recommendations.find(rec => rec.type === 'primary');
  const secondaryRecommendations = recommendations.filter(rec => rec.type === 'secondary');
  const displayedRecommendations = showAll ? recommendations : recommendations.slice(0, 3);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Moderate': return 'text-orange-600 bg-orange-100';
      case 'Comprehensive': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Recommended for you': return 'bg-blue-500 text-white';
      case 'Unlocked': return 'bg-green-500 text-white';
      case 'Coming Soon': return 'bg-slate-500 text-white';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-700">
            <Target className="w-5 h-5 mr-2" />
            Smart Recommendations
            <Tooltip content="AI-powered suggestions based on your profile and goals">
              <Info className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Primary Recommendation - Prominently Displayed */}
            {primaryRecommendation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="p-6 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg cursor-pointer transition-all duration-300"
                onClick={() => onActionClick(primaryRecommendation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      {primaryRecommendation.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-lg text-blue-900">{primaryRecommendation.title}</h4>
                        {primaryRecommendation.badge && (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getBadgeColor(primaryRecommendation.badge)}`}>
                            {primaryRecommendation.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-blue-700 mb-3">{primaryRecommendation.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-700">{primaryRecommendation.timeRequired}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(primaryRecommendation.difficulty)}`}>
                            {primaryRecommendation.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Unlock className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700">{primaryRecommendation.whatYoullUnlock}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-600 font-medium">
                          ✨ {primaryRecommendation.benefit}
                        </p>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          {primaryRecommendation.action}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Secondary Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secondaryRecommendations.slice(0, showAll ? undefined : 2).map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md cursor-pointer transition-all duration-200"
                  onClick={() => onActionClick(rec.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      {rec.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-semibold text-sm text-slate-800">{rec.title}</h5>
                        {rec.badge && (
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(rec.badge)}`}>
                            {rec.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{rec.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>{rec.timeRequired}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${getDifficultyColor(rec.difficulty)}`}>
                          {rec.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-xs text-green-600 mb-2">
                        ✨ {rec.benefit}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600">{rec.whatYoullUnlock}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {recommendations.length > 3 && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {showAll ? 'Show Less' : `See all ${recommendations.length} recommendations`}
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Recent Activity Feed Component
const RecentActivityFeed: React.FC<{
  user: UserType;
}> = ({ user }) => {
  const [activities, setActivities] = React.useState([
    {
      id: 1,
      type: 'property_view',
      title: 'You viewed Luxury Villa in Chisipite',
      description: 'Yesterday at 2:30 PM',
      icon: <Eye className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 2,
      type: 'property_save',
      title: 'You saved 3 properties this week',
      description: 'Properties in your price range',
      icon: <Heart className="w-4 h-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      id: 3,
      type: 'application_update',
      title: 'Your financing application is being processed',
      description: 'Expected completion: 2-3 business days',
      icon: <CheckSquare className="w-4 h-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 4,
      type: 'market_update',
      title: '5 new properties in your price range added today',
      description: 'In Harare and surrounding areas',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-700">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
            <Tooltip content="Your recent interactions and updates">
              <Info className="w-4 h-4 ml-2 text-slate-500 cursor-help" />
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                <div className={`p-2 rounded-full ${activity.bgColor}`}>
                  <div className={activity.color}>
                    {activity.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-slate-800">{activity.title}</h4>
                  <p className="text-xs text-slate-600">{activity.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </motion.div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View All Activity
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Personalized Property Recommendations Component
const PersonalizedPropertyRecommendations: React.FC<{
  user: UserType;
}> = ({ user }) => {
  const [recommendedProperties, setRecommendedProperties] = React.useState([
    {
      id: 1,
      title: 'Modern Apartment in Avondale',
      price: '$1,200/month',
      location: 'Avondale, Harare',
      image: '/propertyimage.jpg',
      type: 'Apartment',
      beds: 2,
      baths: 1,
      reason: 'Similar to properties you\'ve viewed'
    },
    {
      id: 2,
      title: 'Family Home in Mount Pleasant',
      price: '$2,800/month',
      location: 'Mount Pleasant, Harare',
      image: '/propertyimage.jpg',
      type: 'House',
      beds: 3,
      baths: 2,
      reason: 'Matches your price range'
    },
    {
      id: 3,
      title: 'Luxury Villa in Chisipite',
      price: '$3,500/month',
      location: 'Chisipite, Harare',
      image: '/propertyimage.jpg',
      type: 'Villa',
      beds: 4,
      baths: 3,
      reason: 'Based on your preferences'
    }
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-700">
            <Star className="w-5 h-5 mr-2" />
            Properties You Might Like
            <Tooltip content="Personalized recommendations based on your preferences">
              <Info className="w-4 h-4 ml-2 text-slate-500 cursor-help" />
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="h-32 bg-slate-200 relative">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button size="icon" variant="ghost" className="w-8 h-8 bg-white/80 hover:bg-white">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm text-slate-800 mb-1">{property.title}</h4>
                  <p className="text-lg font-bold text-blue-600 mb-1">{property.price}</p>
                  <div className="flex items-center text-xs text-slate-600 mb-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    {property.location}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>{property.beds} beds</span>
                    <span>{property.baths} baths</span>
                    <span>{property.type}</span>
                  </div>
                  <p className="text-xs text-green-600 mb-2">{property.reason}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="px-2">
                      <Heart className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Market Insights Dashboard Component
const MarketInsightsDashboard: React.FC<{
  user: UserType;
}> = ({ user }) => {
  const [marketData, setMarketData] = React.useState({
    area: 'Harare',
    priceRange: '$1,200 - $2,800/month',
    avgDaysOnMarket: 45,
    marketGrowth: 18,
    newListings: 12,
    priceChange: 5
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-700">
            <BarChart3 className="w-5 h-5 mr-2" />
            Your Area Market Update
            <Tooltip content="Real-time market insights for your area">
              <Info className="w-4 h-4 ml-2 text-slate-500 cursor-help" />
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-blue-900">Price Range</h4>
                    <p className="text-lg font-bold text-blue-600">{marketData.priceRange}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-green-900">Market Growth</h4>
                    <p className="text-lg font-bold text-green-600">+{marketData.marketGrowth}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-purple-900">Days on Market</h4>
                    <p className="text-lg font-bold text-purple-600">{marketData.avgDaysOnMarket} days</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-orange-900">New Listings</h4>
                    <p className="text-lg font-bold text-orange-600">{marketData.newListings} today</p>
                  </div>
                  <PlusCircle className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Investment Tip: Best time to buy - Market showing {marketData.marketGrowth}% growth
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};







// Notifications & Alerts Center Component
const NotificationsCenter: React.FC<{
  user: UserType;
}> = ({ user }) => {
  const [notifications, setNotifications] = React.useState([
    {
      id: 1,
      type: 'property_alert',
      title: '3 new properties match your criteria',
      description: 'In Harare and surrounding areas',
      time: '2 hours ago',
      icon: <Bell className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      unread: true
    },
    {
      id: 2,
      type: 'application_update',
      title: 'Your financing application is being processed',
      description: 'Expected completion: 2-3 business days',
      time: '1 day ago',
      icon: <CheckSquare className="w-4 h-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      unread: false
    },
    {
      id: 3,
      type: 'market_alert',
      title: 'Prices in Glen Lorne increased 5% this month',
      description: 'Market trend update',
      time: '2 days ago',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      unread: false
    },
    {
      id: 4,
      type: 'verification_reminder',
      title: 'Complete identity verification to unlock more features',
      description: 'Required for installment purchases',
      time: '3 days ago',
      icon: <Shield className="w-4 h-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      unread: true
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-700">
            <Bell className="w-5 h-5 mr-2" />
            Notifications & Alerts
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
            <Tooltip content="Stay updated with important notifications">
              <Info className="w-4 h-4 ml-2 text-slate-500 cursor-help" />
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.slice(0, 4).map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                  notification.unread ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-full ${notification.bgColor}`}>
                  <div className={notification.color}>
                    {notification.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-slate-800">{notification.title}</h4>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-1">{notification.description}</p>
                  <p className="text-xs text-slate-500">{notification.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View All Notifications
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Progress Gamification Component
const ProgressGamification: React.FC<{
  user: UserType;
}> = ({ user }) => {
  const kycLevel = user.kyc_level || 'none';
  const buyerType = user.buyer_type;
  const isSeller = user.roles.includes('seller');

  const getCompletionBadges = () => {
    const badges = [];
    
    if (user.is_phone_verified) {
      badges.push({
        id: 'phone-champion',
        title: 'Phone Champion',
        description: 'Verified phone number',
        icon: <Phone className="w-4 h-4" />,
        color: 'bg-green-500',
        unlocked: true
      });
    }
    
    if (user.isIdentityVerified) {
      badges.push({
        id: 'identity-verified',
        title: 'Identity Verified',
        description: 'ID verification complete',
        icon: <Shield className="w-4 h-4" />,
        color: 'bg-blue-500',
        unlocked: true
      });
    }
    
    if (user.isFinanciallyVerified) {
      badges.push({
        id: 'pre-approved-buyer',
        title: 'Pre-Approved Buyer',
        description: 'Financial assessment complete',
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'bg-purple-500',
        unlocked: true
      });
    }
    
    if (user.isPropertyVerified) {
      badges.push({
        id: 'verified-seller',
        title: 'Verified Seller',
        description: 'Property verification complete',
        icon: <Home className="w-4 h-4" />,
        color: 'bg-red-500',
        unlocked: true
      });
    }
    
    // Add locked badges for motivation
    if (!user.is_phone_verified) {
      badges.push({
        id: 'phone-champion-locked',
        title: 'Phone Champion',
        description: 'Verify your phone number',
        icon: <Phone className="w-4 h-4" />,
        color: 'bg-slate-300',
        unlocked: false
      });
    }
    
    if (!user.isIdentityVerified && user.is_phone_verified) {
      badges.push({
        id: 'identity-verified-locked',
        title: 'Identity Verified',
        description: 'Complete ID verification',
        icon: <Shield className="w-4 h-4" />,
        color: 'bg-slate-300',
        unlocked: false
      });
    }
    
    if (!user.isFinanciallyVerified && user.isIdentityVerified && buyerType === 'installment') {
      badges.push({
        id: 'pre-approved-buyer-locked',
        title: 'Pre-Approved Buyer',
        description: 'Complete financial assessment',
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'bg-slate-300',
        unlocked: false
      });
    }
    
    return badges;
  };

  const getNextAchievement = () => {
    if (!user.is_phone_verified) {
      return {
        title: 'Phone Champion',
        description: 'Verify your phone number to unlock messaging',
        progress: 0,
        icon: <Phone className="w-5 h-5" />
      };
    }
    
    if (!user.isIdentityVerified) {
      return {
        title: 'Identity Verified',
        description: 'Complete ID verification for premium access',
        progress: 50,
        icon: <Shield className="w-5 h-5" />
      };
    }
    
    if (!user.isFinanciallyVerified && buyerType === 'installment') {
      return {
        title: 'Pre-Approved Buyer',
        description: 'Complete financial assessment for financing',
        progress: 75,
        icon: <TrendingUp className="w-5 h-5" />
      };
    }
    
    if (!user.isPropertyVerified && isSeller) {
      return {
        title: 'Verified Seller',
        description: 'Upload property documents to start listing',
        progress: 75,
        icon: <Home className="w-5 h-5" />
      };
    }
    
    return {
      title: 'All Achievements Unlocked!',
      description: 'You have completed all verifications',
      progress: 100,
      icon: <Trophy className="w-5 h-5" />
    };
  };

  const badges = getCompletionBadges();
  const nextAchievement = getNextAchievement();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-700">
            <Trophy className="w-5 h-5 mr-2" />
            Your Achievements
            <Tooltip content="Track your verification progress and unlock badges">
              <Info className="w-4 h-4 ml-2 text-purple-500 cursor-help" />
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Next Achievement Preview */}
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  {nextAchievement.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">{nextAchievement.title}</h4>
                  <p className="text-sm text-purple-700">{nextAchievement.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-600">Progress</span>
                  <span className="text-purple-700 font-medium">{nextAchievement.progress}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <motion.div
                    className="bg-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${nextAchievement.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div>
              <h5 className="font-semibold text-purple-800 mb-3">Completion Badges</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className={`p-3 rounded-lg text-center transition-all duration-200 ${
                      badge.unlocked 
                        ? 'bg-white border-2 border-purple-200 shadow-md' 
                        : 'bg-slate-100 border-2 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full ${badge.color} flex items-center justify-center mx-auto mb-2`}>
                      <div className="text-white">
                        {badge.icon}
                      </div>
                    </div>
                    <h6 className={`font-semibold text-sm mb-1 ${
                      badge.unlocked ? 'text-purple-900' : 'text-slate-600'
                    }`}>
                      {badge.title}
                    </h6>
                    <p className={`text-xs ${
                      badge.unlocked ? 'text-purple-700' : 'text-slate-500'
                    }`}>
                      {badge.description}
                    </p>
                    {badge.unlocked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Success Message Component
const SuccessMessage: React.FC<{
  isVisible: boolean;
  message: string;
  onClose: () => void;
}> = ({ isVisible, message, onClose }) => {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-20 right-6 z-50"
        >
          <Card className="bg-green-500 text-white border-0 shadow-lg">
            <CardContent className="flex items-center space-x-3 py-3 px-4">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{message}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 w-6 h-6"
              >
                <X className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Profile Panel removed per request

// Mobile-Optimized Navigation Bar Component
const NavigationBar: React.FC<{
  user: UserType;
  onBackToHome?: () => void;
  onProfileSettings?: () => void;
  onLogout?: () => void;
}> = ({ user, onBackToHome, onProfileSettings, onLogout }) => {
  const [notificationCount] = React.useState(3);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <>
      <motion.nav 
        className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Back button */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Back to Home button - Hidden on mobile, shown on tablet+ */}
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackToHome}
                  className="flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200"
                  aria-label="Back to home page"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="hidden lg:inline">Back to Home</span>
                </Button>
              </motion.div>
              
              {/* Breadcrumb separator - Hidden on mobile */}
              <div className="hidden sm:block text-slate-400">/</div>
              
              {/* Logo/Brand */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="font-bold text-lg sm:text-xl text-slate-800">
                  Mukamba
                </span>
              </motion.div>
            </div>

            {/* Right side - Mobile menu button and desktop items */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden w-10 h-10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="w-5 h-5 flex flex-col justify-center items-center">
                  <span className={`block w-4 h-0.5 bg-slate-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                  <span className={`block w-4 h-0.5 bg-slate-600 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`block w-4 h-0.5 bg-slate-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                </div>
              </Button>

              {/* Desktop items - Hidden on mobile */}
              <div className="hidden sm:flex items-center space-x-4">
                {/* Notification Bell */}
                <Tooltip content="View your notifications and updates">
                  <motion.div 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-slate-600 hover:text-slate-900 transition-colors duration-200"
                      aria-label="View notifications"
                    >
                      <motion.div
                        animate={{ rotate: notificationCount > 0 ? [0, -10, 10, 0] : 0 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Bell className="w-5 h-5" />
                      </motion.div>
                      {notificationCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse"
                          aria-label={`${notificationCount} unread notifications`}
                        >
                          {notificationCount}
                        </motion.span>
                      )}
                    </Button>
                  </motion.div>
                </Tooltip>

                {/* User Profile Avatar */}
                <Tooltip content="View and manage your profile">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 p-2 transition-colors duration-200"
                      aria-label="User profile menu"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-red-100 text-red-700 text-sm font-semibold">
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:block font-medium">
                        {user.firstName}
                      </span>
                    </Button>
                  </motion.div>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="sm:hidden bg-white border-t border-slate-200 shadow-lg"
            >
              <div className="px-4 py-3 space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-600 hover:text-slate-900 h-12"
                  onClick={onBackToHome}
                >
                  <ArrowLeft className="w-4 h-4 mr-3" />
                  Back to Home
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-600 hover:text-slate-900 h-12"
                  onClick={() => {
                    // Handle notifications
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Bell className="w-4 h-4 mr-3" />
                  Notifications ({notificationCount})
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-600 hover:text-slate-900 h-12"
                  onClick={() => {
                    // Handle profile settings
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Profile Settings
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 h-12"
                  onClick={() => {
                    // Handle logout
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  user: propUser,
  onStartVerification,
  onBackToHome,
  onProfileSettings,
  onLogout,
  isNewUser = false
}) => {
  const { user: storeUser, updateUser } = useAuthStore();
  const user = storeUser || propUser; // Use store user if available, fallback to prop
  
  // Force re-render when store user changes
  const [forceUpdate, setForceUpdate] = React.useState(0);
  
  // Debug logging to see if store updates are working
  React.useEffect(() => {
    console.log('ProfileDashboard user updated:', {
      isPhoneVerified: user.is_phone_verified,
      isIdentityVerified: user.isIdentityVerified,
      isFinanciallyVerified: user.isFinanciallyVerified,
      isPropertyVerified: user.isPropertyVerified,
      level: user.level,
      buyerType: user.buyer_type,
      kycLevel: user.kyc_level
    });
  }, [user.is_phone_verified, user.isIdentityVerified, user.isFinanciallyVerified, user.isPropertyVerified, user.level, user.buyer_type, user.kyc_level]);
  
  // Force re-render when store user changes
  React.useEffect(() => {
    if (storeUser && storeUser !== propUser) {
      console.log('Store user changed, forcing re-render');
      setForceUpdate(prev => prev + 1);
    }
  }, [storeUser, propUser]);
  
  const userLevel = getUserLevel(user);
  const permissions = getUserPermissions(user);
  const [selectedRole, setSelectedRole] = React.useState<'buyer' | 'seller' | null>(null);
  const [loadingVerification, setLoadingVerification] = React.useState<string | null>(null);
  const [showTour, setShowTour] = React.useState(false);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [celebrationData, setCelebrationData] = React.useState<any>(null);
  const [shownCelebrations, setShownCelebrations] = React.useState<Set<string>>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mukamba-celebrations-shown');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [successMessage, setSuccessMessage] = React.useState('');
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isFirstVisit, setIsFirstVisit] = React.useState(false);

  // Verification Modal State
  const [activeModal, setActiveModal] = React.useState<'phone' | 'identity' | 'financial' | 'property' | 'listing' | null>(null);
  const [selectedCountry, setSelectedCountry] = React.useState<'ZW' | 'SA'>('ZW');

  // Recalculate these when user or forceUpdate changes
  const buyerSteps = React.useMemo(() => getBuyerVerificationSteps(user), [user, forceUpdate]);
  const sellerSteps = React.useMemo(() => getSellerVerificationSteps(user), [user, forceUpdate]);
  const recommendations = useSmartRecommendations(user, selectedRole);

  // Check if this is user's first visit
  React.useEffect(() => {
    const hasVisited = localStorage.getItem('mukamba-dashboard-visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      setShowTour(true);
      localStorage.setItem('mukamba-dashboard-visited', 'true');
    }
  }, []);

  // Progress celebration logic - only show once per verification level
  React.useEffect(() => {
    const verificationCount = [user.is_phone_verified, user.isIdentityVerified, user.isFinanciallyVerified].filter(Boolean).length;
    
    // Create a unique key for this verification level
    const celebrationKey = `verification-${verificationCount}`;
    
    // Only show celebration if we haven't shown it for this level before
    if (!shownCelebrations.has(celebrationKey)) {
    if (verificationCount === 1 && user.is_phone_verified) {
      setCelebrationData({
        title: 'Phone Verified! 🎉',
        description: 'You can now contact property owners directly',
        icon: <Phone className="w-6 h-6" />,
        reward: 'Messaging unlocked'
      });
      setShowCelebration(true);
        setShownCelebrations(prev => new Set([...prev, celebrationKey]));
    } else if (verificationCount === 2 && user.isIdentityVerified) {
      setCelebrationData({
        title: 'Identity Verified! 🚀',
        description: 'Access to premium features and installment purchase options',
        icon: <Shield className="w-6 h-6" />,
        reward: 'Premium features unlocked'
      });
      setShowCelebration(true);
        setShownCelebrations(prev => new Set([...prev, celebrationKey]));
    } else if (verificationCount === 3) {
      setCelebrationData({
        title: 'Full Verification Complete! 🏆',
        description: 'You now have access to all platform features',
        icon: <Trophy className="w-6 h-6" />,
        reward: 'Premium membership status'
      });
      setShowCelebration(true);
        setShownCelebrations(prev => new Set([...prev, celebrationKey]));
      }
    }
  }, [user.is_phone_verified, user.isIdentityVerified, user.isFinanciallyVerified, shownCelebrations]);

  // Save celebrations to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mukamba-celebrations-shown', JSON.stringify([...shownCelebrations]));
    }
  }, [shownCelebrations]);

  // Dynamic welcome message based on user type and KYC level
  const getWelcomeMessage = () => {
    const isSeller = user.roles.includes('seller');
    const isBuyer = user.buyer_type || user.roles.includes('buyer');
    const kycLevel = user.kyc_level || 'none';
    
    if (isNewUser) {
      return `Welcome to Mukamba, ${user.firstName}!`;
    }
    
    if (isSeller) {
      return `Welcome back, ${user.firstName}! Let's get your property listed`;
    }
    
    if (isBuyer) {
      if (kycLevel === 'none' || kycLevel === 'email') {
        return `Welcome back, ${user.firstName}! Complete verification to unlock all features`;
      } else {
        return `Welcome back, ${user.firstName}! Ready to find your next property?`;
      }
    }
    
    // Default for users without specific type
    if (kycLevel === 'none' || kycLevel === 'email') {
      return `Welcome back, ${user.firstName}! Complete verification to unlock all features`;
    }
    
    return `Welcome back, ${user.firstName}!`;
  };

  // Get user journey guidance based on user type
  const getUserJourney = () => {
    const isSeller = user.roles.includes('seller');
    const buyerType = user.buyer_type;
    
    if (isSeller) {
      return {
        title: "Seller Journey",
        steps: ["Verify Profile", "List Properties", "Manage Applications"],
        highlight: "Complete verification to start listing your properties",
        icon: <Home className="w-5 h-5" />,
        color: "from-red-500 to-red-600"
      };
    }
    
    if (buyerType === 'cash') {
      return {
        title: "Cash Buyer Journey",
        steps: ["Browse Properties", "Save Favorites", "Contact Sellers"],
        highlight: "Complete identity verification to access exclusive properties",
        icon: <DollarSign className="w-5 h-5" />,
        color: "from-green-500 to-green-600"
      };
    }
    
    if (buyerType === 'installment') {
      return {
        title: "Installment Buyer Journey",
        steps: ["Browse Properties", "Get Pre-Approved", "Apply for Financing"],
        highlight: "Complete financial verification for installment purchase options",
        icon: <CreditCard className="w-5 h-5" />,
        color: "from-blue-500 to-blue-600"
      };
    }
    
    // Default journey for users without specific type
    return {
      title: "Your Journey",
      steps: ["Complete Verification", "Browse Properties", "Start Your Search"],
      highlight: "Complete verification to unlock all platform features",
      icon: <User className="w-5 h-5" />,
      color: "from-slate-500 to-slate-600"
    };
  };

  // Get progress motivation message
  const getProgressMotivation = () => {
    const verificationSteps = [
      user.is_phone_verified,
      user.isIdentityVerified,
      user.isFinanciallyVerified,
      user.isPropertyVerified
    ];
    const completedSteps = verificationSteps.filter(Boolean).length;
    const totalSteps = verificationSteps.length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
    const remainingSteps = totalSteps - completedSteps;
    
    if (completedSteps === 0) {
      return {
        message: "Start your verification journey to unlock premium features",
        timeEstimate: "5 minutes to complete phone verification",
        nextStep: "Phone verification"
      };
    }
    
    if (completedSteps === 1 && !user.isIdentityVerified) {
      return {
        message: `You're ${progressPercentage}% complete - ${remainingSteps} more steps to unlock premium features`,
        timeEstimate: "3 minutes to complete identity verification",
        nextStep: "Identity verification"
      };
    }
    
    if (completedSteps === 2 && !user.isFinanciallyVerified) {
      return {
        message: `You're ${progressPercentage}% complete - ${remainingSteps} more steps to unlock installment purchase options`,
        timeEstimate: "5 minutes to complete financial assessment",
        nextStep: "Financial assessment"
      };
    }
    
    if (completedSteps >= 3) {
      return {
        message: `You're ${progressPercentage}% complete - Almost there!`,
        timeEstimate: "2 minutes to complete final verification",
        nextStep: "Final verification"
      };
    }
    
    return {
      message: `You're ${progressPercentage}% complete - Keep going!`,
      timeEstimate: "Complete remaining verifications",
      nextStep: "Continue verification"
    };
  };

  const getLevelInfo = (level: typeof userLevel, user: UserType) => {
    // Calculate actual progress based on verification status
    const verificationSteps = [
      user.is_phone_verified,
      user.isIdentityVerified,
      user.isFinanciallyVerified,
      user.isPropertyVerified
    ];
    const completedSteps = verificationSteps.filter(Boolean).length;
    const totalSteps = verificationSteps.length;
    const actualProgress = Math.round((completedSteps / totalSteps) * 100);
    
    // For better visual feedback, show progress as percentage of completion
    // 0% = no verifications, 25% = 1 verification, 50% = 2 verifications, etc.
    // Add a base progress of 10% for basic members to show some initial progress
    const baseProgress = level === 'basic' ? 10 : 0;
    const visualProgress = Math.max(actualProgress, baseProgress);
    
    console.log('getLevelInfo calculation:', {
      verificationSteps,
      completedSteps,
      totalSteps,
      actualProgress,
      visualProgress,
      level,
      isPhoneVerified: user.is_phone_verified,
      isIdentityVerified: user.isIdentityVerified,
      isFinanciallyVerified: user.isFinanciallyVerified,
      isPropertyVerified: user.isPropertyVerified
    });
    
    switch (level) {
      case 'basic':
        return {
          title: 'Basic Member',
          color: 'bg-blue-500',
          progress: visualProgress, // Show actual progress for basic members
          description: 'You can browse and save properties'
        };
      case 'verified':
        return {
          title: 'Verified Member',
          color: 'bg-green-500',
          progress: Math.max(actualProgress, 50), // Minimum 50% for verified members
          description: 'You can contact sellers and list properties'
        };
      case 'premium':
        return {
          title: 'Premium Member',
          color: 'bg-gradient-to-r from-purple-500 to-purple-600',
          progress: Math.max(actualProgress, 75), // Minimum 75% for premium members
          description: 'Full access to all platform features'
        };
      default:
        return {
          title: 'Guest',
          color: 'bg-gray-500',
          progress: 0,
          description: 'Create an account to get started'
        };
    }
  };

  const levelInfo = React.useMemo(() => {
    const info = getLevelInfo(userLevel, user);
    console.log('levelInfo calculated:', {
      userLevel,
      isPhoneVerified: user.is_phone_verified,
      isIdentityVerified: user.isIdentityVerified,
      isFinanciallyVerified: user.isFinanciallyVerified,
      isPropertyVerified: user.isPropertyVerified,
      progress: info.progress,
      title: info.title
    });
    return info;
  }, [userLevel, user, forceUpdate]);

  const userJourney = getUserJourney();
  const progressMotivation = getProgressMotivation();

  const handleStartVerification = async (type: 'buyer' | 'seller', step: string) => {
    // Open the appropriate verification modal
    switch (step) {
      case 'phone-verification':
        setActiveModal('phone');
        break;
      case 'identity-verification':
        setActiveModal('identity');
        break;
      case 'financial-verification':
        setActiveModal('financial');
        break;
      case 'property-verification':
        setActiveModal('property');
        break;
      default:
        // For other verification types, call the original handler
        setLoadingVerification(step);
        await new Promise(resolve => setTimeout(resolve, 2000));
        onStartVerification(type, step);
        setLoadingVerification(null);
        setSuccessMessage('Verification process started successfully!');
        setShowSuccess(true);
    }
  };

  const handleVerificationComplete = (verificationType: 'phone' | 'identity' | 'financial' | 'property') => {
    console.log('handleVerificationComplete called with:', verificationType);
    setActiveModal(null);
    
    // Update user verification status in the store
    const updates: Partial<UserType> = {};
    
    switch (verificationType) {
      case 'phone':
        updates.is_phone_verified = true;
        break;
      case 'identity':
        updates.isIdentityVerified = true;
        break;
      case 'financial':
        updates.isFinanciallyVerified = true;
        break;
      case 'property':
        updates.isPropertyVerified = true;
        break;
    }
    
    // Update permissions and level
    const updatedUser = { ...user, ...updates };
    updates.permissions = getUserPermissions(updatedUser);
    updates.level = getUserLevel(updatedUser);
    
    console.log('Updating store with:', updates);
    // Update the store
    updateUser(updates);
    
    // Force re-render to ensure UI updates
    setTimeout(() => {
      setForceUpdate(prev => prev + 1);
    }, 100);
    
    // Show success message
    setSuccessMessage(`${verificationType.charAt(0).toUpperCase() + verificationType.slice(1)} verification completed successfully!`);
    setShowSuccess(true);
    
    // Trigger progress celebration
    setCelebrationData({
      title: `${verificationType.charAt(0).toUpperCase() + verificationType.slice(1)} Verified!`,
      description: 'You\'ve unlocked new features and higher account level.',
      level: userLevel,
      newFeatures: []
    });
    setShowCelebration(true);
  };

  const handleRecommendationAction = (recommendationId: string) => {
    switch (recommendationId) {
      // Verification actions
      case 'verify-phone':
        setActiveModal('phone');
        break;
      case 'verify-identity':
        setActiveModal('identity');
        break;
      case 'financial-assessment':
        setActiveModal('financial');
        break;
      case 'property-documents':
        setActiveModal('property');
        break;
      case 'list-property':
        setActiveModal('listing');
        break;
      
      // Capabilities Grid actions
      case 'browse-properties':
        setSuccessMessage('Property browsing feature coming soon!');
        setShowSuccess(true);
        break;
      case 'save-favorites':
        setSuccessMessage('Favorites feature coming soon!');
        setShowSuccess(true);
        break;
      case 'contact-sellers':
        setSuccessMessage('Messaging feature coming soon!');
        setShowSuccess(true);
        break;
      case 'apply-financing':
        if (user.buyer_type === 'cash') {
          setSuccessMessage('Cash purchase applications coming soon!');
        } else {
          setActiveModal('financial');
        }
        setShowSuccess(true);
        break;
      case 'list-properties':
        setActiveModal('listing');
        break;
      case 'process-applications':
        setSuccessMessage('Application management coming soon!');
        setShowSuccess(true);
        break;
      case 'installment-pre-approval':
        setActiveModal('financial');
        break;
      case 'market-insights':
        setSuccessMessage('Market insights coming soon!');
        setShowSuccess(true);
        break;
      
      // Smart Recommendations actions

      case 'property-alerts':
      case 'property-alerts-premium':
        setSuccessMessage('Property alerts feature coming soon!');
        setShowSuccess(true);
        break;
      case 'contact-owners':
        setSuccessMessage('Messaging feature coming soon!');
        setShowSuccess(true);
        break;
      case 'cash-buyer-status':
        setSuccessMessage('Premium buyer status coming soon!');
        setShowSuccess(true);
        break;
      case 'calculate-installments':
        setSuccessMessage('Payment calculator coming soon!');
        setShowSuccess(true);
        break;
      case 'pre-approval':
        setSuccessMessage('Pre-approval feature coming soon!');
        setShowSuccess(true);
        break;
      case 'start-applications':
        setSuccessMessage('Property applications coming soon!');
        setShowSuccess(true);
        break;
      case 'premium-support':
        setSuccessMessage('Premium support coming soon!');
        setShowSuccess(true);
        break;
      default:
        setSuccessMessage('Feature coming soon!');
        setShowSuccess(true);
    }
  };



  // Enhanced Capabilities Grid Component
  const CapabilitiesGrid: React.FC<{
    user: UserType;
    onFeatureClick: (featureId: string) => void;
  }> = ({ user, onFeatureClick }) => {
    const kycLevel = user.kyc_level || 'none';
    const buyerType = user.buyer_type;
    const isSeller = user.roles.includes('seller');

    const getFeatureState = (featureId: string) => {
      switch (featureId) {
        case 'browse-properties':
          return { unlocked: true, comingSoon: false };
        case 'save-favorites':
          return { unlocked: true, comingSoon: false };
        case 'contact-sellers':
          return { unlocked: user.is_phone_verified, comingSoon: false };
        case 'apply-financing':
          return { 
            unlocked: user.isIdentityVerified && (buyerType === 'cash' || user.isFinanciallyVerified), 
            comingSoon: user.isIdentityVerified && buyerType === 'installment' && !user.isFinanciallyVerified 
          };
        case 'list-properties':
          return { unlocked: user.isIdentityVerified, comingSoon: false };
        case 'process-applications':
          return { unlocked: user.isPropertyVerified, comingSoon: false };
        case 'installment-pre-approval':
          return { unlocked: user.isFinanciallyVerified, comingSoon: false };
        case 'market-insights':
          return { unlocked: user.isIdentityVerified, comingSoon: false };
        default:
          return { unlocked: false, comingSoon: false };
      }
    };

    const getFeatureRequirement = (featureId: string) => {
      switch (featureId) {
        case 'contact-sellers':
          return 'Phone verification';
        case 'apply-financing':
          return buyerType === 'cash' ? 'Identity verification' : 'Identity & financial verification';
        case 'list-properties':
          return 'Identity verification';
        case 'process-applications':
          return 'Property verification';
        case 'installment-pre-approval':
          return 'Financial verification';
        case 'market-insights':
          return 'Identity verification';
        default:
          return '';
      }
    };

    const features = [
      {
        id: 'browse-properties',
        title: 'Browse Properties',
        description: 'View all installment purchase listings',
        icon: <Home className="w-5 h-5" />,
        action: 'Browse Now',
        stats: '1,247 properties available',
        color: 'blue'
      },
      {
        id: 'save-favorites',
        title: 'Save Favorites',
        description: 'Build your property wishlist',
        icon: <Heart className="w-5 h-5" />,
        action: 'View Saved',
        stats: 'You\'ve saved 3 properties',
        color: 'red'
      },
      {
        id: 'contact-sellers',
        title: 'Contact Sellers',
        description: 'Message property owners directly',
        icon: <MessageCircle className="w-5 h-5" />,
        action: 'Start Messaging',
        stats: 'Direct communication unlocked',
        color: 'green'
      },
      {
        id: 'apply-financing',
        title: buyerType === 'cash' ? 'Cash Purchase' : 'Apply for Financing',
        description: buyerType === 'cash' 
          ? 'Submit cash purchase applications' 
          : 'Submit installment purchase applications',
        icon: <CreditCard className="w-5 h-5" />,
        action: buyerType === 'cash' ? 'Apply Now' : 'Get Pre-Approved',
        stats: buyerType === 'cash' ? 'Cash buyers get priority' : 'Flexible payment options',
        color: 'purple'
      },
      {
        id: 'list-properties',
        title: 'List Properties',
        description: 'Sell or rent out your properties',
        icon: <Building className="w-5 h-5" />,
        action: 'List Property',
        stats: 'Reach qualified buyers',
        color: 'orange'
      },
      {
        id: 'process-applications',
        title: 'Review Applications',
        description: 'Review and approve purchase applications',
        icon: <CheckSquare className="w-5 h-5" />,
        action: 'View Applications',
        stats: 'Manage buyer inquiries',
        color: 'indigo'
      },
      {
        id: 'installment-pre-approval',
        title: 'Installment Pre-Approval',
        description: 'Get pre-approved for installment purchase plans',
        icon: <TrendingUp className="w-5 h-5" />,
        action: 'Get Pre-Approved',
        stats: 'Know your buying power',
        color: 'emerald'
      },
      {
        id: 'market-insights',
        title: 'Market Insights',
        description: 'Access detailed market analysis and trends',
        icon: <BarChart3 className="w-5 h-5" />,
        action: 'View Insights',
        stats: 'Make informed decisions',
        color: 'cyan'
      }
    ];

    const getColorClasses = (color: string, state: 'unlocked' | 'locked' | 'coming-soon') => {
      const baseColors = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
        red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' },
        green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
        purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
        orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-600' },
        indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-600' },
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-600' },
        cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-600' }
      };

      const colorSet = baseColors[color as keyof typeof baseColors] || baseColors.blue;

      if (state === 'unlocked') {
        return {
          card: `${colorSet.bg} ${colorSet.border} hover:shadow-lg`,
          text: colorSet.text,
          icon: colorSet.icon,
          button: `bg-${color.split('-')[0]}-600 hover:bg-${color.split('-')[0]}-700 text-white`
        };
      } else if (state === 'coming-soon') {
        return {
          card: 'bg-blue-50 border-blue-200 hover:shadow-md',
          text: 'text-blue-700',
          icon: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      } else {
        return {
          card: 'bg-gray-50 border-gray-200 hover:shadow-sm',
          text: 'text-gray-600',
          icon: 'text-gray-400',
          button: 'bg-gray-400 text-white cursor-not-allowed'
        };
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-700">
              <Zap className="w-5 h-5 mr-2" />
              What You Can Do Right Now
              <Tooltip content="Features unlock as you complete verification steps">
                <Info className="w-4 h-4 ml-2 text-slate-500 cursor-help" />
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {features.map((feature, index) => {
                const state = getFeatureState(feature.id);
                const requirement = getFeatureRequirement(feature.id);
                const colors = getColorClasses(feature.color, 
                  state.comingSoon ? 'coming-soon' : state.unlocked ? 'unlocked' : 'locked'
                );

                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ 
                      scale: state.unlocked || state.comingSoon ? 1.02 : 1.01, 
                      y: state.unlocked || state.comingSoon ? -2 : 0,
                      boxShadow: state.unlocked || state.comingSoon 
                        ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    whileTap={{ scale: state.unlocked || state.comingSoon ? 0.98 : 1 }}
                    className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${colors.card}`}
                    onClick={() => {
                      if (state.unlocked || state.comingSoon) {
                        onFeatureClick(feature.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          animate={{ 
                            rotate: state.unlocked ? [0, 5, -5, 0] : 0,
                            scale: state.unlocked ? 1.1 : 1
                          }}
                          transition={{ duration: 0.5, repeat: state.unlocked ? Infinity : 0, repeatDelay: 2 }}
                          className={`p-2 rounded-lg ${state.unlocked ? 'bg-white shadow-sm' : 'bg-gray-100'}`}
                        >
                          <div className={colors.icon}>
                            {feature.icon}
                          </div>
                        </motion.div>
                        <div>
                          <h4 className={`font-semibold text-sm ${colors.text}`}>
                            {feature.title}
                          </h4>
                          {state.comingSoon && (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium mt-1">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {state.unlocked ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </motion.div>
                        ) : state.comingSoon ? (
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Clock className="w-4 h-4 text-blue-600" />
                          </motion.div>
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <p className={`text-xs mb-3 ${colors.text} opacity-80`}>
                      {feature.description}
                    </p>

                    {state.unlocked && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-3"
                      >
                        <p className="text-xs text-green-600 font-medium">
                          ✨ {feature.stats}
                        </p>
                      </motion.div>
                    )}

                    {!state.unlocked && requirement && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3"
                      >
                        <p className="text-xs text-red-600 font-medium">
                          🔒 Requires: {requirement}
                        </p>
                      </motion.div>
                    )}

                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        className={`${colors.button} transition-all duration-200 h-10 sm:h-8 px-3 sm:px-2 text-xs sm:text-xs`}
                        disabled={!state.unlocked && !state.comingSoon}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (state.unlocked || state.comingSoon) {
                            onFeatureClick(feature.id);
                          }
                        }}
                        aria-label={`${state.unlocked ? feature.action : state.comingSoon ? 'Coming Soon' : 'Locked'} - ${feature.title}`}
                      >
                        {state.unlocked ? feature.action : 
                         state.comingSoon ? 'Coming Soon' : 'Locked'}
                      </Button>
                      
                      {state.unlocked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const VerificationStepCard: React.FC<{
    step: VerificationStep;
    role: 'buyer' | 'seller';
    index: number;
  }> = ({ step, role, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
    >
      <Card className={`${
        step.completed 
          ? 'border-green-200 bg-green-50' 
          : 'border-slate-200 hover:border-red-300'
      } transition-all duration-300 cursor-pointer`}
      onClick={() => !step.completed && !loadingVerification && handleStartVerification(role, step.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <motion.div
                animate={{ rotate: step.completed ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
              {step.completed ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
              )}
              </motion.div>
              {step.title}
              <Tooltip content={`Priority: ${step.required ? 'Required' : 'Optional'} | Estimated time: 5-10 minutes`}>
                <Info className="w-4 h-4 ml-2 text-gray-400 cursor-help" />
              </Tooltip>
            </CardTitle>
            <div className="flex items-center">
              {step.completed ? (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-sm text-green-600 font-medium"
                >
                  Complete
                </motion.span>
              ) : loadingVerification === step.id ? (
                <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
              ) : (
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                <ArrowRight className="w-4 h-4 text-slate-400" />
                </motion.div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-3">
            {step.description}
          </p>
          
          <div className="space-y-2">
            <div>
              <h5 className="text-xs font-semibold text-slate-700 mb-1">
                Benefits:
              </h5>
              <ul className="text-xs text-slate-600 space-y-1">
                {step.benefits.map((benefit: string, idx: number) => (
                  <motion.li 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-center"
                  >
                    <Star className="w-3 h-3 text-yellow-500 mr-1" />
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </div>
            
            {step.requiredFor.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-slate-700 mb-1">
                  Required for:
                </h5>
                <ul className="text-xs text-slate-600 space-y-1">
                  {step.requiredFor.map((requirement: string, idx: number) => (
                    <motion.li 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="flex items-center"
                    >
                      <Shield className="w-3 h-3 text-blue-500 mr-1" />
                      {requirement}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {!step.completed && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
            <Button 
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
              size="sm"
                disabled={loadingVerification === step.id}
              >
                {loadingVerification === step.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  'Start Verification'
                )}
            </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <NavigationBar
        user={user}
        onBackToHome={onBackToHome}
        onProfileSettings={onProfileSettings}
        onLogout={onLogout}
      />

      {/* Main Content */}
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Header - Only show for non-verified users */}
      {!isFullyVerified(user) && (
        <motion.div 
          id="welcome-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
          {getWelcomeMessage()}
            {(isFirstVisit || isNewUser) && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="ml-2"
              >
                👋
              </motion.span>
            )}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 px-4">
          {progressMotivation.message}
        </p>
        
        {/* Progress Motivation Details */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
          <div className="flex items-center space-x-1 text-blue-600">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{progressMotivation.timeEstimate}</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 text-green-600">
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Next: {progressMotivation.nextStep}</span>
          </div>
        </div>
          
          {/* Take Tour Button for returning users */}
          {!isFirstVisit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTour(true)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50 h-10 sm:h-9 px-4 sm:px-3"
                aria-label="Take a tour of the dashboard"
              >
                <Play className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-xs">Take Tour</span>
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}



        {/* Conditional Dashboard Rendering */}
        {isFullyVerified(user) ? (
          <VerifiedUserDashboard
            user={user}
            onViewProperty={(propertyId) => {
              console.log('View property:', propertyId);
              // Navigate to property details
            }}
            onViewApplication={(applicationId) => {
              console.log('View application:', applicationId);
              // Navigate to application details
            }}
            onStartNewApplication={() => {
              console.log('Start new application');
              // Navigate to property search or application form
            }}
            onViewMarketInsights={() => {
              console.log('View market insights');
              // Navigate to market insights page
            }}
          />
        ) : (
          <>
            {/* New User Welcome Card */}
            {isNewUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  🎉 Welcome to Mukamba!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  Congratulations on creating your account! Here's what you can do to get started:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-sm font-medium">Complete phone verification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-sm font-medium">Verify your identity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-sm font-medium">Complete your profile to unlock property opportunities</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* User Journey Guidance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className={`bg-gradient-to-r ${userJourney.color} text-white border-0 shadow-lg`}>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                {userJourney.icon}
                <span className="ml-2">{userJourney.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Journey Steps */}
                <div className="flex items-center justify-between">
                  {userJourney.steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="ml-2 text-sm font-medium">{step}</span>
                      {index < userJourney.steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 mx-2 text-white/60" />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Highlight Message */}
                <div className="mt-4 p-3 bg-white/10 rounded-lg">
                  <p className="text-sm font-medium">
                    ✨ {userJourney.highlight}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>



        {/* Smart Recommendations */}
        <SmartRecommendations
          recommendations={recommendations}
          onActionClick={handleRecommendationAction}
        />

        {/* Progress Gamification */}
        <ProgressGamification user={user} />



        {/* Recent Activity Feed */}
        <RecentActivityFeed user={user} />

        {/* Personalized Property Recommendations */}
        <PersonalizedPropertyRecommendations user={user} />

        {/* Market Insights Dashboard */}
        <MarketInsightsDashboard user={user} />



        {/* Notifications & Alerts Center */}
        <NotificationsCenter user={user} />

      {/* Account Level */}
        <motion.div
          id="account-level"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Account Level: {levelInfo.title}
                <Tooltip content={`${levelInfo.progress}% complete - ${100 - levelInfo.progress}% to next level`}>
                  <Info className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
                </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
                <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    className={`${levelInfo.color} h-3 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.progress}%` }}
                    transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
              />
            </div>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="ml-3 text-sm font-medium text-slate-600"
                >
              {levelInfo.progress}%
                </motion.span>
          </div>
          <p className="text-slate-600 text-sm">
            {levelInfo.description}
          </p>
        </CardContent>
      </Card>
        </motion.div>

      {/* Enhanced Capabilities Grid */}
      <CapabilitiesGrid user={user} onFeatureClick={handleRecommendationAction} />

      {/* Essential KYC Section */}
          <motion.div
        id="essential-kyc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
                <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Complete Your Profile
              <Tooltip content="These verifications unlock more features and build trust">
                    <Info className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
                  </Tooltip>
                </CardTitle>
            <p className="text-sm text-slate-600">
              Complete these essential verifications to unlock more features
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Phone Verification */}
              <div className={`p-4 rounded-lg border ${
                user.is_phone_verified 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      user.is_phone_verified 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Phone Verification</h4>
                      <p className="text-xs text-slate-600">
                        {user.is_phone_verified ? 'Verified' : 'Required for messaging and notifications'}
                      </p>
                    </div>
                  </div>
                  {user.is_phone_verified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
              <Button
                      size="sm"
                      onClick={() => setActiveModal('phone')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Verify Now
              </Button>
                  )}
                </div>
              </div>

              {/* Identity Verification */}
              <div className={`p-4 rounded-lg border ${
                user.isIdentityVerified 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      user.isIdentityVerified 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Identity Verification</h4>
                      <p className="text-xs text-slate-600">
                        {user.isIdentityVerified ? 'Verified' : 'Required for installment purchases and property applications'}
                      </p>
                    </div>
                  </div>
                  {user.isIdentityVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
              <Button
                      size="sm"
                      onClick={() => setActiveModal('identity')}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!user.is_phone_verified}
                    >
                      Verify Now
              </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          </motion.div>

      {/* Additional Features Section */}
      {user.is_phone_verified && user.isIdentityVerified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
                  <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Unlock Premium Features
                <Tooltip content="These features are available after completing basic verification">
                      <Info className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
                    </Tooltip>
              </CardTitle>
              <p className="text-sm text-slate-600">
                You've unlocked additional features to enhance your experience
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Financial Assessment */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Financial Assessment</h4>
                        <p className="text-xs text-slate-600">
                          Get your credit score and unlock installment purchase options
                        </p>
                      </div>
                    </div>
              <Button
                size="sm"
                      onClick={() => setActiveModal('financial')}
                      className="bg-green-600 hover:bg-green-700"
              >
                      Start Assessment
              </Button>
            </div>
                </div>

                {/* Property Listing */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Home className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">List Your Property</h4>
                        <p className="text-xs text-slate-600">
                          Sell or rent out your property on our platform
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveModal('listing')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      List Property
                    </Button>
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>
          </motion.div>
        )}
      </>
      )}

      {/* Guided Tour */}
      <GuidedTour
        isActive={showTour}
        onComplete={() => setShowTour(false)}
        onSkip={() => setShowTour(false)}
      />

      {/* Progress Celebration */}
      <ProgressCelebration
        isVisible={showCelebration}
        onClose={() => setShowCelebration(false)}
        achievement={celebrationData || {}}
      />

      {/* Success Message */}
      <SuccessMessage
        isVisible={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />

      {/* Verification Modals */}
      <PhoneVerificationModal
        isOpen={activeModal === 'phone'}
        onClose={() => setActiveModal(null)}
        onComplete={() => handleVerificationComplete('phone')}
        initialPhone={user.phone}
      />

      <IdentityVerificationModal
        isOpen={activeModal === 'identity'}
        onClose={() => setActiveModal(null)}
        onComplete={() => handleVerificationComplete('identity')}
      />

      <FinancialAssessmentModal
        isOpen={activeModal === 'financial'}
        onClose={() => setActiveModal(null)}
        onComplete={() => handleVerificationComplete('financial')}
      />

      <PropertyDocumentationModal
        isOpen={activeModal === 'property'}
        onClose={() => setActiveModal(null)}
        onComplete={() => handleVerificationComplete('property')}
      />

      <PropertyListingModal
        isOpen={activeModal === 'listing'}
        onClose={() => setActiveModal(null)}
        onComplete={(data) => {
          console.log('Property listing data:', data);
          setActiveModal(null);
          setSuccessMessage('Property listed successfully!');
          setShowSuccess(true);
        }}
        country={selectedCountry}
      />





      {/* Add Property Button (for verified sellers) */}
      {user.isPropertyVerified && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-24 right-6 z-50"
        >
          <Button
            onClick={() => setActiveModal('listing')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
            size="lg"
          >
            <Building className="w-5 h-5 mr-2" />
            List Property
          </Button>
        </motion.div>
      )}
      </div>
    </div>
  );
}; 