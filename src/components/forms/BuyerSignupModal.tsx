'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, DollarSign, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BuyerSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupComplete: (email: string, buyerType: 'cash' | 'installment') => void;
  propertyTitle?: string;
}

export const BuyerSignupModal: React.FC<BuyerSignupModalProps> = ({
  isOpen,
  onClose,
  onSignupComplete,
  propertyTitle
}) => {
  const [email, setEmail] = useState('');
  const [buyerType, setBuyerType] = useState<'cash' | 'installment' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; buyerType?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; buyerType?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!buyerType) {
      newErrors.buyerType = 'Please select your buyer type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSignupComplete(email, buyerType!);
      
      // Reset form
      setEmail('');
      setBuyerType(null);
      setErrors({});
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ email: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Unlock Property Details</h2>
              {propertyTitle && (
                <p className="text-blue-100 text-sm">
                  Get full access to "{propertyTitle}"
                </p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Buyer Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  How do you plan to purchase?
                </label>
                
                <div className="space-y-3">
                  {/* Cash Buyer Option */}
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      buyerType === 'cash' 
                        ? 'ring-2 ring-green-500 bg-green-50' 
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setBuyerType('cash')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            buyerType === 'cash' 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-slate-300'
                          }`}>
                            {buyerType === 'cash' && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-slate-800">Cash Buyer</h3>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Fast Track
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            I plan to purchase with cash or existing funds
                          </p>
                          <div className="mt-2 text-xs text-green-600">
                            ✓ Simplified verification • ✓ Priority with sellers
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Installment Buyer Option */}
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      buyerType === 'installment' 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setBuyerType('installment')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            buyerType === 'installment' 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-slate-300'
                          }`}>
                            {buyerType === 'installment' && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-slate-800">Installment Buyer</h3>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              Popular
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            I need financing or rent-to-buy options
                          </p>
                          <div className="mt-2 text-xs text-blue-600">
                            ✓ Pre-approved financing • ✓ Rent-to-buy available
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {errors.buyerType && (
                  <p className="text-red-500 text-sm mt-2">{errors.buyerType}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Continue to Property Details</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>

              {/* Next Steps Preview */}
              <div className="text-center text-sm text-slate-500">
                Next: Phone verification required for seller contact
              </div>
            </form>
          </div>

          {/* Benefits Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t">
            <div className="flex items-center justify-center space-x-6 text-xs text-slate-600">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Secure & verified</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No spam</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
