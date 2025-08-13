'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { VerifiedSellerDashboard } from '@/components/seller/VerifiedSellerDashboard';
import { useAuthStore } from '@/lib/store';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/');
      return;
    }
    const isSeller = user.roles?.includes('seller');
    const isVerified = (user.isIdentityVerified && user.isPropertyVerified) || user.kycStatus === 'approved';
    if (!isSeller || !isVerified) {
      router.replace('/');
    }
  }, [isAuthenticated, user, router]);

  if (!user) return null;

  return <VerifiedSellerDashboard user={user} />;
}


