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
    const { data: verification, error } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: userId,
        verification_type: data.verification_type,
        id_number: data.id_number,
        date_of_birth: data.date_of_birth,
        monthly_income: data.monthly_income,
        employment_status: data.employment_status,
        bank_name: data.bank_name,
        credit_consent: data.credit_consent || false,
        business_registered: data.business_registered || false,
        business_name: data.business_name,
        business_registration_number: data.business_registration_number,
        tax_number: data.tax_number,
        status: 'pending'
      })
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
    let query = supabase
      .from('kyc_verifications')
      .select(`
        *,
        user:user_profiles(first_name, last_name, email, phone),
        documents:kyc_documents(*)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('verification_type', filters.type);
    }

    if (filters?.search) {
      query = query.or(`user.first_name.ilike.%${filters.search}%,user.last_name.ilike.%${filters.search}%,user.email.ilike.%${filters.search}%`);
    }

    if (filters?.date_from) {
      query = query.gte('submitted_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('submitted_at', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching KYC verifications:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
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
    const { kyc_verification_id, document_type, file } = request;

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${document_type}_${Date.now()}.${fileExt}`;
    const filePath = `${kyc_verification_id}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return { data: null, error: uploadError.message };
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('user-documents')
      .getPublicUrl(filePath);

    // Save document metadata to database
    const { data: document, error: dbError } = await supabase
      .from('kyc_documents')
      .insert({
        kyc_verification_id,
        document_type,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        verified: false
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving document metadata:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('user-documents').remove([filePath]);
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
      .eq('kyc_verification_id', verificationId)
      .order('uploaded_at', { ascending: false });

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
  filePath: string
): Promise<{ data: string | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from('user-documents')
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
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      console.error('Error fetching document:', fetchError);
      return { error: fetchError.message };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      return { error: storageError.message };
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