'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User as UserType } from '@/types/auth';
import { supabase } from '@/lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface OfferPayment {
  id: string;
  offer_id: string;
  buyer_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  gateway_response: any;
}

interface PortfolioProperty {
  offerId: string;
  offerReference: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  propertyCountry: string;
  propertyCurrency: string;
  propertyPrice: number;
  offerPrice: number;
  depositAmount: number;
  paymentMethod: 'cash' | 'installments';
  offerStatus: string;
  totalPaid: number;
  payments: {
    id: string;
    amount: number;
    status: string;
    method: string;
    date: string;
  }[];
}

interface BuyerPortfolioProps {
  user: UserType;
  onBrowseProperties: () => void;
  /** Increment to reload portfolio data */
  refreshTrigger?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number, currency = 'USD') => {
  const symbol = currency === 'ZAR' ? 'R' : '$';
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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

const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Verified';
    case 'pending': return 'Pending';
    case 'failed': return 'Rejected';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case 'bank_transfer': return 'Bank Transfer';
    case 'ecocash': return 'EcoCash';
    case 'card': return 'Card';
    default: return method?.replace(/_/g, ' ') || '-';
  }
};

// ─── Component ──────────────────────────────────────────────────────────────────

export const BuyerPortfolio: React.FC<BuyerPortfolioProps> = ({
  user,
  onBrowseProperties,
  refreshTrigger = 0,
}) => {
  const [properties, setProperties] = useState<PortfolioProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  const loadPortfolio = useCallback(async () => {
    if (!user.id || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // 1. Fetch approved offers for this buyer
      const { data: offers, error: offersError } = await supabase
        .from('property_offers')
        .select(`
          id, property_id, offer_price, deposit_amount, payment_method, 
          offer_reference, status,
          property:properties(id, title, price, currency, city, country)
        `)
        .eq('buyer_id', user.id)
        .eq('status', 'approved')
        .order('submitted_at', { ascending: false });

      if (offersError) {
        console.error('Error fetching offers for portfolio:', offersError);
        setIsLoading(false);
        return;
      }

      if (!offers || offers.length === 0) {
        setProperties([]);
        setIsLoading(false);
        return;
      }

      const offerIds = offers.map((o: any) => o.id);

      // 2. Fetch all payments for these offers
      const { data: payments, error: paymentsError } = await supabase
        .from('offer_payments')
        .select('id, offer_id, amount, currency, status, payment_method, created_at, updated_at, gateway_response')
        .eq('buyer_id', user.id)
        .in('offer_id', offerIds)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.warn('Error fetching payments for portfolio:', paymentsError);
      }

      const paymentsByOffer = new Map<string, OfferPayment[]>();
      (payments || []).forEach((p: any) => {
        if (!paymentsByOffer.has(p.offer_id)) {
          paymentsByOffer.set(p.offer_id, []);
        }
        paymentsByOffer.get(p.offer_id)!.push(p);
      });

      // 3. Build portfolio items only for offers that have at least one admin-verified (completed) payment
      const portfolioItems: PortfolioProperty[] = offers
        .map((offer: any) => {
          const prop = offer.property as any;
          const offerPayments = paymentsByOffer.get(offer.id) || [];

          const hasVerifiedPayment = offerPayments.some((p: OfferPayment) => p.status === 'completed');
          if (!hasVerifiedPayment) return null;

          const totalPaid = offerPayments
            .filter((p: OfferPayment) => p.status === 'completed')
            .reduce((sum: number, p: OfferPayment) => sum + (p.amount || 0), 0);

          const paymentList = offerPayments.map((p: OfferPayment) => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            method: p.payment_method,
            date: p.updated_at || p.created_at,
          }));

          return {
            offerId: offer.id,
            offerReference: offer.offer_reference,
            propertyId: offer.property_id,
            propertyTitle: prop?.title || 'Unknown Property',
            propertyCity: prop?.city || '',
            propertyCountry: prop?.country || '',
            propertyCurrency: prop?.currency || 'USD',
            propertyPrice: prop?.price || 0,
            offerPrice: offer.offer_price,
            depositAmount: offer.deposit_amount,
            paymentMethod: offer.payment_method,
            offerStatus: offer.status,
            totalPaid,
            payments: paymentList,
          };
        })
        .filter((item): item is PortfolioProperty => item !== null);

      setProperties(portfolioItems);
    } catch (err) {
      console.error('Error loading portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio, refreshTrigger]);

  // ─── Aggregates ───────────────────────────────────────────────────────

  const totalPropertiesOwned = properties.length;
  const totalInvestmentValue = properties.reduce((sum, p) => sum + p.offerPrice, 0);
  const totalPaidToDate = properties.reduce((sum, p) => sum + p.totalPaid, 0);

  // ─── Render ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">Loading portfolio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Total Properties</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">{totalPropertiesOwned}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-600 font-medium">Total Investment Value</div>
          <div className="text-2xl font-bold text-green-900 mt-2">
            {formatCurrency(totalInvestmentValue)}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-600 font-medium">Total Paid to Date</div>
          <div className="text-2xl font-bold text-purple-900 mt-2">
            {formatCurrency(totalPaidToDate)}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {properties.length === 0 ? (
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Properties Yet</h3>
            <p className="text-slate-600 mb-4">
              Once you have an approved offer and submit payment, your property will appear here with full payment tracking.
            </p>
            <ul className="text-sm text-slate-600 space-y-2 mb-6 text-left max-w-md mx-auto">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                <span>All your purchased properties with detailed information</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                <span>Payment progress for each property with visual progress bars</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                <span>Complete transaction history for all deposits and installments</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                <span>Remaining balance and payment status for each property</span>
              </li>
            </ul>
            <Button
              className="bg-red-800 hover:bg-red-900 text-white"
              onClick={onBrowseProperties}
            >
              <Home className="w-4 h-4 mr-2" />
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Property Cards */
        <div className="space-y-4">
          {properties.map((prop, idx) => {
            const pct = prop.offerPrice > 0
              ? Math.min(Math.round((prop.totalPaid / prop.offerPrice) * 100), 100)
              : 0;
            const remaining = Math.max(prop.offerPrice - prop.totalPaid, 0);
            const isExpanded = expandedOfferId === prop.offerId;
            const verifiedPayments = prop.payments.filter(p => p.status === 'completed');
            const pendingPayments = prop.payments.filter(p => p.status === 'pending');
            const isFullyPaid = pct >= 100;

            return (
              <motion.div
                key={prop.offerId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`overflow-hidden ${isFullyPaid ? 'border-emerald-300' : 'border-slate-200'}`}>
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className={`p-4 sm:p-5 ${isFullyPaid ? 'bg-emerald-50/50' : 'bg-white'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="w-5 h-5 text-slate-500 shrink-0" />
                            <h3 className="text-lg font-semibold text-slate-900 truncate">
                              {prop.propertyTitle}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                              {[prop.propertyCity, prop.propertyCountry].filter(Boolean).join(', ') || 'Location not specified'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>Ref: {prop.offerReference}</span>
                            <span className="text-slate-300">|</span>
                            <Badge className={prop.paymentMethod === 'cash' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                              {prop.paymentMethod === 'cash' ? 'Cash Purchase' : 'Installments'}
                            </Badge>
                            {isFullyPaid && (
                              <Badge className="bg-emerald-100 text-emerald-800">Fully Paid</Badge>
                            )}
                          </div>
                        </div>

                        {/* Price & Progress */}
                        <div className="sm:text-right shrink-0">
                          <div className="text-xs text-slate-500">Offer Price</div>
                          <div className="text-xl font-bold text-slate-900">
                            {formatCurrency(prop.offerPrice, prop.propertyCurrency)}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-slate-600 font-medium">Payment Progress</span>
                          <span className={`font-semibold ${isFullyPaid ? 'text-emerald-700' : 'text-slate-900'}`}>
                            {pct}%
                          </span>
                        </div>
                        <Progress value={pct} className="h-2.5" />
                        <div className="flex items-center justify-between mt-1.5 text-xs text-slate-500">
                          <span>
                            {formatCurrency(prop.totalPaid, prop.propertyCurrency)} paid
                          </span>
                          <span>
                            {remaining > 0
                              ? `${formatCurrency(remaining, prop.propertyCurrency)} remaining`
                              : 'Complete'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <div className="text-xs text-slate-500">Deposit</div>
                          <div className="text-sm font-semibold text-slate-800">
                            {formatCurrency(prop.depositAmount, prop.propertyCurrency)}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <div className="text-xs text-slate-500">Verified</div>
                          <div className="text-sm font-semibold text-emerald-700">
                            {verifiedPayments.length}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <div className="text-xs text-slate-500">Pending</div>
                          <div className="text-sm font-semibold text-amber-700">
                            {pendingPayments.length}
                          </div>
                        </div>
                      </div>

                      {/* Expand / Collapse */}
                      {prop.payments.length > 0 && (
                        <button
                          className="w-full flex items-center justify-center gap-1 mt-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                          onClick={() =>
                            setExpandedOfferId(isExpanded ? null : prop.offerId)
                          }
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              Hide transaction history
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              View transaction history ({prop.payments.length})
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Transaction History (expanded) */}
                    {isExpanded && prop.payments.length > 0 && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4" />
                          Transaction History
                        </h4>
                        <div className="space-y-2">
                          {prop.payments.map((payment) => (
                            <div
                              key={payment.id}
                              className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${
                                payment.status === 'completed'
                                  ? 'bg-emerald-50/50 border-emerald-200'
                                  : payment.status === 'pending'
                                  ? 'bg-amber-50/50 border-amber-200'
                                  : payment.status === 'failed'
                                  ? 'bg-red-50/50 border-red-200'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div>
                                  {payment.status === 'completed' ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                  ) : payment.status === 'pending' ? (
                                    <Clock className="w-4 h-4 text-amber-600" />
                                  ) : (
                                    <DollarSign className="w-4 h-4 text-red-500" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-slate-800">
                                    {formatCurrency(payment.amount, prop.propertyCurrency)}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {getPaymentMethodLabel(payment.method)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <Badge
                                  className={
                                    payment.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : payment.status === 'pending'
                                      ? 'bg-amber-100 text-amber-800'
                                      : payment.status === 'failed'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }
                                >
                                  {getPaymentStatusLabel(payment.status)}
                                </Badge>
                                <div className="text-xs text-slate-400 mt-0.5">
                                  {formatDate(payment.date)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BuyerPortfolio;
