'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  MoreHorizontal,
  Search,
  Filter,
  DollarSign,
  Calendar,
  User,
  Home,
  AlertCircle,
  Check,
  X,
  MessageSquare,
  CreditCard,
  TrendingUp,
  FileText,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PropertyOffer, OfferStats } from '@/types/offers';
import { 
  getPropertyOffers, 
  getOfferStats 
} from '@/lib/offer-services';
import { toast } from 'sonner';

interface OffersPageProps {
  onViewOffer?: (offerId: string) => void;
  onApproveOffer?: (offerId: string) => void;
  onRejectOffer?: (offerId: string, reason: string) => void;
  /** Admin user ID – when set, approve/reject will record admin_reviewed_by and admin_reviewed_at */
  adminUserId?: string;
}

export const OffersPage: React.FC<OffersPageProps> = ({
  onViewOffer,
  onApproveOffer,
  onRejectOffer,
  adminUserId
}) => {
  const [offers, setOffers] = useState<PropertyOffer[]>([]);
  const [invoiceStatusByOfferId, setInvoiceStatusByOfferId] = useState<
    Record<string, { hasInvoice: boolean; invoiceNumber?: string | null }>
  >({});
  const [invoiceUploadByOfferId, setInvoiceUploadByOfferId] = useState<
    Record<string, { isUploading: boolean; progress: number }>
  >({});
  const [stats, setStats] = useState<OfferStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    withdrawn: 0,
    expired: 0,
    deleted: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);

  // Load offers and stats
  useEffect(() => {
    loadOffers();
    loadStats();
  }, [statusFilter]);

  const loadOffers = async () => {
    try {
      setIsLoading(true);
      const filters = statusFilter === 'all' ? {} : { status: statusFilter };
      const data = await getPropertyOffers(filters);
      setOffers(data);

      // Fetch invoice status for gating (best-effort)
      try {
        const offerIds = (data || [])
          .map((o) => o.id)
          .filter((id): id is string => Boolean(id));
        if (offerIds.length > 0) {
          const res = await fetch('/api/admin/invoices/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ offer_ids: offerIds }),
          });
          const json = await res.json().catch(() => ({}));
          if (res.ok && json?.data) {
            const next: Record<string, { hasInvoice: boolean; invoiceNumber?: string | null }> = {};
            for (const id of offerIds) {
              const row = json.data[id];
              next[id] = {
                hasInvoice: Boolean(row?.has_invoice),
                invoiceNumber: row?.invoice_number ?? null,
              };
            }
            setInvoiceStatusByOfferId(next);
          } else {
            // If this fails, keep gating conservative (no invoice)
            setInvoiceStatusByOfferId({});
          }
        } else {
          setInvoiceStatusByOfferId({});
        }
      } catch (e) {
        console.error('Failed to fetch invoice status:', e);
        setInvoiceStatusByOfferId({});
      }
    } catch (error) {
      console.error('Error loading offers:', error);
      toast.error('Failed to load offers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getOfferStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading offer stats:', error);
    }
  };

  const handleApproveOffer = async (offerId: string) => {
    try {
      const hasInvoice = Boolean(invoiceStatusByOfferId[offerId]?.hasInvoice);
      if (!hasInvoice) {
        toast.error('Upload the invoice PDF first to enable approval.');
        return;
      }
      const res = await fetch(`/api/admin/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', admin_id: adminUserId }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        toast.success('Offer approved successfully.');
        loadOffers();
        loadStats();
        onApproveOffer?.(offerId);
      } else {
        toast.error(json.error || 'Failed to approve offer');
      }
    } catch (error) {
      console.error('Error approving offer:', error);
      toast.error('Failed to approve offer');
    }
  };

  const handleUploadInvoice = async (offerId: string) => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'application/pdf';

      fileInput.onchange = async () => {
        const file = fileInput.files?.[0];
        if (!file) return;

        const invoiceNumber = window.prompt('Enter the invoice number as shown on the PDF:');
        if (!invoiceNumber) {
          toast.info('Invoice upload cancelled (invoice number is required).');
          return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('offer_id', offerId);
        formData.append('invoice_number', invoiceNumber);

        try {
          setInvoiceUploadByOfferId((prev) => ({
            ...prev,
            [offerId]: { isUploading: true, progress: 0 },
          }));

          const toastId = toast.loading('Uploading invoice…');

          // Use XHR to get upload progress events.
          const json: any = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/admin/invoices/upload');
            xhr.responseType = 'json';

            xhr.upload.onprogress = (evt) => {
              if (!evt.lengthComputable) return;
              const pct = Math.max(0, Math.min(100, Math.round((evt.loaded / evt.total) * 100)));
              setInvoiceUploadByOfferId((prev) => ({
                ...prev,
                [offerId]: { isUploading: true, progress: pct },
              }));
            };

            xhr.onload = () => {
              const resJson = xhr.response ?? (() => {
                try {
                  return JSON.parse(xhr.responseText);
                } catch {
                  return {};
                }
              })();
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(resJson);
              } else {
                reject(resJson);
              }
            };

            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send(formData);
          });

          if (json?.success) {
            setInvoiceUploadByOfferId((prev) => ({
              ...prev,
              [offerId]: { isUploading: false, progress: 100 },
            }));
            toast.success(`Invoice ${json.data?.invoice_number || invoiceNumber} uploaded successfully.`, {
              id: toastId,
            });
            setInvoiceStatusByOfferId((prev) => ({
              ...prev,
              [offerId]: { hasInvoice: true, invoiceNumber: json?.data?.invoice_number ?? invoiceNumber },
            }));
            await loadOffers();
            // Reset progress UI after a short delay
            setTimeout(() => {
              setInvoiceUploadByOfferId((prev) => {
                const next = { ...prev };
                delete next[offerId];
                return next;
              });
            }, 1200);
          } else {
            toast.error(json?.error || 'Failed to upload invoice.', { id: toastId });
            setInvoiceUploadByOfferId((prev) => ({
              ...prev,
              [offerId]: { isUploading: false, progress: 0 },
            }));
          }
        } catch (error) {
          console.error('Error uploading invoice:', error);
          toast.error('Failed to upload invoice.');
          setInvoiceUploadByOfferId((prev) => ({
            ...prev,
            [offerId]: { isUploading: false, progress: 0 },
          }));
        }
      };

      fileInput.click();
    } catch (error) {
      console.error('Error starting invoice upload:', error);
      toast.error('Failed to start invoice upload.');
    }
  };

  const handleDeleteInvoice = async (offerId: string) => {
    const hasInvoice = Boolean(invoiceStatusByOfferId[offerId]?.hasInvoice);
    if (!hasInvoice) {
      toast.info('No uploaded invoice found for this offer.');
      return;
    }

    const confirmed = window.confirm('Delete the uploaded invoice for this offer? You can upload a new one afterwards.');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/invoices/upload?offer_id=${encodeURIComponent(offerId)}`, {
        method: 'DELETE',
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success) {
        toast.success('Invoice removed. You can upload a new one.');
        setInvoiceStatusByOfferId((prev) => ({
          ...prev,
          [offerId]: { hasInvoice: false, invoiceNumber: null },
        }));
        await loadOffers();
      } else {
        toast.error(json?.error || 'Failed to delete invoice.');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice.');
    }
  };

  const handleViewInvoice = async (offerId: string) => {
    try {
      const res = await fetch(`/api/invoice/view?offer_id=${encodeURIComponent(offerId)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.url) {
        toast.error(json?.error || 'Failed to open invoice.');
        return;
      }
      window.open(json.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening invoice:', error);
      toast.error('Failed to open invoice.');
    }
  };

  const handleRejectOffer = async (offerId: string, reason: string) => {
    try {
      const res = await fetch(`/api/admin/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejection_reason: reason, admin_id: adminUserId }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        toast.success('Offer rejected successfully');
        loadOffers();
        loadStats();
        onRejectOffer?.(offerId, reason);
      } else {
        toast.error(json.error || 'Failed to reject offer');
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast.error('Failed to reject offer');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-orange-100 text-orange-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      withdrawn: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      expired: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = searchQuery === '' || 
      offer.property?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.buyer?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.buyer?.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.buyer?.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const StatCard: React.FC<{
    title: string;
    value: number;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = ({ title, value, color, icon: Icon }) => (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Property Offers</h2>
          <p className="text-sm text-gray-600">Manage and review property offers from buyers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadOffers}
            disabled={isLoading}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Offers"
          value={stats.total}
          color="bg-blue-500"
          icon={DollarSign}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          color="bg-orange-500"
          icon={Clock}
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          color="bg-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          color="bg-red-500"
          icon={XCircle}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search offers by property, buyer name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offers List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading offers...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No offers match your current filters.' 
                  : 'No property offers have been submitted yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOffers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Offer Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {offer.property?.title || 'Property Not Found'}
                            </h3>
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                              {offer.offer_reference}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {(offer.property?.location?.suburb ? `${offer.property.location.suburb}, ` : '')}{offer.property?.location?.city || 'Unknown City'}, {offer.property?.location?.country || 'Unknown Country'}
                          </p>
                        </div>
                        {getStatusBadge(offer.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Offer Price</p>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(offer.offer_price, offer.property?.currency)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Deposit</p>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(offer.deposit_amount, offer.property?.currency)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Timeline</p>
                            <p className="font-semibold text-gray-900">
                              {offer.estimated_timeline === 'ready_to_pay_in_full' 
                                ? 'Ready to pay in full' 
                                : `${offer.estimated_timeline.replace('_months', '')} months`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Buyer</p>
                          <p className="font-medium text-gray-900">
                            {offer.buyer?.first_name} {offer.buyer?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{offer.buyer?.email}</p>
                        </div>
                      </div>

                      {offer.additional_notes && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Notes</p>
                            <p className="text-sm text-gray-700">{offer.additional_notes}</p>
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Submitted: {formatDate(offer.submitted_at)}
                        {offer.expires_at && (
                          <span className="ml-4">
                            Expires: {formatDate(offer.expires_at)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:min-w-[200px]">
                      {offer.status === 'pending' && (
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUploadInvoice(offer.id)}
                            disabled={invoiceUploadByOfferId[offer.id]?.isUploading}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {invoiceUploadByOfferId[offer.id]?.isUploading
                              ? `Uploading… ${invoiceUploadByOfferId[offer.id]?.progress ?? 0}%`
                              : invoiceStatusByOfferId[offer.id]?.hasInvoice
                                ? 'Replace Invoice PDF'
                                : 'Upload Invoice PDF'}
                          </Button>
                          {invoiceStatusByOfferId[offer.id]?.hasInvoice ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-700 border-red-200 hover:bg-red-50"
                              onClick={() => handleDeleteInvoice(offer.id)}
                              disabled={invoiceUploadByOfferId[offer.id]?.isUploading}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Invoice
                            </Button>
                          ) : null}
                          {invoiceUploadByOfferId[offer.id]?.isUploading ? (
                            <div className="w-full">
                              <div className="h-2 w-full rounded bg-gray-100 overflow-hidden">
                                <div
                                  className="h-2 bg-blue-600 transition-[width] duration-150"
                                  style={{
                                    width: `${invoiceUploadByOfferId[offer.id]?.progress ?? 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ) : null}
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveOffer(offer.id)}
                            disabled={!invoiceStatusByOfferId[offer.id]?.hasInvoice}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          {!invoiceStatusByOfferId[offer.id]?.hasInvoice ? (
                            <p className="text-xs text-amber-700 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Upload invoice first to enable approval.
                            </p>
                          ) : (
                            <p className="text-xs text-green-700 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Invoice uploaded{invoiceStatusByOfferId[offer.id]?.invoiceNumber ? ` (${invoiceStatusByOfferId[offer.id]?.invoiceNumber})` : ''}.
                            </p>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) {
                                handleRejectOffer(offer.id, reason);
                              }
                            }}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {offer.status === 'approved' && (
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUploadInvoice(offer.id)}
                            disabled={invoiceUploadByOfferId[offer.id]?.isUploading}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {invoiceUploadByOfferId[offer.id]?.isUploading
                              ? `Uploading… ${invoiceUploadByOfferId[offer.id]?.progress ?? 0}%`
                              : invoiceStatusByOfferId[offer.id]?.hasInvoice
                                ? 'Replace Invoice PDF'
                                : 'Upload Invoice PDF'}
                          </Button>
                          {invoiceStatusByOfferId[offer.id]?.hasInvoice ? (
                            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2">
                              <p className="text-xs text-green-800 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Invoice uploaded
                                {invoiceStatusByOfferId[offer.id]?.invoiceNumber
                                  ? ` (${invoiceStatusByOfferId[offer.id]?.invoiceNumber})`
                                  : ''}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewInvoice(offer.id)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-700 border-red-200 hover:bg-red-50"
                                  onClick={() => handleDeleteInvoice(offer.id)}
                                  disabled={invoiceUploadByOfferId[offer.id]?.isUploading}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
