# KYC Implementation Guide for Mukamba FinTech

## Overview

This guide provides step-by-step instructions for implementing the KYC (Know Your Customer) file upload and admin review functionality. The implementation focuses on essential tables needed for testing user KYC document uploads and admin document review capabilities.

## Database Setup

### Step 1: Run the Focused Migration

1. **Copy the SQL migration** from `supabase/migrations/20240301000001_kyc_file_upload_setup.sql`
2. **Go to your Supabase dashboard**
3. **Navigate to SQL Editor**
4. **Paste and run the migration**

This migration creates:
- `user_profiles` table (essential for KYC)
- `kyc_verifications` table (core KYC records)
- `kyc_documents` table (file storage metadata)
- Row Level Security (RLS) policies
- Storage bucket setup
- Performance indexes

### Step 2: Verify Database Setup

After running the migration, verify these tables exist in your Supabase dashboard:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'kyc_verifications', 'kyc_documents');

-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'user-documents';
```

## Environment Setup

### Step 1: Configure Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Frontend Implementation

### Step 1: Update TypeScript Types

The database types are already updated in `src/types/database.ts` to match the focused schema.

### Step 2: KYC Services

The KYC services are implemented in `src/lib/kyc-services.ts` with functions for:
- Creating KYC verifications
- Uploading documents
- Admin review operations
- Document management

### Step 3: Test User KYC Document Upload

#### Create a Test KYC Upload Component

```typescript
// src/components/forms/KYCDocumentUpload.tsx
'use client';

import { useState } from 'react';
import { uploadKYCDocument, createKYCVerification } from '@/lib/kyc-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const KYCDocumentUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleCreateVerification = async () => {
    setIsLoading(true);
    try {
      // Get current user ID (you'll need to implement this)
      const userId = 'current-user-id';
      
      const { data, error } = await createKYCVerification(userId, {
        verification_type: 'buyer',
        id_number: '1234567890123',
        date_of_birth: '1990-01-01',
        monthly_income: 50000,
        employment_status: 'employed',
        bank_name: 'Standard Bank',
        credit_consent: true
      });

      if (error) {
        console.error('Error creating verification:', error);
        return;
      }

      setVerificationId(data!.id);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !verificationId) return;

    setIsLoading(true);
    try {
      const { data, error } = await uploadKYCDocument({
        kyc_verification_id: verificationId,
        document_type: 'id_document',
        file: selectedFile
      });

      if (error) {
        console.error('Error uploading document:', error);
        return;
      }

      console.log('Document uploaded successfully:', data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleCreateVerification}
        disabled={isLoading}
      >
        Create KYC Verification
      </Button>

      {verificationId && (
        <div className="space-y-4">
          <Label>Upload ID Document</Label>
          <Input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <Button 
            onClick={handleFileUpload}
            disabled={!selectedFile || isLoading}
          >
            Upload Document
          </Button>
        </div>
      )}
    </div>
  );
};
```

### Step 4: Test Admin Document Review

#### Update the Admin KYC Page

```typescript
// src/components/admin/KYCPage.tsx
// Add these imports and functions

import { 
  getAllKYCVerifications, 
  updateKYCVerification, 
  getDocumentDownloadUrl,
  getKYCVerificationStats 
} from '@/lib/kyc-services';

// Add state for verifications
const [verifications, setVerifications] = useState<KYCVerificationWithUser[]>([]);
const [stats, setStats] = useState<KYCVerificationStats | null>(null);

// Load verifications on component mount
useEffect(() => {
  const loadVerifications = async () => {
    const { data, error } = await getAllKYCVerifications();
    if (data) {
      setVerifications(data);
    }
  };

  const loadStats = async () => {
    const { data, error } = await getKYCVerificationStats();
    if (data) {
      setStats(data);
    }
  };

  loadVerifications();
  loadStats();
}, []);

// Handle approval
const handleApprove = async (verificationId: string) => {
  const { data, error } = await updateKYCVerification(verificationId, 'admin-user-id', {
    status: 'approved',
    admin_notes: 'Approved by admin'
  });

  if (!error) {
    // Refresh verifications
    const { data: updatedVerifications } = await getAllKYCVerifications();
    if (updatedVerifications) {
      setVerifications(updatedVerifications);
    }
  }
};

// Handle document download
const handleDownloadDocument = async (filePath: string, fileName: string) => {
  const { data: downloadUrl, error } = await getDocumentDownloadUrl(filePath);
  
  if (downloadUrl) {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
```

## Testing Workflow

### Step 1: Test User KYC Upload

1. **Create a test user** in Supabase Auth
2. **Add user profile** to `user_profiles` table
3. **Test KYC verification creation**
4. **Test document upload**
5. **Verify files appear in Supabase Storage**

### Step 2: Test Admin Review

1. **Create an admin user** with `roles: ['admin']`
2. **Login as admin** in your application
3. **Navigate to KYC Verifications** page
4. **View uploaded documents**
5. **Test document download**
6. **Test approval/rejection**

### Step 3: Verify Data Flow

Check these tables after testing:

```sql
-- Check KYC verifications
SELECT * FROM kyc_verifications;

-- Check uploaded documents
SELECT * FROM kyc_documents;

-- Check storage files
SELECT * FROM storage.objects WHERE bucket_id = 'user-documents';
```

## Security Considerations

### Row Level Security (RLS)

The migration includes RLS policies that ensure:
- Users can only access their own data
- Admins can access all data
- Document uploads are restricted to authenticated users

### Storage Security

- Files are stored in private buckets
- Access is controlled by RLS policies
- Download URLs are signed and expire after 1 hour

## Troubleshooting

### Common Issues

1. **"Policy violation" errors**
   - Check that user is authenticated
   - Verify user has correct roles
   - Ensure RLS policies are enabled

2. **File upload failures**
   - Check file size limits
   - Verify file type is allowed
   - Ensure storage bucket exists

3. **Admin access denied**
   - Verify admin user has `admin` role in `user_profiles`
   - Check RLS policies are correctly applied

### Debug Queries

```sql
-- Check user roles
SELECT auth_user_id, roles FROM user_profiles WHERE auth_user_id = 'your-user-id';

-- Check KYC verifications for user
SELECT * FROM kyc_verifications WHERE user_id = 'user-profile-id';

-- Check uploaded documents
SELECT * FROM kyc_documents WHERE kyc_verification_id = 'verification-id';

-- Check storage files
SELECT * FROM storage.objects WHERE bucket_id = 'user-documents';
```

## Next Steps

After successful testing of the basic KYC functionality:

1. **Enhance user forms** to capture all required KYC fields
2. **Add property management** tables and functionality
3. **Implement agent system** for lead management
4. **Add transaction/escrow** functionality
5. **Implement notifications** and alerts

## File Structure

```
src/
├── lib/
│   └── kyc-services.ts          # KYC database operations
├── types/
│   └── database.ts              # Database types
├── components/
│   ├── admin/
│   │   └── KYCPage.tsx         # Admin KYC review
│   └── forms/
│       └── KYCDocumentUpload.tsx # User document upload
└── supabase/
    └── migrations/
        └── 20240301000001_kyc_file_upload_setup.sql
```

This focused implementation allows you to test the core KYC functionality before expanding to the full system. The modular approach makes it easy to add additional features incrementally. 