'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Plus,
  Home,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyDocumentsReview } from './PropertyDocumentsReview';
import { AdminListingModal } from './AdminListingModal';
import type { AdminListing } from '@/types/admin';
import { PropertyListing } from '@/types/property';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ListingsPageProps {
  listings: AdminListing[];
  onViewListing?: (listingId: string) => void;
  onApproveListing?: (listingId: string) => void;
  onRejectListing?: (listingId: string, reason: string) => void;
  onBulkAction?: (action: 'approve' | 'reject', listingIds: string[]) => void;
  onAddToListings?: (propertyListing: PropertyListing) => void;
}

export const ListingsPage: React.FC<ListingsPageProps> = ({
  listings,
  onViewListing,
  onApproveListing,
  onRejectListing,
  onBulkAction,
  onAddToListings
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedListings, setSelectedListings] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState('listings');
  const [isAddListingModalOpen, setIsAddListingModalOpen] = React.useState(false);
  const [selectedListingForAdd, setSelectedListingForAdd] = React.useState<AdminListing | undefined>();

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingListings = listings.filter(l => l.status === 'pending');
  const approvedListings = listings.filter(l => l.status === 'approved');
  const rejectedListings = listings.filter(l => l.status === 'rejected');

  const getStatusColor = (status: AdminListing['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: AdminListing['type']) => {
    switch (type) {
      case 'residential':
        return 'bg-blue-100 text-blue-700';
      case 'commercial':
        return 'bg-purple-100 text-purple-700';
      case 'mixed':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map(l => l.id));
    }
  };

  const handleSelectListing = (listingId: string) => {
    setSelectedListings(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleAddListing = (listing?: AdminListing) => {
    setSelectedListingForAdd(listing);
    setIsAddListingModalOpen(true);
  };

  const handleAddToListingsComplete = (propertyListing: PropertyListing) => {
    onAddToListings?.(propertyListing);
    setIsAddListingModalOpen(false);
    setSelectedListingForAdd(undefined);
    toast.success('Property added to listings successfully!');
  };

  const handleBulkApprove = () => {
    if (selectedListings.length > 0 && onBulkAction) {
      onBulkAction('approve', selectedListings);
      setSelectedListings([]);
    }
  };

  const handleBulkReject = () => {
    if (selectedListings.length > 0 && onBulkAction) {
      onBulkAction('reject', selectedListings);
      setSelectedListings([]);
    }
  };

  // Update the mock data section to use proper date strings
  const mockListings: AdminListing[] = [
    {
      id: '1',
      propertyId: 'prop_1',
      propertyTitle: 'Modern 3-Bedroom House',
      sellerId: 'seller_1',
      sellerName: 'John Smith',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      price: 250000,
      monthlyRental: 1200,
      rentToBuy: true,
      location: 'Harare, Zimbabwe',
      type: 'residential',
      bedrooms: 3,
      bathrooms: 2,
      size: 150
    },
    {
      id: '2',
      propertyId: 'prop_2',
      propertyTitle: 'Luxury Apartment',
      sellerId: 'seller_2',
      sellerName: 'Sarah Wilson',
      status: 'approved',
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
      price: 180000,
      rentToBuy: false,
      location: 'Johannesburg, SA',
      type: 'residential',
      bedrooms: 2,
      bathrooms: 1,
      size: 80
    }
  ];

  // Update the date formatting in the component
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '--:--';
    }
  };

  const handleApproveSubmission = async (id: string, notes?: string) => {
    try {
      if (onApproveListing) {
        await onApproveListing(id);
        toast.success('Property submission approved');
      }
    } catch (error) {
      toast.error('Failed to approve property submission');
      console.error('Error approving submission:', error);
    }
  };

  const handleRejectSubmission = async (id: string, reason: string) => {
    try {
      if (onRejectListing) {
        await onRejectListing(id, reason);
        toast.success('Property submission rejected');
      }
    } catch (error) {
      toast.error('Failed to reject property submission');
      console.error('Error rejecting submission:', error);
    }
  };

  const handleViewDocument = (url: string, type: string) => {
    // In a real app, this would open the document in a viewer or new tab
    console.log('Viewing document:', { url, type });
    window.open(url, '_blank');
  };

  const handleDownloadDocument = (url: string, type: string) => {
    // In a real app, this would trigger a document download
    console.log('Downloading document:', { url, type });
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add the transformation function
  const transformToPropertySubmission = (listing: AdminListing) => ({
    id: listing.id,
    title: listing.propertyTitle,
    location: listing.location,
    landlordName: listing.sellerName,
    landlordId: listing.sellerId,
    submittedAt: listing.submittedAt,
    status: listing.status,
    images: listing.images || [],
    documents: {
      ownershipProof: [`/mock/properties/${listing.id}/ownership.pdf`],
      saleAgreement: [`/mock/properties/${listing.id}/agreement.pdf`],
      idVerification: [`/mock/users/${listing.sellerId}/id.pdf`],
      propertyInspection: [`/mock/properties/${listing.id}/inspection.pdf`],
      taxDocuments: [`/mock/properties/${listing.id}/tax.pdf`]
    },
    price: listing.price,
    description: listing.description || '',
    propertyType: listing.type,
    reviewNotes: listing.notes,
    reviewedBy: listing.reviewedBy,
    reviewedAt: listing.reviewedAt
  });

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingListings.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedListings.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedListings.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Property Listings
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="listings">All Listings</TabsTrigger>
              <TabsTrigger value="documents">Document Review</TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Property Listings</h2>
                  <p className="text-slate-600">Manage and review property submissions</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" suppressHydrationWarning>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    onClick={() => handleAddListing()}
                    suppressHydrationWarning
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Listing
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Total Listings</p>
                        <p className="text-2xl font-bold text-slate-900">{listings.length}</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Pending Review</p>
                        <p className="text-2xl font-bold text-yellow-600">{pendingListings.length}</p>
                      </div>
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Approved</p>
                        <p className="text-2xl font-bold text-green-600">{approvedListings.length}</p>
                      </div>
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">{rejectedListings.length}</p>
                      </div>
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Search */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search listings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                        className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <Button variant="outline" size="sm" suppressHydrationWarning>
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedListings.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 mt-4 p-3 bg-blue-50 rounded-lg"
                    >
                      <span className="text-sm text-blue-700">
                        {selectedListings.length} listing(s) selected
                      </span>
                      <Button
                        size="sm"
                        onClick={handleBulkApprove}
                        className="bg-green-600 hover:bg-green-700"
                        suppressHydrationWarning
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkReject}
                        className="border-red-300 text-red-700"
                        suppressHydrationWarning
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject All
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Listings Table */}
              <div className="space-y-4">
                {filteredListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors ${
                      selectedListings.includes(listing.id) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedListings.includes(listing.id)}
                        onChange={() => handleSelectListing(listing.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <h3 className="font-medium text-slate-900">{listing.propertyTitle}</h3>
                        <p className="text-sm text-slate-600">{listing.location}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(listing.status)}>
                            {listing.status}
                          </Badge>
                          <Badge className={getTypeColor(listing.type)}>
                            {listing.type}
                          </Badge>
                          {listing.rentToBuy && (
                            <Badge className="bg-green-100 text-green-700">
                              Rent-to-Buy
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-medium text-slate-900">
                          ${listing.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">{listing.submittedAt}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {onViewListing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewListing(listing.id)}
                            className="h-8 w-8 p-0"
                            suppressHydrationWarning
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {listing.status === 'pending' && onApproveListing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onApproveListing(listing.id)}
                            className="h-8 w-8 p-0 text-green-600"
                            suppressHydrationWarning
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {listing.status === 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddListing(listing)}
                            className="h-8 w-8 p-0 text-blue-600"
                            suppressHydrationWarning
                            title="Add to Listings"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                        {listing.status === 'pending' && onRejectListing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRejectListing(listing.id, 'Rejected by admin')}
                            className="h-8 w-8 p-0 text-red-600"
                            suppressHydrationWarning
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          suppressHydrationWarning
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {filteredListings.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No listings found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents">
              <PropertyDocumentsReview
                submissions={listings.map(transformToPropertySubmission)}
                onApprove={handleApproveSubmission}
                onReject={handleRejectSubmission}
                onViewDocument={handleViewDocument}
                onDownloadDocument={handleDownloadDocument}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Admin Listing Modal */}
      <AdminListingModal
        isOpen={isAddListingModalOpen}
        onClose={() => setIsAddListingModalOpen(false)}
        onComplete={handleAddToListingsComplete}
        adminListing={selectedListingForAdd}
        country="ZW"
      />
    </div>
  );
}; 