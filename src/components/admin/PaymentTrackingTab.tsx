'use client';

import * as React from 'react';
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  ArrowDownToLine,
  Download,
  Filter,
  Users,
  Clock,
  Info,
  ExternalLink,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface EnrichedPayment {
  id: string;
  offer_id: string;
  buyer_id: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_id: string | null;
  payment_reference: string | null;
  gateway_response: any;
  created_at: string;
  updated_at: string;
  offer: {
    id: string;
    offer_reference: string;
    offer_price: number;
    deposit_amount: number;
    payment_method: string;
    status: string;
  } | null;
  property: {
    id: string;
    title: string;
    price: number;
    currency: string;
    city: string;
    country: string;
  } | null;
  buyer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  } | null;
  seller: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  invoice: {
    id: string;
    invoice_number: string;
    status: string;
    total: number;
    amount_due: number;
  } | null;
}

interface PaymentStats {
  pendingCount: number;
  completedThisMonth: number;
  failedCount: number;
  totalCompleted: number;
  buyersNearCompletion: number;
}

interface BuyerProgressItem {
  offerId: string;
  buyerName: string;
  propertyTitle: string;
  offerPrice: number;
  totalPaid: number;
  lastPaymentDate: string | null;
  paymentCount: number;
}

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'all';

// ─── Helpers ────────────────────────────────────────────────────────────────────

