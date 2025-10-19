// =====================================================
// KYC Services for Mukamba FinTech
// Handles KYC verification and document upload operations
// =====================================================

import { createClient } from '@supabase/supabase-js';
import type { 
  KYCVerification, 
  KYCDocument, 
  CreateKYCVerificationRequest,
  UpdateKYCVerificationRequest,
  UploadKYCDocumentRequest,
  KYCVerificationWithUser,
  KYCVerificationFilters,
  KYCVerificationStats,
  DocumentType
} from '@/types/database';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// =====================================================
// KYC VERIFICATION SERVICES
// =====================================================

/**
 * Create a new KYC verification record
 */
export const createKYCVerification = async (
  userId: string, 
  data: CreateKYCVerificationRequest
): Promise<{ data: KYCVerification | null; error: string | null }> => {
  try {
    // Build insert object with only the fields that exist in your schema
    const insertData: any = {
      user_id: userId,
      verification_type: data.verification_type,
      status: 'pending',
      verification_level: 'basic'
    };

    // Add optional fields only if they exist in the data
    if (data.id_number) insertData.verified_id_number = data.id_number;
    if (data.date_of_birth) insertData.verified_date_of_birth = data.date_of_birth;
    if (data.first_name) insertData.verified_first_name = data.first_name;
    if (data.last_name) insertData.verified_last_name = data.last_name;
    if (data.monthly_income) insertData.monthly_income = data.monthly_income;
    if (data.employment_status) insertData.employment_status = data.employment_status;
    if (data.bank_name) insertData.bank_name = data.bank_name;
    if (data.business_registered !== undefined) insertData.business_registered = data.business_registered;
    if (data.business_name) insertData.business_name = data.business_name;
    if (data.business_registration_number) insertData.business_registration_number = data.business_registration_number;
    if (data.tax_number) insertData.tax_number = data.tax_number;

    const { data: verification, error } = await supabase
      .from('kyc_verifications')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating KYC verification:', error);
      return { data: null, error: error.message };
    }

    return { data: verification, error: null };
  } catch (error) {
    console.error('Error creating KYC verification:', error);
    return { data: null, error: 'Failed to create KYC verification' };
  }
};

/**
 * Get KYC verification by ID
 */
export const getKYCVerification = async (
  verificationId: string
): Promise<{ data: KYCVerificationWithUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select(`
        *,
        user:user_profiles(first_name, last_name, email, phone),
        documents:kyc_documents(*)
      `)
      .eq('id', verificationId)
      .single();

    if (error) {
      console.error('Error fetching KYC verification:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching KYC verification:', error);
    return { data: null, error: 'Failed to fetch KYC verification' };
  }
};

/**
 * Get KYC verifications for a user
 */
export const getUserKYCVerifications = async (
  userId: string
): Promise<{ data: KYCVerification[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user KYC verifications:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user KYC verifications:', error);
    return { data: null, error: 'Failed to fetch KYC verifications' };
  }
};

/**
 * Get all KYC verifications (admin only)
 */
export const getAllKYCVerifications = async (
  filters?: KYCVerificationFilters
): Promise<{ data: KYCVerificationWithUser[] | null; error: string | null }> => {
  try {
    // First, get the KYC verifications
    let query = supabase
      .from('kyc_verifications')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('verification_type', filters.type);
    }

    if (filters?.date_from) {
      query = query.gte('submitted_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('submitted_at', filters.date_to);
    }

    const { data: verifications, error: verificationsError } = await query;

    if (verificationsError) {
      console.error('Error fetching KYC verifications:', verificationsError);
      return { data: null, error: verificationsError.message };
    }

    if (!verifications || verifications.length === 0) {
      return { data: [], error: null };
    }

    // Get user details for each verification
    const userIds = [...new Set(verifications.map(v => v.user_id))];
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, phone')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching user profiles:', usersError);
      return { data: null, error: usersError.message };
    }

    // Get documents for each verification
    const verificationIds = verifications.map(v => v.id);
    const { data: documents, error: documentsError } = await supabase
      .from('kyc_documents')
      .select('*')
      .in('kyc_verification_id', verificationIds);

    if (documentsError) {
      console.error('Error fetching KYC documents:', documentsError);
      return { data: null, error: documentsError.message };
    }

    // Combine the data
    const combinedData: KYCVerificationWithUser[] = verifications.map(verification => {
      const user = users?.find(u => u.id === verification.user_id);
      const verificationDocuments = documents?.filter(d => d.kyc_verification_id === verification.id) || [];

      return {
        ...verification,
        user: user ? {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone
        } : {
          first_name: 'Unknown',
          last_name: 'User',
          email: 'unknown@example.com'
        },
        documents: verificationDocuments
      };
    });

    // Apply search filter if provided
    let filteredData = combinedData;
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = combinedData.filter(verification => 
        verification.user.first_name.toLowerCase().includes(searchTerm) ||
        verification.user.last_name.toLowerCase().includes(searchTerm) ||
        verification.user.email.toLowerCase().includes(searchTerm) ||
        (verification.id_number || '').toLowerCase().includes(searchTerm)
      );
    }

    return { data: filteredData, error: null };
  } catch (error) {
    console.error('Error fetching KYC verifications:', error);
    return { data: null, error: 'Failed to fetch KYC verifications' };
  }
};

/**
 * Update KYC verification (admin only)
 */
