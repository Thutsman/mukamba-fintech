'use client';

import * as React from 'react';
import { LeadFilters } from '../LeadFilters';
import { EnhancedLead } from '../LeadManagementTab';

interface UseLeadManagementProps {
  leads: EnhancedLead[];
  onLeadUpdate: (leadId: string, updates: Partial<EnhancedLead>) => void;
  onBulkAction: (action: string, leadIds: string[]) => void;
}

export const useLeadManagement = ({
  leads,
  onLeadUpdate,
  onBulkAction
}: UseLeadManagementProps) => {
  const [selectedLeads, setSelectedLeads] = React.useState<string[]>([]);
  const [draggedLead, setDraggedLead] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<LeadFilters>({
    search: '',
    status: [],
    budgetRange: [0, 10000000],
    location: [],
    priority: [],
    lastContact: 'all',
    conversionProbability: [0, 100],
    propertyType: [],
    leadSource: [],
    isOverdue: false,
    isVerified: false
  });

  // Filter leads based on current filters
  const filteredLeads = React.useMemo(() => {
    return leads.filter(lead => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          lead.name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.phone.includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(lead.status)) {
        return false;
      }

      // Budget range filter
      if (lead.budget.max < filters.budgetRange[0] || lead.budget.max > filters.budgetRange[1]) {
        return false;
      }

      // Location filter
      if (filters.location.length > 0 && !filters.location.includes(lead.location)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(lead.priority)) {
        return false;
      }

      // Property type filter
      if (filters.propertyType.length > 0) {
        const hasMatchingPropertyType = lead.propertyTypes.some(type => 
          filters.propertyType.includes(type)
        );
        if (!hasMatchingPropertyType) return false;
      }

      // Lead source filter
      if (filters.leadSource.length > 0 && !filters.leadSource.includes(lead.leadSource)) {
        return false;
      }

      // Last contact filter
      if (filters.lastContact !== 'all') {
        const now = new Date();
        const lastContact = new Date(lead.lastContact);
        const daysDiff = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.lastContact) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
        }
      }

      // Conversion probability filter
      if (lead.conversionProbability < filters.conversionProbability[0] || 
          lead.conversionProbability > filters.conversionProbability[1]) {
        return false;
      }

      // Overdue filter
      if (filters.isOverdue && !lead.isOverdue) {
        return false;
      }

      // Verified filter
      if (filters.isVerified && lead.kycStatus !== 'verified') {
        return false;
      }

      return true;
    });
  }, [leads, filters]);

  // Calculate stage metrics
  const stageMetrics = React.useMemo(() => {
    const stages = ['new', 'contacted', 'viewing', 'application', 'closed'];
    return stages.map(stageId => {
      const stageLeads = filteredLeads.filter(lead => lead.status === stageId);
      const totalValue = stageLeads.reduce((sum, lead) => sum + lead.budget.max, 0);
      const averageTimeInStage = stageLeads.length > 0 
        ? stageLeads.reduce((sum, lead) => sum + lead.timeInStage, 0) / stageLeads.length 
        : 0;
      
      // Calculate conversion rate (simplified)
      const conversionRate = stageLeads.length > 0 
        ? stageLeads.filter(lead => lead.conversionProbability > 70).length / stageLeads.length * 100 
        : 0;
      
      const dropOffRate = 100 - conversionRate;

      return {
        stageId,
        averageTimeInStage,
        conversionRate,
        dropOffRate,
        totalValue,
        leadCount: stageLeads.length
      };
    });
  }, [filteredLeads]);

  // Calculate total pipeline value
  const totalPipelineValue = React.useMemo(() => {
    return filteredLeads.reduce((sum, lead) => sum + lead.budget.max, 0);
  }, [filteredLeads]);

  // Handle search
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<LeadFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle lead selection
  const handleLeadSelect = (leadId: string, selected: boolean) => {
    setSelectedLeads(prev => 
      selected 
        ? [...prev, leadId]
        : prev.filter(id => id !== leadId)
    );
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    setSelectedLeads(selected ? filteredLeads.map(lead => lead.id) : []);
  };

  // Handle drag start
  const handleDragStart = (leadId: string, sourceStage: string) => {
    setDraggedLead(leadId);
  };

  // Handle drop
  const handleDrop = (leadId: string, targetStage: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead && lead.status !== targetStage) {
      onLeadUpdate(leadId, { status: targetStage as any });
    }
    setDraggedLead(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedLead(null);
  };

  // Handle bulk actions
  const handleBulkAction = (action: string, leadIds: string[]) => {
    switch (action) {
      case 'deselect':
        setSelectedLeads([]);
        break;
      case 'email':
        // Implement bulk email functionality
        console.log('Bulk email to:', leadIds);
        break;
      case 'sms':
        // Implement bulk SMS functionality
        console.log('Bulk SMS to:', leadIds);
        break;
      case 'move':
        // Implement bulk move functionality
        console.log('Bulk move:', leadIds);
        break;
      case 'export':
        // Implement export functionality
        console.log('Export leads:', leadIds);
        break;
      case 'delete':
        // Implement bulk delete functionality
        console.log('Delete leads:', leadIds);
        break;
      default:
        onBulkAction(action, leadIds);
    }
  };

  return {
    filteredLeads,
    selectedLeads,
    filters,
    draggedLead,
    stageMetrics,
    totalPipelineValue,
    handleSearch,
    handleFilterChange,
    handleLeadSelect,
    handleSelectAll,
    handleDragStart,
    handleDrop,
    handleDragEnd,
    handleBulkAction
  };
}; 