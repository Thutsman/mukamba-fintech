'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { LoginCredentials } from '@/types/auth';
import { useAuthStore } from '@/lib/store';
import { signInWithGoogle } from '@/lib/auth-utils';

interface BasicSigninModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

// Enhanced validation schema
const basicSigninSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean()
});

type SigninFormData = z.infer<typeof basicSigninSchema>;

export const BasicSigninModal: React.FC<BasicSigninModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignup
}) => {
  const { login, isLoading, error, setError, isAuthenticated } = useAuthStore();
  const [hasStartedLogin, setHasStartedLogin] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = React.useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = React.useState(false);

  // Only close modal when authentication succeeds AFTER user started login
  React.useEffect(() => {
    if (isAuthenticated && isOpen && hasStartedLogin && !isLoading) {
      console.log('User authenticated after login, closing login modal');
      setTimeout(() => {
        onClose();
        setHasStartedLogin(false); // Reset for next time
      }, 500);
    }
  }, [isAuthenticated, isOpen, hasStartedLogin, isLoading, onClose]);

  // Reset login state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setHasStartedLogin(false);
      setShowPassword(false);
      setIsGoogleLoading(false);
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
      setIsForgotPasswordLoading(false);
    }
  }, [isOpen]);

  const form = useForm<SigninFormData>({
    resolver: zodResolver(basicSigninSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: SigninFormData) => {
    try {
      setError(null);
      setHasStartedLogin(true);
      console.log('Submitting login form:', data.email);
      
      // Convert to LoginCredentials format
      const loginData: LoginCredentials = {
        email: data.email,
        password: data.password
      };
      
      await login(loginData);
      // Modal will close automatically when isAuthenticated becomes true
    } catch (error) {
      console.error('Login error:', error);
      setHasStartedLogin(false);
    }
  };

  const handleGoogleSignin = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);

      // Persist current path for redirect after OAuth completes
      try {
        sessionStorage.setItem('postAuthRedirect', window.location.pathname);
      } catch (_) {}

      const { error } = await signInWithGoogle();
      if (error) {
        setError(error);
      }
    } catch (error) {
      console.error('Google signin error:', error);
      setError('Google signin failed. Please try again.');
    } finally {
      // On success, browser will redirect before this runs. This only runs on error.
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsForgotPasswordLoading(true);
      setError(null);
      
      // Call the password reset API
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        setError(null);
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
        
        // Show success message in the main modal
        setError('Check your email for password reset instructions. If you don\'t see it, check your spam folder.');
      } else {
        setError(result.error || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isGoogleLoading && !isForgotPasswordLoading) {
      form.reset();
      setError(null);
      setHasStartedLogin(false);
      setShowPassword(false);
      setIsGoogleLoading(false);
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
      setIsForgotPasswordLoading(false);
      onClose();
    }
  };

  // Don't show modal if not open
  if (!isOpen) return null;

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
              Welcome Back
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-600 mt-1">
              Sign in to access your saved properties and continue your journey
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isLoading || isGoogleLoading || isForgotPasswordLoading}
            className="text-slate-500 hover:text-slate-700"
            suppressHydrationWarning
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Signup Link - Prominently placed at the top */}
          <div className="text-center mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-sm text-slate-600">
              Don't have an account?{' '}
            </span>
            <button
              onClick={onSwitchToSignup}
              disabled={isLoading || isGoogleLoading}
              className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 inline-flex items-center"
              suppressHydrationWarning
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Create Account
            </button>
          </div>

          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || isGoogleLoading}
            onClick={handleGoogleSignin}
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
            {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-white px-2 text-slate-500">Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="john@example.com"
                disabled={isLoading}
                className="mt-1"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

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
                  placeholder="Enter your password"
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
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={form.watch('rememberMe')}
                  onCheckedChange={(checked) => form.setValue('rememberMe', checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Remember me
                </Label>
              </div>
              
              <button
                type="button"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
                onClick={() => setShowForgotPassword(true)}
                disabled={isLoading}
                suppressHydrationWarning
              >
                Forgot password?
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-red-700 hover:bg-red-800 text-white py-3 text-base font-semibold"
              suppressHydrationWarning
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
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

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-800">
                  Reset Password
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-600 mt-1">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="forgotEmail">Email Address</Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isForgotPasswordLoading}
                    className="mt-1"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={isForgotPasswordLoading}
                    className="flex-1"
                    suppressHydrationWarning
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isForgotPasswordLoading || !forgotPasswordEmail}
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white"
                    suppressHydrationWarning
                  >
                    {isForgotPasswordLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}; 