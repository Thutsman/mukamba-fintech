'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Shield, CheckCircle, ArrowRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<{ phone?: string; otp?: string }>({});

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validatePhoneNumber = (phone: string) => {
    // Basic phone validation - adjust regex based on your requirements
    const phoneRegex = /^(\+?27|0)[6-8][0-9]{8}$/; // South African format
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setErrors({ phone: 'Phone number is required' });
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      setErrors({ phone: 'Please enter a valid phone number' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Simulate API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Sending OTP to:', phoneNumber);
      
      setStep('verification');
      setCountdown(60); // 60 seconds countdown
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrors({ phone: 'Failed to send verification code. Please try again.' });
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
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Simulate API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Verifying OTP:', otp, 'for phone:', phoneNumber);
      
      // Simulate successful verification
      onVerificationComplete(phoneNumber);
      
      // Reset form
      setStep('phone');
      setPhoneNumber('');
      setOtp('');
      setCountdown(0);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrors({ otp: 'Invalid verification code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call to resend OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Resending OTP to:', phoneNumber);
      setCountdown(60);
    } catch (error) {
      console.error('Error resending OTP:', error);
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
          <div className="relative bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
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
              <p className="text-green-100 text-sm">
                {step === 'phone' 
                  ? 'Required to contact sellers and receive property updates'
                  : `We sent a 6-digit code to ${phoneNumber}`
                }
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {step === 'phone' ? (
              /* Phone Number Step */
              <form onSubmit={handleSendOTP} className="space-y-6">
                {/* User Info */}
                {userEmail && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-slate-600">Signed up as:</span>
                      <span className="font-medium text-slate-800">{userEmail}</span>
                    </div>
                    {buyerType && (
                      <div className="mt-2">
                        <Badge 
                          variant="secondary" 
                          className={
                            buyerType === 'cash' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {buyerType === 'cash' ? '💰 Cash Buyer' : '🏦 Installment Buyer'}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+27 XX XXX XXXX or 0XX XXX XXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`w-full ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Benefits */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-green-800 mb-2">What you'll unlock:</h3>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Direct contact with property sellers</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Instant property alerts via SMS</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Priority support from our team</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 text-lg font-semibold"
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
                      className="text-sm text-green-600 hover:text-green-700 underline"
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
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
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

          {/* Trust Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t">
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-600">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure verification</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>SMS charges may apply</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
