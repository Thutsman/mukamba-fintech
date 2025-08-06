// User account levels/tiers
export type UserLevel = 'guest' | 'basic' | 'verified' | 'premium';

// User roles - now optional and can be multiple
export type UserRole = 'buyer' | 'seller' | 'both' | 'admin' | 'agent';

// Registration steps for tenants
export const TENANT_REGISTRATION_STEPS = [
  'personal-info',
  'verification', 
  'financial-assessment',
  'kyc-documents',
  'completion'
] as const;

// Registration steps for landlords
export const LANDLORD_REGISTRATION_STEPS = [
  'personal-info',
  'verification',
  'property-portfolio', 
  'property-documents',
  'completion'
] as const;

export type TenantRegistrationStep = typeof TENANT_REGISTRATION_STEPS[number];
export type LandlordRegistrationStep = typeof LANDLORD_REGISTRATION_STEPS[number];
export type RegistrationStep = TenantRegistrationStep | LandlordRegistrationStep;

// Property information for landlords
export interface PropertyInfo {
  id: string;
  address: string;
  propertyType: 'residential' | 'commercial' | 'mixed';
  bedrooms?: number;
  bathrooms?: number;
  size: number; // in square meters
  estimatedValue: number;
  currentStatus: 'vacant' | 'rented' | 'owner-occupied';
  monthlyRental?: number;
  description: string;
}

// Basic signup data - minimal fields
export interface BasicSignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// Extended verification data for buyers
export interface BuyerVerificationData {
  // Identity verification
  idNumber: string;
  dateOfBirth: string;
  nationality: 'SA' | 'ZIM';
  
  // Financial assessment (for rent-to-buy)
  monthlyIncome?: number;
  employmentStatus?: string;
  bankName?: string;
  creditConsent?: boolean;
  
  // Documents
  idDocument?: File | null;
  proofOfIncome?: File | null;
  bankStatement?: File | null;
}

// Extended verification data for sellers
export interface SellerVerificationData {
  // Identity verification
  idNumber: string;
  dateOfBirth: string;
  nationality: 'SA' | 'ZIM';
  
  // Business information
  businessRegistered?: boolean;
  businessName?: string;
  businessRegistrationNumber?: string;
  taxNumber?: string;
  
  // Property portfolio
  properties?: PropertyInfo[];
  
  // Documents
  idDocument?: File | null;
  titleDeeds?: File[];
  propertyTaxCertificates?: File[];
  municipalRatesCertificates?: File[];
  propertyInsurance?: File[];
  complianceCertificates?: File[];
  businessRegistrationDoc?: File | null;
  taxClearanceCertificate?: File | null;
}

// Combined registration data - now more flexible
export interface RegistrationData extends BasicSignupData {
  // Optional role-specific data
  buyerData?: BuyerVerificationData;
  sellerData?: SellerVerificationData;
}

// User permissions based on verification level
export interface UserPermissions {
  canBrowseProperties: boolean;
  canSaveProperties: boolean;
  canContactSellers: boolean;
  canScheduleViewings: boolean;
  canApplyForFinancing: boolean;
  canListProperties: boolean;
  canReceiveApplications: boolean;
  canProcessTransactions: boolean;
  // Admin permissions
  canAccessAdminPanel: boolean;
  canManageUsers: boolean;
  canManageProperties: boolean;
  canViewAnalytics: boolean;
  canManageSystemSettings: boolean;
}

// User interface with flexible roles and levels
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  
  // User level and roles
  level: UserLevel;
  roles: UserRole[];
  
  // Verification status
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  isFinanciallyVerified: boolean; // For buyers
  isPropertyVerified: boolean; // For sellers
  isAddressVerified: boolean;
  
  // Optional data based on verification
  nationality?: 'SA' | 'ZIM';
  creditScore?: number; // Only for buyers
  properties?: PropertyInfo[]; // Only for sellers
  
  // System fields
  permissions: UserPermissions;
  kycStatus: 'none' | 'partial' | 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreditScoreData {
  score: number;
  factors: {
    income: number;
    age: number;
    employment: number;
    random: number;
  };
  rating: 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';
}

export interface OTPVerification {
  code: string;
  type: 'email' | 'phone';
  verified: boolean;
  expiresAt: Date;
}

// Verification step configuration
export interface VerificationStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  benefits: string[];
  requiredFor: string[];
}

// Helper function to get user permissions based on verification level
export function getUserPermissions(user: Partial<User>): UserPermissions {
  const hasAdminRole = user.roles?.includes('admin') || false;
  
  return {
    canBrowseProperties: true, // Always available
    canSaveProperties: true, // Always available
    canContactSellers: user.isPhoneVerified || false,
    canScheduleViewings: user.isPhoneVerified || false,
    canApplyForFinancing: user.isIdentityVerified && user.isFinanciallyVerified || false,
    canListProperties: user.isPhoneVerified && user.isIdentityVerified || false,
    canReceiveApplications: user.isIdentityVerified && user.isPropertyVerified || false,
    canProcessTransactions: user.kycStatus === 'approved' || false,
    // Admin permissions
    canAccessAdminPanel: hasAdminRole,
    canManageUsers: hasAdminRole,
    canManageProperties: hasAdminRole,
    canViewAnalytics: hasAdminRole,
    canManageSystemSettings: hasAdminRole
  };
}

