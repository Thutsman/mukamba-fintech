
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Check, 
  X, 
  MoreHorizontal,
  Download,
  Plus,
  Search,
  Filter,
  Building2,
  List
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AdminListingModal } from './AdminListingModal';
import { PropertyManagementTable } from './PropertyManagementTable';
import { PropertyDetailsModal } from './PropertyDetailsModal';
import { EditPropertyModal } from './EditPropertyModal';
import { PropertyListing } from '@/types/property';
import { 
  getPropertyApplications, 
  approvePropertyApplication, 
  rejectPropertyApplication,
  getPropertyListingsStats,
  PropertyApplication 
} from '@/lib/property-application-services';
import { toast } from 'sonner';

interface ListingsPageProps {
  onViewListing: (listingId: string) => void;
  onApproveListing: (listingId: string) => void;
  onRejectListing: (listingId: string, reason: string) => void;
  onBulkAction: (action: string, listingIds: string[]) => void;
  onAddToListings: (propertyListing: PropertyListing) => void;
}

export const ListingsPage: React.FC<ListingsPageProps> = ({
  onViewListing,
  onApproveListing,
  onRejectListing,
  onBulkAction,
  onAddToListings
}) => {
  const [applications, setApplications] = useState<PropertyApplication[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'applications' | 'properties'>('applications');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(false);
  const [isEditPropertyOpen, setIsEditPropertyOpen] = useState(false);

  useEffect(() => {
    loadApplications();
    loadStats();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await getPropertyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getPropertyListingsStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      const success = await approvePropertyApplication(applicationId, 'admin-user-id');
      if (success) {
        toast.success('Application approved successfully');
        await loadApplications();
        await loadStats();
      } else {
        toast.error('Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async (applicationId: string, reason: string) => {
    try {
      const success = await rejectPropertyApplication(applicationId, 'admin-user-id', reason);
      if (success) {
        toast.success('Application rejected successfully');
        await loadApplications();
        await loadStats();
      } else {
        toast.error('Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const handleViewProperty = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setIsPropertyDetailsOpen(true);
  };

  const handleEditProperty = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setIsEditPropertyOpen(true);
  };

  const handleDeleteProperty = (propertyId: string) => {
    // This is handled by the PropertyManagementTable component
    // The actual delete functionality is implemented in the usePropertyActions hook
    console.log('Delete property requested:', propertyId);
  };

  const handleRestoreProperty = (propertyId: string) => {
    // TODO: Implement restore property functionality
    toast.info('Restore property functionality coming soon');
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.property_data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.property_data.location.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
            activeTab === 'applications'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <List className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Property Applications</span>
            <span className="xs:hidden">Applications</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
            activeTab === 'properties'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Property Management</span>
            <span className="xs:hidden">Properties</span>
          </div>
        </button>
      </div>

      {activeTab === 'applications' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Total Listings</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-100">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">Property Applications</h3>
          <p className="text-sm text-slate-600">Review and manage property submissions</p>
        </div>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">
          <Button variant="outline" className="flex items-center justify-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Listing</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Applications List */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-2">
                        <h4 className="font-medium text-slate-900 truncate">
                          {application.property_data.title}
                        </h4>
                        {getStatusBadge(application.status)}
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p className="truncate">Location: {application.property_data.location.city}, {application.property_data.location.country}</p>
                        <p>Price: {application.property_data.financials.currency} {application.property_data.financials.price.toLocaleString()}</p>
                        <p>Submitted: {new Date(application.submitted_at || '').toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1 sm:gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewListing(application.id!)}
                        className="text-slate-600 hover:text-slate-900 p-2"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {application.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(application.id!)}
                            className="text-green-600 hover:text-green-700 p-2"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(application.id!, 'Does not meet requirements')}
                            className="text-red-600 hover:text-red-700 p-2"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" className="text-slate-600 p-2" title="More options">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

          {/* AdminListingModal */}
          <AdminListingModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onComplete={onAddToListings}
          />
        </>
      )}

      {activeTab === 'properties' && (
        <PropertyManagementTable
          onViewProperty={handleViewProperty}
          onEditProperty={handleEditProperty}
          onDeleteProperty={handleDeleteProperty}
        />
      )}

      {/* Property Details Modal */}
      <PropertyDetailsModal
        isOpen={isPropertyDetailsOpen}
        onClose={() => {
          setIsPropertyDetailsOpen(false);
          setSelectedPropertyId(null);
        }}
        propertyId={selectedPropertyId}
        onEdit={handleEditProperty}
        onDelete={handleDeleteProperty}
        onRestore={handleRestoreProperty}
      />

      {/* Edit Property Modal */}
      <EditPropertyModal
        isOpen={isEditPropertyOpen}
        onClose={() => {
          setIsEditPropertyOpen(false);
          setSelectedPropertyId(null);
        }}
        propertyId={selectedPropertyId}
        onSuccess={() => {
          // Refresh the property management table
          // This could trigger a reload of the PropertyManagementTable
        }}
      />
    </div>
  );
}; 