const currency = (n: number, cur = 'USD') => {
  const symbol = cur === 'ZAR' ? 'R' : '$';
  return `${symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '-';
  }
};

const getProofUrl = (payment: EnrichedPayment): string | null => {
  if (!payment.gateway_response) return null;
  return payment.gateway_response.proof_url || null;
};

const getMethodLabel = (method: string) => {
  switch (method) {
    case 'bank_transfer': return 'Bank Transfer';
    case 'ecocash': return 'EcoCash';
    case 'card': return 'Card';
    default: return method?.replace(/_/g, ' ') || '-';
  }
};

// ─── Component ──────────────────────────────────────────────────────────────────

export const PaymentTrackingTab: React.FC = () => {
  const [payments, setPayments] = React.useState<EnrichedPayment[]>([]);
  const [stats, setStats] = React.useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingStats, setIsLoadingStats] = React.useState(true);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = React.useState<PaymentStatus>('all');
  const [search, setSearch] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  // Reject modal state
  const [rejectPaymentId, setRejectPaymentId] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState('');

  // View proof: fetch signed URL (bucket is private) then open
  const [viewProofLoadingUrl, setViewProofLoadingUrl] = React.useState<string | null>(null);
  // Download proof: separate loading so only Download button shows spinner
  const [downloadProofLoadingUrl, setDownloadProofLoadingUrl] = React.useState<string | null>(null);

  // ─── Data fetching ──────────────────────────────────────────────────────

  const fetchPayments = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('q', search);
      if (startDate) params.set('dateFrom', startDate);
      if (endDate) params.set('dateTo', endDate);

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.data) {
        setPayments(json.data);
      } else {
        console.error('Failed to fetch payments:', json.error);
        toast.error('Failed to load payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search, startDate, endDate]);

  const fetchStats = React.useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const res = await fetch('/api/admin/payments/stats');
      const json = await res.json();
      if (res.ok && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [fetchPayments, fetchStats]);

  // Debounce search
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      // fetchPayments will be triggered by the search state change via useCallback deps
    }, 300);
  };

  // ─── Actions ────────────────────────────────────────────────────────────

  const handleVerify = async (paymentId: string) => {
    try {
      setActionLoadingId(paymentId);
      const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: 'admin' }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Payment verified successfully');
        await fetchPayments();
        await fetchStats();
      } else {
        toast.error(json.error || 'Failed to verify payment');
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      toast.error('Failed to verify payment');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectPaymentId) return;
    try {
      setActionLoadingId(rejectPaymentId);
      const res = await fetch(`/api/admin/payments/${rejectPaymentId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: 'admin',
          reason: rejectReason || 'Payment proof rejected',
        }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Payment rejected');
        setRejectPaymentId(null);
        setRejectReason('');
        await fetchPayments();
        await fetchStats();
      } else {
        toast.error(json.error || 'Failed to reject payment');
      }
    } catch (err) {
      console.error('Error rejecting payment:', err);
      toast.error('Failed to reject payment');
    } finally {
      setActionLoadingId(null);
    }
  };

  const fetchSignedProofUrl = async (storedProofUrl: string) => {
    const res = await fetch(
      `/api/admin/payments/signed-proof-url?url=${encodeURIComponent(storedProofUrl)}`
    );
    const json = await res.json();

    if (!res.ok || !json.url) {
      throw new Error(json.error || 'Failed to create signed URL');
    }

    return json.url as string;
  };

  const handleViewProof = async (storedProofUrl: string) => {
    try {
      setViewProofLoadingUrl(storedProofUrl);
      const signedUrl = await fetchSignedProofUrl(storedProofUrl);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error opening proof:', err);
      toast.error('Failed to open proof of payment');
    } finally {
      setViewProofLoadingUrl(null);
    }
  };

  const handleDownloadProof = async (storedProofUrl: string) => {
    try {
      setDownloadProofLoadingUrl(storedProofUrl);
      const apiUrl = `/api/admin/payments/download-proof?url=${encodeURIComponent(storedProofUrl)}`;
      const res = await fetch(apiUrl);

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Download failed');
      }

      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition');
      const match = disposition?.match(/filename="?([^";]+)"?/);
      const filename = match ? match[1].trim() : 'proof-of-payment';

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Download started');
    } catch (err) {
      console.error('Error downloading proof:', err);
      toast.error('Failed to download proof of payment');
    } finally {
      setDownloadProofLoadingUrl(null);
    }
  };

  // ─── Derived data ───────────────────────────────────────────────────────

  const pendingPayments = React.useMemo(
    () => payments.filter((p) => p.status === 'pending'),
    [payments]
  );

  // Build buyer progress: group completed payments by offer
  const buyerProgress = React.useMemo<BuyerProgressItem[]>(() => {
    const offerMap = new Map<string, BuyerProgressItem>();

    payments.forEach((p) => {
      if (!p.offer_id || !p.offer) return;

      if (!offerMap.has(p.offer_id)) {
        offerMap.set(p.offer_id, {
          offerId: p.offer_id,
          buyerName: p.buyer
            ? `${p.buyer.first_name} ${p.buyer.last_name}`
            : 'Unknown',
          propertyTitle: p.property?.title || 'Unknown Property',
          offerPrice: p.offer.offer_price || 0,
          totalPaid: 0,
          lastPaymentDate: null,
          paymentCount: 0,
        });
      }

      const entry = offerMap.get(p.offer_id)!;
      if (p.status === 'completed') {
        entry.totalPaid += p.amount || 0;
        entry.paymentCount++;
        if (
          !entry.lastPaymentDate ||
          new Date(p.updated_at) > new Date(entry.lastPaymentDate)
        ) {
          entry.lastPaymentDate = p.updated_at;
        }
      }
    });

    return Array.from(offerMap.values()).sort(
      (a, b) => (b.totalPaid / (b.offerPrice || 1)) - (a.totalPaid / (a.offerPrice || 1))
    );
  }, [payments]);

  // ─── Status badge ──────────────────────────────────────────────────────

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'cancelled':
        return <Badge className="bg-slate-100 text-slate-700">Cancelled</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700">{status}</Badge>;
    }
  };

  // ─── Export (placeholder) ─────────────────────────────────────────────

  const exportCSV = () => {
    if (payments.length === 0) {
      toast.info('No payments to export');
      return;
    }

    const headers = ['Date', 'Buyer', 'Property', 'Amount', 'Method', 'Status', 'Offer Ref'];
    const rows = payments.map((p) => [
      formatDate(p.created_at),
      p.buyer ? `${p.buyer.first_name} ${p.buyer.last_name}` : '-',
      p.property?.title || '-',
      p.amount,
      getMethodLabel(p.payment_method),
      p.status,
      p.offer?.offer_reference || '-',
    ]);

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Reject Confirmation Modal */}
      {rejectPaymentId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Reject Payment Proof</h3>
            <p className="text-sm text-slate-600 mb-4">
              This will notify the buyer that their proof was rejected and they need to resubmit.
            </p>
            <textarea
              className="w-full h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setRejectPaymentId(null);
                  setRejectReason('');
                }}
                disabled={!!actionLoadingId}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleReject}
                disabled={!!actionLoadingId}
              >
                {actionLoadingId === rejectPaymentId ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Top: Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Verified This Month</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {isLoadingStats ? '...' : currency(stats?.completedThisMonth ?? 0)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Pending Proofs</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {isLoadingStats ? '...' : stats?.pendingCount ?? 0}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Failed / Rejected</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {isLoadingStats ? '...' : stats?.failedCount ?? 0}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Buyers Near Completion</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {isLoadingStats ? '...' : stats?.buyersNearCompletion ?? 0}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Export */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">Search</label>
                <input
                  className="h-9 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Buyer, seller, property, ref..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">Status</label>
                <select
                  className="h-9 rounded-md border border-slate-200 px-3 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PaymentStatus)}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Verified</option>
                  <option value="failed">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">Start Date</label>
                <input
                  type="date"
                  className="h-9 rounded-md border border-slate-200 px-3 text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">End Date</label>
                <input
                  type="date"
                  className="h-9 rounded-md border border-slate-200 px-3 text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-9"
                onClick={() => {
                  fetchPayments();
                  fetchStats();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" className="h-9" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Middle: Ledger + Right Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Payment Ledger
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  <span className="ml-3 text-slate-500">Loading payments...</span>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No payments found</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Payments will appear here when buyers submit proof of payment.
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Offer / Invoice</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((p) => {
                        const proofUrl = getProofUrl(p);
                        const isActionLoading = actionLoadingId === p.id;
                        return (
                          <TableRow
                            key={p.id}
                            className={
                              p.status === 'failed'
                                ? 'bg-red-50/50'
                                : p.status === 'pending'
                                ? 'bg-amber-50/30'
                                : ''
                            }
                          >
                            <TableCell className="min-w-[140px]">
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-800">
                                  {p.buyer
                                    ? `${p.buyer.first_name} ${p.buyer.last_name}`
                                    : 'Unknown'}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {p.buyer?.email || '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[180px]">
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-800">
                                  {p.property?.title || '-'}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {p.property
                                    ? `${p.property.city || ''}, ${p.property.country || ''}`
                                    : '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[130px]">
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-700">
                                  {p.offer?.offer_reference || '-'}
                                </span>
                                {p.invoice && (
                                  <span className="text-xs text-blue-600">
                                    {p.invoice.invoice_number}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(p.created_at)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {currency(p.amount, p.currency)}
                            </TableCell>
                            <TableCell className="text-sm capitalize">
                              {getMethodLabel(p.payment_method)}
                            </TableCell>
                            <TableCell>{statusBadge(p.status)}</TableCell>
                            <TableCell className="min-w-[220px]">
                              <div className="flex items-center gap-1.5">
                                {proofUrl && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs"
                                      onClick={() => handleViewProof(proofUrl)}
                                      disabled={viewProofLoadingUrl === proofUrl}
                                      title="View proof of payment"
                                    >
                                      {viewProofLoadingUrl === proofUrl ? (
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      ) : (
                                        <Eye className="w-3 h-3 mr-1" />
                                      )}
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs"
                                      onClick={() => handleDownloadProof(proofUrl)}
                                      disabled={downloadProofLoadingUrl === proofUrl}
                                      title="Download proof of payment"
                                    >
                                      {downloadProofLoadingUrl === proofUrl ? (
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      ) : (
                                        <Download className="w-3 h-3 mr-1" />
                                      )}
                                      Download
                                    </Button>
                                  </>
                                )}
                                {p.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                      onClick={() => handleVerify(p.id)}
                                      disabled={isActionLoading}
                                      title="Verify payment"
                                    >
                                      {isActionLoading ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <>
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Verify
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 border-red-200"
                                      onClick={() => setRejectPaymentId(p.id)}
                                      disabled={isActionLoading}
                                      title="Reject payment"
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Proofs Awaiting Verification */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" /> Awaiting Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : pendingPayments.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">All caught up!</p>
                  <p className="text-xs text-slate-400">No proofs awaiting verification.</p>
                </div>
              ) : (
                pendingPayments.slice(0, 5).map((p) => {
                  const proofUrl = getProofUrl(p);
                  return (
                    <div
                      key={p.id}
                      className="border border-amber-200 bg-amber-50/50 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 text-sm truncate">
                            {p.buyer
                              ? `${p.buyer.first_name} ${p.buyer.last_name}`
                              : 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {p.property?.title || '-'}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {formatDate(p.created_at)}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-slate-900 text-sm">
                            {currency(p.amount, p.currency)}
                          </div>
                          <div className="text-xs text-slate-500 capitalize">
                            {getMethodLabel(p.payment_method)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                        {proofUrl && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2"
                              onClick={() => handleViewProof(proofUrl)}
                              disabled={viewProofLoadingUrl === proofUrl}
                            >
                              {viewProofLoadingUrl === proofUrl ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <ExternalLink className="w-3 h-3 mr-1" />
                              )}
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2"
                              onClick={() => handleDownloadProof(proofUrl)}
                              disabled={downloadProofLoadingUrl === proofUrl}
                            >
                              {downloadProofLoadingUrl === proofUrl ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Download className="w-3 h-3 mr-1" />
                              )}
                              Download
                            </Button>
                          </>
                        )}
                          <Button
                            size="sm"
                            className="text-xs h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleVerify(p.id)}
                            disabled={actionLoadingId === p.id}
                          >
                            {actionLoadingId === p.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verify
                              </>
                            )}
                          </Button>
                        </div>
                        <div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2 text-red-600 hover:bg-red-50 border-red-200"
                            onClick={() => setRejectPaymentId(p.id)}
                            disabled={actionLoadingId === p.id}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {pendingPayments.length > 5 && (
                <p className="text-xs text-slate-500 text-center">
                  +{pendingPayments.length - 5} more pending
                </p>
              )}
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3" /> Click &quot;View Proof&quot; to review uploaded documents before verifying.
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total Verified (All Time)</span>
                  <span className="font-semibold text-slate-900">
                    {isLoadingStats ? '...' : currency(stats?.totalCompleted ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Pending Verifications</span>
                  <span className="font-semibold text-amber-700">
                    {isLoadingStats ? '...' : stats?.pendingCount ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Failed / Rejected</span>
                  <span className="font-semibold text-red-700">
                    {isLoadingStats ? '...' : stats?.failedCount ?? 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom: Buyer Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" /> Buyer Progress Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              <span className="ml-3 text-slate-500 text-sm">Loading progress data...</span>
            </div>
          ) : buyerProgress.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No buyer progress data yet</p>
              <p className="text-slate-400 text-xs mt-1">
                Progress will appear here when payments are recorded against offers.
              </p>
            </div>
          ) : (
            buyerProgress.map((b) => {
              const pct =
                b.offerPrice > 0
                  ? Math.min(Math.round((b.totalPaid / b.offerPrice) * 100), 100)
                  : 0;
              const nearComplete = pct >= 80;
              return (
                <div
                  key={b.offerId}
                  className={`rounded-lg border ${
                    nearComplete
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-slate-200 bg-white'
                  } p-3`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-[220px]">
                      <div className="font-semibold text-slate-800">{b.buyerName}</div>
                      <div className="text-xs text-slate-500">{b.propertyTitle}</div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-2" />
                        <span className="text-xs text-slate-600 w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {currency(b.totalPaid)} of {currency(b.offerPrice)} paid
                        {b.paymentCount > 0 && (
                          <span className="text-slate-400">
                            {' '}
                            ({b.paymentCount} payment{b.paymentCount !== 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right min-w-[140px]">
                      {b.lastPaymentDate && (
                        <>
                          <div className="text-xs text-slate-500">Last payment</div>
                          <div className="text-sm font-medium text-slate-800">
                            {formatDate(b.lastPaymentDate)}
                          </div>
                        </>
                      )}
                      {nearComplete && (
                        <div className="mt-1 text-xs text-emerald-700 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3 h-3" /> Near completion
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTrackingTab;
