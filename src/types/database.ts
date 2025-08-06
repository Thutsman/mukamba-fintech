// =====================================================
// Database Types for KYC File Upload Setup
// Focused on essential types for KYC document upload and admin review
// =====================================================

// User roles and verification types
export type UserRole = 'buyer' | 'seller' | 'admin' | 'agent';
export type VerificationType = 'buyer' | 'seller';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type KYCStatus = 'none' | 'partial' | 'pending' | 'approved' | 'rejected';
export type Nationality = 'SA' | 'ZIM';

// Document types for KYC
export type DocumentType = 
  | 'id_document'
  | 'proof_of_income'
  | 'bank_statement'
  | 'title_deed'
  | 'property_tax_certificate'
  | 'municipal_rates_certificate'
  | 'property_insurance'
  | 'compliance_certificate'
  | 'business_registration'
  | 'tax_clearance_certificate';

// =====================================================
// CORE DATABASE TABLES
// =====================================================

// User profiles table
export interface UserProfile {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  nationality?: Nationality;
  
  // Verification status
  is_phone_verified: boolean;
  is_identity_verified: boolean;
  is_financially_verified: boolean;
  is_property_verified: boolean;
  kyc_status: KYCStatus;
  
  // User roles
  roles: UserRole[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// KYC verifications table
export interface KYCVerification {
  id: string;
  user_id: string;
  verification_type: VerificationType;
  status: VerificationStatus;
  
  // Identity information
  id_number?: string;
  date_of_birth?: string;
  
  // Financial information (for buyers)
  monthly_income?: number;
  employment_status?: string;
  bank_name?: string;
  credit_consent: boolean;
  
  // Business information (for sellers)
  business_registered: boolean;
  business_name?: string;
  business_registration_number?: string;
  tax_number?: string;
  
  // Admin review
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
  
  // Timestamps
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

// KYC documents table
export interface KYCDocument {
  id: string;
  kyc_verification_id: string;
  document_type: DocumentType;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  verified: boolean;
  verification_notes?: string;
}

// =====================================================
// ENHANCED TYPES FOR FRONTEND USE
// =====================================================

// Enhanced KYC verification with user details
export interface KYCVerificationWithUser extends KYCVerification {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  documents: KYCDocument[];
}

// Enhanced KYC document with verification details
export interface KYCDocumentWithVerification extends KYCDocument {
  verification: {
    user_id: string;
    verification_type: VerificationType;
    status: VerificationStatus;
  };
}

// =====================================================
// REQUEST/RESPONSE TYPES
// =====================================================

// Create KYC verification request
export interface CreateKYCVerificationRequest {
  verification_type: VerificationType;
  id_number?: string;
  date_of_birth?: string;
  monthly_income?: number;
  employment_status?: string;
  bank_name?: string;
  credit_consent?: boolean;
  business_registered?: boolean;
  business_name?: string;
  business_registration_number?: string;
  tax_number?: string;
}

// Update KYC verification request (admin)
export interface UpdateKYCVerificationRequest {
  status: VerificationStatus;
  rejection_reason?: string;
  admin_notes?: string;
}

// Upload KYC document request
export interface UploadKYCDocumentRequest {
  kyc_verification_id: string;
  document_type: DocumentType;
  file: File;
}

// =====================================================
// HELPER TYPES
// =====================================================

// KYC verification filters
export interface KYCVerificationFilters {
  status?: VerificationStatus | 'all';
  type?: VerificationType | 'all';
  search?: string;
  date_from?: string;
  date_to?: string;
}

// KYC verification statistics
export interface KYCVerificationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  buyers: number;
  sellers: number;
}

// =====================================================
// DATABASE VIEWS (for complex queries)
// =====================================================

// KYC verification summary view
export interface KYCVerificationSummary {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  verification_type: VerificationType;
  status: VerificationStatus;
  document_count: number;
  submitted_at: string;
  reviewed_at?: string;
}

// =====================================================
// TYPE GUARDS
// =====================================================

export function isKYCVerification(obj: any): obj is KYCVerification {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.verification_type === 'string' &&
    typeof obj.status === 'string';
}

export function isKYCDocument(obj: any): obj is KYCDocument {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.kyc_verification_id === 'string' &&
    typeof obj.document_type === 'string' &&
    typeof obj.file_path === 'string';
}

// =====================================================
// CONSTANTS
// =====================================================

export const KYC_DOCUMENT_TYPES: Record<DocumentType, string> = {
  id_document: 'ID Document',
  proof_of_income: 'Proof of Income',
  bank_statement: 'Bank Statement',
  title_deed: 'Title Deed',
  property_tax_certificate: 'Property Tax Certificate',
  municipal_rates_certificate: 'Municipal Rates Certificate',
  property_insurance: 'Property Insurance',
  compliance_certificate: 'Compliance Certificate',
  business_registration: 'Business Registration',
  tax_clearance_certificate: 'Tax Clearance Certificate'
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected'
};

export const VERIFICATION_TYPE_LABELS: Record<VerificationType, string> = {
  buyer: 'Buyer',
  seller: 'Seller'
}; 