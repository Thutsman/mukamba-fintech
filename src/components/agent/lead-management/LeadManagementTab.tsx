export interface EnhancedLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  leadScore: number;
  priority: 'high' | 'medium' | 'low';
  leadSource: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  preferredAreas: string[];
  propertyTypes: string[];
  bedrooms: number;
  lastContact: Date;
  nextFollowUp?: Date;
  isOverdue: boolean;
  totalInteractions: number;
  responseRate: number;
  conversionProbability: number;
  timeInStage: number;
  totalTimeInPipeline: number;
  status: 'new' | 'contacted' | 'viewing' | 'qualified' | 'closed' | 'lost';
  interestedProperties: string[];
  viewingsScheduled: number;
  viewingsCompleted: number;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
  notes?: string;
  tags: string[];
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  leads: EnhancedLead[];
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
  totalValue: number;
  maxLeads?: number;
}

export interface LeadManagementTabProps {
  leads: EnhancedLead[];
  onLeadUpdate: (leadId: string, updates: Partial<EnhancedLead>) => void;
  onLeadDelete: (leadId: string) => void;
  onLeadMove: (leadId: string, fromStage: string, toStage: string) => void;
}

export const LeadManagementTab: React.FC<LeadManagementTabProps> = ({
  leads,
  onLeadUpdate,
  onLeadDelete,
  onLeadMove
}) => {
  return (
    <div>
      {/* This is a placeholder component */}
      <p>Lead Management Tab Component</p>
    </div>
  );
}; 