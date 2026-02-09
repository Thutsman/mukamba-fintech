'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Users, 
  Shield, 
  Building, 
  DollarSign,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  UserPlus,
  LogIn,
  ExternalLink,
  Linkedin,
  Globe,
  Menu,
  X,
  Info,
  BookOpen,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BasicSigninModal } from '@/components/forms/BasicSigninModal';
import { BasicSignupModal } from '@/components/forms/BasicSignupModal';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

export default function AboutPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showSigninModal, setShowSigninModal] = React.useState(false);
  const [showSignupModal, setShowSignupModal] = React.useState(false);

  // Analytics tracking function
  const trackEvent = (eventName: string, parameters: Record<string, any>) => {
    // Track user interactions for analytics
    console.log('Analytics Event:', eventName, parameters);
    
    // In a real app, you would send this to your analytics service
    // Example: Google Analytics, Mixpanel, etc.
    // This is a placeholder for actual analytics implementation
  };

  const teamMembers = [
    {
      name: "Lynne",
      role: "CEO",
      initial: "L"
    },
    {
      name: "Tadi",
      role: "Tech and Innovation Lead",
      initial: "T"
    },
    {
      name: "Peter",
      role: "Strategy Lead",
      initial: "P"
    },
    {
      name: "Tjeludo",
      role: "Head of Finance and Investments",
      initial: "TJ"
    },
    {
      name: "Darryl",
      role: "Our Real Estate Guru and Partner",
      initial: "D"
    },
    {
      name: "Thulani",
      role: "Full Stack Development",
      initial: "TH"
    },
    {
      name: "Edson",
      role: "Head of Business Development",
      initial: "E"
    },
    {
      name: "Nkosi",
      role: "UX Design Lead",
      initial: "N"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img 
                src="/logo.svg" 
                alt="Mukamba Logo" 
                className="h-8 sm:h-10 md:h-12 w-auto object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
              <div className="h-8 sm:h-10 md:h-12 w-auto bg-red-600 rounded-lg flex items-center justify-center px-3" style={{ display: 'none' }}>
                <Home className="w-6 h-6 text-white" />
              </div>
            </Link>

            {/* Desktop Navigation - same as PropertyDashboard (Home, About, Properties, How to Buy, How to Sell) */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="flex items-center text-slate-700 hover:text-red-600 transition-colors font-medium"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              <span className="flex items-center text-red-600 font-medium">
                <Info className="w-4 h-4 mr-2" />
                About
              </span>
              <Link
                href="/listings"
                className="flex items-center text-slate-700 hover:text-red-600 transition-colors font-medium"
              >
                <Building className="w-4 h-4 mr-2" />
                Properties
              </Link>
              <Link
                href="/how-to-buy"
                className="flex items-center text-slate-700 hover:text-red-600 transition-colors font-medium"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                How to Buy
              </Link>
              <Link
                href="/how-to-sell"
                className="flex items-center text-slate-700 hover:text-red-600 transition-colors font-medium"
              >
                <Tag className="w-4 h-4 mr-2" />
                How to Sell
              </Link>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => setShowSignupModal(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
              <Button 
                size="sm"
                className="text-white bg-[#7F1518] hover:bg-[#6a1215]"
                onClick={() => setShowSigninModal(true)}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu - same links as desktop */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-4 h-4 mr-3" />
                  Home
                </Link>
                <span className="flex items-center px-3 py-2 text-red-600 font-medium">
                  <Info className="w-4 h-4 mr-3" />
                  About
                </span>
                <Link
                  href="/listings"
                  className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building className="w-4 h-4 mr-3" />
                  Properties
                </Link>
                <Link
                  href="/how-to-buy"
                  className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen className="w-4 h-4 mr-3" />
                  How to Buy
                </Link>
                <Link
                  href="/how-to-sell"
                  className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Tag className="w-4 h-4 mr-3" />
                  How to Sell
                </Link>
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-center border-slate-300 text-slate-700 hover:bg-slate-50"
                    size="sm"
                    onClick={() => { setShowSignupModal(true); setMobileMenuOpen(false); }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                  <Button 
                    className="w-full justify-center text-white bg-[#7F1518] hover:bg-[#6a1215]"
                    size="sm"
                    onClick={() => { setShowSigninModal(true); setMobileMenuOpen(false); }}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16" style={{ backgroundColor: '#7F1518' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            About Mukamba Gateway
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-white leading-relaxed max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Mukamba Gateway is a buyer-focused, fintech-powered real estate platform that makes owning a home in Zimbabwe simple, transparent, and secure — with South Africa soon to follow.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction Paragraph */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-lg text-gray-700 leading-relaxed">
            We're not just another property listing site. Mukamba Gateway is an integrated transaction ecosystem where every property is verified before listing, payments flow through a regulated trust account, and buyers can track their journey from offer to title through clear, auditable dashboards.
          </p>
        </motion.section>

        {/* Why It Matters */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why It Matters</h2>
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              At every step, Mukamba Gateway delivers trust you can see — verified deeds, escrowed payments, standardized contracts, transparent dashboards, and hands-on concierge support.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Diaspora buyers can use overseas identity and financial documents to verify and purchase safely. Sellers gain access to a pool of pre-verified buyers, with reduced fraud risk and flexible installment options that meet real market needs.
            </p>
          </div>
        </motion.section>

        {/* Who We Are */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Mukamba Gateway coordinates the process — bringing structure, compliance, and technology together. We're not a conveyancer or a marketing agent.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              All property verification and escrow services are handled through our licensed estate agents (JPococks), operating registered trust accounts in full compliance with Zimbabwean law.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Independent conveyancers oversee title transfers, ensuring every transaction ends with a secure handover of ownership.
            </p>
          </div>
        </motion.section>

        {/* Meet the Team */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Meet the Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 + index * 0.1 }}
              >
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#7F1518' }}
                >
                  <span className="text-white font-bold text-3xl">{member.initial}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Advisory Board and Superstars */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 shadow-inner">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Advisory Board and Superstars</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our success is built on the expertise and guidance of industry leaders, strategic partners,
                and trusted advisors who share our vision.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Christabel Shava", role: "Strategic Advisor", url: "https://www.linkedin.com/in/christabel-shava/", type: "linkedin", initial: "C" },
                { name: "Kura Chihota", role: "Legal Advisor", url: "https://www.linkedin.com/in/kura-chihota-94b1098/", type: "linkedin", initial: "K" },
                { name: "John Pocock's", role: "Lead Zimbabwean Partner", url: "https://pocock.property.co.zw/", type: "website", initial: "J" },
                { name: "FNB", role: "Banking Partner", url: "https://www.fnb.co.za/", type: "website", initial: "F" },
                { name: "Tjeludo Ndlovu", role: "Financial Advisor", url: "https://www.linkedin.com/in/tjeludondlovu/", type: "linkedin", initial: "T" },
                { name: "EY", role: "Legal Support Partner", url: "https://www.ey.com/en_zw", type: "website", initial: "E" },
                { name: "Obsidian Investments", role: "Lead South African Partner", url: "https://obsidianproperty.co.za/", type: "website", initial: "O" }
              ].map((member, index) => (
                <motion.a
                  key={member.name}
                  href={member.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {member.type === "linkedin" ? (
                      <Linkedin className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Globe className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#7F1518] text-white font-bold text-xl flex items-center justify-center mb-4">
                    {member.initial || member.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#7f1518] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Ready to Get Started */}
        <motion.section 
          className="bg-gray-50 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied users who are building their future through Mukamba Gateway's innovative solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-white"
              style={{ backgroundColor: '#7F1518' }}
              onClick={() => {
                // Navigate to PropertyListings page
                router.push('/listings');
                // Track analytics
                trackEvent('browse_properties_cta_clicked', {
                  source: 'ready_to_start_section',
                  event_category: 'conversion'
                });
              }}
            >
              Browse Properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg">
              Contact Us
            </Button>
          </div>
        </motion.section>
      </main>

      {/* Footer - same as PropertyDashboard */}
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
