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
  ExternalLink
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function TermsPage() {
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
              Terms and Conditions for Mukamba Gateway
            </h1>
            <p className="text-slate-600 text-lg">
              Last updated: October 15, 2025
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Introduction</h2>
            <p className="text-slate-700 leading-relaxed">
              Welcome to Mukamba Gateway! These terms and conditions govern your use of the Mukamba Gateway website and all associated services. By accessing or using our platform, you agree to be bound by these terms. If you do not agree, please refrain from using the website.
            </p>
          </section>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Definitions</h2>
            <ul className="space-y-2 text-slate-700">
              <li><strong>"We," "Our," or "Us"</strong> refers to Mukamba Gateway, its owners, and operators.</li>
              <li><strong>"You" or "User"</strong> refers to any individual or entity accessing the website.</li>
              <li><strong>"Platform" or "Website"</strong> refers to https://www.mukambagateway.com and related services.</li>
            </ul>
          </section>

          {/* Acceptable Usage Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptable Usage Policy</h2>
            <p className="text-slate-700 mb-4">
              This Acceptable Usage Policy governs the proper use of Mukamba Gateway's platform, including property listings, data uploads, and interactions with other users.
            </p>
            
            <h3 className="text-xl font-semibold text-slate-900 mb-3">1.1 General Usage Guidelines</h3>
            <p className="text-slate-700 mb-3">You agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
              <li>Use the platform only for lawful purposes.</li>
              <li>Ensure all information you provide (e.g., property details, identity verification documents) is accurate and up-to-date.</li>
              <li>Adhere to the platform's guidelines for property uploads and interactions.</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">1.2 Prohibited Activities</h3>
            <p className="text-slate-700 mb-3">You may not:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
              <li>Share your login credentials with others or allow others to use your account.</li>
              <li>Manipulate the system by uploading false or misleading property details (e.g., incorrect locations, duplicate uploads).</li>
              <li>Upload properties with incorrect or outdated information to gain unfair visibility.</li>
              <li>Post inappropriate content, including offensive, defamatory, or obscene material.</li>
            </ul>
            <p className="text-slate-700">
              <strong>Violations of this policy may result in suspension or permanent termination of your account.</strong>
            </p>
          </section>

          {/* Terms of Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Terms of Use</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 mb-3">2.1 General Rules</h3>
            <p className="text-slate-700 mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
              <li>Use the website to transmit, distribute, or store material that infringes on others' rights or violates applicable laws.</li>
              <li>Attempt to hack, overload, or interfere with the website's functionality.</li>
              <li>Copy, distribute, or modify any content on the website without prior written authorization.</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">2.2 Disclaimer</h3>
            <p className="text-slate-700 mb-3">
              The information, opinions, and publications available on our website, blogs, and social media channels are broad guides for general information only. They are solely intended to provide a general understanding of the subject matter and to help you assess whether you need more detailed information.
            </p>
            <p className="text-slate-700 mb-3">
              The material on this website is not and should not be regarded as legal, financial, or real estate advice. Users should seek their own legal, financial, or real estate advice where appropriate. Every effort is made to ensure that the material is accurate and up-to-date. However, we do not guarantee or warrant the accuracy, completeness, or currency of the information provided.
            </p>
            <p className="text-slate-700 mb-4">
              You should make your own inquiries and obtain independent professional advice tailored to your specific circumstances before making any legal, financial, or real estate decisions.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">2.3 Limitation of Liability</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Mukamba Gateway is not responsible for any direct, indirect, or consequential damages arising from your use of the platform.</li>
              <li>We do not guarantee uninterrupted access to the website and are not liable for any delays, errors, or system failures.</li>
            </ul>
          </section>

          {/* User Accounts and Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. User Accounts and Security</h2>
            <ul className="space-y-3 text-slate-700">
              <li><strong>Account Creation:</strong> Users must create an account to access full platform features. You agree to provide accurate and complete information during registration.</li>
              <li><strong>Password Security:</strong> You are responsible for maintaining the confidentiality of your password. Any activity conducted through your account will be your responsibility.</li>
              <li><strong>Account Misuse:</strong> Sharing your credentials or engaging in unauthorized activities may result in account suspension or termination.</li>
            </ul>
          </section>

          {/* Listing Policies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Listing Policies</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 mb-3">4.1 Featured Listings</h3>
            <p className="text-slate-700 mb-4">
              Mukamba Gateway offers featured listing options for enhanced visibility. Users agree to the terms and fees associated with such services.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">4.2 Listing Removal</h3>
            <p className="text-slate-700">
              Mukamba Gateway reserves the right to remove any listing that violates these terms or is reported as inappropriate.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Intellectual Property</h2>
            <ul className="space-y-3 text-slate-700">
              <li>All content on the website, including text, images, and software, is the property of Mukamba Gateway or its licensors.</li>
              <li>Users may not copy, modify, or distribute any content without prior written permission.</li>
            </ul>
          </section>

          {/* Payment Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Payment Terms</h2>
            <ul className="space-y-3 text-slate-700">
              <li>Payments for property purchases or listing services must be completed as per the agreed terms.</li>
              <li>Mukamba Gateway reserves the right to suspend services for users who fail to meet payment obligations.</li>
            </ul>
          </section>

          {/* Privacy and Data Protection */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Privacy and Data Protection</h2>
            <p className="text-slate-700">
              Mukamba Gateway is committed to protecting your privacy. Please refer to our <Link href="/privacy" className="text-[#7f1518] hover:text-[#6a1215] underline">Privacy Policy</Link> for details on how we collect, use, and safeguard your personal information.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Dispute Resolution</h2>
            <ul className="space-y-3 text-slate-700">
              <li>Any disputes arising from the use of the platform will be resolved through arbitration under Zimbabwean law.</li>
              <li>Arbitration will be conducted in English, and the decision will be binding.</li>
            </ul>
          </section>

          {/* Amendments */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Amendments</h2>
            <p className="text-slate-700">
              Mukamba Gateway reserves the right to update these terms and conditions at any time. Users are encouraged to review the terms periodically to remain informed of any changes.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8 p-6 bg-slate-50 rounded-lg">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
            <p className="text-slate-700 mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="space-y-2 text-slate-700">
              <p><strong>Email:</strong> hello@mukambagateway.com</p>
              <p><strong>Address:</strong> Harare, Zimbabwe</p>
            </div>
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
