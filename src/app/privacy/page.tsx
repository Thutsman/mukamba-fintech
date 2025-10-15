'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Home,
  Mail,
  User,
  UserPlus,
  LogIn,
  Search,
  ArrowRight,
  FileText,
  Shield,
  Scale,
  Building,
  DollarSign,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Lock,
  Eye,
  Database,
  Settings
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Mukamba Gateway Logo"
                width={150}
                height={40}
                className="h-auto"
                priority
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
                About
              </Link>
              <Link href="/listings" className="text-slate-600 hover:text-slate-900 transition-colors">
                Properties
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => {
                  // Open signin modal logic would go here
                  console.log('Sign in clicked');
                }}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-[#7f1518] hover:bg-[#6a1215] text-white"
                onClick={() => {
                  // Open signup modal logic would go here
                  console.log('Sign up clicked');
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-8"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Privacy Policy for Mukamba Gateway
            </h1>
            <p className="text-slate-600 text-lg">
              Effective Date: October 15, 2025
            </p>
            <p className="text-slate-700 mt-4">
              Mukamba Gateway ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our property purchasing platform.
            </p>
          </div>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information We Collect</h2>
            <p className="text-slate-700 mb-4">We may collect the following types of information:</p>
            
            <h3 className="text-xl font-semibold text-slate-900 mb-3">1. Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
              <li>Name, email address, phone number, and identification documents (e.g., ID, passport, or driver's license).</li>
              <li>Account details required for creating, verifying, and managing your profile.</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">2. Property Information</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
              <li>Details of properties listed by admin, including descriptions, location, and images.</li>
              <li>Saved property preferences and search history.</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">3. Financial Information</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
              <li>Payments and transaction details, including payment terms, installment schedules, and supporting documents.</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">4. Technical Data</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>IP address, browser type, device information, and usage logs.</li>
              <li>Cookies and tracking technologies for user experience and analytics.</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">How We Use Your Information</h2>
            <p className="text-slate-700 mb-4">We collect and use your information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>To provide, customize, and improve our services.</li>
              <li>To verify your identity and manage your account.</li>
              <li>To process payments, offers, and property transactions securely.</li>
              <li>To communicate with you about updates, support, or marketing (if opted-in).</li>
              <li>To detect, prevent, and address technical issues, fraud, or unauthorized activity.</li>
              <li>To comply with applicable laws and regulations, including property ownership and financial reporting requirements.</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Sharing</h2>
            <p className="text-slate-700 mb-4">
              We do not sell your data. However, we may share your personal information under the following circumstances:
            </p>
            
            <h3 className="text-xl font-semibold text-slate-900 mb-3">1. Trusted Third-Party Providers</h3>
            <p className="text-slate-700 mb-4">
              With service providers who help us operate the platform, such as hosting providers, payment processors, or verification services.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">2. Legal Compliance</h3>
            <p className="text-slate-700 mb-4">
              When required by law, regulation, or legal process.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">3. Business Transfers</h3>
            <p className="text-slate-700">
              In connection with a merger, acquisition, or sale of our business assets, your data may be transferred as part of the transaction.
            </p>
          </section>

          {/* Data Storage and Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Storage and Security</h2>
            <p className="text-slate-700 mb-4">We are committed to safeguarding your data using industry best practices:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Data is stored securely in encrypted cloud environments.</li>
              <li>Access to sensitive information is restricted to authorized personnel only.</li>
              <li>Users can request deletion of their data at any time, subject to legal retention requirements.</li>
            </ul>
          </section>

          {/* User Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">User Rights</h2>
            <p className="text-slate-700 mb-4">
              As a user of Mukamba Gateway, you have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li><strong>Access, Correct, or Delete Data:</strong> You may request access to, correction of, or deletion of your personal data.</li>
              <li><strong>Withdraw Consent:</strong> You can opt out of receiving marketing communications.</li>
              <li><strong>Raise Complaints:</strong> If you believe your privacy rights have been violated, you can contact us or file a complaint with the appropriate regulatory authority in Zimbabwe.</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Cookies</h2>
            <p className="text-slate-700 mb-4">
              We use cookies and similar technologies to improve your browsing experience. These cookies help us with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
              <li>Session management.</li>
              <li>Analytics to understand user behavior and improve the platform.</li>
              <li>Enhancing functionality for a seamless experience.</li>
            </ul>
            <p className="text-slate-700">
              You may disable cookies in your browser settings; however, some features of the platform may not function properly if cookies are disabled.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to Privacy Policy</h2>
            <p className="text-slate-700">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. The updated version will be posted on this page with a revised effective date.
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-8 p-6 bg-slate-50 rounded-lg">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
            <p className="text-slate-700 mb-4">
              If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact us:
            </p>
            <div className="space-y-2 text-slate-700">
              <p><strong>Email:</strong> hello@mukambagateway.com</p>
              <p><strong>Address:</strong> Harare, Zimbabwe</p>
            </div>
            <p className="text-slate-600 text-sm mt-4">
              © 2025 Mukamba Gateway. All rights reserved.
            </p>
          </section>
        </motion.div>
      </main>

      {/* Footer Section */}
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
                <Link href="/terms" className="text-white/60 hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </Link>
                <Link href="/privacy" className="text-white/60 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
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
    </div>
  );
}
