'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreVertical,
  Plus,
  TrendingUp,
  DollarSign,
  Clock,
  Users
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

import { EnhancedLeadCard } from './EnhancedLeadCard';
import { EnhancedLead, PipelineStage as PipelineStageType } from './LeadManagementTab';

interface PipelineStageProps {
  stage: PipelineStageType;
  leads: EnhancedLead[];
  selectedLeads: string[];
  onLeadSelect: (leadId: string, selected: boolean) => void;
  onLeadUpdate: (leadId: string, updates: Partial<EnhancedLead>) => void;
  onLeadContact: (leadId: string, method: 'phone' | 'email' | 'message' | 'whatsapp') => void;
  onScheduleViewing: (leadId: string) => void;
  onDragStart: (leadId: string, sourceStage: string) => void;
  onDrop: (leadId: string, targetStage: string) => void;
  onDragEnd: () => void;
  draggedLead: string | null;
}

export const PipelineStage: React.FC<PipelineStageProps> = ({
  stage,
  leads,
  selectedLeads,
  onLeadSelect,
  onLeadUpdate,
  onLeadContact,
  onScheduleViewing,
  onDragStart,
  onDrop,
  onDragEnd,
  draggedLead
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const stageRef = React.useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (stageRef.current) {
      stageRef.current.classList.add('bg-blue-50', 'border-blue-200');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (stageRef.current) {
      stageRef.current.classList.remove('bg-blue-50', 'border-blue-200');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (stageRef.current) {
      stageRef.current.classList.remove('bg-blue-50', 'border-blue-200');
    }
    
    if (draggedLead) {
      onDrop(draggedLead, stage.id);
    }
  };

  const averageTimeInStage = leads.length > 0 
    ? leads.reduce((sum, lead) => sum + lead.timeInStage, 0) / leads.length 
    : 0;

  const conversionRate = leads.length > 0 
    ? leads.filter(lead => lead.conversionProbability > 70).length / leads.length * 100 
    : 0;

  return (
    <motion.div
      ref={stageRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex-1 bg-gray-50 rounded-lg border-2 border-transparent transition-all duration-200 ${
        draggedLead ? 'border-dashed' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Enhanced stage header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${stage.bgColor}`}>
              <stage.icon className={`w-5 h-5 ${stage.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{stage.name}</h3>
              <p className="text-sm text-gray-600">{stage.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white">
              {leads.length}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="w-4 h-4 mr-2" />
                  Export Stage
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stage metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              R{stage.totalValue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(averageTimeInStage)}d
            </div>
            <div className="text-xs text-gray-600">Avg Time</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(conversionRate)}%
            </div>
            <div className="text-xs text-gray-600">Conversion</div>
          </div>
        </div>
      </div>

      {/* Stage content */}
      <div className="p-4">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 max-h-96 overflow-y-auto"
            >
              {leads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-sm">No leads in this stage</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {/* Add lead to this stage */}}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Lead
                  </Button>
                </div>
              ) : (
                leads.map((lead) => (
                  <EnhancedLeadCard
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedLeads.includes(lead.id)}
                    onSelect={(selected) => onLeadSelect(lead.id, selected)}
                    onUpdate={(updates) => onLeadUpdate(lead.id, updates)}
                    onContact={(method) => onLeadContact(lead.id, method)}
                    onScheduleViewing={() => onScheduleViewing(lead.id)}
                    onDragStart={() => onDragStart(lead.id, stage.id)}
                    onDragEnd={onDragEnd}
                    isDragging={draggedLead === lead.id}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse/Expand button */}
        {leads.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-gray-600 hover:text-gray-900"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : `Show ${leads.length} Leads`}
          </Button>
        )}
      </div>
    </motion.div>
  );
}; 