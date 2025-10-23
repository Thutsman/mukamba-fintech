import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Mukamba Gateway | Your Path to Home Ownership",
  description: "Learn about Mukamba Gateway, a buyer-focused, fintech-powered real estate platform that makes owning a home in Zimbabwe simple, transparent, and secure.",
  keywords: [
    "about Mukamba Gateway",
    "property platform Zimbabwe",
    "real estate fintech",
    "home ownership Zimbabwe",
    "property investment platform",
    "diaspora property purchase"
  ],
  openGraph: {
    title: "About Mukamba Gateway | Your Path to Home Ownership",
    description: "Learn about Mukamba Gateway, a buyer-focused, fintech-powered real estate platform that makes owning a home in Zimbabwe simple, transparent, and secure.",
    url: 'https://www.mukambagateway.com/about',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "About Mukamba Gateway | Your Path to Home Ownership",
    description: "Learn about Mukamba Gateway, a buyer-focused, fintech-powered real estate platform that makes owning a home in Zimbabwe simple, transparent, and secure.",
  },
};

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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="flex items-center text-slate-700 hover:text-red-600 transition-colors font-medium"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              <Link
                href="/listings"
                className="flex items-center text-slate-700 hover:text-red-600 transition-colors font-medium"
              >
                <Building className="w-4 h-4 mr-2" />
                Properties
              </Link>
              <span className="flex items-center text-red-600 font-medium">
                About
              </span>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
              <Button 
                size="sm"
                className="text-white bg-[#7F1518] hover:bg-[#6a1215]"
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

          {/* Mobile Menu */}
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
                <Link
                  href="/listings"
                  className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building className="w-4 h-4 mr-3" />
                  Properties
                </Link>
                <span className="flex items-center px-3 py-2 text-red-600 font-medium">
                  About
                </span>
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-center border-slate-300 text-slate-700 hover:bg-slate-50"
                    size="sm"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                  <Button 
                    className="w-full justify-center text-white bg-[#7F1518] hover:bg-[#6a1215]"
                    size="sm"
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
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Advisory Board and Superstars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Christabel Shava", url: "https://www.linkedin.com/in/christabel-shava/", type: "linkedin" },
              { name: "Kura Chihota", url: "https://www.linkedin.com/in/kura-chihota-94b1098/", type: "linkedin" },
              { name: "John Pocock's - Lead Zimbabwean Partner", url: "https://pocock.property.co.zw/", type: "website" },
              { name: "FNB - our bankers", url: "https://www.fnb.co.za/", type: "website" },
              { name: "Tjeludo Ndlovu", url: "https://www.linkedin.com/in/tjeludondlovu/", type: "linkedin" },
              { name: "EY - providing all our legal support", url: "https://www.ey.com/en_zw", type: "website" },
              { name: "Obsidian Investments - Lead South African partner", url: "https://obsidianproperty.co.za/", type: "website" }
            ].map((member, index) => (
              <motion.a
                key={index}
                href={member.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 min-h-[100px] flex flex-col items-center justify-center hover:border-red-300 hover:scale-105 cursor-pointer group relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 + index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                {/* Link Type Icon */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {member.type === "linkedin" ? (
                    <Linkedin className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Globe className="w-5 h-5 text-green-600" />
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-red-600 transition-colors">{member.name}</h3>
                  <p className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {member.type === "linkedin" ? "View LinkedIn Profile" : "Visit Website"}
                  </p>
                </div>
              </motion.a>
            ))}
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <img
                  src="/logo-white.svg"
                  alt="Mukamba Gateway Logo"
                  className="h-auto w-[200px]"
                />
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-6">
                Transforming property ownership in Southern Africa through innovative flexible installment plans.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'About', href: '/about' },
                  { name: 'Properties', href: '/listings' }
                ].map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href} 
                      className="text-white/80 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Our Services */}
            <div>
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
                    <span className="text-white/80 text-sm">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-white/80" />
                  <a 
                    href="mailto:contact@mukambagateway.com" 
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    contact@mukambagateway.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-12 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex flex-wrap gap-4 mb-4 sm:mb-0">
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
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
          </div>
        </div>
      </footer>
    </div>
  );
}
