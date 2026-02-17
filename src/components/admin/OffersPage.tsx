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
  TrendingUp
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PropertyOffer, OfferStats } from '@/types/offers';
import { 
  getPropertyOffers, 
  updatePropertyOffer, 
  getOfferStats 
} from '@/lib/offer-services';
import { createInvoiceForOffer } from '@/lib/invoice-services';
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
      const success = await updatePropertyOffer(offerId, { status: 'approved' }, adminUserId);
      if (success) {
        // Auto-create invoice for the offer (no seller id included)
        try {
          const invoice = await createInvoiceForOffer(offerId);
          if (invoice) {
            toast.success(`Offer approved. Invoice ${invoice.invoice_number} created`);
          } else {
            toast.info('Offer approved, but invoice could not be generated');
          }
        } catch (_) {
          toast.info('Offer approved, but invoice generation failed');
        }
        loadOffers();
        loadStats();
        onApproveOffer?.(offerId);
      } else {
        toast.error('Failed to approve offer');
      }
    } catch (error) {
      console.error('Error approving offer:', error);
      toast.error('Failed to approve offer');
    }
  };

  const handleRejectOffer = async (offerId: string, reason: string) => {
    try {
      const success = await updatePropertyOffer(offerId, { 
        status: 'rejected', 
        rejection_reason: reason 
      }, adminUserId);
      if (success) {
        toast.success('Offer rejected successfully');
        loadOffers();
        loadStats();
        onRejectOffer?.(offerId, reason);
      } else {
        toast.error('Failed to reject offer');
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
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveOffer(offer.id)}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewOffer?.(offer.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
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
