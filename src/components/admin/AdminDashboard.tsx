'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Home, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  Zap,
  Bell,
  Menu,
  ArrowLeft
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { User as UserType } from '@/types/auth';
import { useAuthStore } from '@/lib/store';
import { OverviewCards } from './OverviewCards';
import { RecentUsersFeed } from './RecentUsersFeed';
import { RecentPropertiesFeed } from './RecentPropertiesFeed';
import { AdminNavigation } from './AdminNavigation';
import { ListingsPage } from './ListingsPage';
import { KYCPage } from './KYCPage';
import { getAllKYCVerifications, updateKYCVerification } from '@/lib/kyc-services';
import type { KYCVerificationWithUser } from '@/types/database';
import { ReportsTab } from './ReportsTab';
import { MessagesTab } from './MessagesTab';
import PaymentTrackingTab from './PaymentTrackingTab';
import { OffersPage } from './OffersPage';
import type { AdminTab, AdminStats, AdminUser, AdminProperty, AdminListing, KYCVerification } from '@/types/admin';
import { getPropertyListingsStats } from '@/lib/property-application-services';
import { theme, getColor } from '@/lib/theme';
import { toast } from 'sonner';
import { useMessageStore } from '@/lib/message-store';

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
  onBackToUserView: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onBackToUserView
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [propertyStats, setPropertyStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [kycVerifications, setKycVerifications] = useState<KYCVerificationWithUser[]>([]);
  const [isLoadingKyc, setIsLoadingKyc] = useState<boolean>(false);

  // Load real property stats
  useEffect(() => {
    const loadPropertyStats = async () => {
      try {
        const stats = await getPropertyListingsStats();
        setPropertyStats(stats);
      } catch (error) {
        console.error('Error loading property stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadPropertyStats();
  }, []);

  // Load KYC queue from Supabase
  useEffect(() => {
    const loadKyc = async () => {
      try {
        setIsLoadingKyc(true);
        const { data, error } = await getAllKYCVerifications({ status: 'all', type: 'all' });
        if (!error && data) setKycVerifications(data);
      } catch (e) {
        console.error('Error loading KYC verifications:', e);
      } finally {
        setIsLoadingKyc(false);
      }
    };
    loadKyc();
  }, []);

  // Mock admin data
  const adminStats: AdminStats = {
    totalUsers: 1247,
    totalProperties: 892,
    pendingVerifications: 23,
    activeTransactions: 156,
    monthlyRevenue: 45000,
    userGrowth: 12.5,
    propertyGrowth: 8.3,
    verificationRate: 94.2,
    escrowBalance: 125000,
    pendingListings: 12,
    rejectedListings: 5,
    activeRentToBuy: 89
  };

  const recentUsers: AdminUser[] = [
    { 
      id: '1', 
      name: 'John Doe', 
      email: 'john@example.com', 
      status: 'verified', 
      joined: '2 hours ago',
      role: 'buyer',
      lastActive: '1 hour ago',
      isPhoneVerified: true,
      isIdentityVerified: true,
      isFinanciallyVerified: true,
      isPropertyVerified: false,
      kycStatus: 'approved'
    },
    { 
      id: '2', 
      name: 'Sarah Smith', 
      email: 'sarah@example.com', 
      status: 'pending', 
      joined: '4 hours ago',
      role: 'seller',
      lastActive: '3 hours ago',
      isPhoneVerified: true,
      isIdentityVerified: false,
      isFinanciallyVerified: false,
      isPropertyVerified: false,
      kycStatus: 'pending'
    },
    { 
      id: '3', 
      name: 'Mike Johnson', 
      email: 'mike@example.com', 
      status: 'verified', 
      joined: '6 hours ago',
      role: 'both',
      lastActive: '2 hours ago',
      isPhoneVerified: true,
      isIdentityVerified: true,
      isFinanciallyVerified: true,
      isPropertyVerified: true,
      kycStatus: 'approved'
    },
    { 
      id: '4', 
      name: 'Lisa Brown', 
      email: 'lisa@example.com', 
      status: 'rejected', 
      joined: '1 day ago',
      role: 'buyer',
      lastActive: '1 day ago',
      isPhoneVerified: false,
      isIdentityVerified: false,
      isFinanciallyVerified: false,
      isPropertyVerified: false,
      kycStatus: 'rejected'
    }
  ];

  const recentProperties: AdminProperty[] = [
    { 
      id: '1', 
      title: 'Modern 3-Bedroom House', 
      location: 'Harare, Zimbabwe', 
      price: 250000, 
      status: 'active',
      type: 'residential',
      bedrooms: 3,
      bathrooms: 2,
      size: 150,
      listedBy: 'John Smith',
      listedAt: '2 hours ago',
      rentToBuy: true,
      monthlyRental: 1200,
      verificationStatus: 'approved'
    },
    { 
      id: '2', 
      title: 'Luxury Apartment', 
      location: 'Johannesburg, SA', 
      price: 180000, 
      status: 'pending',
      type: 'residential',
      bedrooms: 2,
      bathrooms: 1,
      size: 80,
      listedBy: 'Sarah Wilson',
      listedAt: '4 hours ago',
      rentToBuy: false,
      verificationStatus: 'pending'
    },
    { 
      id: '3', 
      title: 'Family Home', 
      location: 'Bulawayo, Zimbabwe', 
      price: 320000, 
      status: 'active',
      type: 'residential',
      bedrooms: 4,
      bathrooms: 3,
      size: 200,
      listedBy: 'Mike Davis',
      listedAt: '6 hours ago',
      rentToBuy: true,
      monthlyRental: 1500,
      verificationStatus: 'approved'
    },
    { 
      id: '4', 
      title: 'Investment Property', 
      location: 'Cape Town, SA', 
      price: 450000, 
      status: 'draft',
      type: 'commercial',
      size: 300,
      listedBy: 'Lisa Brown',
      listedAt: '1 day ago',
      rentToBuy: false,
      verificationStatus: 'pending'
    }
  ];



  // Update the mock KYC verifications data
  const mockKYCVerifications: KYCVerification[] = [
    {
      id: '1',
      userId: 'user_1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      type: 'buyer',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      documents: {
        idDocument: '/mock/users/1/id.pdf',
        proofOfIncome: '/mock/users/1/income.pdf',
        bankStatement: '/mock/users/1/bank.pdf'
      }
    },
    {
      id: '2',
      userId: 'user_2',
      userName: 'Sarah Smith',
      userEmail: 'sarah@example.com',
      type: 'seller',
      status: 'approved',
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
      documents: {
        idDocument: '/mock/users/2/id.pdf',
        titleDeeds: ['/mock/users/2/deed1.pdf', '/mock/users/2/deed2.pdf'],
        propertyTaxCertificates: ['/mock/users/2/tax.pdf']
      }
    }
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: string;
  }> = ({ title, value, subtitle, icon: Icon, color, trend }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="group cursor-pointer"
    >
      <Card className="relative overflow-hidden border-0 rounded-2xl shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br opacity-10" 
          style={{
            backgroundImage: `radial-gradient(circle at 100% 100%, 
              ${color === 'bg-blue-600' ? '#60a5fa 0%, #2563eb' :
                color === 'bg-green-600' ? '#34d399 0%, #059669' :
                color === 'bg-purple-600' ? '#a78bfa 0%, #7c3aed' :
                '#fbbf24 0%, #d97706'} 100%)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br"
          style={{
            backgroundImage: `linear-gradient(to bottom right, 
              ${color === 'bg-blue-600' ? '#3b82f6, #1d4ed8' :
                color === 'bg-green-600' ? '#10b981, #047857' :
                color === 'bg-purple-600' ? '#8b5cf6, #6d28d9' :
                '#f59e0b, #b45309'})`
          }}
        />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-2xl font-bold text-white">{value}</h3>
                {trend && (
                  <Badge className="bg-white/20 text-white text-xs backdrop-blur-sm border border-white/10">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {trend}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-white/90 mb-1">{title}</p>
              <p className="text-xs text-white/70">{subtitle}</p>
            </div>
            <div className="relative group-hover:scale-110 transition-transform duration-300">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
              <div className="relative w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.15] mix-blend-soft-light pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '50px 50px'
        }} 
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-blue-50/50 via-transparent to-transparent pointer-events-none" />

        {/* Header */}
      <div className="sticky top-0 z-50">
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 transition-colors duration-200"
                  onClick={() => setMobileOpen(v => !v)}
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 transition-colors duration-200 text-slate-700"
                  onClick={onBackToUserView}
                  aria-label="Back to home"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Back to Home</span>
                </button>
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
              </div>
              <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 truncate">
                  Mukamba Admin
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 truncate">
                  Welcome back, {user.firstName}
                </p>
                  </div>
              </div>
            </div>

              <div className="header-actions flex items-center gap-4 flex-shrink-0">
                <button
                  className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-100/80 hover:bg-slate-200/80 transition-colors duration-200 text-slate-700"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                </button>
              <button 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 transition-all duration-300 shadow-lg hover:shadow-xl shadow-red-800/10 hover:shadow-red-900/20 text-white font-medium"
                onClick={onLogout}
                suppressHydrationWarning
              >
                <LogOut size={18} />
                  <span className="hidden sm:inline text-sm">Sign Out</span>
                  <span className="sm:hidden text-sm">Logout</span>
              </button>
              </div>
            </div>
            </div>
          </div>
        </div>

      {/* Main: Sidebar + Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)]">
        <AdminNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          notifications={useMessageStore.getState().messages.filter((m) => !m.read).length}
          pendingActions={{ listings: 12, kyc: 8, payments: 3, reports: 1, users: 0, messages: useMessageStore.getState().messages.filter((m) => !m.read).length }}
          isMobileOpen={mobileOpen}
          onMobileToggle={() => setMobileOpen(v => !v)}
        />
        <main className="flex-1 lg:pl-6 py-6 space-y-8 sm:space-y-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
          {activeTab === 'overview' && (
            <div className="space-y-8 sm:space-y-12">
              {/* Stats Grid */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
                  Overview
                </h2>
                <OverviewCards stats={adminStats} />
              </section>

              {/* Document Review Queue */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
                  Review Queue
                </h2>
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden">
                  <CardContent className="p-4 sm:p-6 relative">
                    <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-16 sm:-mr-32 -mt-16 sm:-mt-32" />
                    <div className="relative">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                        <div className="space-y-2">
                          <h3 className="text-lg sm:text-xl font-semibold">Document Review Queue</h3>
                          <p className="text-blue-100 text-xs sm:text-sm">
                            {isLoadingStats ? 'Loading...' : `${propertyStats.pending} property listings`} and{' '}
                            {mockKYCVerifications.filter(v => v.status === 'pending').length} KYC verifications pending review
                          </p>
                        </div>
                        <Button 
                          variant="secondary" 
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm text-xs sm:text-sm px-3 sm:px-4 py-2"
                          onClick={() => setActiveTab('listings')}
                          suppressHydrationWarning
                        >
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Review Now
                        </Button>
                      </div>

                      {/* Progress Indicators */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 sm:mt-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span>Property Listings</span>
                            <span className="font-medium">
                              {isLoadingStats ? 'Loading...' : `${propertyStats.pending} pending`}
                            </span>
                          </div>
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white rounded-full transition-all duration-500"
                              style={{ 
                                width: isLoadingStats ? '0%' : `${(propertyStats.approved / propertyStats.total) * 100}%` 
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span>KYC Verifications</span>
                            <span className="font-medium">
                              {mockKYCVerifications.filter(v => v.status === 'pending').length} pending
                            </span>
                          </div>
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(mockKYCVerifications.filter(v => v.status === 'approved').length / mockKYCVerifications.length) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Quick Actions */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
                  Quick Actions
                </h2>
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <Button 
                        className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/10 transition-all duration-150 text-xs sm:text-sm py-2 sm:py-3" 
                        onClick={() => setActiveTab('listings')}
                        suppressHydrationWarning
                      >
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Review Documents</span>
                      </Button>
                      <Button 
                        className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/10 transition-all duration-150 text-xs sm:text-sm py-2 sm:py-3" 
                        suppressHydrationWarning
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Add User</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-center space-x-2 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-700 transition-all duration-150 text-xs sm:text-sm py-2 sm:py-3" 
                        suppressHydrationWarning
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Edit Property</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-center space-x-2 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-700 transition-all duration-150 text-xs sm:text-sm py-2 sm:py-3" 
                        suppressHydrationWarning
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Export Data</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Recent Activity */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
                  Recent Activity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  <Card className="border border-slate-200 shadow-lg shadow-slate-200/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        Recent Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      <RecentUsersFeed 
                        users={recentUsers}
                        onViewUser={(userId) => console.log('View user:', userId)}
                        onViewAll={() => setActiveTab('users')}
                      />
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200 shadow-lg shadow-slate-200/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Home className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                        Recent Properties
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      <RecentPropertiesFeed 
                        properties={recentProperties}
                        onViewProperty={(propertyId) => console.log('View property:', propertyId)}
                        onViewAll={() => setActiveTab('messages')}
                      />
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'listings' && (
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
                Property Listings
              </h2>
              <ListingsPage
                onViewListing={(listingId) => console.log('View listing:', listingId)}
                onApproveListing={async (listingId) => {
                  console.log('Approve listing:', listingId);
                  // Here you would call the approvePropertyApplication function
                  toast.success('Listing approved successfully!');
                }}
                onRejectListing={async (listingId, reason) => {
                  console.log('Reject listing:', listingId, reason);
                  // Here you would call the rejectPropertyApplication function
                  toast.success('Listing rejected successfully!');
                }}
                onBulkAction={(action, listingIds) => console.log('Bulk action:', action, listingIds)}
                onAddToListings={(propertyListing) => {
                  console.log('Adding property to listings:', propertyListing);
                  // Here you would typically add the property to your PropertyListings component
                  // For now, we'll just log it
                  toast.success(`Property "${propertyListing.title}" added to listings successfully!`);
                }}
              />
            </section>
          )}

          {activeTab === 'offers' && (
            <section>
              <OffersPage
                onViewOffer={(offerId) => console.log('View offer:', offerId)}
                onApproveOffer={(offerId) => {
                  console.log('Approve offer:', offerId);
                  toast.success('Offer approved successfully!');
                }}
                onRejectOffer={(offerId, reason) => {
                  console.log('Reject offer:', offerId, reason);
                  toast.success('Offer rejected successfully!');
                }}
              />
            </section>
          )}

          {activeTab === 'kyc' && (
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
                KYC Verifications
              </h2>
              <KYCPage
                verifications={(kycVerifications.length ? kycVerifications.map(v => ({
                  id: v.id,
                  userId: v.user_id,
                  userName: `${v.user.first_name} ${v.user.last_name}`,
                  userEmail: v.user.email,
                  type: v.verification_type,
                  status: v.status,
                  submittedAt: new Date(v.submitted_at || v.created_at).toLocaleString(),
                  reviewedAt: v.reviewed_at ? new Date(v.reviewed_at).toLocaleString() : undefined,
                  reviewedBy: v.reviewed_by,
                  documents: {
                    idDocument: v.documents.find(d => d.document_type === 'id_document')?.file_path,
                    proofOfIncome: v.documents.find(d => d.document_type === 'proof_of_income')?.file_path,
                    bankStatement: v.documents.find(d => d.document_type === 'bank_statement')?.file_path
                  }
                })) : mockKYCVerifications)}
                onViewVerification={(verificationId) => console.log('View verification:', verificationId)}
                onApproveVerification={async (verificationId) => {
                  try {
                    await updateKYCVerification(verificationId, user.id, { status: 'approved' });
                    setKycVerifications(prev => prev.map(v => v.id === verificationId ? { ...v, status: 'approved', reviewed_by: user.id, reviewed_at: new Date().toISOString() } : v));
                    toast.success('Verification approved');
                  } catch (e) {
                    toast.error('Failed to approve');
                  }
                }}
                onRejectVerification={async (verificationId, reason) => {
                  try {
                    await updateKYCVerification(verificationId, user.id, { status: 'rejected', rejection_reason: reason });
                    setKycVerifications(prev => prev.map(v => v.id === verificationId ? { ...v, status: 'rejected', reviewed_by: user.id, reviewed_at: new Date().toISOString() } : v));
                    toast.success('Verification rejected');
                  } catch (e) {
                    toast.error('Failed to reject');
                  }
                }}
                onBulkAction={async (action, verificationIds) => {
                  for (const id of verificationIds) {
                    try {
                      await updateKYCVerification(id, user.id, { status: action === 'approve' ? 'approved' : 'rejected' });
                    } catch {}
                  }
                  setKycVerifications(prev => prev.map(v => verificationIds.includes(v.id) ? { ...v, status: action === 'approve' ? 'approved' : 'rejected', reviewed_by: user.id, reviewed_at: new Date().toISOString() } : v));
                  toast.success(`Bulk ${action} done`);
                }}
              />
            </section>
          )}

          {activeTab === 'users' && (
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
                User Management
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-slate-600">
                      Manage user accounts, roles, and permissions
                    </p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm" suppressHydrationWarning>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Add User
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 sm:mb-6">
                      <div className="flex-1">
                        <Input
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="max-w-sm text-xs sm:text-sm"
                        />
                      </div>
                      <Button variant="outline" className="text-xs sm:text-sm" suppressHydrationWarning>
                        <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Filter
                      </Button>
                    </div>
                    
                    <p className="text-slate-600 text-center py-6 sm:py-8 text-sm">
                      User management interface coming soon...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {activeTab === 'messages' && (
            <section>
              <MessagesTab />
            </section>
          )}

          {activeTab === 'reports' && (
            <section>
              <ReportsTab />
            </section>
          )}

              {activeTab === 'payments' && (
                <section>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
                    Payment Tracking
                  </h2>
                  {/* Lazy import to avoid breaking if file missing at first run */}
                  {/* @ts-ignore - We'll add the component next */}
                  <PaymentTrackingTab />
                </section>
              )}

          {activeTab === 'settings' && (
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
                System Settings
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-slate-600">
                    Configure system preferences and global settings
                  </p>
                </div>
                
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-slate-600 text-center py-6 sm:py-8 text-sm">
                      System settings interface coming soon...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}; 