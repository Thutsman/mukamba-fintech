'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Mail, User, Phone, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BasicSignupData } from '@/types/auth';
import { useAuthStore } from '@/lib/store';

interface BasicSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const basicSignupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional()
});

export const BasicSignupModal: React.FC<BasicSignupModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin
}) => {
  const { basicSignup, isLoading, error, setError, isAuthenticated } = useAuthStore();
  const [hasStartedSignup, setHasStartedSignup] = React.useState(false);

  // Only close modal when authentication succeeds AFTER user started signup
  React.useEffect(() => {
    if (isAuthenticated && isOpen && hasStartedSignup && !isLoading) {
      console.log('User authenticated after signup, closing signup modal');
      setTimeout(() => {
        onClose();
        setHasStartedSignup(false); // Reset for next time
      }, 500);
    }
  }, [isAuthenticated, isOpen, hasStartedSignup, isLoading, onClose]);

  // Debug modal state (only when open)
  React.useEffect(() => {
    if (isOpen) {
      console.log('Signup modal opened:', { isAuthenticated, isLoading, hasStartedSignup });
    }
  }, [isOpen, isAuthenticated, isLoading, hasStartedSignup]);

  // Reset signup state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setHasStartedSignup(false);
    }
  }, [isOpen]);

  const form = useForm<BasicSignupData>({
    resolver: zodResolver(basicSignupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: ''
    }
  });

  const onSubmit = async (data: BasicSignupData) => {
    try {
      setError(null);
      setHasStartedSignup(true); // Mark that user has started signup process
      console.log('Submitting signup form:', data.email);
      await basicSignup(data);
      // Modal will close automatically when isAuthenticated becomes true
    } catch (error) {
      console.error('Signup error:', error);
      setHasStartedSignup(false); // Reset on error
      // Error is handled in the store and will be displayed in the UI
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      setError(null);
      setHasStartedSignup(false);
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
              Join Mukamba
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Get started in 30 seconds - explore properties right away!
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
              <p className="text-xs text-slate-500 mt-1">
                Add now or verify later to contact property owners
              </p>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
                placeholder="Create a secure password"
                disabled={isLoading}
                className="mt-1"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
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
                  Creating account...
                </>
              ) : (
                'Create Account & Start Exploring'
              )}
            </Button>
          </form>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-900/20 dark:to-red-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              🎉 What you get immediately:
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Browse 1,200+ rent-to-buy properties</li>
              <li>• Save your favorite listings</li>
              <li>• Get property price alerts</li>
              <li>• Access market insights</li>
            </ul>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
            </span>
            <button
              onClick={onSwitchToLogin}
              disabled={isLoading}
              className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              suppressHydrationWarning
            >
              Sign In
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 