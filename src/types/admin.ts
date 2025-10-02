// Admin-specific types for Mukamba FinTech admin dashboard

export interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  pendingVerifications: number;
  activeTransactions: number;
  monthlyRevenue: number;
  userGrowth: number;
  propertyGrowth: number;
  verificationRate: number;
  escrowBalance: number;
  pendingListings: number;
  rejectedListings: number;
  activeRentToBuy: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: 'verified' | 'pending' | 'rejected' | 'suspended';
  joined: string;
  role: 'buyer' | 'seller' | 'both' | 'admin';
  lastActive: string;
  phone?: string;
  nationality?: 'SA' | 'ZIM';
  creditScore?: number;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  isFinanciallyVerified: boolean;
  isPropertyVerified: boolean;
  kycStatus: 'none' | 'partial' | 'pending' | 'approved' | 'rejected';
}

export interface AdminProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  status: 'active' | 'pending' | 'draft' | 'rejected' | 'sold';
  type: 'residential' | 'commercial' | 'mixed';
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  listedBy: string;
  listedAt: string;
  description?: string;
  images?: string[];
  rentToBuy?: boolean;
  monthlyRental?: number;
  downPayment?: number;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

export interface KYCVerification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'buyer' | 'seller';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  documents: {
    idDocument?: string;
    proofOfIncome?: string;
    bankStatement?: string;
    titleDeeds?: string[];
    propertyTaxCertificates?: string[];
    municipalRatesCertificates?: string[];
    propertyInsurance?: string[];
    complianceCertificates?: string[];
    businessRegistrationDoc?: string;
    taxClearanceCertificate?: string;
  };
  notes?: string;
}

export interface PaymentInstallment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  method: 'bank' | 'mobile_money' | 'card';
  status: 'pending' | 'paid' | 'failed' | 'flagged';
  createdAt: string;
  paymentDate?: string;
  transactionHash?: string;
  notes?: string;
}

export interface AdminListing {
  id: string;
  propertyId: string;
  propertyTitle: string;
  sellerId: string;
  sellerName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  price: number;
  monthlyInstallment?: number;
  paymentDuration?: number;
  rentToBuy: boolean;
  location: string;
  type: 'residential' | 'commercial' | 'mixed';
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  description?: string;
  images?: string[];
  notes?: string;
}

export interface AdminReport {
  id: string;
  title: string;
  type: 'user_growth' | 'revenue' | 'property_listings' | 'verifications' | 'transactions';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }[];
  };
  generatedAt: string;
}

export interface AdminNotification {
  id: string;
  type: 'verification_pending' | 'listing_pending' | 'payment_issue' | 'user_suspended' | 'system_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'actioned';
  createdAt: string;
  actionedAt?: string;
  actionedBy?: string;
  relatedId?: string; // ID of related user, property, transaction, etc.
}

export interface AdminSettings {
  systemSettings: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    verificationRequired: boolean;
    escrowEnabled: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    adminAlerts: boolean;
  };
  securitySettings: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
  };
}

export type AdminTab = 'overview' | 'listings' | 'offers' | 'kyc' | 'messages' | 'payments' | 'users' | 'reports' | 'settings';

export interface AdminBulkAction {
  type: 'approve' | 'reject' | 'suspend' | 'activate' | 'delete';
  items: string[]; // IDs of items to act on
  itemType: 'users' | 'properties' | 'listings' | 'kyc' | 'transactions';
  reason?: string;
} 