'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LoginCredentials } from '@/types/auth';
import { useAuthStore } from '@/lib/store';

interface BasicSigninModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const basicSigninSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export const BasicSigninModal: React.FC<BasicSigninModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignup
}) => {
  const { login, isLoading, error, setError, isAuthenticated } = useAuthStore();
  const [hasStartedLogin, setHasStartedLogin] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

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

  // Debug modal state (only when open)
  React.useEffect(() => {
    if (isOpen) {
      console.log('Login modal opened:', { isAuthenticated, isLoading, hasStartedLogin });
    }
  }, [isOpen, isAuthenticated, isLoading, hasStartedLogin]);

  // Reset login state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setHasStartedLogin(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(basicSigninSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setError(null);
      setHasStartedLogin(true); // Mark that user has started login process
      console.log('Submitting login form:', data.email);
      await login(data);
      // Modal will close automatically when isAuthenticated becomes true
    } catch (error) {
      console.error('Login error:', error);
      setHasStartedLogin(false); // Reset on error
      // Error is handled in the store and will be displayed in the UI
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      setError(null);
      setHasStartedLogin(false);
      setShowPassword(false);
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
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Sign in to access your saved properties and continue your journey
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isLoading}
            className="text-slate-500 hover:text-slate-700"
            suppressHydrationWarning
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
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

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
                onClick={() => {
                  // TODO: Implement forgot password functionality
                  console.log('Forgot password clicked');
                }}
                disabled={isLoading}
                suppressHydrationWarning
              >
                Forgot your password?
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
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-base font-semibold"
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

            {/* Admin Sign In Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => {
                  form.setValue('email', 'admin@mukamba.com');
                  form.setValue('password', 'admin123');
                  form.handleSubmit(onSubmit)();
                }}
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                suppressHydrationWarning
              >
                <Shield className="w-4 h-4 mr-2" />
                Sign in as Admin
              </Button>
              
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => {
                  form.setValue('email', 'agent@mukamba.com');
                  form.setValue('password', 'agent123');
                  form.handleSubmit(onSubmit)();
                }}
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                suppressHydrationWarning
              >
                <Shield className="w-4 h-4 mr-2" />
                Sign in as Agent
              </Button>
            </div>
          </form>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-900/20 dark:to-red-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              🎉 Welcome back! You'll have access to:
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Your saved properties and favorites</li>
              <li>• Personalized property recommendations</li>
              <li>• Price alerts and market updates</li>
              <li>• Your verification progress and status</li>
            </ul>
          </div>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
            </span>
            <button
              onClick={onSwitchToSignup}
              disabled={isLoading}
              className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              suppressHydrationWarning
            >
              Create Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 