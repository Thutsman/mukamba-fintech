'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

import { useAuthStore } from '@/lib/store';
import { PropertyDetailsVerified } from '@/components/property/PropertyDetailsVerified';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const propertyId = params.propertyId as string;

  // Access control check
  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      
      try {
        // Check if user is authenticated
        if (!isAuthenticated) {
          setError('Please log in to view property details');
          return;
        }

        // Check if user is a verified buyer
        if (!user || !user.roles.includes('buyer')) {
          setError('This page is only available to verified buyers');
          return;
        }

        // Check KYC status
        if (user.kycStatus !== 'approved') {
          setError('Please complete your verification to view property details');
          return;
        }

        // Fetch property data
        // This would be replaced with actual Supabase query
        const mockProperty = {
          id: propertyId,
          title: 'Modern 3-Bedroom House in Harare',
          description: 'Beautiful family home with modern amenities, located in a quiet neighborhood with excellent schools nearby.',
          price: 250000,
          monthlyRental: 2500,
          rentToBuyDeposit: 25000,
          rentCreditPercentage: 70,
          bedrooms: 3,
          bathrooms: 2,
          size: 180,
          location: {
            city: 'Harare',
            suburb: 'Borrowdale',
            streetAddress: '123 Oak Avenue',
            coordinates: { latitude: -17.8252, longitude: 31.0335 }
          },
          features: ['Air Conditioning', 'Garden', 'Security System', 'Garage'],
          amenities: ['Swimming Pool', 'Gym', 'Playground', '24/7 Security'],
          images: [
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800'
          ],
          agent: {
            id: 'agent-001',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@mukamba.com',
            phone: '+263 77 123 4567',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
            responseTime: '2 hours',
            rating: 4.8,
            totalSales: 45
          },
          documents: [
            {
              id: 'doc-001',
              name: 'Title Deed',
              type: 'pdf',
              url: '/documents/title-deed.pdf',
              size: '2.3 MB'
            },
            {
              id: 'doc-002',
              name: 'Inspection Report',
              type: 'pdf',
              url: '/documents/inspection-report.pdf',
              size: '1.8 MB'
            },
            {
              id: 'doc-003',
              name: 'Property Photos',
              type: 'zip',
              url: '/documents/property-photos.zip',
              size: '15.2 MB'
            }
          ],
          similarProperties: [
            {
              id: 'prop-002',
              title: '4-Bedroom Villa in Borrowdale',
              price: 280000,
              monthlyRental: 2800,
              bedrooms: 4,
              bathrooms: 3,
              size: 220,
              image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'
            },
            {
              id: 'prop-003',
              title: 'Modern Apartment in Mount Pleasant',
              price: 180000,
              monthlyRental: 1800,
              bedrooms: 2,
              bathrooms: 2,
              size: 120,
              image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400'
            }
          ],
          status: 'active',
          views: 156,
          savedBy: 23,
          createdAt: new Date('2024-01-15')
        };

        setProperty(mockProperty);
      } catch (err) {
        setError('Failed to load property details');
        console.error('Property fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [propertyId, user, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">{error}</p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/')}
                className="w-full"
              >
                Go to Home
              </Button>
              <Button 
                onClick={() => router.push('/auth')}
                variant="outline"
                className="w-full"
              >
                Complete Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Property Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PropertyDetailsVerified 
      property={property}
      user={user}
    />
  );
} 