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
  CheckCircle,
  Mail,
  Phone,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { navigateWithScrollToTop } from '@/utils/navigation';
import { BasicSigninModal } from '@/components/forms/BasicSigninModal';
import { BasicSignupModal } from '@/components/forms/BasicSignupModal';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

const trackEvent = (eventName: string, parameters: Record<string, any>) => {
  console.log('Analytics Event:', eventName, parameters);
};

export default function SecureTransfersComingSoonPage() {
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
            Secure Transfers
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Coming soon. A streamlined, escrow-based transfer workflow with transparent milestones.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#7f1518] flex items-center justify-center mb-5">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Coming Soon</h2>
          <p className="text-gray-700 mb-8">
            Subscribe to launch updates or contact our team to learn how secure transfers will work for your transaction.
          </p>
          <Button
            size="lg"
            className="bg-[#7f1518] hover:bg-[#6a1215] text-white px-8 py-4 text-lg font-semibold"
            onClick={() => {
              trackEvent('coming_soon_whatsapp_clicked', {
                source: 'secure_transfers_page',
                event_category: 'engagement',
              });
              window.open('https://wa.me/263787075706', '_blank');
            }}
          >
            Message on WhatsApp
          </Button>
        </div>
      </main>

      {/* Footer */}
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
                  href="https://wa.me/263787075706"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Message us on WhatsApp"
                  className="inline-flex items-center justify-center rounded-full p-1.5 transition-colors group"
                >
                  <WhatsAppIcon className="w-4 h-4 text-green-400 group-hover:text-green-300" />
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
                  { label: 'Property Listing Management', href: '/property-listing-management' },
                  { label: 'Property Investment', href: '/property-investment' },
                  { label: 'Administration Oversight', href: '/administration-oversight' },
                  { label: 'Concierge Services', href: '/concierge-services' },
                  { label: 'Secure Transfers', href: '/secure-transfers' },
                ].map((service) => (
                  <li key={service.label}>
                    <a href={service.href} className="text-white/80 hover:text-white transition-colors text-sm">
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
                  Terms &amp; Conditions
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

      {/* Modals */}
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

