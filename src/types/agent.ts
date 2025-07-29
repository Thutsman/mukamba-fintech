import { User } from './auth';

export interface Agent {
  id: string;
  userId: string;
  fullName: string;
  companyName: string;
  eacNumber: string;
  bio: string;
  businessLicenseUrl?: string;
  idDocumentUrl?: string;
  verifiedStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentWithUser extends Agent {
  user: User;
}

export interface AgentStats {
  totalListings: number;
  activeListings: number;
  totalLeads: number;
  newInquiries: number;
  viewingsScheduled: number;
  averageResponseTime: string;
  satisfactionScore: number;
  monthlyEarnings: number;
}

export interface AgentLead {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  message: string;
  status: 'new' | 'contacted' | 'viewing_scheduled' | 'closed' | 'lost';
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentViewing {
  id: string;
  leadId: string;
  propertyId: string;
  scheduledFor: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 