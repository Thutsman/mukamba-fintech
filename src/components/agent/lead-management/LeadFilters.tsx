'use client';

import * as React from 'react';
import { 
  Search,
  Filter,
  X,
  MapPin,
  DollarSign,
  Star,
  Calendar,
  TrendingUp,
  Home,
  Users,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface LeadFilters {
  search: string;
  status: string[];
  budgetRange: [number, number];
  location: string[];
  priority: string[];
  lastContact: string; // 'today' | 'week' | 'month' | 'all'
  conversionProbability: [number, number];
  propertyType: string[];
  leadSource: string[];
  isOverdue: boolean;
  isVerified: boolean;
}

interface LeadFiltersProps {
  filters: LeadFilters;
  onFilterChange: (filters: Partial<LeadFilters>) => void;
  onSearch: (query: string) => void;
}

const priorityOptions = [
  { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-700' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-700' }
];

const statusOptions = [
  { value: 'new', label: 'New Leads', color: 'bg-blue-100 text-blue-700' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'viewing', label: 'Viewing', color: 'bg-purple-100 text-purple-700' },
  { value: 'application', label: 'Application', color: 'bg-orange-100 text-orange-700' },
  { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-700' }
];

const propertyTypeOptions = [
  'House', 'Apartment', 'Townhouse', 'Condo', 'Villa', 'Land', 'Commercial'
];

const leadSourceOptions = [
  'Website', 'Referral', 'Social Media', 'Direct', 'Advertisement', 'Open House'
];

const locationOptions = [
  'Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Epworth', 'Gweru', 'Kwekwe', 'Kadoma'
];

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState(filters.search);

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (typeof value === 'string') return value !== '' && value !== 'all';
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value;
    return false;
  }).length;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const clearFilters = () => {
    onFilterChange({
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
    setSearchQuery('');
  };

  const removeFilter = (key: keyof LeadFilters, value?: string) => {
    if (typeof filters[key] === 'string') {
      onFilterChange({ [key]: '' });
    } else if (Array.isArray(filters[key])) {
      const currentArray = filters[key] as string[];
      const newArray = value 
        ? currentArray.filter(item => item !== value)
        : [];
      onFilterChange({ [key]: newArray });
    } else if (typeof filters[key] === 'boolean') {
      onFilterChange({ [key]: false });
    }
  };

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        {/* Search and main filters */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search leads by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Advanced Filters</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <div className="space-y-2">
                    {statusOptions.map((status) => (
                      <div key={status.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status.value}`}
                          checked={filters.status.includes(status.value)}
                          onCheckedChange={(checked) => {
                            const newStatus = checked
                              ? [...filters.status, status.value]
                              : filters.status.filter(s => s !== status.value);
                            onFilterChange({ status: newStatus });
                          }}
                        />
                        <label htmlFor={`status-${status.value}`} className="text-sm">
                          {status.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <div className="space-y-2">
                    {priorityOptions.map((priority) => (
                      <div key={priority.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`priority-${priority.value}`}
                          checked={filters.priority.includes(priority.value)}
                          onCheckedChange={(checked) => {
                            const newPriority = checked
                              ? [...filters.priority, priority.value]
                              : filters.priority.filter(p => p !== priority.value);
                            onFilterChange({ priority: newPriority });
                          }}
                        />
                        <label htmlFor={`priority-${priority.value}`} className="text-sm">
                          {priority.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Budget Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={filters.budgetRange[0]}
                      onChange={(e) => onFilterChange({
                        budgetRange: [parseInt(e.target.value) || 0, filters.budgetRange[1]]
                      })}
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={filters.budgetRange[1]}
                      onChange={(e) => onFilterChange({
                        budgetRange: [filters.budgetRange[0], parseInt(e.target.value) || 10000000]
                      })}
                    />
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {locationOptions.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location}`}
                          checked={filters.location.includes(location)}
                          onCheckedChange={(checked) => {
                            const newLocation = checked
                              ? [...filters.location, location]
                              : filters.location.filter(l => l !== location);
                            onFilterChange({ location: newLocation });
                          }}
                        />
                        <label htmlFor={`location-${location}`} className="text-sm">
                          {location}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Type</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {propertyTypeOptions.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`property-${type}`}
                          checked={filters.propertyType.includes(type)}
                          onCheckedChange={(checked) => {
                            const newPropertyType = checked
                              ? [...filters.propertyType, type]
                              : filters.propertyType.filter(t => t !== type);
                            onFilterChange({ propertyType: newPropertyType });
                          }}
                        />
                        <label htmlFor={`property-${type}`} className="text-sm">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lead Source */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Lead Source</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {leadSourceOptions.map((source) => (
                      <div key={source} className="flex items-center space-x-2">
                        <Checkbox
                          id={`source-${source}`}
                          checked={filters.leadSource.includes(source)}
                          onCheckedChange={(checked) => {
                            const newLeadSource = checked
                              ? [...filters.leadSource, source]
                              : filters.leadSource.filter(s => s !== source);
                            onFilterChange({ leadSource: newLeadSource });
                          }}
                        />
                        <label htmlFor={`source-${source}`} className="text-sm">
                          {source}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Last Contact */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Last Contact</label>
                  <Select
                    value={filters.lastContact}
                    onValueChange={(value) => onFilterChange({ lastContact: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conversion Probability */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Conversion Probability</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min %"
                      type="number"
                      value={filters.conversionProbability[0]}
                      onChange={(e) => onFilterChange({
                        conversionProbability: [parseInt(e.target.value) || 0, filters.conversionProbability[1]]
                      })}
                    />
                    <Input
                      placeholder="Max %"
                      type="number"
                      value={filters.conversionProbability[1]}
                      onChange={(e) => onFilterChange({
                        conversionProbability: [filters.conversionProbability[0], parseInt(e.target.value) || 100]
                      })}
                    />
                  </div>
                </div>

                {/* Special Filters */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="overdue"
                      checked={filters.isOverdue}
                      onCheckedChange={(checked) => onFilterChange({ isOverdue: checked as boolean })}
                    />
                    <label htmlFor="overdue" className="text-sm">Overdue Follow-ups</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={filters.isVerified}
                      onCheckedChange={(checked) => onFilterChange({ isVerified: checked as boolean })}
                    />
                    <label htmlFor="verified" className="text-sm">Verified Leads Only</label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'} Quick Filters
          </Button>
        </div>

        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.status.map(status => (
              <Badge key={status} variant="secondary" className="flex items-center space-x-1">
                <span>{statusOptions.find(s => s.value === status)?.label}</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('status', status)}
                />
              </Badge>
            ))}
            {filters.priority.map(priority => (
              <Badge key={priority} variant="secondary" className="flex items-center space-x-1">
                <span>{priorityOptions.find(p => p.value === priority)?.label}</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('priority', priority)}
                />
              </Badge>
            ))}
            {filters.location.map(location => (
              <Badge key={location} variant="secondary" className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('location', location)}
                />
              </Badge>
            ))}
            {filters.propertyType.map(type => (
              <Badge key={type} variant="secondary" className="flex items-center space-x-1">
                <Home className="w-3 h-3" />
                <span>{type}</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('propertyType', type)}
                />
              </Badge>
            ))}
            {filters.budgetRange[0] > 0 || filters.budgetRange[1] < 10000000 ? (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3" />
                <span>R{filters.budgetRange[0].toLocaleString()} - R{filters.budgetRange[1].toLocaleString()}</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('budgetRange')}
                />
              </Badge>
            ) : null}
            {filters.isOverdue && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <span>Overdue</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('isOverdue')}
                />
              </Badge>
            )}
            {filters.isVerified && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Verified Only</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('isVerified')}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Quick filters */}
        {isExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <Button
              variant={filters.isOverdue ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange({ isOverdue: !filters.isOverdue })}
              className="justify-start"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Overdue
            </Button>
            <Button
              variant={filters.isVerified ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange({ isVerified: !filters.isVerified })}
              className="justify-start"
            >
              <Users className="w-4 h-4 mr-2" />
              Verified
            </Button>
            <Button
              variant={filters.priority.includes('high') ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newPriority = filters.priority.includes('high')
                  ? filters.priority.filter(p => p !== 'high')
                  : [...filters.priority, 'high'];
                onFilterChange({ priority: newPriority });
              }}
              className="justify-start"
            >
              <Star className="w-4 h-4 mr-2" />
              High Priority
            </Button>
            <Button
              variant={filters.status.includes('new') ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newStatus = filters.status.includes('new')
                  ? filters.status.filter(s => s !== 'new')
                  : [...filters.status, 'new'];
                onFilterChange({ status: newStatus });
              }}
              className="justify-start"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              New Leads
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 