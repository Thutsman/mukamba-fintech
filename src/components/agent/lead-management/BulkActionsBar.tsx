'use client';

import * as React from 'react';
import { 
  Mail,
  MessageCircle,
  Phone,
  Calendar,
  Download,
  Trash2,
  Edit,
  Copy,
  Share2,
  Users,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface BulkActionsBarProps {
  selectedCount: number;
  selectedLeads: string[];
  onBulkAction: (action: string, leadIds: string[]) => void;
}

const bulkActions = [
  {
    id: 'email',
    label: 'Send Email',
    icon: Mail,
    color: 'text-green-600',
    description: 'Send email to all selected leads'
  },
  {
    id: 'sms',
    label: 'Send SMS',
    icon: MessageCircle,
    color: 'text-blue-600',
    description: 'Send SMS to all selected leads'
  },
  {
    id: 'call',
    label: 'Call List',
    icon: Phone,
    color: 'text-purple-600',
    description: 'Generate call list for selected leads'
  },
  {
    id: 'schedule',
    label: 'Schedule Viewings',
    icon: Calendar,
    color: 'text-orange-600',
    description: 'Schedule viewings for selected leads'
  },
  {
    id: 'export',
    label: 'Export to CSV',
    icon: Download,
    color: 'text-gray-600',
    description: 'Export selected leads to CSV'
  },
  {
    id: 'move',
    label: 'Move to Stage',
    icon: Users,
    color: 'text-indigo-600',
    description: 'Move selected leads to different stage'
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    color: 'text-yellow-600',
    description: 'Duplicate selected leads'
  },
  {
    id: 'share',
    label: 'Share',
    icon: Share2,
    color: 'text-teal-600',
    description: 'Share selected leads with team'
  }
];

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  selectedLeads,
  onBulkAction
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedCount} lead{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {selectedCount}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBulkAction('deselect', [])}
            className="text-blue-600 hover:text-blue-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear Selection
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Actions */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onBulkAction('email', selectedLeads)}
            className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email All
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onBulkAction('sms', selectedLeads)}
            className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            SMS All
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                More Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {bulkActions.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => onBulkAction(action.id, selectedLeads)}
                  className="flex items-center space-x-2"
                >
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                  <div>
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onBulkAction('delete', selectedLeads)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Hide' : 'Show'} Details
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="text-sm font-medium text-gray-700 mb-1">Total Value</div>
              <div className="text-lg font-semibold text-blue-900">
                R{/* Calculate total value of selected leads */}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="text-sm font-medium text-gray-700 mb-1">Average Lead Score</div>
              <div className="text-lg font-semibold text-blue-900">
                {/* Calculate average lead score */}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="text-sm font-medium text-gray-700 mb-1">Priority Distribution</div>
              <div className="flex space-x-2">
                <Badge variant="destructive" className="text-xs">High: {/* Count */}</Badge>
                <Badge variant="secondary" className="text-xs">Medium: {/* Count */}</Badge>
                <Badge variant="outline" className="text-xs">Low: {/* Count */}</Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 