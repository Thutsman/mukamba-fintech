'use client';

import { PropertyListings } from '@/components/property/PropertyListings';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function ListingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  return (
    <PropertyListings
      user={user || undefined}
      onPropertySelect={(property) => {
        router.push(`/property/${property.id}`);
      }}
      onSignUpPrompt={() => {
        // Handle signup prompt
        console.log('Sign up prompt');
      }}
    />
  );
}
