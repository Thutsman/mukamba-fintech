# Database Implementation Guide for Mukamba FinTech

## Overview

This guide provides step-by-step instructions for implementing the database schema with your existing Mukamba FinTech application. The implementation is designed to be phased, allowing you to migrate from the current mock-based system to a fully functional Supabase backend.

## Prerequisites

1. **Supabase Project Setup**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Note your project URL and anon key
   - Enable Row Level Security (RLS) in your project settings

2. **Environment Variables**
   Add the following to your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Phase 1: Database Setup

### Step 1: Run the Migration

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase in your project**:
   ```bash
   supabase init
   ```

3. **Run the complete schema migration**:
   ```bash
   supabase db push
   ```

   This will create all tables, indexes, policies, and triggers defined in `supabase/migrations/20240301000000_complete_schema_setup.sql`.

### Step 2: Verify Setup

1. **Check tables in Supabase Dashboard**:
   - Navigate to your Supabase project dashboard
   - Go to "Table Editor"
   - Verify all tables are created:
     - `user_profiles`
     - `kyc_verifications`
     - `kyc_documents`
     - `properties`
     - `property_media`
     - `property_documents`
     - `agents`
     - `agent_leads`
     - `agent_viewings`
     - `property_inquiries`
     - `saved_properties`
     - `property_alerts`
     - `escrow_transactions`
     - `admin_audit_log`
     - `system_notifications`

2. **Check storage buckets**:
   - Go to "Storage" in your Supabase dashboard
   - Verify buckets are created:
     - `property-images`
     - `property-documents`
     - `user-documents`
     - `agent-documents`

## Phase 2: Authentication Integration

### Step 1: Update Supabase Client

Replace your current `src/lib/supabase.ts` with the enhanced version:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROPERTY_IMAGES: 'property-images',
  PROPERTY_DOCUMENTS: 'property-documents',
  USER_DOCUMENTS: 'user-documents',
  AGENT_DOCUMENTS: 'agent-documents',
} as const;

// Helper function to get public URL
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Helper function to upload a file
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;
  return data;
};

// Helper function to download a file
export const downloadFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) throw error;
  return data;
};
```

### Step 2: Update Auth Store

Modify your `src/lib/store.ts` to integrate with Supabase:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import type { UserProfile, InsertType } from '@/types/database';

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isNewUser: boolean;
  
  // Actions
  basicSignup: (data: BasicSignupData) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markUserAsReturning: () => void;
}

export const useAuthStore = create<AuthStore>()
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isNewUser: false,

      basicSignup: async (data: BasicSignupData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Create user in Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone
              }
            }
          });

          if (authError) throw authError;

          // User profile will be created automatically by the trigger
          // Fetch the created profile
          if (authData.user) {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single();

            if (profileError) throw profileError;

            set({
              user: profile,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              isNewUser: true
            });
          }
        } catch (error) {
          console.error('Signup failed:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Signup failed'
          });
        }
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          });

          if (error) throw error;

          if (data.user) {
            // Fetch user profile
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profileError) throw profileError;

            // Update last login
            await supabase
              .from('user_profiles')
              .update({ last_login_at: new Date().toISOString() })
              .eq('id', data.user.id);

            set({
              user: profile,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              isNewUser: false
            });
          }
        } catch (error) {
          console.error('Login failed:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed'
          });
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isNewUser: false
          });
        } catch (error) {
          console.error('Logout failed:', error);
        }
      },

      updateUser: async (updates: Partial<UserProfile>) => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

          if (error) throw error;

          set({ user: data });
        } catch (error) {
          console.error('Update user failed:', error);
          set({ error: error instanceof Error ? error.message : 'Update failed' });
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      markUserAsReturning: () => set({ isNewUser: false })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isNewUser: state.isNewUser
      })
    }
  );
```

## Phase 3: KYC Document Management

### Step 1: Create KYC Service

