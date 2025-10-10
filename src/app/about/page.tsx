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
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

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
      name: "Tatenda",
      role: "CTO",
      initial: "T"
    },
    {
      name: "Tendai",
      role: "COO",
      initial: "T"
    },
    {
      name: "Rumbidzai",
      role: "CFO",
      initial: "R"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-40">
        <div className="w-full px-6 md:px-8">
          <div className="flex items-center justify-between h-17 sm:h-21 md:h-24">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <img 
                  src="/logo.svg" 
                  alt="Mukamba Logo" 
                  className="header-logo w-35 h-30 sm:w-44 sm:h-36 md:w-52 md:h-42 object-contain"
                  onError={(e) => {
                    // Fallback to the original icon if image fails to load
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div className="w-35 h-30 sm:w-44 sm:h-36 md:w-52 md:h-42 bg-red-600 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                  <User className="w-18 h-15 sm:w-22 sm:h-18 md:w-26 md:h-21 text-white" />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="flex items-center text-slate-700 hover:text-red-600 transition-colors font-medium"
              >
                <User className="w-4 h-4 mr-2" />
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

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
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
                className="text-white"
                style={{ backgroundColor: '#7F1518' }}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16" style={{ backgroundColor: '#7F1518' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            About Mukamba Gateway
          </motion.h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-lg text-gray-700 leading-relaxed">
            Mukamba Gateway is a revolutionary property platform that transforms how people buy and sell real estate in Southern Africa. We believe that homeownership should be accessible to everyone, regardless of their financial situation.
          </p>
        </motion.section>

        {/* Why It Matters */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why It Matters</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Payment Options</h3>
                <p className="text-gray-700">We offer installment-based ownership, making property investment accessible to more people.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Transactions</h3>
                <p className="text-gray-700">All transactions are protected and verified, ensuring your investment is safe.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Properties</h3>
                <p className="text-gray-700">Every property is thoroughly vetted before listing, ensuring quality and authenticity.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Who We Are */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Mukamba Gateway is a fintech-enabled real estate platform designed specifically for the Southern African market. We combine innovative technology with deep local knowledge to create a seamless property buying and selling experience.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our platform serves both local buyers and the diaspora community, providing flexible payment options and secure transaction processes that make property investment accessible to everyone.
            </p>
          </div>
        </motion.section>

        {/* Meet the Team */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Meet the Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
              >
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#7F1518' }}
                >
                  <span className="text-white font-bold text-3xl">{member.initial}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-base text-gray-600">{member.role}</p>
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
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-3">
                  <img
                    src="/logo.jpg"
                    alt="Mukamba Logo"
                    className="w-8 h-8 object-contain"
                    onLoad={() => console.log('Footer logo loaded successfully')}
                    onError={(e) => {
                      console.log('Footer logo failed to load, using fallback');
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                    <Home className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-xl font-bold">Mukamba Gateway</span>
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
