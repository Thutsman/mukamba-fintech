'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main app - admin access is handled through the sign-in modal
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Admin Access</h1>
        <p className="text-slate-600 mb-4">
          Redirecting to main application...
        </p>
        <p className="text-sm text-slate-500">
          Use the "Sign in as Admin" option in the sign-in modal to access the admin dashboard.
        </p>
      </div>
    </div>
  );
} 