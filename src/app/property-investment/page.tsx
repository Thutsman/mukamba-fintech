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
  Shield,
  Search,
  Mail,
  Phone,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { navigateWithScrollToTop } from '@/utils/navigation';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { BasicSigninModal } from '@/components/forms/BasicSigninModal';
import { BasicSignupModal } from '@/components/forms/BasicSignupModal';

const trackEvent = (eventName: string, parameters: Record<string, any>) => {
  console.log('Analytics Event:', eventName, parameters);
};

export default function PropertyInvestmentPage() {
  const router = useRouter();
  const [showSigninModal, setShowSigninModal] = React.useState(false);
  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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

  const investmentPathways = [
    {
      step: '1',
      title: 'Buy Outright (Cash)',
      description:
        'Complete property ownership with verified documents and immediate possession after transfer.',
    },
    {
      step: '2',
      title: 'Buy on Instalments',
      description:
        'Agreed payment schedule structured in the sale agreement with full visibility in your dashboard.',
    },
    {
      step: '3',
      title: 'Pipeline Access',
      description:
        'Get matched to verified stock that fits your budget and investment timeline.',
    },
  ] as const;

  const whatYouGet = [
    'Access to verified listings with transparent transaction steps.',
    'Ability to submit offers with custom payment terms.',
    'Real‑time payment tracking visibility in your dashboard.',
    'Dedicated admin support for process coordination.',
    'Priority support for diaspora and remote investors.',
  ] as const;

  const reduceRisk = [
    'Identity verification required to bid and submit offers.',
    'Property verification to reduce fraud risk.',
    'Escrow handling with controlled fund releases.',
    'Formal trust account process for all payments.',
    'Complete audit trail and documentation.',
  ] as const;

  const simpleSteps = [
    { step: '1', title: 'Create Account', description: 'Register and set up your investor profile.' },
    { step: '2', title: 'Verify ID', description: 'Complete KYC verification (local or diaspora documents accepted).' },
    { step: '3', title: 'Choose Property', description: 'Browse and select from verified listings.' },
    { step: '4', title: 'Make Offer', description: 'Submit offer with your preferred payment terms.' },
    { step: '5', title: 'Pay', description: 'Transfer funds via local trust account or diaspora gateway.' },
    { step: '6', title: 'Track', description: 'Monitor progress in your Mukamba Gateway dashboard.' },
  ] as const;

  const faqs = [
    {
      question: 'Can I invest from outside Zimbabwe?',
      answer:
        'Yes. Our KYC process accepts diaspora documentation. You can invest from anywhere with international payment options available.',
    },
    {
      question: 'How do instalments work?',
      answer:
        'Payment terms are defined in the sale agreement and visible in your dashboard. Our team provides support if any issues arise.',
    },
    {
      question: 'What if I need to adjust my payment schedule?',
      answer:
        'Contact your investment team. We can discuss options within the framework of your sale agreement.',
    },
    {
      question: 'Is my investment protected?',
      answer:
        'Yes. Funds are held in escrow with controlled releases per written instructions, protecting both buyer and seller.',
    },
  ] as const;

  return (
    <div className="min-h-screen bg-white">
      {/* Header – same structure as other marketing pages */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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

            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setShowSignupModal(true)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Create Account
              </Button>
              <Button
                size="sm"
                className="bg-[#7f1518] hover:bg-[#6a1215] text-white"
                onClick={() => setShowSigninModal(true)}
              >
                <LogIn className="w-4 h-4 mr-1" />
                Sign In
              </Button>
            </div>

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
          </div>
        </div>

        {/* Mobile menu dropdown */}
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

      {/* Hero */}
      <section className="bg-[#7f1518] py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Property Investment
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Built for buyers who want proof, not promises. Invest with verification, transparent
            steps, and secure payment handling.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Investment Pathways */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Investment Pathways
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {investmentPathways.map((pathway) => (
              <div
                key={pathway.step}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-[#7f1518] text-white flex items-center justify-center font-semibold mx-auto mb-4">
                  {pathway.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {pathway.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {pathway.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What You Get – grey hug */}
        <section className="bg-[#F9FAFB] px-4 sm:px-8 py-12 rounded-3xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              What You Get
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {whatYouGet.map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-[#7f1518] mt-0.5" />
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How We Reduce Risk – separated white card section */}
        <section>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-8 py-8 mt-4 sm:mt-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  How We Reduce Risk
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reduceRisk.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <Shield className="w-5 h-5 text-[#7f1518] mt-0.5" />
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Simple Steps to Invest – grey hug */}
        <section className="bg-[#F9FAFB] px-4 sm:px-8 py-12 rounded-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Simple Steps to Invest
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {simpleSteps.map((step) => (
              <div
                key={step.step}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-[#7f1518] text-white flex items-center justify-center text-sm font-semibold mb-2">
                  {step.step}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ready to Start Investing CTA */}
        <section className="bg-[#FDF5F5] rounded-2xl px-6 sm:px-10 py-10 sm:py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Ready to Start Investing?
          </h2>
          <p className="text-sm sm:text-base text-gray-700 mb-8 max-w-2xl mx-auto">
            Get matched with properties that fit your investment goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#7f1518] hover:bg-[#6a1215] text-white px-8 py-4 text-lg font-semibold"
              onClick={() => {
                navigateWithScrollToTop(router, '/listings');
                trackEvent('investment_browse_properties_clicked', {
                  source: 'property_investment_page',
                  event_category: 'navigation',
                });
              }}
            >
              Browse Properties
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
              onClick={() => {
                trackEvent('investment_speak_team_clicked', {
                  source: 'property_investment_page',
                  event_category: 'engagement',
                });
                // Match WhatsApp contact behaviour
                window.open('https://wa.me/263787075706', '_blank');
              }}
            >
              Speak to Investment Team
            </Button>
          </div>
        </section>
      </main>

      {/* Footer – same as PropertyDashboard / marketing pages */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                Transforming property ownership in Southern Africa through innovative flexible
                installment plans.
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
                  className="w-8 h-8 bg.white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
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
                  { name: 'How to Sell', href: '/how-to-sell' },
                ].map((link) => (
                  <li key={link.name}>
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
                  {
                    label: 'Property Investment',
                    href: '/property-investment',
                  },
                  { label: 'Administration Oversight', href: '#' },
                  { label: 'Concierge Services', href: '#' },
                  { label: 'Secure Transfers', href: '#' },
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

      {/* Auth Modals */}
      <BasicSigninModal
        isOpen={showSigninModal}
        onClose={() => setShowSigninModal(false)}
        onSwitchToSignup={() => {
          setShowSigninModal(false);
          setShowSignupModal(true);
        }}
      />

      <BasicSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowSigninModal(true);
        }}
      />
    </div>
  );
}

