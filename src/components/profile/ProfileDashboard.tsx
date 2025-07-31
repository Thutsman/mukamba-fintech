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
  MessageCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  getUserLevel, 
  getUserPermissions, 
  getBuyerVerificationSteps, 
  getSellerVerificationSteps,
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
import { AgentOnboardingModal } from '@/components/agent/AgentOnboardingModal';

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

    // Profile completion recommendations
    if (!user.isPhoneVerified) {
      recommendations.push({
        id: 'verify-phone',
        type: 'urgent',
        title: 'Verify Your Phone Number',
        description: 'Enable communication with property owners and unlock key features',
        action: 'Start Phone Verification',
        priority: 1,
        icon: <Phone className="w-4 h-4" />,
        benefit: 'Unlock messaging and notifications'
      });
    }

    if (!user.isIdentityVerified && user.isPhoneVerified) {
      recommendations.push({
        id: 'verify-identity',
        type: 'important',
        title: 'Complete Identity Verification',
        description: 'Build trust and access premium features with ID verification',
        action: 'Upload ID Document',
        priority: 2,
        icon: <Shield className="w-4 h-4" />,
        benefit: 'Access financing options and exclusive listings'
      });
    }

    // Role-specific recommendations
    if (selectedRole === 'buyer' && !user.isFinanciallyVerified && user.isIdentityVerified) {
      recommendations.push({
        id: 'financial-assessment',
        type: 'opportunity',
        title: 'Complete Financial Assessment',
        description: 'Get your credit score and unlock rent-to-buy options',
        action: 'Start Assessment',
        priority: 3,
        icon: <TrendingUp className="w-4 h-4" />,
        benefit: 'Access to personalized financing offers'
      });
    }

    if (selectedRole === 'seller' && !user.isPropertyVerified && user.isIdentityVerified) {
      recommendations.push({
        id: 'property-documents',
        type: 'opportunity',
        title: 'Upload Property Documents',
        description: 'Verify your properties to attract serious buyers',
        action: 'Upload Documents',
        priority: 3,
        icon: <Home className="w-4 h-4" />,
        benefit: 'Increased visibility and buyer trust'
      });
    }

    // Engagement recommendations
    if (userLevel === 'basic') {
      recommendations.push({
        id: 'explore-features',
        type: 'tip',
        title: 'Explore Platform Features',
        description: 'Discover what you can do with your current access level',
        action: 'Take Tour',
        priority: 4,
        icon: <Lightbulb className="w-4 h-4" />,
        benefit: 'Make the most of your membership'
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 3);
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
  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
            <Target className="w-5 h-5 mr-2" />
            Smart Recommendations
            <Tooltip content="AI-powered suggestions based on your profile and goals">
              <Info className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.type === 'urgent' 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-400' 
                    : rec.type === 'important'
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400'
                    : rec.type === 'opportunity'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-400'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
                } cursor-pointer transition-all duration-200`}
                onClick={() => onActionClick(rec.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      rec.type === 'urgent' 
                        ? 'bg-red-100 text-red-600' 
                        : rec.type === 'important'
                        ? 'bg-orange-100 text-orange-600'
                        : rec.type === 'opportunity'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {rec.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{rec.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{rec.description}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✨ {rec.benefit}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </motion.div>
            ))}
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

// Profile Panel Component (existing code with contextual hints)
const ProfilePanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onProfileSettings?: () => void;
  onLogout?: () => void;
}> = ({ isOpen, onClose, user, onProfileSettings, onLogout }) => {
  const [profileImage, setProfileImage] = React.useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const userLevel = getUserLevel(user);
  const permissions = getUserPermissions(user);

  const getLevelInfo = (level: typeof userLevel, user: UserType) => {
    // Calculate actual progress based on verification status
    const verificationSteps = [
      user.isPhoneVerified,
      user.isIdentityVerified,
      user.isFinanciallyVerified,
      user.isPropertyVerified
    ];
    const completedSteps = verificationSteps.filter(Boolean).length;
    const totalSteps = verificationSteps.length;
    const actualProgress = Math.round((completedSteps / totalSteps) * 100);
    
    switch (level) {
      case 'basic':
        return {
          title: 'Basic Member',
          color: 'bg-blue-500',
          progress: Math.max(actualProgress, 25), // Minimum 25% for basic members
          description: 'You can browse and save properties',
          hint: 'Complete phone verification to unlock messaging features'
        };
      case 'verified':
        return {
          title: 'Verified Member',
          color: 'bg-green-500',
          progress: Math.max(actualProgress, 50), // Minimum 50% for verified members
          description: 'You can contact sellers and list properties',
          hint: 'Complete all verifications to become a Premium member'
        };
      case 'premium':
        return {
          title: 'Premium Member',
          color: 'bg-gradient-to-r from-purple-500 to-purple-600',
          progress: Math.max(actualProgress, 75), // Minimum 75% for premium members
          description: 'Full access to all platform features',
          hint: 'You have access to all platform features!'
        };
      default:
        return {
          title: 'Guest',
          color: 'bg-gray-500',
          progress: 0,
          description: 'Create an account to get started',
          hint: 'Sign up to start your verification journey'
        };
    }
  };

  const levelInfo = getLevelInfo(userLevel, user);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Simulate logout delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    onLogout?.();
    onClose();
    setIsLoggingOut(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Profile Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              opacity: { duration: 0.3 }
            }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6 z-10"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Profile
                </h2>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* User Avatar Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="relative inline-block">
                  <Tooltip content="Click to upload a profile picture">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Avatar className="w-24 h-24 mx-auto">
                        {profileImage ? (
                          <AvatarImage src={profileImage} alt={`${user.firstName} ${user.lastName}`} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white text-2xl font-bold">
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </motion.div>
                  </Tooltip>
                  
                  <motion.button
                    onClick={handleImageClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </motion.button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </motion.div>
              </motion.div>

              {/* Account Level Progress with Contextual Hint */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      {levelInfo.title}
                      <Tooltip content={levelInfo.hint}>
                        <MessageCircle className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
                      </Tooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="font-medium text-slate-900 dark:text-slate-100"
                        >
                          {levelInfo.progress}%
                        </motion.span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          className={`${levelInfo.color} h-2 rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${levelInfo.progress}%` }}
                          transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-xs text-slate-500 dark:text-slate-400"
                      >
                        {levelInfo.description}
                      </motion.p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Settings */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Quick Settings
                </h4>
                <div className="space-y-3">
                  {/* Dark Mode Toggle */}
                  <Tooltip content="Toggle between light and dark themes">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div
                          animate={{ rotate: isDarkMode ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {isDarkMode ? (
                            <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          ) : (
                            <Sun className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          )}
                        </motion.div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          Dark Mode
                        </span>
                      </div>
                      <motion.button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${
                          isDarkMode ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          className="w-4 h-4 bg-white rounded-full"
                          animate={{ x: isDarkMode ? 16 : 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        />
                      </motion.button>
                    </motion.div>
                  </Tooltip>

                  {/* Notifications Toggle */}
                  <Tooltip content="Control email and push notifications">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div
                          animate={{ rotate: notificationsEnabled ? 0 : -15 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </motion.div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          Notifications
                        </span>
                      </div>
                      <motion.button
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${
                          notificationsEnabled ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          className="w-4 h-4 bg-white rounded-full"
                          animate={{ x: notificationsEnabled ? 16 : 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        />
                      </motion.button>
                    </motion.div>
                  </Tooltip>
                </div>
              </motion.div>

              {/* Account Stats */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Account Overview
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Tooltip content="Complete verifications to unlock more features">
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Verifications
                      </div>
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                        className="text-lg font-bold text-green-700 dark:text-green-300"
                      >
                        {[user.isPhoneVerified, user.isIdentityVerified, user.isFinanciallyVerified].filter(Boolean).length}/3
                      </motion.div>
                    </motion.div>
                  </Tooltip>
                  
                  <Tooltip content="Your current Know Your Customer status">
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        KYC Status
                      </div>
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
                        className="text-lg font-bold text-blue-700 dark:text-blue-300 capitalize"
                      >
                        {user.kycStatus}
                      </motion.div>
                    </motion.div>
                  </Tooltip>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-3"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => {
                      onProfileSettings?.();
                      onClose();
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </motion.div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Security
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help
                    </Button>
                  </motion.div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    variant="ghost"
                    className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing Out...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Navigation Bar Component
const NavigationBar: React.FC<{
  user: UserType;
  onBackToHome?: () => void;
  onProfileSettings?: () => void;
  onLogout?: () => void;
}> = ({ user, onBackToHome, onProfileSettings, onLogout }) => {
  const [showProfilePanel, setShowProfilePanel] = React.useState(false);
  const [notificationCount] = React.useState(3); // Mock notification count

  return (
    <>
      <motion.nav 
        className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Back button */}
            <div className="flex items-center space-x-4">
              {/* Back to Home button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackToHome}
                  className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Home
                </Button>
              </motion.div>
              
              {/* Breadcrumb separator */}
              <div className="text-slate-400 dark:text-slate-600">/</div>
              
              {/* Logo/Brand */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="font-bold text-xl text-slate-800 dark:text-slate-200">
                  Mukamba
                </span>
              </motion.div>
            </div>

            {/* Right side - Notifications and Profile */}
            <div className="flex items-center space-x-4">
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
                    className="relative text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
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
                      >
                        {notificationCount}
                      </motion.span>
                    )}
                  </Button>
                </motion.div>
              </Tooltip>

              {/* User Profile Avatar - Trigger for Panel */}
              <Tooltip content="View and manage your profile">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    onClick={() => setShowProfilePanel(true)}
                    className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 p-2 transition-colors duration-200"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block font-medium">
                      {user.firstName}
                    </span>
                  </Button>
                </motion.div>
              </Tooltip>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Profile Panel */}
      <ProfilePanel
        isOpen={showProfilePanel}
        onClose={() => setShowProfilePanel(false)}
        user={user}
        onProfileSettings={onProfileSettings}
        onLogout={onLogout}
      />
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
      isPhoneVerified: user.isPhoneVerified,
      isIdentityVerified: user.isIdentityVerified,
      isFinanciallyVerified: user.isFinanciallyVerified,
      isPropertyVerified: user.isPropertyVerified,
      level: user.level
    });
  }, [user.isPhoneVerified, user.isIdentityVerified, user.isFinanciallyVerified, user.isPropertyVerified, user.level]);
  
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
  const [successMessage, setSuccessMessage] = React.useState('');
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isFirstVisit, setIsFirstVisit] = React.useState(false);

  // Verification Modal State
  const [activeModal, setActiveModal] = React.useState<'phone' | 'identity' | 'financial' | 'property' | 'listing' | 'agent' | null>(null);
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

  // Progress celebration logic
  React.useEffect(() => {
    const verificationCount = [user.isPhoneVerified, user.isIdentityVerified, user.isFinanciallyVerified].filter(Boolean).length;
    
    if (verificationCount === 1 && user.isPhoneVerified) {
      setCelebrationData({
        title: 'Phone Verified! 🎉',
        description: 'You can now contact property owners directly',
        icon: <Phone className="w-6 h-6" />,
        reward: 'Messaging unlocked'
      });
      setShowCelebration(true);
    } else if (verificationCount === 2 && user.isIdentityVerified) {
      setCelebrationData({
        title: 'Identity Verified! 🚀',
        description: 'Access to premium features and financing options',
        icon: <Shield className="w-6 h-6" />,
        reward: 'Premium features unlocked'
      });
      setShowCelebration(true);
    } else if (verificationCount === 3) {
      setCelebrationData({
        title: 'Full Verification Complete! 🏆',
        description: 'You now have access to all platform features',
        icon: <Trophy className="w-6 h-6" />,
        reward: 'Premium membership status'
      });
      setShowCelebration(true);
    }
  }, [user.isPhoneVerified, user.isIdentityVerified, user.isFinanciallyVerified]);

  const getLevelInfo = (level: typeof userLevel, user: UserType) => {
    // Calculate actual progress based on verification status
    const verificationSteps = [
      user.isPhoneVerified,
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
      isPhoneVerified: user.isPhoneVerified,
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
      isPhoneVerified: user.isPhoneVerified,
      isIdentityVerified: user.isIdentityVerified,
      isFinanciallyVerified: user.isFinanciallyVerified,
      isPropertyVerified: user.isPropertyVerified,
      progress: info.progress,
      title: info.title
    });
    return info;
  }, [userLevel, user, forceUpdate]);

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
        updates.isPhoneVerified = true;
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
      case 'explore-features':
        setShowTour(true);
        break;
      default:
        setSuccessMessage('Feature coming soon!');
        setShowSuccess(true);
    }
  };

  const PermissionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    available: boolean;
    requiredFor?: string;
  }> = ({ icon, title, description, available, requiredFor }) => (
    <motion.div 
      whileHover={{ 
        scale: 1.02, 
        y: -2,
        boxShadow: available 
          ? '0 10px 25px -5px rgba(34, 197, 94, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
      available 
        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center mb-2">
        <motion.div
          animate={{ rotate: available ? 0 : -5 }}
          transition={{ duration: 0.3 }}
        >
        {available ? (
          <Unlock className="w-4 h-4 text-green-600 mr-2" />
        ) : (
          <Lock className="w-4 h-4 text-gray-400 mr-2" />
        )}
        </motion.div>
        <div className="text-green-600 mr-2">{icon}</div>
        <span className={`font-medium text-sm ${
          available ? 'text-green-800 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'
        }`}>
          {title}
        </span>
        {!available && (
          <Tooltip content={`Complete ${requiredFor} to unlock this feature`}>
            <Info className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
          </Tooltip>
        )}
      </div>
      <p className={`text-xs ${
        available ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'
      }`}>
        {description}
      </p>
      {!available && requiredFor && (
        <motion.p 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-600 dark:text-red-400 mt-1"
        >
          Requires: {requiredFor}
        </motion.p>
      )}
    </motion.div>
  );

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
          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
          : 'border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700'
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
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            {step.description}
          </p>
          
          <div className="space-y-2">
            <div>
              <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Benefits:
              </h5>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
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
                <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Required for:
                </h5>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation Bar */}
      <NavigationBar
        user={user}
        onBackToHome={onBackToHome}
        onProfileSettings={onProfileSettings}
        onLogout={onLogout}
      />

      {/* Main Content */}
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
        <motion.div 
          id="welcome-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          {isNewUser ? `Welcome to Mukamba, ${user.firstName}!` : `Welcome back, ${user.firstName}!`}
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
        <p className="text-slate-600 dark:text-slate-400">
          {isNewUser 
            ? "Let's get your account set up! Complete your profile to start exploring rent-to-buy properties." 
            : "Complete your profile to unlock more features"
          }
        </p>
          
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
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Play className="w-4 h-4 mr-2" />
                Take Tour
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* New User Welcome Card */}
        {isNewUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                  🎉 Welcome to Mukamba!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 dark:text-green-300 mb-4">
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
                    <span className="text-sm font-medium">Complete your profile to unlock real estate opportunities</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Smart Recommendations */}
        <SmartRecommendations
          recommendations={recommendations}
          onActionClick={handleRecommendationAction}
        />

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
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
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
                  className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400"
                >
              {levelInfo.progress}%
                </motion.span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {levelInfo.description}
          </p>
        </CardContent>
      </Card>
        </motion.div>

      {/* Current Permissions */}
        <motion.div
          id="permissions-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
              <CardTitle className="flex items-center">
                What You Can Do Right Now
                <Tooltip content="Green = Available, Gray = Requires verification">
                  <Info className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
                </Tooltip>
              </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PermissionCard
              icon={<Home className="w-4 h-4" />}
              title="Browse Properties"
              description="View all rent-to-buy listings"
              available={permissions.canBrowseProperties}
            />
            <PermissionCard
              icon={<Star className="w-4 h-4" />}
              title="Save Favorites"
              description="Save properties you're interested in"
              available={permissions.canSaveProperties}
            />
            <PermissionCard
              icon={<Phone className="w-4 h-4" />}
              title="Contact Sellers"
              description="Message property owners directly"
              available={permissions.canContactSellers}
              requiredFor="Phone verification"
            />
            <PermissionCard
              icon={<CreditCard className="w-4 h-4" />}
              title="Apply for Financing"
              description="Submit rent-to-buy applications"
              available={permissions.canApplyForFinancing}
              requiredFor="Identity & financial verification"
            />
            <PermissionCard
              icon={<Home className="w-4 h-4" />}
              title="List Properties"
              description="Add your properties to the platform"
              available={permissions.canListProperties}
              requiredFor="Phone & identity verification"
            />
            <PermissionCard
              icon={<Shield className="w-4 h-4" />}
              title="Process Applications"
              description="Review and approve tenant applications"
              available={permissions.canProcessTransactions}
              requiredFor="Full KYC verification"
            />
          </div>
        </CardContent>
      </Card>
        </motion.div>

      {/* Role Selection */}
      {!selectedRole && (
          <motion.div
            id="role-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
                <CardTitle className="flex items-center">
                  Choose Your Path
                  <Tooltip content="Select your primary interest to see relevant verification steps">
                    <Info className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
                  </Tooltip>
                </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select what you'd like to do to see relevant verification steps
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
              <Button
                variant="outline"
                      className="h-24 flex-col space-y-2 hover:border-red-300 transition-all duration-300 hover:shadow-md"
                onClick={() => setSelectedRole('buyer')}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
              >
                <Home className="w-8 h-8 text-red-600" />
                      </motion.div>
                <div className="text-center">
                  <div className="font-semibold">I want to buy/rent</div>
                  <div className="text-xs text-slate-500">Find and apply for properties</div>
                </div>
              </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
              <Button
                variant="outline"
                      className="h-24 flex-col space-y-2 hover:border-red-300 transition-all duration-300 hover:shadow-md"
                onClick={() => setSelectedRole('seller')}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
              >
                <CreditCard className="w-8 h-8 text-red-600" />
                      </motion.div>
                <div className="text-center">
                  <div className="font-semibold">I want to sell/rent out</div>
                  <div className="text-xs text-slate-500">List properties and find tenants</div>
                </div>
              </Button>
                  </motion.div>
            </div>
          </CardContent>
        </Card>
          </motion.div>
      )}

      {/* Verification Steps */}
      {selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                {selectedRole === 'buyer' ? 'Buyer' : 'Seller'} Verification Steps
                    <Tooltip content="Complete these steps in order for the best experience">
                      <Info className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
                    </Tooltip>
              </CardTitle>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRole(null)}
                      className="transition-colors duration-200"
              >
                Switch Path
              </Button>
                  </motion.div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Complete these steps to unlock more features
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {(selectedRole === 'buyer' ? buyerSteps : sellerSteps).map((step, index) => (
                <VerificationStepCard
                  key={step.id}
                  step={step}
                  role={selectedRole}
                  index={index}
                />
              ))}
            </div>
          </CardContent>
        </Card>
          </motion.div>
        )}
      </div>

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

      <AgentOnboardingModal
        isOpen={activeModal === 'agent'}
        onClose={() => setActiveModal(null)}
        onComplete={() => {
          setActiveModal(null);
          setSuccessMessage('Agent application submitted successfully! We will review your documents and contact you soon.');
          setShowSuccess(true);
          // Update user roles to include agent (this would be done after verification in real app)
          // updateUser({ roles: [...user.roles, 'agent'] });
        }}
      />

      {/* Real Estate Agent Registration Section */}
      {!user.roles.includes('agent') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                <Building className="w-5 h-5 mr-2" />
                Become a Real Estate Agent
                <Tooltip content="Join our network of verified real estate professionals">
                  <Info className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Are you a licensed real estate agent? Join our platform to access exclusive features and connect with more clients.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">Verified Status</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400">EAC registration verification</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">Enhanced Features</h4>
                    <p className="text-xs text-green-600 dark:text-green-400">Lead management & analytics</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">Direct Communication</h4>
                    <p className="text-xs text-purple-600 dark:text-purple-400">Connect with clients directly</p>
                  </div>
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setActiveModal('agent')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Apply as Real Estate Agent
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
  );
}; 