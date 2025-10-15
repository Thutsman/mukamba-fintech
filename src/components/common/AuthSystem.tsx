'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, LogOut, User, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { BasicSignupModal } from '@/components/forms/BasicSignupModal';
import { BasicSigninModal } from '@/components/forms/BasicSigninModal';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';
import { PropertyDashboard } from '@/components/property/PropertyDashboard';
import { VerifiedUserDashboard } from '@/components/profile/VerifiedUserDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAuthStore } from '@/lib/store';
import { isFullyVerified } from '@/types/auth';

export const AuthSystem: React.FC = () => {
  const [showRegister, setShowRegister] = React.useState(false);
  const [showSigninModal, setShowSigninModal] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<'properties' | 'profile' | 'home'>('properties');
  const [showSignupWidget, setShowSignupWidget] = React.useState(true);
  const mobileMenuRef = React.useRef<HTMLDetailsElement>(null);
  const [hasRedirectedToProfile, setHasRedirectedToProfile] = React.useState(false);
  
  const router = useRouter();
  const { user, isAuthenticated, logout, startVerification, isNewUser, markUserAsReturning, checkAuth } = useAuthStore();
  // Theme is app-controlled (light-only). No toggle here.

  // Check authentication status on component mount
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Check localStorage for widget closed state on component mount
  React.useEffect(() => {
    const widgetClosed = localStorage.getItem('signupWidgetClosed');
    if (widgetClosed === 'true') {
      setShowSignupWidget(false);
    }
  }, []);

  const handleCloseSignupWidget = () => {
    setShowSignupWidget(false);
    localStorage.setItem('signupWidgetClosed', 'true');
  };

  // Only redirect new users to profile view if they just signed up (not on every load)
  React.useEffect(() => {
    // Only redirect if user is new, on properties view, hasn't been redirected yet, and JUST signed up
    if (isAuthenticated && isNewUser && currentView === 'properties' && !hasRedirectedToProfile) {
      // Check if this is a fresh signup (within last 5 minutes) to prevent unwanted redirects
      const signupTime = localStorage.getItem('userSignupTime');
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);
      
      if (signupTime && parseInt(signupTime) > fiveMinutesAgo) {
        // Add a small delay to prevent immediate redirects
        const timer = setTimeout(() => {
          console.log('Fresh signup detected, redirecting to profile for onboarding');
          setCurrentView('profile');
          setHasRedirectedToProfile(true);
        }, 2000); // 2 second delay to allow user to see the dashboard first
        
        return () => clearTimeout(timer);
      } else {
        // User is not a fresh signup, mark them as returning
        markUserAsReturning();
      }
    }
  }, [isAuthenticated, isNewUser, currentView, hasRedirectedToProfile, markUserAsReturning]);

  // Only redirect users who just confirmed email and need immediate KYC (not on every load)
  React.useEffect(() => {
    // Only redirect if user needs KYC, is on properties view, hasn't been redirected yet, and JUST confirmed email
    if (isAuthenticated && user && !user.is_phone_verified && user.kyc_level === 'none' && currentView === 'properties' && !hasRedirectedToProfile) {
      // Check if this is a fresh email confirmation (within last 2 minutes) to prevent unwanted redirects
      const emailConfirmTime = localStorage.getItem('userEmailConfirmTime');
      const now = Date.now();
      const twoMinutesAgo = now - (2 * 60 * 1000);
      
      if (emailConfirmTime && parseInt(emailConfirmTime) > twoMinutesAgo) {
        // Add a small delay to prevent immediate redirects
        const timer = setTimeout(() => {
          console.log('Fresh email confirmation detected, redirecting to profile for KYC');
          setCurrentView('profile');
          setHasRedirectedToProfile(true);
        }, 2000); // 2 second delay to allow user to see the dashboard first
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user, currentView, hasRedirectedToProfile]);

  // Debug authentication state changes
  React.useEffect(() => {
    console.log('Authentication state changed:', { 
      isAuthenticated, 
      isNewUser,
      user: user ? { id: user.id, email: user.email } : null 
    });
  }, [isAuthenticated, user, isNewUser]);

  // Cleanup timestamps when component unmounts or user changes
  React.useEffect(() => {
    return () => {
      // Clear timestamps on cleanup to prevent stale redirects
      localStorage.removeItem('userSignupTime');
      localStorage.removeItem('userEmailConfirmTime');
    };
  }, [user?.id]); // Re-run when user ID changes

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

  // Removed: automatic redirect to seller dashboard to prevent navigation loop when returning home

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
    // Clear timestamps and redirect flags
    localStorage.removeItem('userSignupTime');
    localStorage.removeItem('userEmailConfirmTime');
    setHasRedirectedToProfile(false);
    // Then logout
    logout();
  };

  const handleStartVerification = (type: 'buyer' | 'seller', step: string) => {
    // This would open the appropriate verification modal/flow
    console.log(`Starting ${type} verification for step: ${step}`);
    // For now, just simulate the verification
    startVerification(type, step);
  };

  const handleManualProfileNavigation = () => {
    // Clear redirect flag and timestamps when user manually navigates to profile
    setHasRedirectedToProfile(false);
    localStorage.removeItem('userSignupTime');
    localStorage.removeItem('userEmailConfirmTime');
    setCurrentView('profile');
  };

  // Render logic - all conditional returns moved to the end
  const renderContent = () => {
    // If authenticated and user is admin, show admin dashboard (unless they want to see home)
    if (isAuthenticated && user && user.roles.includes('admin') && currentView !== 'home') {
      return (
        <AdminDashboard 
          user={user}
          onLogout={handleLogout}
          onBackToUserView={() => {
            // Navigate to PropertyDashboard while keeping admin logged in
            setCurrentView('home');
            // Scroll to top of the page to show the hero section
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            setHasRedirectedToProfile(false); // Reset redirect flag when user manually navigates
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
        {/* Header matching Mukamba Gateway marketing site */}
        <header className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-40">
          <div className="w-full px-6 md:px-8">
            <div className="flex items-center justify-between h-17 sm:h-21 md:h-24">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center">
                  {/* Logo matching Mukamba Gateway marketing site */}
                  <img 
                    src="/logo.svg" 
                    alt="Mukamba Logo" 
                    className="header-logo w-35 h-30 sm:w-44 sm:h-36 md:w-52 md:h-42 object-contain"
                    onError={(e) => {
                      // Fallback to the original icon if image fails to load
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-35 h-30 sm:w-44 sm:h-36 md:w-52 md:h-42 bg-red-600 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                    <User className="w-18 h-15 sm:w-22 sm:h-18 md:w-26 md:h-21 text-white" />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => {
                    setCurrentView('home');
                    // Scroll to top of the page to show the hero section
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center text-slate-700 hover:text-red-600 transition-colors font-medium cursor-pointer"
                >
                  <User className="w-4 h-4 mr-2" />
                  Home
                </button>
                <button 
                  onClick={() => router.push('/listings')}
                  className="flex items-center text-slate-700 hover:text-red-600 transition-colors font-medium cursor-pointer"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Properties
                </button>
                {isAuthenticated && user && user.roles.includes('admin') && (
                  <button 
                    onClick={() => {
                      // Admin users go back to admin dashboard
                      setCurrentView('properties');
                      // Scroll to top of the page
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center text-slate-700 hover:text-red-600 transition-colors font-medium cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </button>
                )}
                {isAuthenticated && user && isFullyVerified(user) && !user.roles.includes('admin') && (
                  <button 
                    onClick={() => {
                      setCurrentView('properties');
                      // Scroll to top of the page
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center text-slate-700 hover:text-red-600 transition-colors font-medium cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </button>
                )}
              </div>

              {/* Mobile hamburger */}
              <div className="md:hidden">
                <details className="relative" ref={mobileMenuRef}>
                  <summary className="list-none cursor-pointer inline-flex items-center justify-center w-10 h-10 rounded-md border border-slate-200 hover:bg-slate-50">
                    <span className="sr-only">Menu</span>
                    <div className="flex flex-col gap-1.5">
                      <span className="block w-5 h-0.5 bg-slate-700"></span>
                      <span className="block w-5 h-0.5 bg-slate-700"></span>
                      <span className="block w-5 h-0.5 bg-slate-700"></span>
                    </div>
                  </summary>
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs bg-white border border-slate-200 rounded-lg shadow-lg p-3 space-y-2">
                    <button 
                      onClick={() => { 
                        setCurrentView('home'); 
                        // Scroll to top of the page to show the hero section
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        if (mobileMenuRef.current) mobileMenuRef.current.open = false; 
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => { router.push('/listings'); if (mobileMenuRef.current) mobileMenuRef.current.open = false; }}
                      className="block w-full text-left px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Properties
                    </button>
                    {isAuthenticated && user && user.roles.includes('admin') && (
                      <button 
                        onClick={() => { 
                          setCurrentView('properties'); 
                          if (mobileMenuRef.current) mobileMenuRef.current.open = false; 
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Admin Dashboard
                      </button>
                    )}
                    {isAuthenticated && user && isFullyVerified(user) && !user.roles.includes('admin') && (
                      <button 
                        onClick={() => { 
                          setCurrentView('properties'); 
                          if (mobileMenuRef.current) mobileMenuRef.current.open = false; 
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Dashboard
                      </button>
                    )}
                    {isAuthenticated && user?.roles.includes('seller') && (
                      <a href="/dashboard/seller" className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50">Seller Dashboard</a>
                    )}
                    <div className="h-px bg-slate-200" />
                    <div className="flex gap-2">
                      {!isAuthenticated ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => { setShowRegister(true); if (mobileMenuRef.current) mobileMenuRef.current.open = false; }} className="flex-1 border-slate-300 text-slate-700">Create Account</Button>
                          <Button size="sm" className="flex-1 bg-red-700 hover:bg-red-800" onClick={() => { setShowSigninModal(true); console.log('Sign-in modal opened from AuthSystem mobile menu'); if (mobileMenuRef.current) mobileMenuRef.current.open = false; }}>Sign In</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={handleManualProfileNavigation} className="flex-1 border-slate-300">Profile</Button>
                          <Button size="sm" className="flex-1 bg-red-700 hover:bg-red-800" onClick={handleLogout}>Sign Out</Button>
                        </>
                      )}
                    </div>
                  </div>
                </details>
              </div>

              {/* Authentication Buttons (desktop) */}
              <div className="hidden md:flex items-center space-x-3">
                {!isAuthenticated ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRegister(true)}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      suppressHydrationWarning
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#7f1518] hover:bg-[#6a1215] text-white"
                      onClick={() => {
                        setShowSigninModal(true);
                        console.log('Sign-in modal opened from AuthSystem header');
                      }}
                      suppressHydrationWarning
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </>
                ) : (
                  <>
                    {user?.roles.includes('seller') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push('/dashboard/seller')}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        Seller Dashboard
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleManualProfileNavigation}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      suppressHydrationWarning
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-800 hover:bg-red-900 text-white"
                      onClick={handleLogout}
                      suppressHydrationWarning
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Conditional Dashboard Rendering */}
        {isAuthenticated && user && isFullyVerified(user) && currentView !== 'home' ? (
          // Show VerifiedUserDashboard for fully verified users (unless they want to see home)
          <VerifiedUserDashboard
            user={user}
            onViewProperty={(propertyId) => {
              console.log('View property:', propertyId);
              // Navigate to property details
            }}
            onViewApplication={(applicationId) => {
              console.log('View application:', applicationId);
              // Navigate to application details
            }}
            onStartNewApplication={() => {
              console.log('Start new application');
              // Navigate to property search or application form
            }}
            onViewMarketInsights={() => {
              console.log('View market insights');
              // Navigate to market insights page
            }}
          />
        ) : (
          // Show PropertyDashboard for unauthenticated, non-verified users, or when user wants to see home
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
        )}

      {/* Authentication Status UI */}
      {isAuthenticated && user ? (
        // Authenticated user - show floating profile access
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, type: 'spring', stiffness: 200 }}
          className="fixed bottom-20 right-6 z-[9999]"
        >
          <div className="flex flex-col items-end space-y-2">
            {/* Profile Button with Tooltip */}
            <div className="group relative">
              <Button
                onClick={handleManualProfileNavigation}
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
                  className="bg-white/90 backdrop-blur-sm border-slate-200 text-slate-600 hover:text-red-700 hover:border-red-400 shadow-lg"
                  suppressHydrationWarning
                >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="text-xs">Sign Out</span>
            </Button>
          </div>
        </motion.div>
      ) : (
        // Unauthenticated user - show floating sign up prompt
        showSignupWidget && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 2, type: 'spring', stiffness: 200 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 sm:p-4 max-w-xs sm:max-w-sm relative">
              {/* Close Button */}
              <button
                onClick={handleCloseSignupWidget}
                className="absolute top-2 right-2 w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all duration-200 group"
                aria-label="Close signup widget"
              >
                <span className="text-sm font-medium group-hover:scale-110 transition-transform duration-200">×</span>
              </button>
              
              <div className="flex items-center space-x-3 pr-6">
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
                  className="flex-1 bg-red-700 hover:bg-red-800"
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
        )
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