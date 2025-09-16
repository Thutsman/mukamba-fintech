export interface PropertyOffer {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  
  // Offer details
  offer_price: number;
  deposit_amount: number;
  payment_method: 'cash' | 'installments';
  estimated_timeline: string;
  additional_notes?: string;
  
  // Status & workflow
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'expired';
  admin_reviewed_by?: string;
  admin_reviewed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
  
  // Timestamps
  submitted_at: string;
  expires_at?: string;
  updated_at: string;
  
  // Related data (joined from other tables)
  property?: {
    id: string;
    title: string;
    price: number;
    currency: string;
    location: {
      city: string;
      country: string;
    };
  };
  buyer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface OfferStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
  expired: number;
}

export interface CreateOfferData {
  property_id: string;
  buyer_id: string;
  seller_id?: string; // Optional for admin-listed properties
  offer_price: number;
  deposit_amount: number;
  payment_method: 'cash' | 'installments';
  estimated_timeline: string;
  additional_notes?: string;
}

export interface UpdateOfferData {
  status?: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'expired';
  admin_notes?: string;
  rejection_reason?: string;
}
