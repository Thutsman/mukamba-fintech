'use client';

import { PropertyDetailsPage } from '@/components/property/PropertyDetailsPage';
import { getPropertyByIdFromSupabase } from '@/lib/property-services-supabase';
import { useAuthStore } from '@/lib/store';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PropertyListing } from '@/types/property';

export default function PropertyPage() {
  const params = useParams();
  const { user } = useAuthStore();
  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperty = async () => {
      if (params.id) {
        const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;
        try {
          const foundProperty = await getPropertyByIdFromSupabase(propertyId);
          setProperty(foundProperty || null);
        } catch (error) {
          console.error('Error loading property:', error);
          setProperty(null);
        }
      }
      setLoading(false);
    };

    loadProperty();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <PropertyDetailsPage
      property={property}
      user={user || undefined}
      onSignUpPrompt={() => {
        // Handle signup prompt
        console.log('Sign up prompt');
      }}
      onPhoneVerification={() => {
        // Handle phone verification
        console.log('Phone verification');
      }}
      onBuyerSignup={() => {
        // Handle buyer signup
        console.log('Buyer signup');
      }}
    />
  );
}
