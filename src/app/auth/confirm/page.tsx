'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';

function ConfirmEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { autoLoginAfterConfirmation } = useAuthStore();

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link. Please check your email and try again.');
        return;
      }

      try {
        // Call API route to confirm email (uses admin privileges)
        const response = await fetch('/api/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!result.success) {
          setStatus('error');
          if (response.status === 410) {
            setMessage('This confirmation link has expired (links are valid for 1 hour). Please request a new one.');
          } else if (response.status === 404) {
            setMessage('Invalid confirmation link. Please check your email and try again.');
          } else {
            setMessage(result.error || 'Confirmation failed. Please try again.');
          }
          return;
        }

        // Check if already confirmed
        if (result.alreadyConfirmed) {
          setStatus('success');
          setMessage('Your email has already been confirmed! Redirecting to your profile...');
          setTimeout(() => router.push('/?view=profile'), 2000);
          return;
        }

        setStatus('success');
        setMessage('Email confirmed successfully! You are now signed in and will be redirected to your profile.');
        
        // Auto-login the user with the returned user data
        if (result.user) {
          autoLoginAfterConfirmation(result.user);
        }
        
        // Redirect to main page with profile view after 2 seconds
        setTimeout(() => {
          router.push('/?view=profile');
        }, 2000);

      } catch (error) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setMessage('An error occurred during confirmation. Please try again or contact support.');
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  const handleResendEmail = () => {
    router.push('/?action=resend-confirmation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
      >
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-[#7F1518] animate-spin" />
            )}
            {status === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500" />
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              >
                <XCircle className="w-16 h-16 text-red-500" />
              </motion.div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'loading' && 'Confirming Your Email'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Action Buttons */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => router.push('/?view=profile')}
                className="w-full bg-[#7F1518] text-white py-3 px-6 rounded-lg hover:bg-[#6a1214] transition-colors font-medium"
              >
                Go to Profile
              </button>
            </motion.div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                className="w-full bg-[#7F1518] text-white py-3 px-6 rounded-lg hover:bg-[#6a1214] transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Request New Confirmation Email
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Back to Home
              </button>
            </div>
          )}

          {status === 'loading' && (
            <p className="text-sm text-gray-500">
              This will only take a moment...
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-[#7F1518] animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Confirming Your Email</h1>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}

