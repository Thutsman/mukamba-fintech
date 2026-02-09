'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ClipboardList,
  Upload,
  CheckCircle,
  FileText,
  Scale,
  ScrollText,
  Stamp,
  Home,
  Building,
  UserPlus,
  ArrowRight,
  LogIn,
  Menu,
  Mail,
  Phone,
  Search,
  Info,
  BookOpen,
  Tag
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { UnifiedSignupModal } from '@/components/forms/UnifiedSignupModal';
import { BasicSigninModal } from '@/components/forms/BasicSigninModal';
import { AgentOnboardingModal } from '@/components/agent/AgentOnboardingModal';
import { SellerOnboardingModal } from '@/components/forms/SellerOnboardingModal';
import { BuyerPhoneVerificationModal } from '@/components/forms/BuyerPhoneVerificationModal';
import { useAuthStore } from '@/lib/store';
import { navigateWithScrollToTop } from '@/utils/navigation';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

const trackEvent = (eventName: string, parameters: Record<string, any>) => {
  console.log('Analytics Event:', eventName, parameters);
};

const sellingSteps = [
  {
    number: '01',
    title: 'Complete Seller Verification',
    description:
      'Begin by verifying your identity and property ownership. This ensures all sellers on our platform are legitimate and authorized to sell.',
    icon: Shield,
    cards: [
      {
        title: 'Phone Verification',
        description: 'Verify your phone number via SMS to confirm your identity.'
      },
      {
        title: 'Identity Verification',
        description: 'Provide government-issued identification documents.'
      },
      {
        title: 'Property Ownership Verification',
        description: 'Upload proof of property ownership or authorization to sell.'
      },
      {
        title: 'Contact Information',
        description: 'Submit valid contact details and verify your address.'
      }
    ]
  },
  {
    number: '02',
    title: 'Submit Listing Details',
    description:
      'After verification, provide high-resolution property images, specific descriptions, and set your price with preferred payment terms.',
    icon: Upload,
    cards: [
      {
        title: 'High Resolution Images',
        description: 'Professional photos that highlight your property’s best features.'
      },
      {
        title: 'Property Description',
        description: 'Detailed specifications and standout features for buyers.'
      },
      {
        title: 'Pricing & Terms',
        description: 'Set your price and payment options (cash, installments, or both).'
      }
    ]
  },
  {
    number: '03',
    title: 'List on Platform',
    description:
      'Our team reviews your submission and publishes it to the marketplace. You receive real-time access to monitor performance.',
    icon: ClipboardList,
    cards: [
      {
        title: 'Dashboard Overview',
        description: 'Track all live listings and performance analytics.'
      },
      {
        title: 'Offer Management',
        description: 'View, accept, or reject offers from verified buyers.'
      },
      {
        title: 'Document Portal',
        description: 'Upload and manage deeds, contracts, and supporting documents.'
      }
    ]
  },
  {
    number: '04',
    title: 'Review & Accept Offers',
    description:
      'Potential buyers submit offers directly on your listing. Review each offer, negotiate, and accept terms that suit you.',
    icon: CheckCircle,
    cards: [
      { title: 'View Offers', description: 'See all offers from pre-verified buyers.' },
      {
        title: 'Accept Terms',
        description: 'Once you accept terms, invoices and next steps are generated automatically.'
      },
      {
        title: 'Track Payments',
        description: 'Monitor every payment as it comes in via the secure portal.'
      }
    ]
  },
  {
    number: '05',
    title: 'Agreement of Sale',
    description:
      "Once payment is made according to the agreed terms, our legal partners draft the Agreement of Sale covering every critical detail of the transaction.",
    icon: FileText,
    cards: [
      {
        title: 'Document Preparation',
        description: 'Agreement drafted by licensed estate agents.'
      },
      {
        title: 'Sign & Upload',
        description: 'Sign digitally and store the agreement in your dashboard.'
      },
      {
        title: 'Legal Compliance',
        description: 'All terms, risk transfer, and dispute processes are clearly documented.'
      }
    ]
  },
  {
    number: '06',
    title: 'Prepare Transfer Documents',
    description:
      'Our legal partners coordinate with the conveyancer to prepare all necessary transfer documents, including stamp duty and legal service requirements.',
    icon: ScrollText,
    cards: [
      {
        title: 'Title Deed Transfer',
        description: 'Provide the original title deed to the conveyancer.'
      },
      {
        title: 'Legal Documents',
        description: 'Power of Attorney, declarations, and draft deeds are created.'
      },
      {
        title: 'Conveyancing Fees',
        description: 'Calculated according to the standard 2–5% tariff of the purchase price.'
      }
    ]
  },
  {
    number: '07',
    title: 'Clearances & Tax Compliance',
    description:
      'Both parties ensure all outstanding fees, rates, and taxes are cleared before transfer. Required documents are uploaded to the portal for review.',
    icon: Scale,
    cards: [
      {
        title: 'Rates Clearance',
        description: 'Certificate confirming no outstanding council rates or levies.'
      },
      {
        title: 'Levy Clearance',
        description: 'Required if the property falls under sectional title or HOA.'
      },
      {
        title: 'Tax Clearance',
        description: 'Capital Gains Tax clearance from ZIMRA when applicable.'
      }
    ]
  },
  {
    number: '08',
    title: 'Transfer Registration',
    description:
      'The conveyancer lodges all documents with the Deeds Office. Once processed, the title is transferred into the buyer’s name and the transaction is complete.',
    icon: Stamp,
    cards: [
      { title: 'Document Lodgement', description: 'All documents submitted to the Deeds Office.' },
      { title: 'Registry Examination', description: 'Documents reviewed and processed by officials.' },
      { title: 'Title Transfer', description: 'New deed issued in the buyer’s name.' }
    ]
  }
] as const;

