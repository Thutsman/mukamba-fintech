'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Download,
  MessageSquare,
  Calendar,
  DollarSign,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  SortAsc,
  SortDesc
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplicationStatus as AppStatus } from './ApplicationForm';

interface Application {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyCity: string;
  propertyPrice: number;
  propertyImageUrl?: string;
  status: AppStatus;
  submittedDate: Date;
  lastUpdated: Date;
  rentAmount: number;
  rentCreditPercentage: number;
  estimatedReviewTime: number;
  documentsSubmitted: boolean;
  agentName: string;
  agentEmail: string;
}

interface ApplicationHistoryProps {
  applications: Application[];
  onBack: () => void;
  onViewApplication: (applicationId: string) => void;
  onContactAgent: (applicationId: string) => void;
  onDownloadDocuments: (applicationId: string) => void;
}

const STATUS_CONFIG = {
  [AppStatus.DRAFT]: { color: 'bg-slate-100 text-slate-800', icon: FileText, label: 'Draft' },
  [AppStatus.SUBMITTED]: { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Submitted' },
  [AppStatus.UNDER_REVIEW]: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Under Review' },
  [AppStatus.APPROVED]: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
  [AppStatus.REJECTED]: { color: 'bg-red-100 text-red-800', icon: X, label: 'Rejected' },
  [AppStatus.COUNTER_OFFER]: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Counter Offer' }
};

export const ApplicationHistory: React.FC<ApplicationHistoryProps> = ({
  applications,
  onBack,
  onViewApplication,
  onContactAgent,
  onDownloadDocuments
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<'date' | 'status' | 'property'>('date');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = React.useState(false);

  // Filter and sort applications
  const filteredApplications = React.useMemo(() => {
    let filtered = applications.filter(app => {
      const matchesSearch = searchQuery === '' || 
        app.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort applications
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.submittedDate.getTime() - b.submittedDate.getTime();
          break;
        case 'status':
          const statusOrder = ['draft', 'submitted', 'under_review', 'approved', 'counter_offer', 'rejected'];
          comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
          break;
        case 'property':
          comparison = a.propertyTitle.localeCompare(b.propertyTitle);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [applications, searchQuery, statusFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  const getStatusIcon = (status: AppStatus) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    return <Icon className="w-3 h-3" />;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysSinceSubmission = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <h1 className="text-xl font-semibold text-slate-900">Application History</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {(searchQuery || statusFilter !== 'all') && (
                  <Badge className="ml-1 bg-red-100 text-red-700 text-xs">Active</Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Filters & Search</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Search applications..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                            <SelectItem key={status} value={status}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Sort By</label>
                      <div className="flex gap-2">
                        <Select value={sortBy} onValueChange={(value: 'date' | 'status' | 'property') => setSortBy(value)}>
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                            <SelectItem value="property">Property</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="px-2"
                        >
                          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
            </h2>
            {(searchQuery || statusFilter !== 'all') && (
              <p className="text-sm text-slate-500 mt-1">Filters applied</p>
            )}
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application, index) => {
              const statusConfig = STATUS_CONFIG[application.status];
              const daysSinceSubmission = getDaysSinceSubmission(application.submittedDate);
              
              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Property Info */}
                        <div className="lg:col-span-2">
                          <div className="flex items-start gap-4">
                            <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              {application.propertyImageUrl ? (
                                <img
                                  src={application.propertyImageUrl}
                                  alt={application.propertyTitle}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Building className="w-8 h-8 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 mb-1 truncate">
                                {application.propertyTitle}
                              </h3>
                              <p className="text-slate-600 mb-2">{application.propertyAddress}, {application.propertyCity}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-slate-500">Application ID:</span>
                                <span className="font-mono text-slate-700">{application.id}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm mt-1">
                                <span className="text-slate-500">Submitted:</span>
                                <span className="text-slate-700">{formatDate(application.submittedDate)}</span>
                                <span className="text-slate-500">({daysSinceSubmission} days ago)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge className={statusConfig.color}>
                                {getStatusIcon(application.status)}
                                {statusConfig.label}
                              </Badge>
                              <div className="text-right">
                                <div className="text-lg font-bold text-slate-900">
                                  R{application.rentAmount.toLocaleString()}
                                </div>
                                <div className="text-sm text-slate-500">Monthly Rent</div>
                              </div>
                            </div>
                            
                            <div className="text-sm text-slate-600">
                              <div className="flex justify-between">
                                <span>Rent Credit:</span>
                                <span>{application.rentCreditPercentage}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Property Price:</span>
                                <span>R{application.propertyPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewApplication(application.id)}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onContactAgent(application.id)}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDownloadDocuments(application.id)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications found</h3>
              <p className="text-slate-500 mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters to find more applications.'
                  : 'You haven\'t submitted any applications yet.'
                }
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
