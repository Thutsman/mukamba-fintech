'use client';

import * as React from 'react';
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  ArrowDownToLine,
  Download,
  Filter,
  Calendar as CalendarIcon,
  Users,
  Building,
  Banknote,
  Clock,
  Info,
  ArrowUpRight
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
import type { PaymentInstallment } from '@/types/admin';

type InstallmentStatus = PaymentInstallment['status'];

interface BuyerProgressItem {
  buyerId: string;
  buyerName: string;
  propertyTitle: string;
  propertyId: string;
  totalPrice: number;
  totalPaid: number;
  missedPayments: number;
  nextDueDate: string;
}

interface SellerPayoutItem {
  sellerId: string;
  sellerName: string;
  amountDue: number;
  payoutMethod: 'bank' | 'mobile_money';
  status: 'pending' | 'processing' | 'paid' | 'on_hold';
}

const currency = (n: number) => `R${n.toLocaleString()}`;

const mockInstallments: PaymentInstallment[] = [
  {
    id: 'pi_001',
    propertyId: 'prop_1',
    propertyTitle: 'Modern 3-Bedroom House',
    buyerId: 'buyer_1',
    buyerName: 'John Doe',
    sellerId: 'seller_1',
    sellerName: 'John Smith',
    amount: 12500,
    method: 'bank',
    status: 'paid',
    createdAt: new Date().toISOString(),
    paymentDate: new Date().toISOString(),
    transactionHash: 'txn_abc123'
  },
  {
    id: 'pi_002',
    propertyId: 'prop_2',
    propertyTitle: 'Luxury Apartment',
    buyerId: 'buyer_2',
    buyerName: 'Sarah Smith',
    sellerId: 'seller_2',
    sellerName: 'Sarah Wilson',
    amount: 9800,
    method: 'mobile_money',
    status: 'pending',
    createdAt: new Date().toISOString(),
    notes: 'Awaiting confirmation from provider'
  },
  {
    id: 'pi_003',
    propertyId: 'prop_3',
    propertyTitle: 'Family Home',
    buyerId: 'buyer_3',
    buyerName: 'Mike Johnson',
    sellerId: 'seller_3',
    sellerName: 'Mike Davis',
    amount: 15200,
    method: 'card',
    status: 'failed',
    createdAt: new Date().toISOString(),
    notes: 'Card declined'
  },
  {
    id: 'pi_004',
    propertyId: 'prop_4',
    propertyTitle: 'Investment Property',
    buyerId: 'buyer_4',
    buyerName: 'Lisa Brown',
    sellerId: 'seller_4',
    sellerName: 'Lisa Brown',
    amount: 17500,
    method: 'bank',
    status: 'flagged',
    createdAt: new Date().toISOString(),
    notes: 'Manual review required'
  }
];

const mockSellerPayouts: SellerPayoutItem[] = [
  { sellerId: 'seller_1', sellerName: 'John Smith', amountDue: 25000, payoutMethod: 'bank', status: 'pending' },
  { sellerId: 'seller_2', sellerName: 'Sarah Wilson', amountDue: 9800, payoutMethod: 'mobile_money', status: 'processing' },
  { sellerId: 'seller_3', sellerName: 'Mike Davis', amountDue: 15200, payoutMethod: 'bank', status: 'on_hold' }
];

const mockBuyerProgress: BuyerProgressItem[] = [
  { buyerId: 'buyer_1', buyerName: 'John Doe', propertyTitle: 'Modern 3-Bedroom House', propertyId: 'prop_1', totalPrice: 1250000, totalPaid: 875000, missedPayments: 0, nextDueDate: new Date(Date.now()+1000*60*60*24*14).toISOString() },
  { buyerId: 'buyer_2', buyerName: 'Sarah Smith', propertyTitle: 'Luxury Apartment', propertyId: 'prop_2', totalPrice: 900000, totalPaid: 540000, missedPayments: 1, nextDueDate: new Date(Date.now()+1000*60*60*24*7).toISOString() },
  { buyerId: 'buyer_3', buyerName: 'Mike Johnson', propertyTitle: 'Family Home', propertyId: 'prop_3', totalPrice: 1450000, totalPaid: 435000, missedPayments: 2, nextDueDate: new Date(Date.now()+1000*60*60*24*3).toISOString() }
];

