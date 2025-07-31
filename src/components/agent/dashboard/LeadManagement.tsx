'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Calendar,
  FileCheck,
  CheckCircle,
  MessageSquare,
  Clock,
  AlertCircle,
  Users,
  TrendingUp
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'viewing' | 'application' | 'closed';
  isVerified: boolean;
  propertyInterest: string;
  lastContact: string;
  nextFollowUp: string;
  urgency: 'low' | 'medium' | 'high';
}

interface LeadCardProps {
  lead: Lead;
  onStatusChange: (leadId: string, newStatus: Lead['status']) => void;
  onContact: (leadId: string) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onStatusChange, onContact }) => {
  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    viewing: 'bg-purple-100 text-purple-800',
    application: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  const urgencyColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{lead.name}</h3>
              {lead.isVerified && (
                <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-600 truncate">{lead.propertyInterest}</p>
          </div>
          <Badge className={`${statusColors[lead.status]} text-xs ml-2 flex-shrink-0`}>
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-1 mb-3">
          <div className="flex items-center text-xs text-gray-600">
            <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">Last: {lead.lastContact}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">Next: {lead.nextFollowUp}</span>
          </div>
          <Badge className={`${urgencyColors[lead.urgency]} text-xs`}>
            {lead.urgency.toUpperCase()} Priority
          </Badge>
        </div>

        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-7"
            onClick={() => onContact(lead.id)}
          >
            <Phone className="w-3 h-3 mr-1" />
            Contact
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-7"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Message
          </Button>
        </div>
        
        {/* Status Update Dropdown */}
        <div className="mt-2">
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(lead.id, e.target.value as Lead['status'])}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="viewing">Viewing</option>
            <option value="application">Application</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
};

interface LeadManagementProps {
  leads: Lead[];
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void;
  onAddLead: () => void;
}

export const LeadManagement: React.FC<LeadManagementProps> = ({ leads, onLeadUpdate, onAddLead }) => {
  const pipelineStages: Lead['status'][] = ['new', 'contacted', 'viewing', 'application', 'closed'];

  const handleStatusChange = (leadId: string, newStatus: Lead['status']) => {
    onLeadUpdate(leadId, { status: newStatus });
  };

  const handleContact = (leadId: string) => {
    // Implement contact functionality
    console.log('Contacting lead:', leadId);
  };

  // Add a header section with summary stats
  const totalLeads = leads.length;
  const urgentLeads = leads.filter(lead => lead.urgency === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header with Add Lead Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Lead Management</h2>
        <Button
          onClick={onAddLead}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Users className="w-4 h-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent Leads</p>
                <p className="text-2xl font-bold text-red-600">{urgentLeads}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-600">15%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline View */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {pipelineStages.map((stage) => (
          <div key={stage} className="space-y-4 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 text-sm">
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {leads.filter(lead => lead.status === stage).length}
              </Badge>
            </div>
            <div className="space-y-3">
              {leads
                .filter(lead => lead.status === stage)
                .map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onStatusChange={handleStatusChange}
                    onContact={handleContact}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};