'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setError, setLoading, updateUser, checkAuth } = useAuthStore();

  React.useEffect(() => {
    const finalize = async () => {
      try {
        setLoading(true);
        if (!supabase) throw new Error('Supabase not configured');

        // Refresh session/user
        await checkAuth();

        // Determine where to go next
        let redirect = '/';
        try {
          const stored = sessionStorage.getItem('postAuthRedirect');
          if (stored) redirect = stored;
          // Ensure we land on profile dashboard after OAuth
          sessionStorage.setItem('postAuthView', 'profile');
        } catch (_) {}

        // Clear temporary flags
        try {
          sessionStorage.removeItem('postAuthRedirect');
        } catch (_) {}

        router.replace(redirect);
      } catch (e) {
        console.error('Auth callback error', e);
        setError('Authentication failed. Please try again.');
        router.replace('/');
      } finally {
        setLoading(false);
      }
    };
    finalize();
  }, [router, setError, setLoading, updateUser, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600">Signing you in with Google...</div>
    </div>
  );
}


