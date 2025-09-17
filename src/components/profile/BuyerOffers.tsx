'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  DollarSign,
  Calendar,
  Home,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Search,
  X,
  Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PropertyOffer } from '@/types/offers';
import { getPropertyOffers, updatePropertyOffer } from '@/lib/offer-services';
import { User as UserType } from '@/types/auth';

interface BuyerOffersProps {
  user: UserType;
  onViewOffer?: (offer: PropertyOffer) => void;
  onViewProperty?: (propertyId: string) => void;
  onMakePayment?: (offer: PropertyOffer) => void;
}

export const BuyerOffers: React.FC<BuyerOffersProps> = ({
  user,
  onViewOffer,
  onViewProperty,
  onMakePayment
}) => {
  const [offers, setOffers] = useState<PropertyOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancellingOffer, setCancellingOffer] = useState<string | null>(null);

  // Load buyer's offers
  useEffect(() => {
    loadOffers();
  }, [user.id]);

  const loadOffers = async () => {
    try {
      setIsLoading(true);
      // Get offers filtered by buyer_id
      const buyerOffers = await getPropertyOffers({ buyer_id: user.id });
      setOffers(buyerOffers);
    } catch (error) {
      console.error('Error loading buyer offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOffer = async (offerId: string) => {
    try {
      setCancellingOffer(offerId);
      await updatePropertyOffer(offerId, { status: 'withdrawn', rejection_reason: 'Cancelled by buyer' });
      await loadOffers(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling offer:', error);
    } finally {
      setCancellingOffer(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: Clock,
        label: 'Under Review'
      },
      approved: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        label: 'Approved'
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle,
        label: 'Rejected'
      },
      withdrawn: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: AlertCircle,
        label: 'Cancelled'
      },
      expired: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock,
        label: 'Expired'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1 border`}>
        <Icon className="w-3 h-3" />
        {config.label}
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
      day: 'numeric'
    });
  };

  const getOfferStats = () => {
    const stats = {
      total: offers.length,
      pending: offers.filter(o => o.status === 'pending').length,
      approved: offers.filter(o => o.status === 'approved').length,
      rejected: offers.filter(o => o.status === 'rejected').length
    };
    return stats;
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = searchQuery === '' || 
      offer.property?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.property?.location.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = getOfferStats();

  const StatCard: React.FC<{
    title: string;
    value: number;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = ({ title, value, color, icon: Icon }) => (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
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
          <h2 className="text-2xl font-bold text-gray-900">My Offers</h2>
          <p className="text-sm text-gray-600">Track your property offers and their status</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadOffers}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
          title="Under Review"
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
                  placeholder="Search offers by property name or location..."
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
                <option value="pending">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Cancelled</option>
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
            <p className="text-gray-600 mt-2">Loading your offers...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No offers match your current filters.' 
                  : 'You haven\'t made any offers yet. Browse properties to make your first offer!'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => onViewProperty?.('browse')}
                >
                  Browse Properties
                </Button>
              )}
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
                          <h3 className="text-lg font-semibold text-gray-900">
                            {offer.property?.title || 'Property Title'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {offer.property?.location?.city || 'City'}, {offer.property?.location?.country || 'Country'}
                          </p>
                        </div>
                        {getStatusBadge(offer.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Your Offer</p>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(offer.offer_price, offer.property?.currency || 'USD')}
                            </p>
                            {offer.property?.price && offer.offer_price !== offer.property.price && (
                              <p className="text-xs text-gray-500">
                                Listed: {formatCurrency(offer.property.price, offer.property.currency || 'USD')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Deposit</p>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(offer.deposit_amount, offer.property?.currency || 'USD')}
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

                      {offer.additional_notes && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Your Message</p>
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
                        {offer.admin_reviewed_at && (
                          <span className="ml-4">
                            Reviewed: {formatDate(offer.admin_reviewed_at)}
                          </span>
                        )}
                      </div>

                      {/* Admin Notes (if any) */}
                      {offer.admin_notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            <strong>Admin Note:</strong> {offer.admin_notes}
                          </p>
                        </div>
                      )}

                      {/* Rejection Reason (if rejected) */}
                      {offer.status === 'rejected' && offer.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-800">
                            <strong>Reason for Rejection:</strong> {offer.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:min-w-[200px]">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewOffer?.(offer)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewProperty?.(offer.property_id)}
                      >
                        <Home className="w-4 h-4 mr-2" />
                        View Property
                      </Button>
                      {offer.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelOffer(offer.id)}
                          disabled={cancellingOffer === offer.id}
                        >
                          {cancellingOffer === offer.id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Cancel Offer
                        </Button>
                      )}
                      {offer.status === 'approved' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => onMakePayment?.(offer)}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Make Payment
                        </Button>
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
