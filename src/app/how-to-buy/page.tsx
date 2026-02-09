'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Home,
  Building,
  Search,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle,
  Calendar,
  DollarSign,
  FileText,
  Key,
  Eye,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Loader2,
  X,
  Menu,
  Info,
  BookOpen,
  Tag
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UnifiedSignupModal } from '@/components/forms/UnifiedSignupModal';
import { BasicSigninModal } from '@/components/forms/BasicSigninModal';
import { AgentOnboardingModal } from '@/components/agent/AgentOnboardingModal';
import { SellerOnboardingModal } from '@/components/forms/SellerOnboardingModal';
import { BuyerPhoneVerificationModal } from '@/components/forms/BuyerPhoneVerificationModal';
import { navigateWithScrollToTop } from '@/utils/navigation';
import { useAuthStore } from '@/lib/store';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

// Analytics tracking function (mirrors PropertyDashboard)
const trackEvent = (eventName: string, parameters: Record<string, any>) => {
  console.log('Analytics Event:', eventName, parameters);
};

// Step Image Component with error handling and loading placeholder
const StepImage: React.FC<{
  src: string;
  alt: string;
  fallbackIcon: React.ComponentType<{ className?: string }>;
  fallbackText: string;
  imageLoadErrors: Set<string>;
  setImageLoadErrors: React.Dispatch<React.SetStateAction<Set<string>>>;
}> = ({ src, alt, fallbackIcon: FallbackIcon, fallbackText, imageLoadErrors, setImageLoadErrors }) => {
  const hasError = imageLoadErrors.has(src);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const fileName = React.useMemo(() => {
    try {
      const parts = src.split('/');
      return parts[parts.length - 1];
    } catch {
      return '';
    }
  }, [src]);
  
  if (hasError) {
    return (
          <div className="bg-gray-100 rounded-2xl h-80 flex items-center justify-center border-2 border-dashed border-gray-500 shadow-md">
        <div className="text-center text-gray-500 px-6">
          <div className="mx-auto mb-3 w-12 h-12 relative">
            <Image src="/file.svg" alt="Placeholder" fill className="object-contain" />
          </div>
          <p className="text-sm font-medium">{fallbackText}</p>
          {fileName && (
            <p className="text-xs text-gray-400 mt-1">{fileName} not found</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Add image to /public/images/how-to-buy</p>
        </div>
      </div>
    );
  }

  return (
        <div className="relative rounded-2xl h-64 sm:h-72 md:h-80 overflow-hidden border-2 border-gray-400 shadow-md">
      {/* Loading shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-100" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
        onError={() => {
          setImageLoadErrors(prev => new Set(prev).add(src));
        }}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default function HowToBuyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const [showSigninModal, setShowSigninModal] = React.useState(false);
  const [showAgentModal, setShowAgentModal] = React.useState(false);
  const [showSellerModal, setShowSellerModal] = React.useState(false);
  const [showBuyerPhoneVerificationModal, setShowBuyerPhoneVerificationModal] = React.useState(false);
  const [imageLoadErrors, setImageLoadErrors] = React.useState<Set<string>>(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('[data-mobile-menu]')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar - Same as PropertyDashboard */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Mukamba Gateway"
                width={140}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </div>

            {/* Center Navigation - same as PropertyDashboard (Home, About, Properties, How to Buy, How to Sell) */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/"
                className="text-gray-700 hover:text-[#7f1518] transition-colors flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithScrollToTop(router, '/');
                }}
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </a>
              <a
                href="/about"
                className="text-gray-700 hover:text-[#7f1518] transition-colors flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithScrollToTop(router, '/about');
                }}
              >
                <Info className="w-4 h-4 mr-1" />
                About
              </a>
              <a
                href="/listings"
                className="text-gray-700 hover:text-[#7f1518] transition-colors flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithScrollToTop(router, '/listings');
                }}
              >
                <Building className="w-4 h-4 mr-1" />
                Properties
              </a>
              <span className="text-[#7f1518] font-medium flex items-center cursor-default">
                <BookOpen className="w-4 h-4 mr-1" />
                How to Buy
              </span>
              <a
                href="/how-to-sell"
                className="text-gray-700 hover:text-[#7f1518] transition-colors flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithScrollToTop(router, '/how-to-sell');
                }}
              >
                <Tag className="w-4 h-4 mr-1" />
                How to Sell
              </a>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden" data-mobile-menu>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setShowSignupModal(true);
                  trackEvent('how_to_buy_create_account_clicked', {
                    source: 'navigation_bar',
                    event_category: 'conversion'
                  });
                }}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Create Account
              </Button>
              <Button
                size="sm"
                className="bg-[#7f1518] hover:bg-[#6a1215] text-white"
                onClick={() => {
                  setShowSigninModal(true);
                  trackEvent('how_to_buy_sign_in_clicked', {
                    source: 'navigation_bar',
                    event_category: 'conversion'
                  });
                }}
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-gray-200 shadow-lg"
              data-mobile-menu
            >
              <div className="px-4 py-4 space-y-3">
                <button
                  className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => {
                    navigateWithScrollToTop(router, '/');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Home className="w-4 h-4 mr-3" />
                  Home
                </button>
                <button
                  className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => {
                    navigateWithScrollToTop(router, '/about');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Info className="w-4 h-4 mr-3" />
                  About
                </button>
                <button
                  className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => {
                    navigateWithScrollToTop(router, '/listings');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Building className="w-4 h-4 mr-3" />
                  Properties
                </button>
                <span className="w-full flex items-center px-3 py-2 text-[#7f1518] font-medium">
                  <BookOpen className="w-4 h-4 mr-3" />
                  How to Buy
                </span>
                <button
                  className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => {
                    navigateWithScrollToTop(router, '/how-to-sell');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Tag className="w-4 h-4 mr-3" />
                  How to Sell
                </button>
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <button
                    className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => {
                      setShowSignupModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-3" />
                    Create Account
                  </button>
                  <button
                    className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => {
                      setShowSigninModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="w-4 h-4 mr-3" />
                    Sign In
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <div className="bg-[#7f1518] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            How to Buy Property
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Your complete guide to purchasing verified properties in Zimbabwe through Mukamba Gateway. 
            Simple, transparent, and secure from anywhere in the world.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Your Property Buying Journey
          </h2>
        </div>

        {/* Step 1: Create Your Account */}
        <div className="mb-16 lg:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-1 lg:order-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#7f1518] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <span className="text-4xl sm:text-6xl font-light text-gray-300">01</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Sign Up & Complete KYC
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Sign up for free and complete your profile. We accept identity documents from diaspora buyers, 
                making it easy to verify your account from anywhere in the world. Complete verification to unlock 
                full access to property enquiries and bidding.
              </p>
              <ul className="space-y-3">
                {[
                  'Quick registration process with email verification',
                  'Complete phone verification for enquiries and notifications',
                  'Verify identity to make bids and offers on properties'
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-2 lg:order-2">
              <StepImage
                src="/images/step-1-create-account.png"
                alt="Create Your Account - Step 1"
                fallbackIcon={User}
                fallbackText="Account Creation Visual"
                imageLoadErrors={imageLoadErrors}
                setImageLoadErrors={setImageLoadErrors}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Browse Verified Properties */}
        <div className="mb-16 lg:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-2">
              <StepImage
                src="/images/step-2-browse-properties.png"
                alt="Browse Verified Properties - Step 2"
                fallbackIcon={Search}
                fallbackText="Property Search Visual"
                imageLoadErrors={imageLoadErrors}
                setImageLoadErrors={setImageLoadErrors}
              />
            </div>
            <div className="order-1 lg:order-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#7f1518] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <span className="text-4xl sm:text-6xl font-light text-gray-300">02</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Make Offer Or Bid
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Click the View Details Button on the property of your choice. If your Identity verification 
                application has been approved by our team, you are eligible to make an offer by clicking the 
                Green Make Offer Button.
              </p>
              <ul className="space-y-3">
                {[
                  'Browse through verified property listings',
                  'Click View Details to see full property information',
                  'Make offers after identity verification approval'
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Step 3: Review Property Details */}
        <div className="mb-16 lg:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-1 lg:order-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#7f1518] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <span className="text-4xl sm:text-6xl font-light text-gray-300">03</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Submit Your Offer
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Submit your offer through our secure platform. Choose between installment payments or cash purchase,
                and upload supporting documents for verification.
              </p>
              <ul className="space-y-3">
                {[
                  'Choose payment terms (installments or cash)',
                  'Track offer status in real-time'
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-2 lg:order-2">
              <StepImage
                src="/images/step-3-review-details.png"
                alt="Review Property Details - Step 3"
                fallbackIcon={FileText}
                fallbackText="Property Details Visual"
                imageLoadErrors={imageLoadErrors}
                setImageLoadErrors={setImageLoadErrors}
              />
            </div>
          </div>
        </div>

        {/* Step 4: Make Your Offer */}
        <div className="mb-16 lg:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-2">
              <StepImage
                src="/images/step-4-make-offer.png"
                alt="Make Your Offer - Step 4"
                fallbackIcon={DollarSign}
                fallbackText="Offer Process Visual"
                imageLoadErrors={imageLoadErrors}
                setImageLoadErrors={setImageLoadErrors}
              />
            </div>
            <div className="order-1 lg:order-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#7f1518] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <span className="text-4xl sm:text-6xl font-light text-gray-300">04</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Make Payment
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Make Payment: Settle your approved offer’s deposit securely. Choose Bank Transfer (local trust
                account) or Diaspora Payment (international gateway). Use your invoice reference; bank transfers
                require proof of payment. We’ll review and confirm within 24–48 hours, and you can track status
                in your dashboard.
              </p>
              <ul className="space-y-3">
                {[
                  'Review and confirm your invoice amount',
                  'Use the exact invoice/reference when paying',
                  'Upload proof of payment',
                  'Track payment status and download/print your invoice',
                  'Receive confirmation and proceed to due diligence'
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Step 5: Complete Due Diligence */}
        <div className="mb-16 lg:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-1 lg:order-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#7f1518] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <span className="text-4xl sm:text-6xl font-light text-gray-300">05</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Track Your Payments
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Within 24–48 hours after your payment, the Mukamba Gateway team will contact you to confirm
                receipt and outline next steps. To monitor progress, go to your Profile and open the Portfolio
                tab where your purchase record is updated automatically with the payment date, amount and status.
              </p>
              <ul className="space-y-3">
                {[
                  'Payment confirmation within 24–48 hours',
                  'Open Profile → Portfolio to view your updated record',
                  'See payment date, amount, reference and status in Payment History',
                  'We’ll contact you with any additional requirements'
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-2 lg:order-2">
              <StepImage
                src="/images/step-5-due-diligence.png"
                alt="Track Your Payments - Step 5"
                fallbackIcon={CheckCircle}
                fallbackText="Payments Tracking Visual"
                imageLoadErrors={imageLoadErrors}
                setImageLoadErrors={setImageLoadErrors}
              />
            </div>
          </div>
        </div>
        {/* Step 6 has been removed per requirements */}
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied buyers who have found their dream home through Mukamba Gateway's 
            transparent and secure process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#7f1518] hover:bg-[#6a1215] text-white px-8 py-4 text-lg font-semibold"
              onClick={() => {
                setShowSignupModal(true);
                trackEvent('how_to_buy_cta_signup_clicked', {
                  source: 'cta_section',
                  event_category: 'conversion'
                });
              }}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Your Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
              onClick={() => {
                navigateWithScrollToTop(router, '/listings');
                trackEvent('how_to_buy_cta_browse_clicked', {
                  source: 'cta_section',
                  event_category: 'navigation'
                });
              }}
            >
              <Search className="w-5 h-5 mr-2" />
              Browse Properties
            </Button>
          </div>
        </div>
      </div>

      {/* Footer - Same as PropertyDashboard */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <div className="mb-4">
                <Image
                  src="/logo-white.svg"
                  alt="Mukamba Gateway Logo"
                  width={200}
                  height={60}
                  className="h-auto"
                  priority
                />
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-6">
                Transforming property ownership in Southern Africa through innovative flexible installment plans.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/people/Mukamba-Gateway/61580417286014/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
                  aria-label="Follow us on Facebook"
                >
                  <span className="text-xs font-bold">f</span>
                </a>
                <a 
                  href="https://www.linkedin.com/company/mukamba-gateway/about/?viewAsMember=true" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
                  aria-label="Follow us on LinkedIn"
                >
                  <span className="text-xs font-bold">in</span>
                </a>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'About', href: '/about' },
                  { name: 'Properties', href: '/listings' },
                  { name: 'How to Buy', href: '/how-to-buy' },
                  { name: 'How to Sell', href: '/how-to-sell' }
                ].map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-white/80 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Our Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">Our Services</h3>
              <ul className="space-y-2">
                {[
                  'Property Listing Management',
                  'Property Investment',
                  'Administration Oversight',
                  'Concierge Services',
                  'Secure Transfers'
                ].map((service, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="text-white/80 hover:text-white transition-colors text-sm"
                    >
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Us */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-white/80" />
                  <a 
                    href="mailto:hello@mukambagateway.com" 
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    hello@mukambagateway.com
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-white/80" />
                  <a 
                    href="https://wa.me/263787075706"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    +263 787 075 706
                  </a>
                  <a
                    href="https://wa.me/263787075706"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with us on WhatsApp"
                    className="ml-2 inline-flex items-center justify-center rounded-full p-1 transition-colors group"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="border-t border-white/20 mt-12 pt-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex flex-wrap gap-4 mb-4 sm:mb-0">
                <a href="/terms" className="text-white/60 hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </a>
                <a href="/privacy" className="text-white/60 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Insurance
                </a>
              </div>
              <p className="text-white/60 text-sm">
                © 2025 Mukamba Gateway. All rights reserved.
              </p>
            </div>
          </motion.div>
        </div>
      </footer>

      {/* Modals - Same as PropertyDashboard */}
      <UnifiedSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowSigninModal(true);
        }}
        onSignupComplete={async (email) => {
          setShowSignupModal(false);
          trackEvent('how_to_buy_signup_completed', {
            email: email,
            source: 'how_to_buy_page',
            event_category: 'conversion'
          });
          console.log('Signup completed:', { email });
        }}
      />

      <BasicSigninModal
        isOpen={showSigninModal}
        onClose={() => setShowSigninModal(false)}
        onSwitchToSignup={() => {
          setShowSigninModal(false);
          setShowSignupModal(true);
        }}
      />

      <AgentOnboardingModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        onComplete={() => setShowAgentModal(false)}
      />

      <SellerOnboardingModal
        isOpen={showSellerModal}
        onClose={() => setShowSellerModal(false)}
        onComplete={() => setShowSellerModal(false)}
      />

      <BuyerPhoneVerificationModal
        isOpen={showBuyerPhoneVerificationModal}
        onClose={() => setShowBuyerPhoneVerificationModal(false)}
        onVerificationComplete={() => setShowBuyerPhoneVerificationModal(false)}
        buyerType={undefined}
        userEmail={user?.email}
      />

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSignupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
