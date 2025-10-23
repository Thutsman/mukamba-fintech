
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
import { getSellerOnboardingEntries, type SellerOnboardingEntry } from '@/lib/seller-onboarding-services';

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
  const [applications, setApplications] = useState<PropertyApplication[]>([]); // kept for compatibility if needed
  const [sellerEntries, setSellerEntries] = useState<SellerOnboardingEntry[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'applications' | 'properties'>('applications');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(false);
  const [isEditPropertyOpen, setIsEditPropertyOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [previewItems, setPreviewItems] = useState<{ name?: string; url?: string; signedUrl?: string; type?: string }[]>([]);

  useEffect(() => {
    loadSellerEntries();
    loadStats();
  }, []);

  const loadSellerEntries = async () => {
    setIsLoading(true);
    try {
      const data = await getSellerOnboardingEntries(false);
      setSellerEntries(data);
    } catch (error) {
      console.error('Error loading seller onboarding entries:', error);
      toast.error('Failed to load seller entries');
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
        await loadSellerEntries();
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
        await loadSellerEntries();
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

  const filteredSellerEntries = sellerEntries.filter(entry => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (entry.firstName || '').toLowerCase().includes(q) ||
      (entry.lastName || '').toLowerCase().includes(q) ||
      (entry.propertyAddress || '').toLowerCase().includes(q) ||
      (entry.propertyType || '').toLowerCase().includes(q) ||
      String(entry.estimatedValue || '').toLowerCase().includes(q);
    // statusFilter not applicable; keep for future compatibility
    const matchesStatus = statusFilter === 'all';
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
          <p className="text-sm text-slate-600">Review and manage property submissions from Sellers</p>
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

      {/* Applications List (Populated from seller_onboarding_progress) */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Loading applications...</p>
            </div>
          ) : filteredSellerEntries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No applications found</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600 border-b">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Surname</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Property Address</th>
                    <th className="py-2 pr-4">Property Type</th>
                    <th className="py-2 pr-4">Proposed Price</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Images</th>
                    <th className="py-2 pr-4">Documents</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSellerEntries.map((entry) => (
                    <tr key={entry.id} className="border-b align-top">
                      <td className="py-3 pr-4 text-slate-900">{entry.firstName || '-'}</td>
                      <td className="py-3 pr-4 text-slate-900">{entry.lastName || '-'}</td>
                      <td className="py-3 pr-4">{entry.completedAt ? new Date(entry.completedAt).toLocaleDateString() : '-'}</td>
                      <td className="py-3 pr-4 max-w-xs truncate">{entry.propertyAddress || '-'}</td>
                      <td className="py-3 pr-4">{entry.propertyType || '-'}</td>
                      <td className="py-3 pr-4">{entry.estimatedValue ? `${entry.estimatedValue}` : '-'}</td>
                      <td className="py-3 pr-4 max-w-xs truncate" title={entry.email || ''}>{entry.email || '-'}</td>
                      <td className="py-3 pr-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPreviewTitle('Images');
                            setPreviewItems(entry.photos || []);
                            setPreviewOpen(true);
                          }}
                        >
                          View ({entry.photos?.length || 0})
                        </Button>
                      </td>
                      <td className="py-3 pr-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPreviewTitle('Documents');
                            setPreviewItems(entry.documents || []);
                            setPreviewOpen(true);
                          }}
                        >
                          View ({entry.documents?.length || 0})
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPreviewOpen(false)}>
          <div className="bg-white rounded-lg max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b p-4">
              <h4 className="text-base font-semibold text-slate-900">{previewTitle}</h4>
              <button className="text-slate-500 hover:text-slate-700" onClick={() => setPreviewOpen(false)}>×</button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
              {previewItems.length === 0 ? (
                <p className="text-sm text-slate-600">No files.</p>
              ) : (
                previewItems.map((item, idx) => (
                  <div key={idx} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium truncate max-w-[60%]">{item.name || `file-${idx+1}`}</div>
                      <div className="flex gap-2">
                        {(() => {
                          const href = item.signedUrl || item.url;
                          return (
                            <a href={href} download className="text-blue-600 text-sm hover:underline" target="_blank" rel="noreferrer">Download</a>
                          );
                        })()}
                      </div>
                    </div>
                    {/* Preview area */}
                    {item?.type?.startsWith('image/') ? (
                      <img src={item.signedUrl || item.url} alt={item.name || `image-${idx+1}`} className="w-full max-h-[400px] object-contain bg-slate-50" />
                    ) : (
                      <iframe
                        src={item.signedUrl || item.url}
                        className="w-full h-[400px] bg-slate-50"
                        title={item.name || `doc-${idx+1}`}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="border-t p-4 flex justify-end">
              <Button onClick={() => setPreviewOpen(false)} variant="outline">Close</Button>
            </div>
          </div>
        </div>
      )}

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