export const PaymentTrackingTab: React.FC = () => {
  const [statusFilter, setStatusFilter] = React.useState<InstallmentStatus | 'all'>('all');
  const [search, setSearch] = React.useState('');
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');

  const filteredInstallments = React.useMemo(() => {
    return mockInstallments.filter((i) => {
      const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
      const matchesSearch = !search ||
        i.buyerName.toLowerCase().includes(search.toLowerCase()) ||
        i.sellerName.toLowerCase().includes(search.toLowerCase()) ||
        i.propertyTitle.toLowerCase().includes(search.toLowerCase());
      const created = new Date(i.createdAt).valueOf();
      const afterStart = !startDate || created >= new Date(startDate).valueOf();
      const beforeEnd = !endDate || created <= new Date(endDate).valueOf();
      return matchesStatus && matchesSearch && afterStart && beforeEnd;
    });
  }, [statusFilter, search, startDate, endDate]);

  const totals = React.useMemo(() => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const receivedThisMonth = mockInstallments
      .filter(i => i.status === 'paid' && i.paymentDate && new Date(i.paymentDate).getMonth() === month && new Date(i.paymentDate).getFullYear() === year)
      .reduce((sum, i) => sum + i.amount, 0);
    const overdue = mockInstallments.filter(i => i.status === 'failed').length;
    const buyersNearCompletion = mockBuyerProgress.filter(b => (b.totalPaid / b.totalPrice) >= 0.8).length;
    const pendingSellerPayouts = mockSellerPayouts.filter(s => s.status === 'pending' || s.status === 'processing').reduce((sum, s) => sum + s.amountDue, 0);
    return { receivedThisMonth, overdue, buyersNearCompletion, pendingSellerPayouts };
  }, []);

  const exportCSV = () => {
    console.log('Export CSV clicked');
  };
  const exportPDF = () => {
    console.log('Export PDF clicked');
  };

  const statusBadge = (status: InstallmentStatus) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-100 text-emerald-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'flagged':
        return <Badge className="bg-amber-100 text-amber-800">Flagged</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top: Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Installments Received (This Month)</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{currency(totals.receivedThisMonth)}</div>
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
                <div className="text-xs text-slate-500">Pending Seller Payouts</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{currency(totals.pendingSellerPayouts)}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Overdue / Failed Installments</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{totals.overdue}</div>
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
                <div className="text-2xl font-bold text-slate-900 mt-1">{totals.buyersNearCompletion}</div>
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
                  className="h-9 rounded-md border border-slate-200 px-3 text-sm"
                  placeholder="Buyer, seller, or property"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">Status</label>
                <select
                  className="h-9 rounded-md border border-slate-200 px-3 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as InstallmentStatus | 'all')}
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">Start Date</label>
                <input type="date" className="h-9 rounded-md border border-slate-200 px-3 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">End Date</label>
                <input type="date" className="h-9 rounded-md border border-slate-200 px-3 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-9"><Filter className="w-4 h-4 mr-2" />Filter</Button>
              <Button variant="outline" className="h-9" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />CSV</Button>
              <Button className="h-9" onClick={exportPDF}><Download className="w-4 h-4 mr-2" />PDF</Button>
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
                <CreditCard className="w-5 h-5" /> Installment Ledger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completion %</TableHead>
                      <TableHead>Seller Payout</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstallments.map((i) => {
                      const buyer = mockBuyerProgress.find(b => b.buyerId === i.buyerId && b.propertyId === i.propertyId);
                      const completion = buyer ? Math.round((buyer.totalPaid / buyer.totalPrice) * 100) : 0;
                      const rowClass = i.status === 'failed' ? 'bg-red-50' : i.status === 'flagged' ? 'bg-amber-50' : '';
                      return (
                        <TableRow key={i.id} className={rowClass}>
                          <TableCell className="min-w-[140px]">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800">{i.buyerName}</span>
                              <span className="text-xs text-slate-500">{i.buyerId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[200px]">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800">{i.propertyTitle}</span>
                              <span className="text-xs text-slate-500">{i.propertyId}</span>
                            </div>
                          </TableCell>
                          <TableCell>{i.paymentDate ? new Date(i.paymentDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell className="font-medium">{currency(i.amount)}</TableCell>
                          <TableCell className="capitalize">{i.method.replace('_', ' ')}</TableCell>
                          <TableCell>{statusBadge(i.status)}</TableCell>
                          <TableCell className="min-w-[160px]">
                            <div className="flex items-center gap-2">
                              <div className="w-24">
                                <Progress value={completion} className="h-2" />
                              </div>
                              <span className="text-xs text-slate-600">{completion}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {i.status === 'paid' ? (
                              <Badge className="bg-emerald-100 text-emerald-800">Queued</Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-700">-</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Seller Payouts */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5" /> Seller Payouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockSellerPayouts.map((s) => (
                <div key={s.sellerId} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{s.sellerName}</div>
                      <div className="text-xs text-slate-500">{s.payoutMethod === 'bank' ? 'Bank Transfer' : 'Mobile Money'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{currency(s.amountDue)}</div>
                      <div className="text-xs mt-1">
                        {s.status === 'pending' && <Badge className="bg-blue-100 text-blue-800">Pending</Badge>}
                        {s.status === 'processing' && <Badge className="bg-amber-100 text-amber-800">Processing</Badge>}
                        {s.status === 'paid' && <Badge className="bg-emerald-100 text-emerald-800">Paid</Badge>}
                        {s.status === 'on_hold' && <Badge className="bg-red-100 text-red-800">On Hold</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Approve Payout</Button>
                    <Button size="sm" variant="outline">Details</Button>
                  </div>
                </div>
              ))}
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3" /> Manual approval may be required for flagged payments.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-semibold">Issues detected</span>
              </div>
              <Button size="sm" variant="outline" className="mt-2 w-full">
                View 1 Issue
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
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
          {mockBuyerProgress.map((b) => {
            const pct = Math.round((b.totalPaid / b.totalPrice) * 100);
            const late = b.missedPayments > 0;
            return (
              <div key={`${b.buyerId}-${b.propertyId}`} className={`rounded-lg border ${late ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white'} p-3`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-[220px]">
                    <div className="font-semibold text-slate-800">{b.buyerName}</div>
                    <div className="text-xs text-slate-500">{b.propertyTitle}</div>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-2" />
                      <span className="text-xs text-slate-600 w-10 text-right">{pct}%</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {currency(b.totalPaid)} of {currency(b.totalPrice)} paid
                    </div>
                  </div>
                  <div className="text-right min-w-[160px]">
                    <div className="text-xs text-slate-500">Next due</div>
                    <div className="text-sm font-medium text-slate-800">{new Date(b.nextDueDate).toLocaleDateString()}</div>
                    {late && (
                      <div className="mt-1 text-xs text-amber-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {b.missedPayments} missed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTrackingTab;


