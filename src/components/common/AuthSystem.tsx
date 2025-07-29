'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { BasicSignupModal } from '@/components/forms/BasicSignupModal';
import { BasicSigninModal } from '@/components/forms/BasicSigninModal';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';
import { PropertyDashboard } from '@/components/property/PropertyDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAuthStore } from '@/lib/store';

export const AuthSystem: React.FC = () => {
  const [showRegister, setShowRegister] = React.useState(false);
  const [showSigninModal, setShowSigninModal] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<'properties' | 'profile'>('properties');
  
  const router = useRouter();
  const { user, isAuthenticated, logout, startVerification, isNewUser, markUserAsReturning } = useAuthStore();

  // Automatically redirect new users to profile view
  React.useEffect(() => {
    if (isAuthenticated && isNewUser) {
      console.log('New user detected, redirecting to profile');
      setCurrentView('profile');
    }
  }, [isAuthenticated, isNewUser]);

  // Debug authentication state changes
  React.useEffect(() => {
    console.log('Authentication state changed:', { 
      isAuthenticated, 
      isNewUser,
      user: user ? { id: user.id, email: user.email } : null 
    });
  }, [isAuthenticated, user, isNewUser]);

  // Close modals when authentication state changes (but not on initial load)
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  
  React.useEffect(() => {
    // Don't close modals on initial load if user is already authenticated
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    
    if (isAuthenticated) {
      console.log('User authenticated, closing modals');
      setShowRegister(false);
    }
  }, [isAuthenticated, isInitialLoad]);

  // Debug modal state in AuthSystem
  React.useEffect(() => {
    console.log('AuthSystem modal state:', { showRegister, isAuthenticated });
  }, [showRegister, isAuthenticated]);

  // If authenticated and user is agent, redirect to agent dashboard
  React.useEffect(() => {
    if (isAuthenticated && user && user.roles.includes('agent')) {
      router.push('/agent-dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleSwitchToRegister = () => {
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowSigninModal(true);
  };

  const handleCloseModals = () => {
    setShowRegister(false);
    setShowSigninModal(false);
  };

  const handleLogout = () => {
    // Close any open modals first
    setShowRegister(false);
    setShowSigninModal(false);
    // Then logout
    logout();
  };

  const handleStartVerification = (type: 'buyer' | 'seller', step: string) => {
    // This would open the appropriate verification modal/flow
    console.log(`Starting ${type} verification for step: ${step}`);
    // For now, just simulate the verification
    startVerification(type, step);
  };

  // Render logic - all conditional returns moved to the end
  const renderContent = () => {
    // If authenticated and user is admin, show admin dashboard
    if (isAuthenticated && user && user.roles.includes('admin')) {
      return (
        <AdminDashboard 
          user={user}
          onLogout={handleLogout}
          onBackToUserView={() => {
            // For now, just logout and go back to user view
            // In a real app, you might want to switch to a different user account
            handleLogout();
          }}
        />
      );
    }

    // If authenticated and viewing profile
    if (isAuthenticated && user && currentView === 'profile') {
      return (
        <ProfileDashboard 
          user={user} 
          onStartVerification={handleStartVerification}
          onLogout={handleLogout}
          onBackToHome={() => {
            setCurrentView('properties');
            if (isNewUser) {
              markUserAsReturning(); // Mark user as no longer new when they navigate away from profile
            }
          }}
          onProfileSettings={() => {
            // This could open a profile settings modal in the future
            alert('Profile settings coming soon!');
          }}
          isNewUser={isNewUser}
        />
      );
    }

    // Default view - main application
    return (
      <div className="relative">
      {/* Hero Section - Now compact and at top */}
      <div className="bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-display font-bold text-red-700 dark:text-red-400 mb-4">
              Mukamba FinTech
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              Your gateway to rent-to-buy properties with comprehensive KYC verification
            </p>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setShowRegister(true)}
                  className="inline-flex items-center justify-center px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  suppressHydrationWarning
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowSigninModal(true);
                    // Analytics tracking for signin modal
                    console.log('Sign-in modal opened from AuthSystem header');
                  }}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  suppressHydrationWarning
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </div>
            )}

            {isAuthenticated && user && (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 border border-slate-200">
                  <span className="text-sm text-slate-600">
                    {isNewUser ? 'Welcome' : 'Welcome back'}, <span className="font-semibold text-slate-800">{user.firstName}</span>!
                  </span>
                </div>
                
                {/* Profile Access Buttons */}
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => setCurrentView('profile')}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2"
                    suppressHydrationWarning
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </Button>
                  
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50 flex items-center space-x-2"
                    suppressHydrationWarning
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Property Dashboard - Available to all users */}
      <PropertyDashboard 
        user={user || undefined}
        onPropertySelect={(property) => {
          console.log('Selected property:', property);
          // For unauthenticated users, show signup prompt for advanced features
          if (!isAuthenticated) {
            // Could show property details but prompt to sign up for contact/save features
          }
        }}
      />

      {/* Authentication Status UI */}
      {isAuthenticated && user ? (
        // Authenticated user - show floating profile access
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, type: 'spring', stiffness: 200 }}
          className="fixed bottom-6 right-6 z-[9999]"
        >
          <div className="flex flex-col items-end space-y-2">
            {/* Profile Button with Tooltip */}
            <div className="group relative">
              <Button
                onClick={() => setCurrentView('profile')}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 shadow-2xl hover:shadow-red-500/30 transition-all duration-300 border-4 border-white"
                size="icon"
                suppressHydrationWarning
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-lg">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
              </Button>
              
              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                View Profile & Settings
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-slate-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            </div>
            
            {/* Quick Logout */}
            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className="bg-white/90 backdrop-blur-sm border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-300 shadow-lg"
              suppressHydrationWarning
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="text-xs">Sign Out</span>
            </Button>
          </div>
        </motion.div>
      ) : (
        // Unauthenticated user - show floating sign up prompt
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, type: 'spring', stiffness: 200 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  Ready to get started?
                </p>
                <p className="text-xs text-slate-600">
                  Sign up to save properties and contact owners
                </p>
              </div>
            </div>
            <div className="flex space-x-2 mt-3">
              <Button
                size="sm"
                onClick={() => setShowRegister(true)}
                className="flex-1 bg-red-600 hover:bg-red-700"
                suppressHydrationWarning
              >
                Sign Up
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowSigninModal(true);
                  // Analytics tracking for signin modal
                  console.log('Sign-in modal opened from AuthSystem floating prompt');
                }}
                className="border-red-300 text-red-700"
                suppressHydrationWarning
              >
                Sign In
              </Button>
            </div>
          </div>
        </motion.div>
      )}

            {/* Modals */}
      <AnimatePresence>
        {showRegister && (
          <BasicSignupModal
            isOpen={showRegister}
            onClose={handleCloseModals}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
        {showSigninModal && (
          <BasicSigninModal
            isOpen={showSigninModal}
            onClose={handleCloseModals}
            onSwitchToSignup={() => {
              setShowSigninModal(false);
              setShowRegister(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
  };

  return renderContent();
}; 