// Helper function to get verification steps for buyers
export function getBuyerVerificationSteps(user: Partial<User>): VerificationStep[] {
  return [
    {
      id: 'phone-verification',
      title: 'Verify Phone Number',
      description: 'Confirm your phone number with SMS verification',
      required: false,
      completed: user.isPhoneVerified || false,
      benefits: ['Contact property owners', 'Schedule viewings', 'Get priority notifications'],
      requiredFor: ['Contact sellers', 'Schedule viewings']
    },
    {
      id: 'identity-verification',
      title: 'Verify Identity',
      description: 'Upload your ID document for identity verification',
      required: false,
      completed: user.isIdentityVerified || false,
      benefits: ['Apply for rent-to-buy financing', 'Access exclusive properties', 'Get pre-approval'],
      requiredFor: ['Apply for financing', 'Rent-to-buy applications']
    },
    {
      id: 'financial-verification',
      title: 'Financial Assessment',
      description: 'Complete income verification and credit assessment',
      required: false,
      completed: user.isFinanciallyVerified || false,
      benefits: ['Get credit score', 'Pre-approved financing', 'Higher application priority'],
      requiredFor: ['Rent-to-buy applications', 'Financing pre-approval']
    }
  ];
}

// Helper function to get verification steps for sellers
export function getSellerVerificationSteps(user: Partial<User>): VerificationStep[] {
  return [
    {
      id: 'phone-verification',
      title: 'Verify Phone Number',
      description: 'Confirm your phone number with SMS verification',
      required: false,
      completed: user.isPhoneVerified || false,
      benefits: ['List properties', 'Receive inquiries', 'Direct communication'],
      requiredFor: ['List properties', 'Receive applications']
    },
    {
      id: 'identity-verification',
      title: 'Verify Identity',
      description: 'Upload your ID document for identity verification',
      required: false,
      completed: user.isIdentityVerified || false,
      benefits: ['List verified properties', 'Build trust with buyers', 'Access premium tools'],
      requiredFor: ['Property listing', 'Receive applications']
    },
    {
      id: 'property-verification',
      title: 'Property Documentation',
      description: 'Upload title deeds and property certificates',
      required: false,
      completed: user.isPropertyVerified || false,
      benefits: ['List verified properties', 'Process rent-to-buy deals', 'Premium placement'],
      requiredFor: ['Rent-to-buy listings', 'Premium property placement']
    }
  ];
}

// Enhanced verification status types
export type VerificationStatus = 'unverified' | 'partially_verified' | 'fully_verified';

// Detailed verification states for modals
export type IdentityVerificationState = 'unverified' | 'pending' | 'verified' | 'expired' | 'rejected';
export type FinancialVerificationState = 'unverified' | 'pending' | 'verified' | 'expired' | 'rejected';

// Verification document interface
export interface VerificationDocument {
  id: string;
  type: 'identity' | 'financial' | 'address' | 'income' | 'employment';
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  expiresAt?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  rejectionReason?: string;
}

// Verification certificate interface
export interface VerificationCertificate {
  id: string;
  type: 'identity' | 'financial' | 'comprehensive';
  issuedAt: Date;
  expiresAt: Date;
  certificateUrl: string;
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  features: string[];
}

export interface FinancialProfile {
  creditScore: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  disposableIncome: number;
  debtToIncomeRatio: number;
  preApprovedAmount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastUpdated: Date;
}

export interface PropertyApplication {
  id: string;
  propertyId: string;
  propertyAddress: string;
  propertyType: string;
  applicationDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  rentAmount: number;
  rentCreditPercentage: number;
  estimatedMoveInDate?: Date;
  documentsSubmitted: boolean;
  lastUpdated: Date;
}

export interface SmartRecommendation {
  id: string;
  type: 'property' | 'action' | 'insight';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  matchScore?: number;
  estimatedMonthlyPayment?: number;
  propertyData?: {
    id: string;
    address: string;
    bedrooms: number;
    bathrooms: number;
    price: number;
    imageUrl: string;
  };
  action?: () => void;
}

// Enhanced helper functions for verification status
export function getVerificationStatus(user: Partial<User>): VerificationStatus {
  const verificationCount = [
    user.isPhoneVerified,
    user.isIdentityVerified,
    user.isFinanciallyVerified,
    user.isAddressVerified
  ].filter(Boolean).length;

  if (verificationCount === 0) return 'unverified';
  if (verificationCount < 3) return 'partially_verified';
  return 'fully_verified';
}

export function isFullyVerified(user: Partial<User>): boolean {
  return getVerificationStatus(user) === 'fully_verified';
}

export function getVerificationProgress(user: Partial<User>): number {
  const totalSteps = 4; // phone, identity, financial, address
  const completedSteps = [
    user.isPhoneVerified,
    user.isIdentityVerified,
    user.isFinanciallyVerified,
    user.isAddressVerified
  ].filter(Boolean).length;
  
  return Math.round((completedSteps / totalSteps) * 100);
}

// Helper function to determine user level
export function getUserLevel(user: Partial<User>): UserLevel {
  if (!user.email) return 'guest';
  if (!user.isPhoneVerified && !user.isIdentityVerified) return 'basic';
  if (user.isPhoneVerified && user.isIdentityVerified && user.isAddressVerified) return 'verified';
  if (user.kycStatus === 'approved') return 'premium';
  return 'basic';
} 