export const updateKYCVerification = async (
  verificationId: string,
  adminUserId: string,
  data: UpdateKYCVerificationRequest
): Promise<{ data: KYCVerification | null; error: string | null }> => {
  try {
    const updateData: any = {
      status: data.status,
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString()
    };

    if (data.rejection_reason) {
      updateData.rejection_reason = data.rejection_reason;
    }

    if (data.admin_notes) {
      updateData.admin_notes = data.admin_notes;
    }

    const { data: verification, error } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', verificationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating KYC verification:', error);
      return { data: null, error: error.message };
    }

    return { data: verification, error: null };
  } catch (error) {
    console.error('Error updating KYC verification:', error);
    return { data: null, error: 'Failed to update KYC verification' };
  }
};

/**
 * Get KYC verification statistics
 */
export const getKYCVerificationStats = async (): Promise<{ data: KYCVerificationStats | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('status, verification_type');

    if (error) {
      console.error('Error fetching KYC verification stats:', error);
      return { data: null, error: error.message };
    }

    const stats: KYCVerificationStats = {
      total: data.length,
      pending: data.filter(v => v.status === 'pending').length,
      approved: data.filter(v => v.status === 'approved').length,
      rejected: data.filter(v => v.status === 'rejected').length,
      buyers: data.filter(v => v.verification_type === 'buyer').length,
      sellers: data.filter(v => v.verification_type === 'seller').length
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching KYC verification stats:', error);
    return { data: null, error: 'Failed to fetch KYC verification stats' };
  }
};

// =====================================================
// KYC DOCUMENT SERVICES
// =====================================================

/**
 * Upload KYC document
 */
export const uploadKYCDocument = async (
  request: UploadKYCDocumentRequest
): Promise<{ data: KYCDocument | null; error: string | null }> => {
  try {
    const { kyc_verification_id, document_type, document_side, file } = request;
    
    // Validate file
    if (!file || file.size === 0) {
      return { data: null, error: 'Invalid file provided' };
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {  
      return { data: null, error: 'File size too large. Maximum 10MB allowed.' };
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return { data: null, error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}` };
    }
    
    // Create a new File object to avoid DataCloneError
    const cleanFile = new File([file], file.name, { type: file.type });
    
    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${document_type}_${Date.now()}.${fileExt}`;
    const filePath = `${kyc_verification_id}/${fileName}`;
    
    // Storage bucket name
    const storageBucket = 'kyc-documents';
    
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      path: filePath
    });
    
    // Upload file to Supabase Storage
    // Remove the listBuckets check - it requires service role permissions
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(filePath, cleanFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      console.error('Storage bucket:', storageBucket);
      console.error('File path:', filePath);
      console.error('File size:', file.size);
      console.error('File type:', file.type);
      
      // Check if error is auth-related
      if (uploadError.message?.includes('401') || uploadError.message?.includes('Unauthorized')) {
        return { 
          data: null, 
          error: 'Authentication failed. Please ensure you are signed in and have upload permissions.' 
        };
      }
      
      return { data: null, error: uploadError.message || 'Upload failed' };
    }
    
    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(filePath);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      // Clean up uploaded file if user not authenticated
      await supabase.storage.from(storageBucket).remove([filePath]);
      return { data: null, error: 'User authentication required' };
    }

    // Save document metadata to database
    const { data: document, error: dbError } = await supabase
      .from('kyc_documents')
      .insert({
        user_id: user.id,
        verification_id: kyc_verification_id,
        document_type,
        document_side: document_side || 'front',
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        verification_status: 'pending'
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Error saving document metadata:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from(storageBucket).remove([filePath]);
      return { data: null, error: dbError.message };
    }
    
    return { data: document, error: null };
  } catch (error) {
    console.error('Error uploading KYC document:', error);
    return { data: null, error: 'Failed to upload document' };
  }
};

/**
 * Get documents for a KYC verification
 */
export const getKYCVerificationDocuments = async (
  verificationId: string
): Promise<{ data: KYCDocument[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('verification_id', verificationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching KYC documents:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching KYC documents:', error);
    return { data: null, error: 'Failed to fetch documents' };
  }
};

/**
 * Get document download URL
 */
export const getDocumentDownloadUrl = async (
  filePath: string,
  documentType?: string
): Promise<{ data: string | null; error: string | null }> => {
  try {
    // Use kyc-documents bucket for all KYC documents
    const storageBucket = 'kyc-documents';
    
    const { data, error } = await supabase.storage
      .from(storageBucket)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error generating download URL:', error);
      return { data: null, error: error.message };
    }

    return { data: data.signedUrl, error: null };
  } catch (error) {
    console.error('Error generating download URL:', error);
    return { data: null, error: 'Failed to generate download URL' };
  }
};

/**
 * Delete KYC document
 */
export const deleteKYCDocument = async (
  documentId: string
): Promise<{ error: string | null }> => {
  try {
    // Get document details first
    const { data: document, error: fetchError } = await supabase
      .from('kyc_documents')
      .select('file_url, document_type')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      console.error('Error fetching document:', fetchError);
      return { error: fetchError.message };
    }

    // Extract file path from URL for storage deletion
    const filePath = document.file_url?.split('/').slice(-2).join('/'); // Get last two parts of URL

    if (filePath) {
    // Use kyc-documents bucket for all KYC documents
    const storageBucket = 'kyc-documents';

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(storageBucket)
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('kyc_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      console.error('Error deleting document from database:', dbError);
      return { error: dbError.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting KYC document:', error);
    return { error: 'Failed to delete document' };
  }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Check if user has admin role
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('roles')
      .eq('auth_user_id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.roles.includes('admin');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get current user's profile
 */
export const getCurrentUserProfile = async (): Promise<{ data: any | null; error: string | null }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error: 'Failed to fetch user profile' };
  }
}; 