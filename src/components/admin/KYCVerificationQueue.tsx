'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye, 
  Search,
  Filter,
  User,
  Mail,
  Calendar,
  Camera,
  FileText,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  Download,
  RefreshCw
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@supabase/supabase-js';
import { getAllKYCVerifications } from '@/lib/kyc-services';
import type { KYCVerification, KYCVerificationWithUser } from '@/types/database';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface KYCVerificationQueueProps {
  onApproveVerification: (verificationId: string) => Promise<void>;
  onRejectVerification: (verificationId: string, reason: string) => Promise<void>;
  adminUserId: string;
}


interface QueueStats {
  total: number;
  flagged: number;
  autoApproved: number;
  pending: number;
  rejected: number;
  averageReviewTime: number;
}

export const KYCVerificationQueue: React.FC<KYCVerificationQueueProps> = ({
  onApproveVerification,
  onRejectVerification,
  adminUserId
}) => {
  const [verifications, setVerifications] = React.useState<KYCVerificationWithUser[]>([]);
  const [filteredVerifications, setFilteredVerifications] = React.useState<KYCVerificationWithUser[]>([]);
  const [stats, setStats] = React.useState<QueueStats>({
    total: 0,
    flagged: 0,
    autoApproved: 0,
    pending: 0,
    rejected: 0,
    averageReviewTime: 0
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedVerification, setSelectedVerification] = React.useState<KYCVerificationWithUser | null>(null);
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [loadingVerificationId, setLoadingVerificationId] = React.useState<string | null>(null);
  const [rejectionReasons] = React.useState([
    'Document image is too blurry or unclear',
    'ID has expired',
    'Face doesn\'t match ID photo',
    'Name on ID doesn\'t match submission',
    'Missing document side (front or back)',
    'Document is not authentic',
    'Custom reason (type your own)'
  ]);

  // Auto-refresh every 5 minutes
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing KYC verifications...');
      fetchVerifications();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(interval);
  }, []);

  // Fetch verifications from database
  const fetchVerifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the getAllKYCVerifications function from kyc-services
      const { data, error } = await getAllKYCVerifications({ status: 'all', type: 'all' });

      if (error) {
        console.error('Error fetching verifications:', error);
        setError(`Failed to fetch verifications: ${error}`);
        return;
      }

      if (!data) {
        console.log('No verification data received');
        setVerifications([]);
        setFilteredVerifications([]);
        setStats({
          total: 0,
          flagged: 0,
          autoApproved: 0,
          pending: 0,
          rejected: 0,
          averageReviewTime: 0
        });
        return;
      }

      console.log('Fetched verifications:', data.length, 'records');
      console.log('Sample verification structure:', data[0] ? {
        id: data[0].id,
        hasUser: !!data[0].user,
        userKeys: data[0].user ? Object.keys(data[0].user) : 'no user',
        hasDocuments: !!data[0].documents,
        documentsLength: data[0].documents?.length || 0,
        hasVerifiedFields: {
          verified_first_name: !!data[0].verified_first_name,
          verified_last_name: !!data[0].verified_last_name,
          verified_id_number: !!data[0].verified_id_number
        },
        allKeys: Object.keys(data[0])
      } : 'no data');
      setVerifications(data);
      setFilteredVerifications(data);
      
      // Calculate stats
      const queueStats = calculateStats(data);
      setStats(queueStats);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate queue statistics
  const calculateStats = (data: KYCVerificationWithUser[]): QueueStats => {
    const flagged = data.filter(v => 
      (v.automated_risk_score || 0) > 0.5 || 
      (v.auto_approved === false && (v.selfie_quality_score || 0) < 50)
    ).length;

    const autoApproved = data.filter(v => v.auto_approved === true && v.status === 'approved').length;
    const pending = data.filter(v => v.auto_approved === false && v.status === 'pending').length;
    const rejected = data.filter(v => v.status === 'rejected').length;

    // Calculate average review time (simplified)
    const reviewedVerifications = data.filter(v => v.reviewed_at && v.submitted_at);
    const totalReviewTime = reviewedVerifications.reduce((acc, v) => {
      const submitted = new Date(v.submitted_at);
      const reviewed = new Date(v.reviewed_at!);
      return acc + (reviewed.getTime() - submitted.getTime());
    }, 0);
    
    const averageReviewTime = reviewedVerifications.length > 0 
      ? Math.round(totalReviewTime / reviewedVerifications.length / (1000 * 60)) // minutes
      : 0;

    return {
      total: data.length,
      flagged,
      autoApproved,
      pending,
      rejected,
      averageReviewTime
    };
  };

  // Filter verifications based on search and status
  React.useEffect(() => {
    let filtered = verifications;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(v => {
        const firstName = v.user?.first_name || v.verified_first_name || '';
        const lastName = v.user?.last_name || v.verified_last_name || '';
        const email = v.user?.email || '';
        const idNumber = v.verified_id_number || '';
        
        return `${firstName} ${lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
               email.toLowerCase().includes(searchQuery.toLowerCase()) ||
               idNumber.includes(searchQuery);
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'flagged':
          filtered = filtered.filter(v => 
            (v.automated_risk_score || 0) > 0.5 || 
            (v.auto_approved === false && (v.selfie_quality_score || 0) < 50)
          );
          break;
        case 'auto-approved':
          filtered = filtered.filter(v => v.auto_approved === true && v.status === 'approved');
          break;
        case 'pending':
          filtered = filtered.filter(v => v.auto_approved === false && v.status === 'pending');
          break;
        case 'rejected':
          filtered = filtered.filter(v => v.status === 'rejected');
          break;
      }
    }

    setFilteredVerifications(filtered);
  }, [verifications, searchQuery, statusFilter]);

  // Auto-refresh every 30 seconds
  React.useEffect(() => {
    fetchVerifications();
    const interval = setInterval(fetchVerifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle approval
  const handleApprove = async (verification: KYCVerificationWithUser) => {
    try {
      setError(null);
      setLoadingVerificationId(verification.id);
      await onApproveVerification(verification.id);
      await fetchVerifications(); // Refresh data
    } catch (error) {
      console.error('Error approving verification:', error);
      setError(`Failed to approve verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingVerificationId(null);
    }
  };

  // Handle rejection
  const handleReject = async (verification: KYCVerificationWithUser, reason: string) => {
    try {
      setError(null);
      await onRejectVerification(verification.id, reason);
      await fetchVerifications(); // Refresh data
    } catch (error) {
      console.error('Error rejecting verification:', error);
      setError(`Failed to reject verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Open image modal
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Get verification queue section
  const getQueueSection = (title: string, verifications: KYCVerificationWithUser[], bgColor: string, borderColor: string) => {
    if (verifications.length === 0) return null;

    return (
      <Card className={`${bgColor} ${borderColor} border-2`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>{title}</span>
            <Badge variant="secondary" className="text-xs">
              {verifications.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {verifications.map((verification) => (
            <VerificationCard
              key={verification.id}
              verification={verification}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewImage={openImageModal}
              isLoading={loadingVerificationId === verification.id}
            />
          ))}
        </CardContent>
      </Card>
    );
  };

  // Categorize verifications
  const flaggedVerifications = filteredVerifications.filter(v => 
    (v.automated_risk_score || 0) > 0.5 || 
    (v.auto_approved === false && (v.selfie_quality_score || 0) < 50)
  );

  const autoApprovedVerifications = filteredVerifications.filter(v => 
    v.auto_approved === true && v.status === 'approved'
  );

  const pendingVerifications = filteredVerifications.filter(v => 
    v.auto_approved === false && v.status === 'pending'
  );

  const rejectedVerifications = filteredVerifications.filter(v => 
    v.status === 'rejected'
  );

  // Error boundary - show error UI if there's an error
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error Loading Verifications</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <Button
                  onClick={() => {
                    setError(null);
                    fetchVerifications();
                  }}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-6 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Flagged</p>
                <p className="text-2xl font-bold text-red-900">{stats.flagged}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Auto-Approved</p>
                <p className="text-2xl font-bold text-green-900">{stats.autoApproved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Total</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Shield className="w-8 h-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or ID number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verifications</SelectItem>
                <SelectItem value="flagged">Flagged (High Priority)</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="auto-approved">Auto-Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchVerifications}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Queue Sections */}
      <div className="space-y-6">
        {getQueueSection(
          "🚨 Flagged (High Priority - Review ASAP)",
          flaggedVerifications,
          "bg-red-50",
          "border-red-200"
        )}

        {getQueueSection(
          "⏳ Pending Review (Standard Priority)",
          pendingVerifications,
          "bg-yellow-50",
          "border-yellow-200"
        )}

        {getQueueSection(
          "✅ Auto-Approved (Completed)",
          autoApprovedVerifications,
          "bg-green-50",
          "border-green-200"
        )}

        {getQueueSection(
          "❌ Rejected",
          rejectedVerifications,
          "bg-slate-50",
          "border-slate-200"
        )}
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Document Preview</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowImageModal(false)}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4">
                <img
                  src={selectedImage}
                  alt="Document preview"
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Individual verification card component
interface VerificationCardProps {
  verification: KYCVerificationWithUser;
  onApprove: (verification: KYCVerificationWithUser) => void;
  onReject: (verification: KYCVerificationWithUser, reason: string) => void;
  onViewImage: (imageUrl: string) => void;
  isLoading?: boolean;
}

const VerificationCard: React.FC<VerificationCardProps> = ({
  verification,
  onApprove,
  onReject,
  onViewImage,
  isLoading = false
}) => {
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [selectedReason, setSelectedReason] = React.useState('');
  const [cardError, setCardError] = React.useState<string | null>(null);

  const getRiskScoreColor = (score: number) => {
    if (score <= 0.2) return 'text-green-600';
    if (score <= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskScoreBg = (score: number) => {
    if (score <= 0.2) return 'bg-green-100';
    if (score <= 0.5) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentThumbnail = async (documents: any[] | undefined, type: string) => {
    if (!documents || !Array.isArray(documents)) return null;
    const doc = documents.find(d => d.document_type === type);
    if (!doc?.file_url) return null;
    
    try {
      // Extract file path from the full URL for signed URL generation
      const url = new URL(doc.file_url);
      console.log('Original file_url:', doc.file_url);
      console.log('URL pathname:', url.pathname);
      
      // Remove the bucket prefix and get the actual file path
      // URL format: /storage/v1/object/public/kyc-documents/verification-id/filename
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.indexOf('kyc-documents');
      
      if (bucketIndex === -1) {
        console.error('Could not find kyc-documents in path:', url.pathname);
        return doc.file_url; // Fallback to original URL
      }
      
      // Get everything after 'kyc-documents/'
      const filePath = pathParts.slice(bucketIndex + 1).join('/');
      console.log('Extracted file path:', filePath);
      
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(filePath, 3600); // Valid for 1 hour
      
      if (error) {
        console.error('Error creating signed URL:', error);
        console.error('File path that failed:', filePath);
        return doc.file_url; // Fallback to original URL
      }
      
      console.log('Created signed URL successfully');
      return data.signedUrl;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      return doc.file_url; // Fallback to original URL
    }
  };

  const downloadDocument = async (documents: any[] | undefined, type: string, fileName: string) => {
    if (!documents || !Array.isArray(documents)) return;
    const doc = documents.find(d => d.document_type === type);
    if (!doc?.file_url) return;
    
    try {
      // Extract file path from the full URL for signed URL generation
      const url = new URL(doc.file_url);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.indexOf('kyc-documents');
      
      if (bucketIndex === -1) {
        console.error('Could not find kyc-documents in path:', url.pathname);
        return;
      }
      
      // Get everything after 'kyc-documents/'
      const filePath = pathParts.slice(bucketIndex + 1).join('/');
      
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(filePath, 3600); // Valid for 1 hour
      
      if (error) {
        console.error('Error creating download URL:', error);
        return;
      }
      
      // Fetch the file as a blob to force download
      const response = await fetch(data.signedUrl);
      if (!response.ok) {
        console.error('Failed to fetch file:', response.statusText);
        return;
      }
      
      const blob = await response.blob();
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  // Helper function to safely get user name with fallbacks
  const getUserDisplayName = (verification: KYCVerificationWithUser) => {
    const firstName = verification.user?.first_name || verification.verified_first_name || 'Unknown';
    const lastName = verification.user?.last_name || verification.verified_last_name || 'User';
    return `${firstName} ${lastName}`;
  };

  // Helper function to safely get user email with fallback
  const getUserEmail = (verification: KYCVerificationWithUser) => {
    return verification.email || 'No email';
  };

  // Helper function to safely get verification type
  const getVerificationType = (verification: KYCVerificationWithUser) => {
    return verification.verification_type || 'Unknown';
  };

  // Helper function to safely get status
  const getStatus = (verification: KYCVerificationWithUser) => {
    return verification.status || 'pending';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-slate-800">
                {getUserDisplayName(verification)}
              </h4>
              <Badge variant="outline" className="text-xs">
                {getVerificationType(verification)}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{getUserEmail(verification)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Submitted: {formatDate(verification.submitted_at)}</span>
              </div>
            </div>
          </div>

          {/* Risk Score Indicator */}
          {verification.automated_risk_score !== null && verification.automated_risk_score !== undefined && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskScoreBg(verification.automated_risk_score)} ${getRiskScoreColor(verification.automated_risk_score)}`}>
              Risk: {(verification.automated_risk_score * 100).toFixed(0)}%
            </div>
          )}
        </div>

        {/* Automated Check Results */}
        <div className="mb-3">
          <div className="text-xs font-medium text-slate-700 mb-2">Automated Checks:</div>
          <div className="flex flex-wrap gap-1">
            {verification.selfie_quality_score && (
              <Badge variant={verification.selfie_quality_score > 70 ? 'default' : 'destructive'} className="text-xs">
                Selfie: {verification.selfie_quality_score}%
              </Badge>
            )}
            {verification.id_front_quality_score && (
              <Badge variant={verification.id_front_quality_score > 70 ? 'default' : 'destructive'} className="text-xs">
                ID Front: {verification.id_front_quality_score}%
              </Badge>
            )}
            {verification.face_match_score && (
              <Badge variant={verification.face_match_score > 70 ? 'default' : 'destructive'} className="text-xs">
                Face Match: {verification.face_match_score}%
              </Badge>
            )}
            {verification.auto_approved && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                ✓ Auto-approved
              </Badge>
            )}
          </div>
        </div>

        {/* Document Thumbnails */}
        <div className="mb-3">
          <div className="text-xs font-medium text-slate-700 mb-2">Documents:</div>
          <div className="flex flex-wrap gap-2">
            {verification.documents && verification.documents.find(d => d.document_type === 'id_document') && (
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const signedUrl = await getDocumentThumbnail(verification.documents, 'id_document');
                    if (signedUrl) onViewImage(signedUrl);
                  }}
                  className="text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View ID
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const doc = verification.documents?.find(d => d.document_type === 'id_document');
                    const fileName = doc?.file_name || `ID_Document_${verification.id}.jpg`;
                    await downloadDocument(verification.documents, 'id_document', fileName);
                  }}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            )}
            {verification.documents && verification.documents.find(d => d.document_type === 'selfie_photo') && (
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const signedUrl = await getDocumentThumbnail(verification.documents, 'selfie_photo');
                    if (signedUrl) onViewImage(signedUrl);
                  }}
                  className="text-xs"
                >
                  <Camera className="w-3 h-3 mr-1" />
                  View Selfie
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const doc = verification.documents?.find(d => d.document_type === 'selfie_photo');
                    const fileName = doc?.file_name || `Selfie_${verification.id}.jpg`;
                    await downloadDocument(verification.documents, 'selfie_photo', fileName);
                  }}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            )}
            {(!verification.documents || verification.documents.length === 0) && (
              <span className="text-xs text-slate-500 italic">No documents available</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {getStatus(verification) === 'pending' && (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={async () => {
                try {
                  setCardError(null);
                  await onApprove(verification);
                } catch (error) {
                  console.error('Error in card approve:', error);
                  setCardError(`Failed to approve: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              }}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {/* Card Error Display */}
        {cardError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
            {cardError}
          </div>
        )}

        {getStatus(verification) === 'approved' && (
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Approved {verification.reviewed_at && formatDate(verification.reviewed_at)}</span>
          </div>
        )}

        {getStatus(verification) === 'rejected' && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <XCircle className="w-4 h-4" />
            <span>Rejected {verification.reviewed_at && formatDate(verification.reviewed_at)}</span>
          </div>
        )}
      </CardContent>

      {/* Rejection Dialog */}
      <AnimatePresence>
        {showRejectDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Reject Verification</h3>
              <p className="text-sm text-slate-600 mb-4">
                Select a reason for rejecting {getUserDisplayName(verification)}'s verification:
              </p>
              
              <div className="space-y-2 mb-4">
                {[
                  'Document image is too blurry or unclear',
                  'ID has expired',
                  'Face doesn\'t match ID photo',
                  'Name on ID doesn\'t match submission',
                  'Missing document side (front or back)',
                  'Document is not authentic'
                ].map((reason) => (
                  <label key={reason} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rejection-reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="text-red-600"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (selectedReason) {
                      try {
                        setCardError(null);
                        await onReject(verification, selectedReason);
                        setShowRejectDialog(false);
                      } catch (error) {
                        console.error('Error in card reject:', error);
                        setCardError(`Failed to reject: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      }
                    }
                  }}
                  disabled={!selectedReason}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Card>
  );
};
