'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

function ConfirmEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link. Please check your email and try again.');
        return;
      }

      if (!supabase) {
        setStatus('error');
        setMessage('Database connection error. Please try again later.');
        return;
      }

      try {
        // Verify token exists and hasn't expired
        const { data: confirmationData, error: fetchError } = await supabase
          .from('email_confirmations')
          .select('*')
          .eq('token', token)
          .single();

        if (fetchError || !confirmationData) {
          setStatus('error');
          setMessage('Invalid or expired confirmation link. Please request a new confirmation email.');
          return;
        }

        // Check if already confirmed
        if (confirmationData.confirmed_at) {
          setStatus('success');
          setMessage('Your email has already been confirmed! Redirecting to home...');
          setTimeout(() => router.push('/'), 2000);
          return;
        }

        // Check expiration
        if (new Date() > new Date(confirmationData.expires_at)) {
          setStatus('error');
          setMessage('This confirmation link has expired. Please request a new confirmation email.');
          return;
        }

        // Mark as confirmed in our custom table
        const { error: updateError } = await supabase
          .from('email_confirmations')
          .update({ confirmed_at: new Date().toISOString() })
          .eq('token', token);

        if (updateError) {
          throw updateError;
        }

        // Update user metadata to mark email as confirmed
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: { email_confirmed_custom: true }
        });

        if (authUpdateError) {
          console.error('Failed to update user metadata:', authUpdateError);
          // Continue anyway - the important part is the database record
        }

        setStatus('success');
        setMessage('Email confirmed successfully! You now have full access to all features.');
        
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);

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
                onClick={() => router.push('/')}
                className="w-full bg-[#7F1518] text-white py-3 px-6 rounded-lg hover:bg-[#6a1214] transition-colors font-medium"
              >
                Go to Home
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