Create `src/lib/kyc-services.ts`:

```typescript
import { supabase } from './supabase';
import { STORAGE_BUCKETS } from './supabase';
import type { 
  KYCVerification, 
  KYCDocument, 
  InsertType, 
  DocumentType 
} from '@/types/database';

export async function createKYCVerification(
  data: InsertType<'kyc_verifications'>
): Promise<KYCVerification> {
  const { data: verification, error } = await supabase
    .from('kyc_verifications')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return verification;
}

export async function uploadKYCDocument(
  file: File,
  kycVerificationId: string,
  documentType: DocumentType
): Promise<KYCDocument> {
  // Generate unique file path
  const fileExt = file.name.split('.').pop();
  const fileName = `${kycVerificationId}/${documentType}.${fileExt}`;
  const filePath = `kyc/${fileName}`;

  // Upload file to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.USER_DOCUMENTS)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Create document record
  const documentData: InsertType<'kyc_documents'> = {
    kyc_verification_id: kycVerificationId,
    document_type: documentType,
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type
  };

  const { data: document, error: documentError } = await supabase
    .from('kyc_documents')
    .insert(documentData)
    .select()
    .single();

  if (documentError) throw documentError;
  return document;
}

export async function getKYCVerification(userId: string): Promise<KYCVerification | null> {
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getKYCDocuments(kycVerificationId: string): Promise<KYCDocument[]> {
  const { data, error } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('kyc_verification_id', kycVerificationId)
    .order('uploaded_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function downloadKYCDocument(documentId: string): Promise<Blob> {
  const { data: document, error: docError } = await supabase
    .from('kyc_documents')
    .select('file_path')
    .eq('id', documentId)
    .single();

  if (docError) throw docError;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.USER_DOCUMENTS)
    .download(document.file_path);

  if (error) throw error;
  return data;
}
```

### Step 2: Update KYC Components

Update your KYC components to use the new service:

```typescript
// In your KYC components, replace mock uploads with real uploads
import { uploadKYCDocument, createKYCVerification } from '@/lib/kyc-services';

// Example usage in IdentityVerificationModal
const handleSubmitDocuments = async () => {
  setIsLoading(true);
  setStep('processing');
  
  try {
    // Create KYC verification record
    const verificationData = {
      user_id: user.id,
      verification_type: 'buyer' as const,
      id_number: idNumber,
      date_of_birth: dateOfBirth,
      // ... other fields
    };

    const verification = await createKYCVerification(verificationData);

    // Upload documents
    for (const [type, file] of Object.entries(uploadedFiles)) {
      if (file) {
        await uploadKYCDocument(file, verification.id, type as DocumentType);
      }
    }

    // Update user KYC status
    await updateUser({ kyc_status: 'pending' });

    setStep('success');
    setTimeout(() => {
      onComplete();
      handleClose();
    }, 2000);
  } catch (error) {
    console.error('Document verification failed:', error);
    setError(error instanceof Error ? error.message : 'Upload failed');
  } finally {
    setIsLoading(false);
  }
};
```

## Phase 4: Property Management

### Step 1: Create Property Service

Create `src/lib/property-services.ts`:

```typescript
import { supabase } from './supabase';
import { STORAGE_BUCKETS } from './supabase';
import type { 
  Property, 
  PropertyMedia, 
  PropertyDocument,
  InsertType,
  SearchFilters,
  PaginatedResponse
} from '@/types/database';

export async function createProperty(
  data: InsertType<'properties'>
): Promise<Property> {
  const { data: property, error } = await supabase
    .from('properties')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return property;
}

export async function uploadPropertyMedia(
  file: File,
  propertyId: string,
  mediaType: 'image' | 'virtual_tour' | 'floor_plan',
  isMainImage: boolean = false
): Promise<PropertyMedia> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${propertyId}/${mediaType}/${Date.now()}.${fileExt}`;
  const filePath = `properties/${fileName}`;

  // Upload file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Create media record
  const mediaData: InsertType<'property_media'> = {
    property_id: propertyId,
    media_type: mediaType,
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    is_main_image: isMainImage,
    display_order: 0
  };

  const { data: media, error: mediaError } = await supabase
    .from('property_media')
    .insert(mediaData)
    .select()
    .single();

  if (mediaError) throw mediaError;
  return media;
}

