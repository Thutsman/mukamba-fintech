'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MessageCircle,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MoreHorizontal,
  MapPin,
  Home,
  DollarSign,
  TrendingUp,
  UserCheck,
  FileText,
  Eye,
  Edit,
  Copy,
  Trash2,
  Share2
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

import { EnhancedLead } from './LeadManagementTab';
import { formatDistanceToNow, format } from 'date-fns';

interface EnhancedLeadCardProps {
  lead: EnhancedLead;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onUpdate: (updates: Partial<EnhancedLead>) => void;
  onContact: (method: 'phone' | 'email' | 'message' | 'whatsapp') => void;
  onScheduleViewing: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

const leadQuickActions = [
  { id: 'call', label: 'Call Now', icon: Phone, color: 'blue' },
  { id: 'email', label: 'Send Email', icon: Mail, color: 'green' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'green' },
  { id: 'schedule', label: 'Schedule Viewing', icon: Calendar, color: 'purple' },
  { id: 'note', label: 'Add Note', icon: FileText, color: 'gray' },
  { id: 'move', label: 'Move Stage', icon: TrendingUp, color: 'orange' },
];

export const EnhancedLeadCard: React.FC<EnhancedLeadCardProps> = ({
  lead,
  isSelected = false,
  onSelect,
  onUpdate,
  onContact,
  onScheduleViewing,
  onDragStart,
  onDragEnd,
  isDragging = false
}) => {
  const priorityColors = {
    high: 'border-l-red-500 bg-red-50',
    medium: 'border-l-yellow-500 bg-yellow-50',
    low: 'border-l-green-500 bg-green-50'
  };

  const getHealthIndicator = () => {
    if (lead.isOverdue) return { color: 'text-red-600', icon: AlertCircle };
    if (lead.nextFollowUp && new Date(lead.nextFollowUp) <= new Date(Date.now() + 24 * 60 * 60 * 1000)) {
      return { color: 'text-yellow-600', icon: Clock };
    }
    if (lead.lastContact && new Date(lead.lastContact) >= new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return { color: 'text-green-600', icon: CheckCircle };
    }
    return { color: 'text-blue-600', icon: Clock };
  };

  const healthIndicator = getHealthIndicator();



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`group cursor-pointer ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className={`overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-all duration-300 ${priorityColors[lead.priority]}`}>
        <CardContent className="p-4">
          {/* Lead header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              {onSelect && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelect(checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <Avatar className="w-10 h-10">
                <AvatarImage src={`/api/avatar/${lead.id}`} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                  {lead.kycStatus === 'verified' && (
                    <UserCheck className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{lead.email}</p>
              </div>
            </div>
            
            {/* Status badges */}
            <div className="flex flex-col items-end space-y-1">
              {lead.isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
              <div className="flex items-center space-x-1">
                <healthIndicator.icon className={`w-4 h-4 ${healthIndicator.color}`} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {leadQuickActions.map((action) => (
                      <DropdownMenuItem key={action.id}>
                        <action.icon className="w-4 h-4 mr-2" />
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Lead
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          {/* Lead details */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                Budget:
              </span>
              <span className="font-medium">R{lead.budget.max.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                Location:
              </span>
              <span className="font-medium">{lead.location}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <Home className="w-3 h-3 mr-1" />
                Property:
              </span>
              <span className="font-medium">{lead.propertyTypes.join(', ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Lead Score:</span>
              <div className="flex items-center space-x-1">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-500 rounded-full transition-all duration-300" 
                    style={{ width: `${lead.leadScore}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{lead.leadScore}%</span>
              </div>
            </div>
          </div>
          
          {/* Time indicators */}
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Last: {formatDistanceToNow(lead.lastContact)} ago
            </span>
            {lead.nextFollowUp && (
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Next: {format(lead.nextFollowUp, 'MMM dd')}
              </span>
            )}
          </div>
          
          {/* Interaction stats */}
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>Interactions: {lead.totalInteractions}</span>
            <span>Response: {lead.responseRate}%</span>
            <span>Viewings: {lead.viewingsCompleted}/{lead.viewingsScheduled}</span>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
              onClick={(e) => {
                e.stopPropagation();
                onContact('phone');
              }}
            >
              <Phone className="w-3 h-3 mr-1" />
              Call
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
              onClick={(e) => {
                e.stopPropagation();
                onContact('email');
              }}
            >
              <Mail className="w-3 h-3 mr-1" />
              Email
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200"
              onClick={(e) => {
                e.stopPropagation();
                onScheduleViewing();
              }}
            >
              <Calendar className="w-3 h-3" />
            </Button>
          </div>

          {/* Tags */}
          {lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {lead.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {lead.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{lead.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}; 