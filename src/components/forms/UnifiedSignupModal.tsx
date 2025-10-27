'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Mail, User, Phone, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
// Removed select components; not needed after simplifying modal
import type { BasicSignupData } from '@/types/auth';
import { useAuthStore } from '@/lib/store';
import { signUpWithGoogle } from '@/lib/auth-utils';

interface UnifiedSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  sellerIntent?: boolean;
  onSellerSignupComplete?: () => void;
  propertyTitle?: string; // For property-specific signups
  onSignupComplete?: (email: string) => void; // For buyer signups
}

// Enhanced validation schema
const unifiedSignupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name too long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name too long"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
  privacyAccepted: z.boolean().refine(val => val === true, "You must accept the privacy policy")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SignupFormData = z.infer<typeof unifiedSignupSchema>;

// Password strength indicator
const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: '', color: 'bg-gray-200' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-emerald-500'];
  
  return {
    score: Math.min(score, 5),
    label: labels[score],
    color: colors[score]
  };
};

export const UnifiedSignupModal: React.FC<UnifiedSignupModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  sellerIntent = false,
  onSellerSignupComplete,
  propertyTitle,
  onSignupComplete
}) => {
  const { basicSignup, isLoading, error, setError, isAuthenticated, showSuccessPopup } = useAuthStore();
  const [hasStartedSignup, setHasStartedSignup] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [emailAvailability, setEmailAvailability] = React.useState<'checking' | 'available' | 'taken' | null>(null);
  // Removed buyer type selection (cash/installments)

  // Close modal immediately when success popup appears (email confirmation message)
  React.useEffect(() => {
    console.log('UnifiedSignupModal effect - showSuccessPopup:', showSuccessPopup, 'isOpen:', isOpen, 'hasStartedSignup:', hasStartedSignup);
    
      if (showSuccessPopup && isOpen && hasStartedSignup) {
      console.log('✅ SUCCESS POPUP DETECTED - Closing signup modal to prevent duplicate signups');
      // Close modal immediately when "check your email" message appears
      onClose();
      setHasStartedSignup(false); // Reset for next time
      
      // Handle different completion scenarios
      if (sellerIntent && onSellerSignupComplete) {
        onSellerSignupComplete();
        } else if (onSignupComplete) {
        const formData = form.getValues();
        onSignupComplete(formData.email);
      }
    }
  }, [showSuccessPopup, isOpen, hasStartedSignup, onClose, sellerIntent, onSellerSignupComplete, onSignupComplete]);

  // Only close modal when authentication succeeds AFTER user started signup (for OAuth flows)
  React.useEffect(() => {
    if (isAuthenticated && isOpen && hasStartedSignup && !isLoading && !showSuccessPopup) {
      console.log('User authenticated after signup, closing signup modal');
      setTimeout(() => {
        onClose();
        setHasStartedSignup(false); // Reset for next time
        
        // Handle different completion scenarios
        if (sellerIntent && onSellerSignupComplete) {
          onSellerSignupComplete();
        } else if (onSignupComplete) {
          const formData = form.getValues();
          onSignupComplete(formData.email);
        }
      }, 500);
    }
  }, [isAuthenticated, isOpen, hasStartedSignup, isLoading, showSuccessPopup, onClose, sellerIntent, onSellerSignupComplete, onSignupComplete]);

  // Reset signup state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setHasStartedSignup(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsGoogleLoading(false);
      setEmailAvailability(null);
      // no-op
    }
  }, [isOpen]);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(unifiedSignupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      termsAccepted: false,
      privacyAccepted: false
    }
  });

  // Watch password for strength indicator
  const password = form.watch('password');
  const email = form.watch('email');

  // Check email availability - real API call
  React.useEffect(() => {
    const checkEmail = async () => {
      if (email && email.includes('@')) {
        setEmailAvailability('checking');
        
        try {
          const response = await fetch('/api/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          
          const result = await response.json();
          setEmailAvailability(result.available ? 'available' : 'taken');
        } catch (error) {
          console.error('Error checking email availability:', error);
          // On error, don't block signup - just clear the indicator
          setEmailAvailability(null);
        }
      } else {
        setEmailAvailability(null);
      }
    };

    // Debounce the email check
    const timer = setTimeout(checkEmail, 800);
    return () => clearTimeout(timer);
  }, [email]);

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError(null);
      setHasStartedSignup(true);
      console.log('🚀 STARTING SIGNUP - hasStartedSignup set to TRUE for:', data.email);
      
      // Double-check email availability before signup
      try {
        const response = await fetch('/api/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email })
        });
        
        const result = await response.json();
        if (!result.available) {
          setError('This email is already registered. Please sign in instead or use a different email.');
          setHasStartedSignup(false);
          return;
        }
      } catch (error) {
        console.error('Error checking email availability:', error);
        // Continue with signup if check fails - better UX
      }
      
      // Convert to BasicSignupData format
      const signupData: BasicSignupData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined
      };
      
      await basicSignup(signupData);
      // Modal will close automatically when isAuthenticated becomes true
      try {
        sessionStorage.setItem('postAuthView', 'profile');
      } catch (_) {}
    } catch (error) {
      console.error('Signup error:', error);
      setHasStartedSignup(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);

      // Persist redirect and seller intent across OAuth redirect
      try {
        sessionStorage.setItem('postAuthRedirect', window.location.pathname);
        if (sellerIntent) sessionStorage.setItem('sellerIntent', 'true');
        if (propertyTitle) sessionStorage.setItem('propertyTitle', propertyTitle);
      } catch (_) {}

      const { error } = await signUpWithGoogle();
      if (error) {
        setError(error);
      }
    } catch (error) {
      console.error('Google signup error:', error);
      setError('Google signup failed. Please try again.');
    } finally {
      // On success the browser redirects before this executes
      setIsGoogleLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isGoogleLoading) {
      form.reset();
      setError(null);
      setHasStartedSignup(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsGoogleLoading(false);
      setEmailAvailability(null);
      onClose();
    }
  };

  // Don't show modal if not open OR if success popup is showing
  // This provides an extra layer of safety to ensure modal doesn't show during success message
  if (!isOpen || (showSuccessPopup && hasStartedSignup) || isAuthenticated) return null;

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-800">
              {propertyTitle ? 'Unlock Property Details' : 
               sellerIntent ? 'Start Selling on Mukamba Gateway' : 
               'Join Mukamba Gateway'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-600 mt-1">
              {propertyTitle ? `Sign up to view details for ${propertyTitle}` :
               sellerIntent ? 'Create your account to list your property and reach qualified buyers!' : 
               'Get started in 30 seconds - explore properties right away!'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isLoading || isGoogleLoading}
            className="text-slate-500 hover:text-slate-700"
            suppressHydrationWarning
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Login Link - Prominently placed at the top */}
          <div className="text-center mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-slate-600">
              Already have an account?{' '}
            </span>
            <button
              onClick={onSwitchToLogin}
              disabled={isLoading || isGoogleLoading}
              className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 inline-flex items-center"
              suppressHydrationWarning
            >
              <LogIn className="w-4 h-4 mr-1" />
              Sign In
            </button>
          </div>

          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || isGoogleLoading}
            onClick={handleGoogleSignup}
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 mb-4"
            suppressHydrationWarning
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isGoogleLoading ? 'Signing up...' : 'Continue with Google'}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-white px-2 text-slate-500">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  {...form.register('firstName')}
                  placeholder="John"
                  disabled={isLoading}
                  className="mt-1"
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...form.register('lastName')}
                  placeholder="Doe"
                  disabled={isLoading}
                  className="mt-1"
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </Label>
              <div className="relative mt-1">
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="john@example.com"
                  disabled={isLoading}
                  className={`pr-10 ${emailAvailability === 'taken' ? 'border-red-500' : ''}`}
                />
                {emailAvailability === 'checking' && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                )}
                {emailAvailability === 'available' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {emailAvailability === 'taken' && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
              {emailAvailability === 'taken' && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This email is already registered. 
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="ml-1 font-semibold text-blue-600 hover:text-blue-800 underline"
                    >
                      Sign in instead
                    </button>
                  </p>
                </div>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <Label htmlFor="phone" className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Phone Number <span className="text-slate-400 ml-1">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                {...form.register('phone')}
                placeholder="+27123456789"
                disabled={isLoading}
                className="mt-1"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Add now or verify later to contact property owners
              </p>
            </div>

            {/* Buyer Type Selection removed as per requirements */}

            {/* Password */}
            <div>
              <Label htmlFor="password" className="flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...form.register('password')}
                  placeholder="Create a secure password"
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  suppressHydrationWarning
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </Button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Password strength:</span>
                    <span className={`font-medium ${passwordStrength.score >= 4 ? 'text-green-600' : passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          level <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...form.register('confirmPassword')}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  suppressHydrationWarning
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </Button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={form.watch('termsAccepted')}
                  onCheckedChange={(checked) => {
                    console.log('Terms checkbox clicked:', checked);
                    form.setValue('termsAccepted', checked);
                    if (checked) {
                      form.clearErrors('termsAccepted');
                    }
                  }}
                  disabled={isLoading}
                />
                <Label 
                  htmlFor="terms" 
                  className="text-sm leading-relaxed cursor-pointer"
                  onClick={() => {
                    const currentValue = form.watch('termsAccepted');
                    const newValue = !currentValue;
                    form.setValue('termsAccepted', newValue);
                    if (newValue) {
                      form.clearErrors('termsAccepted');
                    }
                  }}
                >
                  I agree to the{' '}
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700 underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('/terms', '_blank');
                    }}
                  >
                    Terms & Conditions
                  </button>
                </Label>
              </div>
              {form.formState.errors.termsAccepted && (
                <p className="text-sm text-red-600 ml-6">
                  {form.formState.errors.termsAccepted.message}
                </p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  checked={form.watch('privacyAccepted')}
                  onCheckedChange={(checked) => {
                    console.log('Privacy checkbox clicked:', checked);
                    form.setValue('privacyAccepted', checked);
                    if (checked) {
                      form.clearErrors('privacyAccepted');
                    }
                  }}
                  disabled={isLoading}
                />
                <Label 
                  htmlFor="privacy" 
                  className="text-sm leading-relaxed cursor-pointer"
                  onClick={() => {
                    const currentValue = form.watch('privacyAccepted');
                    const newValue = !currentValue;
                    form.setValue('privacyAccepted', newValue);
                    if (newValue) {
                      form.clearErrors('privacyAccepted');
                    }
                  }}
                >
                  I agree to the{' '}
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700 underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('/privacy', '_blank');
                    }}
                  >
                    Privacy Policy
                  </button>
                </Label>
              </div>
              {form.formState.errors.privacyAccepted && (
                <p className="text-sm text-red-600 ml-6">
                  {form.formState.errors.privacyAccepted.message}
                </p>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-50 border border-red-200 dark:border-red-200 rounded-lg text-red-700 dark:text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading || emailAvailability === 'taken'}
              className="w-full bg-red-700 hover:bg-red-800 text-white py-3 text-base font-semibold"
              suppressHydrationWarning
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                propertyTitle ? 'Continue to Property Details' : 'Create Account & Start Exploring'
              )}
            </Button>
          </form>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-50 dark:to-red-50 rounded-lg border border-blue-200 dark:border-blue-200">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-800 mb-2">
              🎉 What you get immediately:
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-600 space-y-1">
              <li>• Save your favorite listings</li>
              <li>• Access market insights</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
