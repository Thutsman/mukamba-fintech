import { supabase } from './supabase';
import type { Agent, AgentStats, AgentLead, AgentViewing } from '@/types/agent';

// Mock data for development
const MOCK_AGENT: Agent = {
  id: 'mock-agent-1',
  userId: 'mock-user-1',
  fullName: 'John Doe',
  companyName: 'Real Estate Co',
  eacNumber: 'EAC12345',
  bio: 'Experienced real estate agent with 10 years in the industry.',
  verifiedStatus: 'approved',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Agent Profile Management
export async function createAgent(agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) {
  if (!supabase) {
    console.log('Mock agent creation:', agentData);
    return { ...MOCK_AGENT, ...agentData };
  }

  const { data, error } = await supabase
    .from('agents')
    .insert([agentData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAgent(agentId: string, updates: Partial<Agent>) {
  if (!supabase) {
    console.log('Mock agent update:', { agentId, updates });
    return { ...MOCK_AGENT, ...updates };
  }

  const { data, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', agentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAgentById(agentId: string) {
  if (!supabase) {
    console.log('Mock agent fetch by ID:', agentId);
    return MOCK_AGENT;
  }

  const { data, error } = await supabase
    .from('agents')
    .select(`
      *,
      user:user_id (*)
    `)
    .eq('id', agentId)
    .single();

  if (error) throw error;
  return data;
}

export async function getAgentByUserId(userId: string) {
  if (!supabase) {
    console.log('Mock agent fetch by user ID:', userId);
    return MOCK_AGENT;
  }

  const { data, error } = await supabase
    .from('agents')
    .select(`
      *,
      user:user_id (*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Agent Verification
export async function verifyEACNumber(eacNumber: string) {
  // TODO: Implement actual EAC verification
  // This is a mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    isValid: true,
    details: {
      registrationDate: new Date(),
      status: 'active',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    }
  };
}

export async function uploadAgentDocument(file: File, agentId: string, type: 'business_license' | 'id_document') {
  if (!supabase) {
    console.log('Mock document upload:', { file, agentId, type });
    return `https://example.com/mock-${type}-${agentId}.pdf`;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${agentId}/${type}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('agent-documents')
    .upload(fileName, file, {
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('agent-documents')
    .getPublicUrl(fileName);

  return publicUrl;
}

// Agent Stats and Analytics
export async function getAgentStats(agentId: string): Promise<AgentStats> {
  if (!supabase) {
    console.log('Mock stats fetch for agent:', agentId);
  }

  // Using mock data for both development and production for now
  return {
    totalListings: 12,
    activeListings: 8,
    totalLeads: 45,
    newInquiries: 15,
    viewingsScheduled: 6,
    averageResponseTime: '2.5 hours',
    satisfactionScore: 4.8,
    monthlyEarnings: 25000
  };
}

// Lead Management
export async function getAgentLeads(agentId: string, status?: AgentLead['status']) {
  if (!supabase) {
    console.log('Mock leads fetch:', { agentId, status });
    return [
      {
        id: 'mock-lead-1',
        propertyId: 'mock-property-1',
        propertyTitle: 'Luxury Apartment',
        clientName: 'Alice Smith',
        clientEmail: 'alice@example.com',
        message: 'Interested in viewing the property',
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  const query = supabase
    .from('agent_leads')
    .select('*')
    .eq('agent_id', agentId);

  if (status) {
    query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function updateLeadStatus(leadId: string, status: AgentLead['status']) {
  if (!supabase) {
    console.log('Mock lead status update:', { leadId, status });
    return {
      id: leadId,
      status,
      updatedAt: new Date()
    };
  }

  const { data, error } = await supabase
    .from('agent_leads')
    .update({ status })
    .eq('id', leadId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Viewing Management
export async function scheduleViewing(viewingData: Omit<AgentViewing, 'id' | 'createdAt' | 'updatedAt'>) {
  if (!supabase) {
    console.log('Mock viewing scheduled:', viewingData);
    return {
      id: 'mock-viewing-1',
      ...viewingData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  const { data, error } = await supabase
    .from('agent_viewings')
    .insert([viewingData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateViewingStatus(viewingId: string, status: AgentViewing['status'], notes?: string) {
  if (!supabase) {
    console.log('Mock viewing status update:', { viewingId, status, notes });
    return {
      id: viewingId,
      status,
      notes,
      updatedAt: new Date()
    };
  }

  const { data, error } = await supabase
    .from('agent_viewings')
    .update({ status, notes })
    .eq('id', viewingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAgentViewings(agentId: string, status?: AgentViewing['status']) {
  if (!supabase) {
    console.log('Mock viewings fetch:', { agentId, status });
    return [
      {
        id: 'mock-viewing-1',
        leadId: 'mock-lead-1',
        propertyId: 'mock-property-1',
        scheduledFor: new Date(),
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  const query = supabase
    .from('agent_viewings')
    .select(`
      *,
      lead:lead_id (*),
      property:property_id (*)
    `)
    .eq('agent_id', agentId);

  if (status) {
    query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
} 