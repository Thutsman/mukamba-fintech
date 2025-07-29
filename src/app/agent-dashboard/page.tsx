'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { AgentDashboard } from '@/components/agent/AgentDashboard';

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // Check for agent role and authentication
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (!user?.roles?.includes('agent')) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user?.roles?.includes('agent')) {
    return null;
  }

  return <AgentDashboard user={user} />;
} 