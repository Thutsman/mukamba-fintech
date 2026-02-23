'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Shield, CheckCircle, ArrowRight, MessageSquare, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CountryCodeSelector } from '@/components/ui/country-code-selector';
import { CountryCode, getDefaultCountry } from '@/data/country-codes';
import { buyerServices } from '@/lib/buyer-services';
import { useAuthStore } from '@/lib/store';

interface BuyerPhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (phoneNumber: string) => void;
  buyerType?: 'cash' | 'installment';
  userEmail?: string;
}

export const BuyerPhoneVerificationModal: React.FC<BuyerPhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerificationComplete,
  buyerType,
  userEmail
}) => {
  const { user } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(getDefaultCountry());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<{ phone?: string; otp?: string }>({});
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean;
    error: any;
    suggestion: string;
  } | null>(null);

  // Get full phone number with country code
  const getFullPhoneNumber = () => {
    return selectedCountry.dialCode + phoneNumber.replace(/\D/g, '');
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Real-time phone validation
  useEffect(() => {
    if (phoneNumber.trim()) {
      const validationError = getPhoneValidationError(phoneNumber, selectedCountry.dialCode);
      const isValid = !validationError && validatePhoneNumber(phoneNumber);
      
      setPhoneValidation({
        isValid,
        error: validationError,
        suggestion: validationError?.suggestion || ''
      });
    } else {
      setPhoneValidation(null);
    }
  }, [phoneNumber, selectedCountry.dialCode]);

  const validatePhoneNumber = (phone: string) => {
    // International phone validation - more flexible for global users
    const phoneRegex = /^\+?[1-9]\d{7,14}$/; // International format
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Check for common phone number issues
  const getPhoneValidationError = (phone: string, countryCode: string) => {
    if (!phone.trim()) return null;
    
    const cleanPhone = phone.replace(/\s/g, '');
    
    // Check for leading zero after country code (common issue)
    if (cleanPhone.startsWith('0')) {
      return {
        type: 'leading_zero',
        message: 'Remove the leading "0" - international numbers don\'t need it',
        suggestion: `Try: ${cleanPhone.substring(1)}`
      };
    }
    
    // Check for too short numbers
    if (cleanPhone.length < 7) {
      return {
        type: 'too_short',
        message: 'Phone number is too short',
        suggestion: 'Enter your complete phone number'
      };
    }
    
    // Check for too long numbers
    if (cleanPhone.length > 15) {
      return {
        type: 'too_long',
        message: 'Phone number is too long',
        suggestion: 'Check your number and try again'
      };
    }
    
    // Check for invalid characters
    if (!/^[0-9\s\-\(\)]+$/.test(cleanPhone)) {
      return {
        type: 'invalid_chars',
        message: 'Phone number contains invalid characters',
        suggestion: 'Use only numbers, spaces, hyphens, and parentheses'
      };
    }
    
    return null;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setErrors({ phone: 'Phone number is required' });
      return;
    }
    
    // Check for specific validation issues first
    const validationError = getPhoneValidationError(phoneNumber, selectedCountry.dialCode);
    if (validationError) {
      setErrors({ phone: validationError.message });
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      setErrors({ phone: 'Please enter a valid international phone number' });
      return;
    }
    
    if (!user) {
      setErrors({ phone: 'User not authenticated' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Use the actual buyerServices to send OTP
      const result = await buyerServices.sendPhoneOTP(
        user.id,
        getFullPhoneNumber(),
        'property_details_page',
        undefined // propertyId - could be passed as prop if needed
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send verification code');
      }
      
      console.log('OTP sent successfully to:', getFullPhoneNumber());
      
      setStep('verification');
      setCountdown(60); // 60 seconds countdown
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setErrors({ phone: error.message || 'Failed to send verification code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      setErrors({ otp: 'Verification code is required' });
      return;
    }
    
    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' });
      return;
    }
    
    if (!user) {
      setErrors({ otp: 'User not authenticated' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Use the actual buyerServices to verify OTP
      const result = await buyerServices.verifyPhoneOTP(
        user.id,
        getFullPhoneNumber(),
        otp
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Invalid verification code');
      }
      
      console.log('Phone verification completed successfully');

      // Notify (best-effort) to send transactional email
      try {
        await fetch('/api/notifications/phone-verified', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id }),
        });
      } catch (e) {
        console.warn('Failed to notify phone-verified email:', e);
      }
      
      // Call the completion handler
      onVerificationComplete(getFullPhoneNumber());
      
      // Reset form
      setStep('phone');
      setPhoneNumber('');
      setOtp('');
      setCountdown(0);
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setErrors({ otp: error.message || 'Invalid verification code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || !user) return;
    
    setIsLoading(true);
    
    try {
      // Use the actual buyerServices to resend OTP
      const result = await buyerServices.sendPhoneOTP(
        user.id,
        getFullPhoneNumber(),
        'property_details_page_resend',
        undefined
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to resend verification code');
      }
      
      console.log('OTP resent successfully to:', getFullPhoneNumber());
      setCountdown(60);
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      setErrors({ otp: error.message || 'Failed to resend verification code' });
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
          className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="relative px-6 py-6 text-white" style={{background: 'linear-gradient(to right, #7F1518, #7F1518)'}}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                {step === 'phone' ? (
                  <Phone className="w-8 h-8 text-white" />
                ) : (
                  <Shield className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {step === 'phone' ? 'Verify Your Phone' : 'Enter Verification Code'}
              </h2>
              {step === 'verification' && (
                <p className="text-sm" style={{color: '#FFE5E5'}}>
                  We sent a 6-digit code to {getFullPhoneNumber()}
                </p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {step === 'phone' ? (
              /* Phone Number Step */
              <form onSubmit={handleSendOTP} className="space-y-4">

                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex space-x-2">
                    <CountryCodeSelector
                      value={selectedCountry}
                      onChange={setSelectedCountry}
                      className="w-32"
                    />
                    <Input
                      type="tel"
                      placeholder="123 456 7890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={`flex-1 ${
                        errors.phone || (phoneValidation && !phoneValidation.isValid) 
                          ? 'border-red-500' 
                          : phoneValidation && phoneValidation.isValid 
                            ? 'border-green-500' 
                            : ''
                      } rounded-l-none`}
                    />
                  </div>
                  
                  {/* Real-time validation feedback */}
                  {phoneValidation && phoneValidation.error && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-red-700 font-medium">
                            {phoneValidation.error.message}
                          </p>
                          {phoneValidation.suggestion && (
                            <p className="text-sm text-red-600 mt-1">
                              💡 {phoneValidation.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Success feedback */}
                  {phoneValidation && phoneValidation.isValid && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <p className="text-sm text-green-700 font-medium">
                          ✓ Valid phone number format
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Form submission errors */}
                  {errors.phone && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{errors.phone}</p>
                    </div>
                  )}
                  
                  {/* Country-specific hints */}
                  {selectedCountry.code === 'ZW' && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-blue-700 font-medium">
                            🇿🇼 Zimbabwe Phone Number Format
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Enter your number without the leading "0". For example: 779035404 (not 0779035404)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Full number display - only show if valid or no validation yet */}
                  {phoneNumber && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-lg border">
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Full number:</span> {getFullPhoneNumber()}
                        {phoneValidation && phoneValidation.isValid && (
                          <span className="ml-2 text-green-600">✓</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <Card className="border-red-200" style={{backgroundColor: '#FFE5E5'}}>
                  <CardContent className="p-3">
                    <h3 className="font-semibold mb-2" style={{color: '#7F1518'}}>What you'll unlock:</h3>
                    <div className="space-y-2 text-sm" style={{color: '#7F1518'}}>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" style={{color: '#7F1518'}} />
                        <span>Direct contact with Admin</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full text-white py-3 text-lg font-semibold"
                  style={{background: 'linear-gradient(to right, #7F1518, #7F1518)'}}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Code...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <MessageSquare className="w-5 h-5" />
                      <span>Send Verification Code</span>
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              /* OTP Verification Step */
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    6-Digit Verification Code
                  </label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`w-full text-center text-2xl tracking-widest ${errors.otp ? 'border-red-500' : ''}`}
                    maxLength={6}
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
                  )}
                </div>

                {/* Resend Code */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-slate-500">
                      Resend code in {countdown} seconds
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-sm underline"
                      style={{color: '#7F1518'}}
                    >
                      Didn't receive the code? Resend
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('phone')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 text-white"
                    style={{background: 'linear-gradient(to right, #7F1518, #7F1518)'}}
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Verify</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