export async function uploadPropertyDocument(
  file: File,
  propertyId: string,
  documentType: PropertyDocumentType
): Promise<PropertyDocument> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${propertyId}/${documentType}/${Date.now()}.${fileExt}`;
  const filePath = `documents/${fileName}`;

  // Upload file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.PROPERTY_DOCUMENTS)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Create document record
  const documentData: InsertType<'property_documents'> = {
    property_id: propertyId,
    document_type: documentType,
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type
  };

  const { data: document, error: documentError } = await supabase
    .from('property_documents')
    .insert(documentData)
    .select()
    .single();

  if (documentError) throw documentError;
  return document;
}

export async function getProperties(
  filters: SearchFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Property>> {
  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('status', 'active');

  // Apply filters
  if (filters.country) {
    query = query.eq('country', filters.country);
  }
  if (filters.city) {
    query = query.eq('city', filters.city);
  }
  if (filters.propertyType && filters.propertyType.length > 0) {
    query = query.in('property_type', filters.propertyType);
  }
  if (filters.listingType) {
    query = query.eq('listing_type', filters.listingType);
  }
  if (filters.priceMin) {
    query = query.gte('price', filters.priceMin);
  }
  if (filters.priceMax) {
    query = query.lte('price', filters.priceMax);
  }
  if (filters.bedrooms) {
    query = query.gte('bedrooms', filters.bedrooms);
  }
  if (filters.bathrooms) {
    query = query.gte('bathrooms', filters.bathrooms);
  }

  // Apply sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price-desc':
        query = query.order('price', { ascending: false });
        break;
      case 'date-newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'date-oldest':
        query = query.order('created_at', { ascending: true });
        break;
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  };
}

export async function getProperty(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getPropertyMedia(propertyId: string): Promise<PropertyMedia[]> {
  const { data, error } = await supabase
    .from('property_media')
    .select('*')
    .eq('property_id', propertyId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getPropertyDocuments(propertyId: string): Promise<PropertyDocument[]> {
  const { data, error } = await supabase
    .from('property_documents')
    .select('*')
    .eq('property_id', propertyId)
    .order('uploaded_at', { ascending: true });

  if (error) throw error;
  return data || [];
}
```

### Step 2: Update Property Components

Update your property components to use the new service:

```typescript
// In PropertyListingModal
const handleFinalSubmit = async () => {
  setIsLoading(true);
  setStep('submitting');
  
  try {
    const formData = form.getValues();
    
    // Create property
    const propertyData = {
      owner_id: user.id,
      title: formData.title,
      description: formData.description,
      property_type: formData.propertyType,
      listing_type: formData.listingType,
      country: formData.country,
      city: formData.city,
      suburb: formData.suburb,
      street_address: formData.streetAddress,
      size_sqm: formData.size,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      parking_spaces: formData.parking,
      features: formData.features,
      amenities: formData.amenities,
      price: formData.price,
      currency: formData.currency,
      rent_to_buy_deposit: formData.rentToBuyDeposit,
      monthly_rental: formData.monthlyRental,
      rent_credit_percentage: formData.rentCreditPercentage
    };

    const property = await createProperty(propertyData);

    // Upload images
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      await uploadPropertyMedia(
        image, 
        property.id, 
        'image', 
        i === 0 // First image is main image
      );
    }

    onComplete(property);
    setStep('success');
    setTimeout(() => {
      handleClose();
    }, 2000);
  } catch (error) {
    console.error('Failed to submit property listing:', error);
    setError(error instanceof Error ? error.message : 'Submission failed');
    setStep('preview');
  } finally {
    setIsLoading(false);
  }
};
```

