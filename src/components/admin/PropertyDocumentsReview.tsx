'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  MoreHorizontal,
  Home,
  MapPin,
  FileText,
  Image as ImageIcon,
  User,
  Calendar,
  Shield,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { supabase, STORAGE_BUCKETS, getPublicUrl } from '@/lib/supabase';

// Mock data structure for property submissions
interface PropertySubmission {
  id: string;
  title: string;
  location: string;
  landlordName: string;
  landlordId: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  images: string[];
  documents: {
    ownershipProof?: string[];
    saleAgreement?: string[];
    idVerification?: string[];
    propertyInspection?: string[];
    taxDocuments?: string[];
  };
  price: number;
  description: string;
  propertyType: 'residential' | 'commercial' | 'mixed';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface PropertyDocumentsReviewProps {
  submissions: PropertySubmission[];
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onViewDocument: (url: string, type: string) => void;
  onDownloadDocument: (url: string, type: string) => void;
  isLoading?: boolean;
}

const statusConfig = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle }
};

export const PropertyDocumentsReview: React.FC<PropertyDocumentsReviewProps> = ({
  submissions,
  onApprove,
  onReject,
  onViewDocument,
  onDownloadDocument,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = React.useState<PropertySubmission | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);
  const [reviewNotes, setReviewNotes] = React.useState('');
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [pendingAction, setPendingAction] = React.useState<'approve' | 'reject' | null>(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.landlordName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedSubmission) return;
    
    setPendingAction(action);
    try {
      if (action === 'approve') {
        await onApprove(selectedSubmission.id, reviewNotes);
        toast.success('Property listing approved successfully');
      } else {
        if (!rejectionReason.trim()) {
          toast.error('Please provide a reason for rejection');
          return;
        }
        await onReject(selectedSubmission.id, rejectionReason);
        toast.success('Property listing rejected');
      }
      setIsReviewDialogOpen(false);
      setReviewNotes('');
      setRejectionReason('');
      setSelectedSubmission(null);
    } catch (error) {
      toast.error('Failed to process the submission');
      console.error('Action failed:', error);
    } finally {
      setPendingAction(null);
    }
  };

  const getDocumentCount = (submission: PropertySubmission) => {
    return Object.values(submission.documents)
      .filter(docs => docs && docs.length > 0)
      .length;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStorageUrl = (bucket: keyof typeof STORAGE_BUCKETS, path: string) => {
    return getPublicUrl(STORAGE_BUCKETS[bucket], path);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Property Submissions
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Review property listings and documentation
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {submissions.filter(s => s.status === 'pending').length} Pending
            </Badge>
            <Badge variant="outline" className="text-xs">
              {submissions.filter(s => s.status === 'approved').length} Approved
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by property title, location, or landlord..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submissions Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property Details</TableHead>
                <TableHead>Landlord</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <p className="text-slate-500">No submissions found</p>
                      <p className="text-sm text-slate-400">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((submission) => {
                  const StatusIcon = statusConfig[submission.status].icon;
                  
                  return (
                    <motion.tr
                      key={submission.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-slate-50"
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{submission.title}</p>
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {submission.location}
                          </p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {getInitials(submission.landlordName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium text-slate-900">
                              {submission.landlordName}
                            </p>
                            <p className="text-slate-500">ID: {submission.landlordId}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">
                            {getDocumentCount(submission)} docs
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {submission.images.slice(0, 3).map((image, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedImage(image);
                                setIsImagePreviewOpen(true);
                              }}
                              className="relative w-8 h-8 rounded overflow-hidden hover:ring-2 ring-blue-500 transition-all"
                            >
                              <Image
                                src={image}
                                alt={`Property ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </button>
                          ))}
                          {submission.images.length > 3 && (
                            <span className="text-xs text-slate-500">
                              +{submission.images.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={`${statusConfig[submission.status].color} text-xs`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[submission.status].label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-slate-600">
                          {typeof submission.submittedAt === 'string' 
                            ? format(new Date(submission.submittedAt), 'MMM dd, yyyy')
                            : format(submission.submittedAt, 'MMM dd, yyyy')
                          }
                        </div>
                        <div className="text-xs text-slate-400">
                          {typeof submission.submittedAt === 'string'
                            ? format(new Date(submission.submittedAt), 'HH:mm')
                            : format(submission.submittedAt, 'HH:mm')
                          }
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {submission.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setIsReviewDialogOpen(true);
                                  setPendingAction('approve');
                                }}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setIsReviewDialogOpen(true);
                                  setPendingAction('reject');
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                // View all documents in a new dialog
                                onViewDocument(submission.documents.ownershipProof?.[0] || '', 'ownership');
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View All Documents
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                // Download all documents as zip
                                onDownloadDocument(submission.documents.ownershipProof?.[0] || '', 'all');
                              }}>
                                <Download className="w-4 h-4 mr-2" />
                                Download All Documents
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pendingAction === 'approve' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Approve Property Listing
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  Reject Property Listing
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedSubmission && (
                <div className="mt-2">
                  <p className="font-medium">{selectedSubmission.title}</p>
                  <p className="text-sm text-slate-500">{selectedSubmission.location}</p>
                  <p className="text-sm text-slate-500">Listed by {selectedSubmission.landlordName}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {pendingAction === 'approve' ? (
              <div>
                <label className="text-sm font-medium">Approval Notes (Optional)</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                  className="w-full mt-1 p-3 border rounded-md resize-none"
                  rows={3}
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full mt-1 p-3 border rounded-md resize-none"
                  rows={3}
                  required
                />
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReviewDialogOpen(false);
                  setReviewNotes('');
                  setRejectionReason('');
                  setSelectedSubmission(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAction(pendingAction!)}
                disabled={!pendingAction || (pendingAction === 'reject' && !rejectionReason.trim())}
                className={
                  pendingAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {pendingAction === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Property Image</DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="relative h-96 w-full">
              <Image
                src={selectedImage}
                alt="Property preview"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}; 