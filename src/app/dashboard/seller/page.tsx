'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { VerifiedSellerDashboard } from '@/components/seller/VerifiedSellerDashboard';
import { useAuthStore } from '@/lib/store';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  React.useEffect(() => {
    // Wait until persisted auth store is hydrated to avoid false redirects on mobile
    if (!hasHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace('/');
      return;
    }
    const isSeller = user.roles?.includes('seller');
    const isVerified = (user.isIdentityVerified && user.isPropertyVerified) || user.kycStatus === 'approved';
    if (!isSeller || !isVerified) {
      router.replace('/');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  // Avoid rendering until hydration completes to prevent flicker/redirect loop
  if (!hasHydrated) return null;
  if (!user) return null;

  return <VerifiedSellerDashboard user={user} />;
}


