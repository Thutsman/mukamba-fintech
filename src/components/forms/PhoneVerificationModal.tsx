'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Loader2, Check, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialPhone?: string;
}

const phoneSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+?[1-9]\d{8,14}$/, "Please enter a valid phone number")
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers")
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialPhone = ''
}) => {
  const [step, setStep] = React.useState<'phone' | 'otp' | 'success'>('phone');
  const [isLoading, setIsLoading] = React.useState(false);
  const [phoneNumber, setPhoneNumber] = React.useState(initialPhone);
  const [timeLeft, setTimeLeft] = React.useState(0);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: initialPhone }
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' }
  });

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handlePhoneSubmit = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      // Generate a 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Send SMS via our API
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: data.phone,
          otpCode: otpCode,
          message: `Mukamba: Your verification code is ${otpCode}. It expires in 10 minutes.`
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send verification code');
      }
      
      console.log('OTP sent successfully:', result);
      setPhoneNumber(data.phone);
      setStep('otp');
      setTimeLeft(60); // 60 seconds countdown
      
      // Store OTP in sessionStorage for verification
      sessionStorage.setItem('verification_otp', otpCode);
      sessionStorage.setItem('verification_phone', data.phone);
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      phoneForm.setError('phone', { message: error.message || 'Failed to send verification code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (data: OTPFormData) => {
    setIsLoading(true);
    try {
      // Get stored OTP from sessionStorage
      const storedOTP = sessionStorage.getItem('verification_otp');
      const storedPhone = sessionStorage.getItem('verification_phone');
      
      if (!storedOTP || !storedPhone) {
        throw new Error('Verification session expired. Please request a new code.');
      }
      
      // Verify OTP
      if (data.otp !== storedOTP) {
        throw new Error('Invalid verification code');
      }
      
      console.log('OTP verified successfully');
      setStep('success');
      
      // Clear stored data
      sessionStorage.removeItem('verification_otp');
      sessionStorage.removeItem('verification_phone');
      
      setTimeout(() => {
        onComplete();
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      otpForm.setError('otp', { message: error.message || 'Invalid OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timeLeft > 0) return;
    
    setIsLoading(true);
    try {
      // Generate a new 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Send SMS via our API
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          otpCode: otpCode,
          message: `Mukamba: Your verification code is ${otpCode}. It expires in 10 minutes.`
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to resend verification code');
      }
      
      console.log('OTP resent successfully:', result);
      
      // Update stored OTP
      sessionStorage.setItem('verification_otp', otpCode);
      setTimeLeft(60);
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      // You could show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStep('phone');
      phoneForm.reset();
      otpForm.reset();
      setTimeLeft(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="w-6 h-6" /> {/* Spacer */}
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <CardTitle className="text-xl">
                {step === 'phone' && 'Verify Your Phone Number'}
                {step === 'otp' && 'Enter Verification Code'}
                {step === 'success' && 'Phone Verified!'}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                {step === 'phone' && 'We\'ll send you a verification code to confirm your number'}
                {step === 'otp' && `We sent a 6-digit code to ${phoneNumber}`}
                {step === 'success' && 'Your phone number has been successfully verified'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 'phone' && (
                <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+27123456789"
                      disabled={isLoading}
                      {...phoneForm.register('phone')}
                      className="mt-1"
                    />
                    {phoneForm.formState.errors.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {phoneForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={otpForm.handleSubmit(handleOTPSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="otp">6-Digit Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      disabled={isLoading}
                      {...otpForm.register('otp')}
                      className="mt-1 text-center text-2xl font-mono tracking-widest"
                    />
                    {otpForm.formState.errors.otp && (
                      <p className="text-sm text-red-600 mt-1">
                        {otpForm.formState.errors.otp.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Phone Number'
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={timeLeft > 0 || isLoading}
                      className="text-sm text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      {timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Resend verification code'}
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      disabled={isLoading}
                      className="text-sm text-slate-600 hover:text-slate-700"
                    >
                      Change phone number
                    </button>
                  </div>
                </form>
              )}

              {step === 'success' && (
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Check className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Verification Complete!</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      You can now contact property owners and receive notifications
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 