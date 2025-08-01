'use client';

import * as React from 'react';
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
  DollarSign,
  MapPin,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  Zap
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
import type { AdminTab, AdminStats, AdminUser, AdminProperty, AdminListing, KYCVerification } from '@/types/admin';
import { theme, getColor } from '@/lib/theme';

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
  const [activeTab, setActiveTab] = React.useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = React.useState('');

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

  // Update the mock listings data
  const mockListings: AdminListing[] = [
    {
      id: '1',
      propertyId: 'prop_1',
      propertyTitle: 'Modern 3-Bedroom House',
      sellerId: 'seller_1',
      sellerName: 'John Smith',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      price: 250000,
      monthlyRental: 1200,
      rentToBuy: true,
      location: 'Harare, Zimbabwe',
      type: 'residential',
      bedrooms: 3,
      bathrooms: 2,
      size: 150,
      description: 'Beautiful modern house in a prime location',
      images: [
        '/mock/properties/1/main.jpg',
        '/mock/properties/1/1.jpg',
        '/mock/properties/1/2.jpg'
      ]
    },
    {
      id: '2',
      propertyId: 'prop_2',
      propertyTitle: 'Luxury Apartment',
      sellerId: 'seller_2',
      sellerName: 'Sarah Wilson',
      status: 'approved',
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
      price: 180000,
      rentToBuy: false,
      location: 'Johannesburg, SA',
      type: 'residential',
      bedrooms: 2,
      bathrooms: 1,
      size: 80,
      description: 'Modern apartment with great city views',
      images: [
        '/mock/properties/2/main.jpg',
        '/mock/properties/2/1.jpg',
        '/mock/properties/2/2.jpg'
      ]
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
  }> = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="group cursor-pointer"
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                {trend && (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {trend}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">{title}</p>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }} 
      />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                    Mukamba Admin
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    Welcome back, {user.firstName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={onBackToUserView}
                className="border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                suppressHydrationWarning
              >
                <User className="w-4 h-4 mr-2" />
                User View
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
                className="border-red-200 hover:border-red-300 text-red-700 hover:bg-red-50"
                suppressHydrationWarning
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notifications={5}
        pendingActions={{
          listings: 12,
          kyc: 8,
          escrow: 3
        }}
      />

      {/* Main Content */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Stats Grid */}
              <section>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                  Overview
                </h2>
                <OverviewCards stats={adminStats} />
              </section>

              {/* Document Review Queue */}
              <section>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                  Review Queue
                </h2>
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden">
                  <CardContent className="p-6 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-32 -mt-32" />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold">Document Review Queue</h3>
                          <p className="text-blue-100 text-sm">
                            {mockListings.filter(l => l.status === 'pending').length} property listings and{' '}
                            {mockKYCVerifications.filter(v => v.status === 'pending').length} KYC verifications pending review
                          </p>
                        </div>
                        <Button 
                          variant="secondary" 
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                          onClick={() => setActiveTab('listings')}
                          suppressHydrationWarning
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Review Now
                        </Button>
                      </div>

                      {/* Progress Indicators */}
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Property Listings</span>
                            <span className="font-medium">
                              {mockListings.filter(l => l.status === 'pending').length} pending
                            </span>
                          </div>
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(mockListings.filter(l => l.status === 'approved').length / mockListings.length) * 100}%` 
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
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
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                  Quick Actions
                </h2>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Button 
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/10 transition-all duration-150" 
                        onClick={() => setActiveTab('listings')}
                        suppressHydrationWarning
                      >
                        <FileText className="w-4 h-4" />
                        <span>Review Documents</span>
                      </Button>
                      <Button 
                        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/10 transition-all duration-150" 
                        suppressHydrationWarning
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add User</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center space-x-2 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-700 transition-all duration-150" 
                        suppressHydrationWarning
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Property</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center space-x-2 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-700 transition-all duration-150" 
                        suppressHydrationWarning
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Data</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Recent Activity */}
              <section>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                  Recent Activity
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border border-slate-200 shadow-lg shadow-slate-200/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Recent Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RecentUsersFeed 
                        users={recentUsers}
                        onViewUser={(userId) => console.log('View user:', userId)}
                        onViewAll={() => setActiveTab('users')}
                      />
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200 shadow-lg shadow-slate-200/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-emerald-500" />
                        Recent Properties
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RecentPropertiesFeed 
                        properties={recentProperties}
                        onViewProperty={(propertyId) => console.log('View property:', propertyId)}
                        onViewAll={() => setActiveTab('properties')}
                      />
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'listings' && (
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                Property Listings
              </h2>
              <ListingsPage
                listings={mockListings}
                onViewListing={(listingId) => console.log('View listing:', listingId)}
                onApproveListing={(listingId) => console.log('Approve listing:', listingId)}
                onRejectListing={(listingId, reason) => console.log('Reject listing:', listingId, reason)}
                onBulkAction={(action, listingIds) => console.log('Bulk action:', action, listingIds)}
              />
            </section>
          )}

          {activeTab === 'kyc' && (
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                KYC Verifications
              </h2>
              <KYCPage
                verifications={mockKYCVerifications}
                onViewVerification={(verificationId) => console.log('View verification:', verificationId)}
                onApproveVerification={(verificationId) => console.log('Approve verification:', verificationId)}
                onRejectVerification={(verificationId, reason) => console.log('Reject verification:', verificationId, reason)}
                onBulkAction={(action, verificationIds) => console.log('Bulk action:', action, verificationIds)}
              />
            </section>
          )}

          {activeTab === 'users' && (
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                User Management
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Manage user accounts, roles, and permissions
                    </p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700" suppressHydrationWarning>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-1">
                        <Input
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="max-w-sm"
                        />
                      </div>
                      <Button variant="outline" suppressHydrationWarning>
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                    
                    <p className="text-slate-600 text-center py-8">
                      User management interface coming soon...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {activeTab === 'properties' && (
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                Property Management
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Manage property listings and documentation
                    </p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700" suppressHydrationWarning>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <p className="text-slate-600 text-center py-8">
                      Property management interface coming soon...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                System Settings
              </h2>
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Configure system preferences and global settings
                  </p>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <p className="text-slate-600 text-center py-8">
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
  );
}; 