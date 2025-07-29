'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertCircle,
  Building,
  FileCheck,
  UserCheck,
  DollarSign,
  Star
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/auth';
import { AgentOnboardingModal } from '@/components/agent/AgentOnboardingModal';
import { PropertyListingModal } from '@/components/forms/PropertyListingModal';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface AgentDashboardProps {
  user: User;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = React.useState('listings');
  const [showOnboarding, setShowOnboarding] = React.useState(!user.isPropertyVerified);
  const [showListingModal, setShowListingModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const router = useRouter();
  const { logout, updateUser } = useAuthStore();

  // Mock data - replace with real data from Supabase
  const mockStats = {
    totalListings: 12,
    activeListings: 8,
    totalLeads: 45,
    newInquiries: 15,
    viewingsScheduled: 6,
    averageResponseTime: '2.5 hours',
    satisfactionScore: 4.8,
    monthlyEarnings: 25000
  };

  const handleBackToHome = () => {
    // Remove agent role and switch to buyer role to access PropertyDashboard
    const updatedRoles = user.roles.filter(role => role !== 'agent');
    if (updatedRoles.length === 0) {
      updatedRoles.push('buyer'); // Default to buyer if no other roles
    }
    
    updateUser({ roles: updatedRoles });
    router.push('/');
  };

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Agent Dashboard
                </h1>
                <p className="text-sm text-slate-500">
                  Welcome back, {user.firstName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleBackToHome}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <Button
                onClick={() => setShowListingModal(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Listing
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings" className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Listings Manager
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Lead Engagement
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Listings Manager Tab */}
          <TabsContent value="listings">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Listing Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Listings</span>
                      <Badge variant="secondary">{mockStats.totalListings}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Active Listings</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {mockStats.activeListings}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Agent Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      {user.isPropertyVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                      <span className="text-sm text-slate-600">
                        {user.isPropertyVerified ? 'Verified Agent' : 'Verification Required'}
                      </span>
                    </div>
                    {!user.isPropertyVerified && (
                      <Button
                        onClick={() => setShowOnboarding(true)}
                        variant="outline"
                        className="w-full"
                      >
                        Complete Verification
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setShowListingModal(true)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Listing
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View Messages
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Listings Grid will go here */}
            <div className="mt-8">
              {/* Add PropertyListingsGrid component here */}
            </div>
          </TabsContent>

          {/* Lead Engagement Tab */}
          <TabsContent value="leads">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Lead Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Lead Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Leads</span>
                      <Badge variant="secondary">{mockStats.totalLeads}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">New Inquiries</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {mockStats.newInquiries}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Viewings Scheduled</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {mockStats.viewingsScheduled}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      {mockStats.averageResponseTime}
                    </div>
                    <p className="text-sm text-slate-600">Average Response Time</p>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Viewings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Today's Viewings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Viewing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leads List will go here */}
            <div className="mt-8">
              {/* Add LeadsList component here */}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Performance Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Monthly Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      R{mockStats.monthlyEarnings.toLocaleString()}
                    </div>
                    <p className="text-sm text-green-600">+12% from last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Satisfaction Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 flex items-center justify-center">
                      {mockStats.satisfactionScore}
                      <Star className="w-5 h-5 text-yellow-500 ml-1" />
                    </div>
                    <p className="text-sm text-slate-600">Based on 28 reviews</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Response Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      98%
                    </div>
                    <p className="text-sm text-slate-600">Within 24 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      15%
                    </div>
                    <p className="text-sm text-slate-600">Leads to Viewings</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts will go here */}
            <div className="mt-8">
              {/* Add AnalyticsCharts component here */}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AgentOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          // Update user verification status
        }}
      />

      <PropertyListingModal
        isOpen={showListingModal}
        onClose={() => setShowListingModal(false)}
        onComplete={(data) => {
          setShowListingModal(false);
          // Add new listing to state/database
        }}
        country="ZW"
      />
    </div>
  );
}; 