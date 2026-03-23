 'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Building,
  Info,
  BookOpen,
  Tag,
  UserPlus,
  LogIn,
  ArrowRight,
  CheckCircle,
  ClipboardList,
  FileText,
  Shield,
  Users,
  Phone,
  Mail,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BasicSignupModal } from '@/components/forms/BasicSignupModal';
import { BasicSigninModal } from '@/components/forms/BasicSigninModal';
import { AgentOnboardingModal } from '@/components/agent/AgentOnboardingModal';
import { SellerOnboardingModal } from '@/components/forms/SellerOnboardingModal';
import { BuyerPhoneVerificationModal } from '@/components/forms/BuyerPhoneVerificationModal';
import { navigateWithScrollToTop } from '@/utils/navigation';
import { useAuthStore } from '@/lib/store';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

// Reuse lightweight analytics helper used on marketing pages
const trackEvent = (eventName: string, parameters: Record<string, any>) => {
  console.log('Analytics Event:', eventName, parameters);
};

export default function PropertyListingManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const [showSigninModal, setShowSigninModal] = React.useState(false);
  const [showAgentModal, setShowAgentModal] = React.useState(false);
  const [showSellerModal, setShowSellerModal] = React.useState(false);
  const [showBuyerPhoneVerificationModal, setShowBuyerPhoneVerificationModal] =
    React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [sellerIntent, setSellerIntent] = React.useState(false);

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
      {/* Navigation Bar - match HowToBuy color theme */}
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

            {/* Center Navigation */}
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
              <a
                href="/how-to-buy"
                className="text-gray-700 hover:text-[#7f1518] transition-colors flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithScrollToTop(router, '/how-to-buy');
                }}
              >
                <BookOpen className="w-4 h-4 mr-1" />
                How to Buy
              </a>
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
                <Tag className="w-6 h-6" />
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
                  trackEvent('plm_create_account_clicked', {
                    source: 'navigation_bar',
                    event_category: 'conversion',
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
                  trackEvent('plm_sign_in_clicked', {
                    source: 'navigation_bar',
                    event_category: 'conversion',
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
                <button
                  className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => {
                    navigateWithScrollToTop(router, '/how-to-buy');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <BookOpen className="w-4 h-4 mr-3" />
                  How to Buy
                </button>
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Property Listing Management B2B
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            We do not list what we cannot verify. Mukamba Gateway manages your
            property listings end-to-end so you can focus on closing deals.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Who This Service Is For */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Who This Service Is For
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-gray-200 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Building className="w-8 h-8 text-[#7f1518] mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Developers with Inventory
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Single units or bulk portfolios looking for a structured,
                  verified way to bring stock onto the market. We handle
                  documentation, listing structure, and buyer matching so your
                  projects move faster.
                </p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-[#7f1518] mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Agents & Mandated Sellers
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Sales teams and individual mandate holders who need a trusted
                  process for listing, verification, and managing offers.
                  Mukamba Gateway provides the back-office engine so you can
                  focus on selling.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What's Included */}
        <section className="bg-[#F9FAFB] px-4 sm:px-8 py-12 rounded-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              What&apos;s Included
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              'Listing intake with full document verification (title, ownership, IDs, approvals)',
              'Verification workflow with clear exceptions process',
              'Professional listing creation with pricing, payment options, and disclosures',
              'Media standards support (photos, video, 360° tours where available)',
              'Offer management with submission, review, and acceptance steps',
              'Payment reference rules and proof-of-payment handling',
              'Complete audit trail through Mukamba Gateway platform',
              'Option for private admin dashboard (offline listing management)',
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start bg-white rounded-lg p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-[#7f1518]" />
                </div>
                <p className="ml-3 text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              How It Works
            </h2>
          </div>
          <div className="space-y-8 max-w-3xl mx-auto">
            {[
              {
                step: '01',
                title: 'Submit Property + Documents',
                description:
                  'Provide property details and upload all required verification documents through a secure intake form.',
              },
              {
                step: '02',
                title: 'Verification Outcome',
                description:
                  'Our team reviews ownership, compliance, and documentation. You receive a verified status or a clear exception report within 5–7 business days.',
              },
              {
                step: '03',
                title: 'Listing Goes Live',
                description:
                  'Verified properties go live on Mukamba Gateway, visible only to vetted buyers with the right access level.',
              },
              {
                step: '04',
                title: 'Offers Collected',
                description:
                  'Receive and review structured offers from verified buyers. All activity is tracked in your dashboard.',
              },
              {
                step: '05',
                title: 'Buyer Payment Begins',
                description:
                  'Accepted offers move into secure payment and transfer workflows with full visibility for you and the buyer.',
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="flex flex-col sm:flex-row items-start gap-4"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#7f1518] text-white text-lg font-semibold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Seller Protections */}
        <section className="bg-[#F9FAFB] px-4 sm:px-8 py-12 rounded-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Seller Protections
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              'Only verified buyers can proceed to transactional steps',
              'Complete transparency throughout the listing lifecycle',
              'Professional document management and storage',
              'Clear written instructions and defined milestones',
              'Secure payment handling through escrow',
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start bg-white rounded-lg p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex-shrink-0 mt-1">
                  <Shield className="w-5 h-5 text-[#7f1518]" />
                </div>
                <p className="ml-3 text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white rounded-2xl border border-gray-200 px-6 sm:px-10 py-10 sm:py-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to List Your Property?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join developers and agents who trust Mukamba Gateway for verified,
            structured property transactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#7f1518] hover:bg-[#6a1215] text-white px-8 py-4 text-lg font-semibold"
              onClick={() => {
                trackEvent('floating_sell_button_clicked', {
                  source: 'property_listing_management_page',
                  event_category: 'conversion',
                  user_status: user ? 'authenticated' : 'guest',
                });

                if (user) {
                  setShowSellerModal(true);
                } else {
                  setSellerIntent(true);
                  setShowSignupModal(true);
                }
              }}
            >
              <ClipboardList className="w-5 h-5 mr-2" />
              List a Property
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
              onClick={() => {
                trackEvent('plm_download_checklist_clicked', {
                  source: 'cta_section',
                  event_category: 'engagement',
                });
                window.open('/documents/property-listing-checklist', '_blank');
              }}
            >
              <FileText className="w-5 h-5 mr-2" />
              View Checklist
            </Button>
          </div>
        </section>
      </div>

      {/* Footer - copied from PropertyDashboard to stay in sync */}
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
                Transforming property ownership in Southern Africa through
                innovative flexible installment plans.
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
                  { name: 'How to Sell', href: '/how-to-sell' },
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
                  {
                    label: 'Property Listing Management',
                    href: '/property-listing-management',
                  },
                  { label: 'Property Investment', href: '/property-investment' },
                  { label: 'Administration Oversight', href: '/administration-oversight' },
                  { label: 'Concierge Services', href: '/concierge-services' },
                  { label: 'Secure Transfers', href: '/secure-transfers' },
                ].map((service) => (
                  <li key={service.label}>
                    <a
                      href={service.href}
                      className="text-white/80 hover:text-white transition-colors text-sm"
                    >
                      {service.label}
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
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm">+263 787 075 706</span>
                  <a
                    href="tel:+263787075706"
                    aria-label="Call us"
                    className="inline-flex items-center justify-center rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href="https://wa.me/263787075706"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Message us on WhatsApp"
                    className="inline-flex items-center justify-center rounded-full p-1.5 transition-colors group"
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
                <a
                  href="/terms"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Terms &amp; Conditions
                </a>
                <a
                  href="/privacy"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
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

      {/* Modals */}
      <BasicSignupModal
        isOpen={showSignupModal}
        onClose={() => {
          setShowSignupModal(false);
          setSellerIntent(false);
        }}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setSellerIntent(false);
          setShowSigninModal(true);
        }}
        sellerIntent={sellerIntent}
        onSellerSignupComplete={() => {
          setSellerIntent(false);
          setTimeout(() => {
            setShowSellerModal(true);
          }, 1000);
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

