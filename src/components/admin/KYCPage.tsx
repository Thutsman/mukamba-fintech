'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MoreHorizontal,
  Search,
  Filter,
  Download,
  FileText,
  User,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { KYCVerification } from '@/types/admin';

interface KYCPageProps {
  verifications: KYCVerification[];
  onViewVerification?: (verificationId: string) => void;
  onApproveVerification?: (verificationId: string) => void;
  onRejectVerification?: (verificationId: string, reason: string) => void;
  onBulkAction?: (action: 'approve' | 'reject', verificationIds: string[]) => void;
}

export const KYCPage: React.FC<KYCPageProps> = ({
  verifications,
  onViewVerification,
  onApproveVerification,
  onRejectVerification,
  onBulkAction
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = React.useState<'all' | 'identity' | 'financial' | 'address' | 'employment' | 'comprehensive' | 'buyer' | 'seller'>('all');
  const [selectedVerifications, setSelectedVerifications] = React.useState<string[]>([]);

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = verification.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         verification.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || verification.status === statusFilter;
    const matchesType = typeFilter === 'all' || verification.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingVerifications = verifications.filter(v => v.status === 'pending');
  const approvedVerifications = verifications.filter(v => v.status === 'approved');
  const rejectedVerifications = verifications.filter(v => v.status === 'rejected');
  const buyerVerifications = verifications.filter(v => v.type === 'buyer');
  const sellerVerifications = verifications.filter(v => v.type === 'seller');

  const getStatusColor = (status: KYCVerification['status']) => {
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

  const getTypeColor = (type: KYCVerification['type']) => {
    switch (type) {
      case 'buyer':
        return 'bg-blue-100 text-blue-700';
      case 'seller':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDocumentCount = (verification: KYCVerification) => {
    const docs = verification.documents;
    return Object.values(docs).filter(doc => doc).length;
  };

  const handleSelectAll = () => {
    if (selectedVerifications.length === filteredVerifications.length) {
      setSelectedVerifications([]);
    } else {
      setSelectedVerifications(filteredVerifications.map(v => v.id));
    }
  };

  const handleSelectVerification = (verificationId: string) => {
    setSelectedVerifications(prev => 
      prev.includes(verificationId) 
        ? prev.filter(id => id !== verificationId)
        : [...prev, verificationId]
    );
  };

  const handleBulkApprove = () => {
    if (selectedVerifications.length > 0 && onBulkAction) {
      onBulkAction('approve', selectedVerifications);
      setSelectedVerifications([]);
    }
  };

  const handleBulkReject = () => {
    if (selectedVerifications.length > 0 && onBulkAction) {
      onBulkAction('reject', selectedVerifications);
      setSelectedVerifications([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">KYC Verifications</h2>
          <p className="text-slate-600">Review and approve identity verifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" suppressHydrationWarning>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Verifications</p>
                <p className="text-2xl font-bold text-slate-900">{verifications.length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingVerifications.length}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedVerifications.length}</p>
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
                <p className="text-sm text-slate-600">Buyers</p>
                <p className="text-2xl font-bold text-blue-600">{buyerVerifications.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Sellers</p>
                <p className="text-2xl font-bold text-purple-600">{sellerVerifications.length}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Building className="w-4 h-4 text-purple-600" />
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
                placeholder="Search verifications..."
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
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'identity' | 'financial' | 'address' | 'employment' | 'comprehensive' | 'buyer' | 'seller')}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="identity">Identity</option>
                <option value="financial">Financial</option>
                <option value="address">Address</option>
                <option value="employment">Employment</option>
                <option value="comprehensive">Comprehensive</option>
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers</option>
              </select>
              <Button variant="outline" size="sm" suppressHydrationWarning>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedVerifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3 mt-4 p-3 bg-blue-50 rounded-lg"
            >
              <span className="text-sm text-blue-700">
                {selectedVerifications.length} verification(s) selected
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

      {/* Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVerifications.map((verification, index) => (
              <motion.div
                key={verification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors ${
                  selectedVerifications.includes(verification.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedVerifications.includes(verification.id)}
                    onChange={() => handleSelectVerification(verification.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <h3 className="font-medium text-slate-900">{verification.userName}</h3>
                    <p className="text-sm text-slate-600">{verification.userEmail}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(verification.status)}>
                        {verification.status}
                      </Badge>
                      <Badge className={getTypeColor(verification.type)}>
                        {verification.type}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-700">
                        <FileText className="w-3 h-3 mr-1" />
                        {getDocumentCount(verification)} docs
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{verification.submittedAt}</p>
                    {verification.reviewedAt && (
                      <p className="text-xs text-slate-500">Reviewed: {verification.reviewedAt}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {onViewVerification && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewVerification(verification.id)}
                        className="h-8 w-8 p-0"
                        suppressHydrationWarning
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {verification.status === 'pending' && onApproveVerification && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApproveVerification(verification.id)}
                        className="h-8 w-8 p-0 text-green-600"
                        suppressHydrationWarning
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {verification.status === 'pending' && onRejectVerification && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRejectVerification(verification.id, 'Rejected by admin')}
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
          
          {filteredVerifications.length === 0 && (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No verifications found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 