## Phase 5: Admin Integration

### Step 1: Create Admin Service

Create `src/lib/admin-services.ts`:

```typescript
import { supabase } from './supabase';
import type { 
  KYCVerification, 
  Property, 
  UserProfile,
  AdminAuditLog,
  SystemNotification,
  UserStats,
  PropertyStats,
  AgentStats
} from '@/types/database';

export async function getPendingKYC(): Promise<KYCVerification[]> {
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select(`
      *,
      user_profiles!inner (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function approveKYC(
  kycId: string, 
  adminId: string, 
  notes?: string
): Promise<void> {
  const { error } = await supabase
    .from('kyc_verifications')
    .update({
      status: 'approved',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      admin_notes: notes
    })
    .eq('id', kycId);

  if (error) throw error;

  // Update user profile
  const { data: kyc } = await supabase
    .from('kyc_verifications')
    .select('user_id')
    .eq('id', kycId)
    .single();

  if (kyc) {
    await supabase
      .from('user_profiles')
      .update({ kyc_status: 'approved' })
      .eq('id', kyc.user_id);
  }

  // Create notification
  await createNotification({
    userId: kyc.user_id,
    type: 'kyc_approved',
    title: 'KYC Approved',
    message: 'Your KYC verification has been approved. You can now access premium features.'
  });
}

export async function rejectKYC(
  kycId: string, 
  adminId: string, 
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from('kyc_verifications')
    .update({
      status: 'rejected',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason
    })
    .eq('id', kycId);

  if (error) throw error;

  // Update user profile
  const { data: kyc } = await supabase
    .from('kyc_verifications')
    .select('user_id')
    .eq('id', kycId)
    .single();

  if (kyc) {
    await supabase
      .from('user_profiles')
      .update({ kyc_status: 'rejected' })
      .eq('id', kyc.user_id);
  }

  // Create notification
  await createNotification({
    userId: kyc.user_id,
    type: 'kyc_rejected',
    title: 'KYC Rejected',
    message: `Your KYC verification has been rejected. Reason: ${reason}`
  });
}

export async function getPendingProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      user_profiles!inner (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function approveProperty(
  propertyId: string, 
  adminId: string
): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({
      verification_status: 'approved',
      status: 'active',
      listed_at: new Date().toISOString()
    })
    .eq('id', propertyId);

  if (error) throw error;

  // Get property owner
  const { data: property } = await supabase
    .from('properties')
    .select('owner_id, title')
    .eq('id', propertyId)
    .single();

  if (property) {
    // Create notification
    await createNotification({
      userId: property.owner_id,
      type: 'property_approved',
      title: 'Property Approved',
      message: `Your property "${property.title}" has been approved and is now live.`
    });
  }
}

export async function rejectProperty(
  propertyId: string, 
  adminId: string, 
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({
      verification_status: 'rejected',
      status: 'draft'
    })
    .eq('id', propertyId);

  if (error) throw error;

  // Get property owner
  const { data: property } = await supabase
    .from('properties')
    .select('owner_id, title')
    .eq('id', propertyId)
    .single();

  if (property) {
    // Create notification
    await createNotification({
      userId: property.owner_id,
      type: 'property_rejected',
      title: 'Property Rejected',
      message: `Your property "${property.title}" has been rejected. Reason: ${reason}`
    });
  }
}

export async function createNotification(
  data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedId?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('system_notifications')
    .insert({
      user_id: data.userId,
      notification_type: data.type,
      title: data.title,
      message: data.message
    });

  if (error) throw error;
}

export async function getAdminStats(): Promise<{
  userStats: UserStats;
  propertyStats: PropertyStats;
  agentStats: AgentStats;
}> {
  // Get user stats
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });

  const { count: verifiedUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('kyc_status', 'approved');

  const { count: pendingKYC } = await supabase
    .from('kyc_verifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Get property stats
  const { count: totalProperties } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  const { count: activeProperties } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: pendingVerification } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'pending');

  // Get agent stats
  const { count: totalAgents } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true });

  const { count: verifiedAgents } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('verified_status', 'approved');

  return {
    userStats: {
      totalUsers: totalUsers || 0,
      verifiedUsers: verifiedUsers || 0,
      pendingKYC: pendingKYC || 0,
      activeUsers: 0, // Would need to calculate based on last login
      userGrowth: 0 // Would need to calculate based on time period
    },
    propertyStats: {
      totalProperties: totalProperties || 0,
      activeProperties: activeProperties || 0,
      pendingVerification: pendingVerification || 0,
      averagePrice: 0, // Would need to calculate
      popularCities: [], // Would need to calculate
      listingsByType: {} // Would need to calculate
    },
    agentStats: {
      totalAgents: totalAgents || 0,
      verifiedAgents: verifiedAgents || 0,
      pendingVerification: 0, // Would need to calculate
      totalLeads: 0, // Would need to calculate
      activeViewings: 0, // Would need to calculate
      averageResponseTime: '0h' // Would need to calculate
    }
  };
}
```

## Phase 6: Testing and Validation

### Step 1: Test User Registration

1. **Test basic signup flow**
2. **Verify user profile creation**
3. **Test login/logout functionality**
4. **Verify RLS policies work correctly**

### Step 2: Test KYC Upload

1. **Test document upload to storage**
2. **Verify KYC verification creation**
3. **Test admin approval/rejection flow**
4. **Verify notifications are created**

### Step 3: Test Property Management

1. **Test property creation**
2. **Test image upload**
3. **Test property search and filtering**
4. **Test admin property approval**

### Step 4: Test Admin Features

1. **Test KYC document review**
2. **Test property verification**
3. **Test admin statistics**
4. **Test audit logging**

## Phase 7: Performance Optimization

### Step 1: Add Database Indexes

The migration already includes comprehensive indexes, but monitor query performance and add additional indexes as needed.

### Step 2: Implement Caching

Consider implementing Redis caching for frequently accessed data:

```typescript
// Example caching implementation
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedProperties(filters: SearchFilters) {
  const cacheKey = `properties:${JSON.stringify(filters)}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await getProperties(filters);
  await redis.setex(cacheKey, 300, JSON.stringify(data)); // Cache for 5 minutes
  return data;
}
```

### Step 3: Optimize File Uploads

Implement image optimization and compression:

```typescript
// Example image optimization
import sharp from 'sharp';

export async function optimizeImage(file: File): Promise<File> {
  const buffer = await file.arrayBuffer();
  const optimizedBuffer = await sharp(buffer)
    .resize(1200, 800, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
  
  return new File([optimizedBuffer], file.name, {
    type: 'image/jpeg'
  });
}
```

## Migration Checklist

- [ ] Set up Supabase project
- [ ] Run database migration
- [ ] Update environment variables
- [ ] Integrate authentication
- [ ] Implement KYC document upload
- [ ] Implement property management
- [ ] Implement admin features
- [ ] Test all functionality
- [ ] Optimize performance
- [ ] Deploy to production

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Ensure all tables have proper RLS policies
2. **Storage Upload Failures**: Check bucket permissions and file size limits
3. **Authentication Issues**: Verify Supabase Auth configuration
4. **Type Errors**: Ensure TypeScript types match database schema

### Debug Commands

```bash
# Check Supabase connection
supabase status

# View database logs
supabase logs

# Reset database (development only)
supabase db reset
```

This implementation guide provides a comprehensive path to migrate your application from mock data to a fully functional Supabase backend while maintaining all existing functionality and adding new features like document management, admin controls, and proper data persistence. 