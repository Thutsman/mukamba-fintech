'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, DollarSign, CreditCard, CheckCircle, ArrowRight, User, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store';
import { buyerServices } from '@/lib/buyer-services';

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
  const { basicSignup, isLoading, error, setError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [buyerType, setBuyerType] = useState<'cash' | 'installment' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    
    try {
      // Create account using the auth store
      const signupResult = await basicSignup({
        firstName,
        lastName,
        email,
        password,
        phone
      });
      
      // If successful, update user profile with buyer type
      // We need to wait a moment for the user to be created, then update the profile
      setTimeout(async () => {
        try {
          const { buyerServices } = await import('@/lib/buyer-services');
          
          // Get the current user from the auth store
          const { user } = useAuthStore.getState();
          
          console.log('BuyerSignupModal: User from store:', user);
          
          if (user?.id) {
            console.log('BuyerSignupModal: Calling handleBuyerSignup with:', {
              userId: user.id,
              buyerType: buyerType,
              signupSource: 'property_details_gate'
            });
            
            // Call the handle_buyer_signup function to properly populate buyer_onboarding_progress
            const result = await buyerServices.handleBuyerSignup(
              user.id,
              buyerType!,
              'property_details_gate' as any,
              undefined // propertyId will be set later if needed
            );
            
            if (result.success) {
              console.log('Buyer signup completed successfully');
              // Only call onSignupComplete after buyer type is saved
              onSignupComplete(email, buyerType!);
            } else {
              console.error('Error completing buyer signup:', result.error);
            }
          } else {
            console.error('BuyerSignupModal: No user found in store after signup');
          }
        } catch (error) {
          console.error('Error updating buyer type:', error);
        }
      }, 2000); // Increased timeout to 2 seconds
      
      // Reset form
      setEmail('');
      setFirstName('');
      setLastName('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
      setBuyerType(null);
      setErrors({});
      
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
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
                     className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
                     {/* Header */}
           <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
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
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                             {/* Name Fields */}
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <Label htmlFor="firstName" className="text-sm font-medium text-slate-700 mb-1">
                     First Name
                   </Label>
                   <Input
                     id="firstName"
                     type="text"
                     placeholder="First name"
                     value={firstName}
                     onChange={(e) => setFirstName(e.target.value)}
                     className={`w-full ${errors.firstName ? 'border-red-500' : ''}`}
                   />
                   {errors.firstName && (
                     <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                   )}
                 </div>
                 <div>
                   <Label htmlFor="lastName" className="text-sm font-medium text-slate-700 mb-1">
                     Last Name
                   </Label>
                   <Input
                     id="lastName"
                     type="text"
                     placeholder="Last name"
                     value={lastName}
                     onChange={(e) => setLastName(e.target.value)}
                     className={`w-full ${errors.lastName ? 'border-red-500' : ''}`}
                   />
                   {errors.lastName && (
                     <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                   )}
                 </div>
               </div>

                             {/* Email Input */}
               <div>
                 <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-1">
                   Email Address
                 </Label>
                 <Input
                   id="email"
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

                             {/* Phone Input */}
               <div>
                 <Label htmlFor="phone" className="text-sm font-medium text-slate-700 mb-1">
                   Phone Number (Optional)
                 </Label>
                 <Input
                   id="phone"
                   type="tel"
                   placeholder="+27 123 456 789"
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   className="w-full"
                 />
               </div>

                             {/* Password Fields */}
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <Label htmlFor="password" className="text-sm font-medium text-slate-700 mb-1">
                     Password
                   </Label>
                   <div className="relative">
                     <Input
                       id="password"
                       type={showPassword ? 'text' : 'password'}
                       placeholder="Create password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className={`w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
                     />
                     <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                     >
                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                   </div>
                   {errors.password && (
                     <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                   )}
                 </div>
                 <div>
                   <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 mb-1">
                     Confirm Password
                   </Label>
                   <div className="relative">
                     <Input
                       id="confirmPassword"
                       type={showConfirmPassword ? 'text' : 'password'}
                       placeholder="Confirm password"
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       className={`w-full pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                     />
                     <button
                       type="button"
                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                     >
                       {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                   </div>
                   {errors.confirmPassword && (
                     <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                   )}
                 </div>
               </div>

                             {/* Buyer Type Selection */}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">
                   How do you plan to purchase?
                 </label>
                 
                 <div className="space-y-2">
                  {/* Cash Buyer Option */}
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      buyerType === 'cash' 
                        ? 'ring-2 ring-green-500 bg-green-50' 
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setBuyerType('cash')}
                  >
                    <CardContent className="p-3">
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
                          <div className="mt-1 text-xs text-green-600">
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
                    <CardContent className="p-3">
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
                            I would like installment options
                          </p>
                          <div className="mt-1 text-xs text-blue-600">
                            ✓ Flexible payment plan
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

              {/* General Error */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Submit Button */}
                             <Button
                 type="submit"
                 className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 text-lg font-semibold"
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
               <div className="text-center text-xs text-slate-500">
                 Next: Phone verification required for seller contact
               </div>
            </form>
          </div>

                     {/* Benefits Footer */}
           <div className="bg-slate-50 px-6 py-3 border-t">
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
