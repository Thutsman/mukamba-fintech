'use client';

import * as React from 'react';
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
  Star,
  BellRing
} from 'lucide-react';

import { PerformanceMetricsGrid } from './dashboard/PerformanceMetrics';
import { LeadManagement } from './dashboard/LeadManagement';
import { PropertyAnalytics } from './dashboard/PropertyAnalytics';
import { CommunicationCenter } from './dashboard/CommunicationCenter';
import { CalendarWidget } from './dashboard/CalendarWidget';
import { mockData } from './dashboard/mock-data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/auth';
import { AgentOnboardingModal } from '@/components/agent/AgentOnboardingModal';
import { PropertyListingModal } from '@/components/forms/PropertyListingModal';
import { LeadEntryModal } from '@/components/agent/LeadEntryModal';
import { EarningsEntryModal } from '@/components/agent/EarningsEntryModal';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface AgentDashboardProps {
  user: User;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showOnboarding, setShowOnboarding] = React.useState(!user.isPropertyVerified);
  const [showListingModal, setShowListingModal] = React.useState(false);
  const [showLeadModal, setShowLeadModal] = React.useState(false);
  const [showEarningsModal, setShowEarningsModal] = React.useState(false);
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Lead Management
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
              {mockData.messages.filter(m => m.isUnread).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {mockData.messages.filter(m => m.isUnread).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-8">
              <PerformanceMetricsGrid metrics={mockData.performanceMetrics} />
              <PropertyAnalytics data={mockData.propertyAnalytics} />
            </div>
          </TabsContent>

          {/* Lead Management Tab */}
          <TabsContent value="leads">
            <LeadManagement
              leads={mockData.leads}
              onLeadUpdate={(leadId, updates) => {
                console.log('Updating lead:', leadId, updates);
                // Implement lead update logic
              }}
              onAddLead={() => setShowLeadModal(true)}
            />
          </TabsContent>

          {/* Listings Tab */}
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
                      onClick={() => setShowLeadModal(true)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Add New Lead
                    </Button>
                    <Button
                      onClick={() => setShowEarningsModal(true)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Record Earnings
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('messages')}
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

          {/* Messages Tab */}
          <TabsContent value="messages">
            <CommunicationCenter
              messages={mockData.messages}
              onSendMessage={(message, recipientId) => {
                console.log('Sending message:', message, 'to:', recipientId);
                // Implement message sending logic
              }}
              onMarkAsRead={(messageId) => {
                console.log('Marking message as read:', messageId);
                // Implement mark as read logic
              }}
            />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <CalendarWidget
              appointments={mockData.appointments}
              onAddAppointment={() => {
                console.log('Adding new appointment');
                // Implement appointment creation logic
              }}
              onUpdateAppointment={(appointmentId, updates) => {
                console.log('Updating appointment:', appointmentId, updates);
                // Implement appointment update logic
              }}
            />
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

      <LeadEntryModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onComplete={(leadData) => {
          setShowLeadModal(false);
          console.log('New lead added:', leadData);
          // Add new lead to state/database
        }}
      />

      <EarningsEntryModal
        isOpen={showEarningsModal}
        onClose={() => setShowEarningsModal(false)}
        onComplete={(earningsData) => {
          setShowEarningsModal(false);
          console.log('Earnings recorded:', earningsData);
          // Add earnings to state/database
        }}
      />
    </div>
  );
}; 