'use client';

import * as React from 'react';
import { AdminDashboard } from './AdminDashboard';
import { PropertyListings } from '../property/PropertyListings';
import { User } from '@/types/auth';
import { PropertyListing } from '@/types/property';

interface AdminListingIntegrationExampleProps {
  user: User;
}

export const AdminListingIntegrationExample: React.FC<AdminListingIntegrationExampleProps> = ({ user }) => {
  const [activeView, setActiveView] = React.useState<'admin' | 'listings'>('admin');
  const [propertyListings, setPropertyListings] = React.useState<PropertyListing[]>([]);

  const handleAddToListings = (propertyListing: PropertyListing) => {
    // Add the new property to the PropertyListings component
    setPropertyListings(prev => [propertyListing, ...prev]);
    
    // Switch to the listings view to show the newly added property
    setActiveView('listings');
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
  };

  const handleBackToUserView = () => {
    // Handle back to user view logic
    console.log('Going back to user view...');
  };

  if (activeView === 'listings') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Property Listings</h1>
            <button
              onClick={() => setActiveView('admin')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Admin Dashboard
            </button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto p-4">
          <PropertyListings 
            initialFilters={{ country: 'ZW' }}
            onPropertySelect={(property) => console.log('Selected property:', property)}
            showFeatured={true}
            user={user}
          />
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      user={user}
      onLogout={handleLogout}
      onBackToUserView={handleBackToUserView}
    />
  );
};