const sellerRequirements = [
  {
    number: '1',
    title: 'Proof of Ownership Documents',
    items: [
      'Title Deed – The gold standard document showing legal ownership.',
      'Valid Offer or Allocation Letter – Common with newly subdivided stands.',
      'Approved Subdivision Permit – Required when a larger plot was divided.',
      'Approved Survey Diagrams – Shows exact boundaries and dimensions.'
    ]
  },
  {
    number: '2',
    title: 'Agreement of Sale',
    items: [
      'Full details of both buyer and seller.',
      'Exact property description matching the title deeds.',
      'Purchase price, payment terms, and occupation arrangements.',
      'Special conditions or warranties agreed by both parties.'
    ]
  },
  {
    number: '3',
    title: 'Financial Considerations',
    items: [
      'Conveyancing fees: approximately 2–5% of purchase price.',
      'Capital Gains Tax: varies according to property value.',
      'Estate agent commission: typically 5% of sale price.',
      'Clearance certificate and administrative costs.'
    ]
  }
] as const;

export default function HowToSellPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const [showSigninModal, setShowSigninModal] = React.useState(false);
  const [showAgentModal, setShowAgentModal] = React.useState(false);
  const [showSellerModal, setShowSellerModal] = React.useState(false);
  const [showBuyerPhoneVerificationModal, setShowBuyerPhoneVerificationModal] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [sellerIntent, setSellerIntent] = React.useState(false);

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

  // SAFEGUARD: Never show signup modal when authenticated
  React.useEffect(() => {
    if (user && showSignupModal) {
      setShowSignupModal(false);
    }
  }, [user, showSignupModal]);

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src="/logo.svg" alt="Mukamba Gateway" width={140} height={40} className="h-8 w-auto" priority />
            </div>

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
              <span className="text-[#7f1518] font-medium flex items-center cursor-default">
                <Tag className="w-4 h-4 mr-1" />
                How to Sell
              </span>
            </div>

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

            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setShowSignupModal(true);
                  trackEvent('how_to_sell_create_account_clicked', {
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
                  trackEvent('how_to_sell_sign_in_clicked', {
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
                <span className="w-full flex items-center px-3 py-2 text-[#7f1518] font-medium">
                  <Tag className="w-4 h-4 mr-3" />
                  How to Sell
                </span>
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

      <section className="bg-[#7f1518] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">How to Sell Your Property</h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            List your property with confidence on Mukamba Gateway. We handle verification, marketing, and secure
            transactions so you can focus on getting the best value.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <p className="text-[#7f1518] font-semibold tracking-wide uppercase">Guided Experience</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">The Complete Selling Process</h2>
        </div>

        <div className="space-y-10">
          {sellingSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-3xl border border-gray-100 shadow-lg p-6 sm:p-10 overflow-hidden"
            >
              <div className="absolute left-8 top-10 bottom-10 w-1 bg-[#7f1518]/15 hidden md:block" />

              <div className="flex flex-col md:flex-row gap-10 relative z-10">
                <div className="md:w-1/3">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-[#7f1518] flex items-center justify-center shadow-lg">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-5xl font-light text-gray-200">{step.number}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>

                <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {step.cards.map((card) => (
                    <div
                      key={card.title}
                      className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-2 hover:bg-white hover:border-[#7f1518]/30 transition"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {card.title}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Seller Requirements & Costs</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Understand what documents you will need and what costs to expect when selling through Mukamba Gateway.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sellerRequirements.map((card) => (
              <div key={card.title} className="bg-white rounded-3xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#7f1518] text-white flex items-center justify-center font-semibold">
                    {card.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{card.title}</h3>
                </div>
                <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#7f1518] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to List Your Property?</h2>
          <p className="text-base sm:text-lg text-white/90 mb-8 max-w-3xl mx-auto">
            Get started today and connect with verified buyers looking for properties like yours. We handle verification, marketing,
            and secure transactions so you can focus on getting the best value.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[#7f1518] hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={() => {
                // Track analytics
                trackEvent('how_to_sell_cta_list_property_clicked', {
                  source: 'cta_section',
                  event_category: 'conversion',
                  user_status: user ? 'authenticated' : 'guest'
                });
                
                // Smart routing based on authentication
                if (user) {
                  // Authenticated user: Open seller onboarding
                  setShowSellerModal(true);
                } else {
                  // Guest user: Open signup modal with seller intent
                  setSellerIntent(true);
                  setShowSignupModal(true);
                }
              }}
            >
              List Your Property
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              onClick={() => navigateWithScrollToTop(router, '/listings')}
            >
              <Search className="w-5 h-5 mr-2" />
              View Listed Properties
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="mb-4">
                <Image src="/logo-white.svg" alt="Mukamba Gateway Logo" width={200} height={60} className="h-auto" priority />
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-6">
                Transforming property ownership in Southern Africa through innovative flexible installment plans.
              </p>
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
                ].map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-white/80 hover:text-white transition-colors text-sm">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

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
                ].map((service) => (
                  <li key={service}>
                    <a href="#" className="text-white/80 hover:text-white transition-colors text-sm">
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

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
                  <a href="mailto:hello@mukambagateway.com" className="text-white/80 hover:text-white transition-colors text-sm">
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
              <p className="text-white/60 text-sm">© 2025 Mukamba Gateway. All rights reserved.</p>
            </div>
          </motion.div>
        </div>
      </footer>

      <UnifiedSignupModal
        isOpen={showSignupModal}
        onClose={() => {
          setShowSignupModal(false);
          setSellerIntent(false); // Reset seller intent when modal closes
        }}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setSellerIntent(false); // Reset seller intent when switching to login
          setShowSigninModal(true);
        }}
        sellerIntent={sellerIntent}
        onSellerSignupComplete={() => {
          // User completed signup with seller intent - open seller onboarding
          setSellerIntent(false); // Reset seller intent
          setTimeout(() => {
            setShowSellerModal(true); // Open seller onboarding modal
          }, 1000); // Small delay to let signup modal close gracefully
        }}
        onSignupComplete={async (email) => {
          setShowSignupModal(false);
          trackEvent('how_to_sell_signup_completed', {
            email,
            source: 'how_to_sell_page',
            event_category: 'conversion'
          });
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

      <AgentOnboardingModal isOpen={showAgentModal} onClose={() => setShowAgentModal(false)} onComplete={() => setShowAgentModal(false)} />

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

      <AnimatePresence>
        {showSignupModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 pointer-events-none" />
        )}
      </AnimatePresence>
    </div>
  );
}


