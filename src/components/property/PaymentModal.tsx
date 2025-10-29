'use client';

/**
 * PaymentModal - Payment gateway for approved offers
 * 
 * Features:
 * - Display offer summary with all details
 * - Multiple payment options (Bank Transfer, Diaspora)
 * - Payment status tracking and confirmation
 * - Integration with offer_payments table
 * - Admin notifications on payment completion
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CreditCard,
  Building2,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  Clock,
  User,
  Home,
  Shield,
  Info,
  Upload,
  FileText,
  Copy,
  Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PropertyOffer } from '@/types/offers';
import type { Invoice } from '@/types/invoices';
import { getInvoiceByOffer, markInvoicePaid } from '@/lib/invoice-services';
import { User as UserType } from '@/types/auth';
import { createClient } from '@/lib/supabase/client';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: PropertyOffer;
  user: UserType;
  onSubmit?: (paymentData: PaymentData) => Promise<void>;
}

interface PaymentData {
  paymentMethod: 'bank_transfer' | 'diaspora';
  bankDetails?: string;
  paymentReference?: string;
  amount: number;
  transaction_id?: string;
  payment_id?: string;
  // Bank transfer specific fields
  proofOfPayment?: File;
  proofUrl?: string;
  transferReference?: string;
  transferNotes?: string;
  confirmationChecked?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  offer,
  user,
  onSubmit
}) => {
  const [step, setStep] = React.useState<'method' | 'details' | 'processing' | 'success'>('method');
  const [paymentData, setPaymentData] = React.useState<PaymentData>({
    paymentMethod: 'bank_transfer',
    amount: offer.deposit_amount
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [uploadingFile, setUploadingFile] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [buyerInfo, setBuyerInfo] = React.useState<{ name: string; email: string; phone: string } | null>(null);
  
  const buildInvoiceFromOffer = (o: PropertyOffer, buyerData?: { name: string; email: string; phone: string }): Invoice => {
    const subtotal = o.payment_method === 'cash' ? o.offer_price : o.deposit_amount;
    const taxes = 0;
    const total = subtotal + taxes;
    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tail = (o.offer_reference || o.id).toString().slice(-6).toUpperCase();
    return {
      id: `local-${o.id}`,
      invoice_number: `INV-${issueDate.getFullYear()}-${tail}`,
      offer_id: o.id,
      buyer_id: o.buyer_id,
      property_id: o.property_id,
      currency: o.property?.currency || 'USD',
      subtotal,
      taxes,
      total,
      amount_due: total,
      status: 'unpaid',
      issue_date: issueDate.toISOString(),
      due_date: dueDate.toISOString(),
      line_items: [{ description: `Deposit for ${o.property?.title || 'Property'}`, quantity: 1, unit_price: subtotal, total: subtotal }],
      metadata: { 
        offer_reference: o.offer_reference,
        buyer_name: buyerData?.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        buyer_email: buyerData?.email || user.email,
        buyer_phone: buyerData?.phone || user.phone,
        buyer_uid: o.buyer_id,
        property_title: o.property?.title || 'Property',
        property_address: o.property?.address || '',
        listing_type: o.property?.listing_type || '',
        payment_method: o.payment_method
      }
    };
  };

  // Reset form when modal opens/closes and load invoice
  React.useEffect(() => {
    if (isOpen) {
      setStep('method');
      setPaymentData({
        paymentMethod: 'bank_transfer',
        amount: offer.deposit_amount
      });
      setValidationErrors({});
      (async () => {
        // Fetch buyer information from user_profiles
        try {
          const supabase = createClient();
          const { data: buyerData, error } = await supabase
            .from('user_profiles')
            .select('id, first_name, last_name, email, phone')
            .eq('id', offer.buyer_id)
            .single();

          let buyerDetails = null;
          if (!error && buyerData) {
            buyerDetails = {
              name: `${buyerData.first_name || ''} ${buyerData.last_name || ''}`.trim() || 'Buyer',
              email: buyerData.email || '',
              phone: buyerData.phone || ''
            };
            setBuyerInfo(buyerDetails);
          }
          
          // Load or build invoice with buyer info
          const inv = await getInvoiceByOffer(offer.id);
          if (inv) {
            setInvoice(inv);
            setPaymentData(p => ({ ...p, amount: inv.total || offer.deposit_amount }));
          } else {
            // Fallback: build a local invoice so buyers still see invoice details in dev/mock
            const local = buildInvoiceFromOffer(offer, buyerDetails || undefined);
            setInvoice(local);
            setPaymentData(p => ({ ...p, amount: local.total }));
          }
        } catch (error) {
          console.error('Error fetching buyer info:', error);
          // Fallback: build invoice without specific buyer data
          const inv = await getInvoiceByOffer(offer.id);
          if (inv) {
            setInvoice(inv);
            setPaymentData(p => ({ ...p, amount: inv.total || offer.deposit_amount }));
          } else {
            const local = buildInvoiceFromOffer(offer);
            setInvoice(local);
            setPaymentData(p => ({ ...p, amount: local.total }));
          }
        }
      })();
    }
  }, [isOpen, offer.id, offer.deposit_amount, offer.buyer_id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Bank details for Mukamba FinTech
  const bankDetails = {
    bankName: 'NEDBANK',
    accountName: 'JOHN POCOCK AND COMPANY TRUST ACCOUNT',
    accountNumber: '11990130215',
    swiftCode: 'MBCAZWHX',
    branchCode: '18301',
    reference: `OFFER-${offer.id.slice(-8).toUpperCase()}`
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const buildInvoiceHtml = (inv: Invoice, autoPrint = false) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const logoSrc = `${origin}/logo.svg`;
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${inv.invoice_number}</title>
<style>
  :root{--slate:#0f172a;--muted:#475569;--line:#e2e8f0;--brand:#0ea5e9}
  body{font-family:Arial,Helvetica,sans-serif;color:var(--slate);padding:24px;background:#fff;font-size:13px;line-height:1.45}
  .card{max-width:900px;margin:0 auto;border:1px solid var(--line);border-radius:12px;padding:28px;background:#fff;box-sizing:border-box}
  .row{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}
  h1{font-size:20px;margin:0 0 12px 0}
  .table-wrap{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
  table{width:100%;border-collapse:collapse;margin-top:16px;min-width:560px}
  th,td{border-bottom:1px solid var(--line);padding:10px;text-align:left}
  thead th{background:#f8fafc;color:var(--muted);font-size:12px}
  tbody td{font-size:12px}
  tfoot td{font-size:12px}
  .total{font-weight:700}
  .muted{color:var(--muted)}
  .badge{display:inline-block;padding:4px 8px;border-radius:999px;border:1px solid var(--line);font-size:12px}
  .header{border-bottom:1px solid var(--line);padding-bottom:16px;margin-bottom:16px}
  .brand{display:flex;align-items:center;gap:12px}
  .brand-img{height:36px;width:auto;display:block}
  .section-title{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:24px 0 8px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .instructions{font-size:12px;line-height:1.6}
  .instructions p{margin:6px 0}
  .footer{border-top:1px solid var(--line);margin-top:24px;padding-top:12px;font-size:12px;color:var(--muted)}

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    body{padding:16px;font-size:12px}
    .card{padding:18px;border-radius:10px}
    .row{flex-direction:column;gap:8px}
    .brand-img{height:28px}
    h1{font-size:18px}
    .grid{grid-template-columns:1fr;gap:8px}
    .section-title{margin:16px 0 6px;font-size:12px}
    thead th,tbody td,tfoot td{font-size:11px;padding:8px}
  }

  /* Print tweaks */
  @media print {
    body{padding:0}
    .card{border-color:#ddd}
  }
</style>
${autoPrint ? '<script>window.onload=function(){setTimeout(function(){window.print();},200)}</script>' : ''}
</head>
<body>
  <div class="card">
    <div class="header row">
      <div class="brand">
        <img src="${logoSrc}" alt="Mukamba Gateway" class="brand-img" />
        <div><h1>Deposit Invoice</h1></div>
      </div>
      <div style="text-align:right">
        <div><strong>Invoice:</strong> ${inv.invoice_number}</div>
        <div><strong>Offer Ref:</strong> ${inv.metadata?.offer_reference || ''}</div>
        <div class="muted">Issued: ${new Date(inv.issue_date).toLocaleDateString()} • Due: ${new Date(inv.due_date).toLocaleDateString()}</div>
        <div class="badge">${(inv as any).status || 'Pending Payment'}</div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="section-title">Buyer</div>
        <div><strong>${inv.metadata?.buyer_name || ''}</strong></div>
        <div class="muted">${inv.metadata?.buyer_email || ''}</div>
        <div class="muted">${inv.metadata?.buyer_phone || ''}</div>
      </div>
      <div>
        <div class="section-title">Property</div>
        <div><strong>${inv.metadata?.property_title || 'Property'}</strong></div>
        <div class="muted">${inv.metadata?.property_address || ''}</div>
        <div class="muted">Listing Type: ${inv.metadata?.listing_type || ''}</div>
      </div>
    </div>

    <div class="table-wrap">
      <table><thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
        <tbody>
          ${(inv.line_items || []).map(li => `<tr><td>${li.description}</td><td>${li.quantity}</td><td>${inv.currency} ${li.unit_price.toLocaleString()}</td><td>${inv.currency} ${li.total.toLocaleString()}</td></tr>`).join('')}
        </tbody>
        <tfoot>
          <tr><td colspan="3" class="total">Subtotal</td><td class="total">${inv.currency} ${(inv.subtotal).toLocaleString()}</td></tr>
          <tr><td colspan="3">Taxes</td><td>${inv.currency} ${(inv.taxes).toLocaleString()}</td></tr>
          <tr><td colspan="3" class="total">Total</td><td class="total">${inv.currency} ${(inv.total).toLocaleString()}</td></tr>
        </tfoot>
      </table>
    </div>

    <div class="section-title">Payment Instructions</div>
    <div class="instructions">
      <p class="muted">Please complete payment by ${new Date(inv.due_date).toLocaleDateString()}.</p>
      <p class="muted"><strong>Validity:</strong> This invoice is valid for 7 working days from the date of issue. After this period the offer and invoice will automatically expire.</p>
      <p class="muted">Upload proof of payment in your Mukamba dashboard after transfer. Your payment will be reviewed and confirmed within 24–48 hours.</p>
    </div>

    <div class="section-title"><strong>Banking Details</strong></div>
    <table>
      <tbody>
        <tr><td>Bank Name</td><td>NEDBANK</td></tr>
        <tr><td>Account Name</td><td>JOHN POCOCK AND COMPANY TRUST ACCOUNT</td></tr>
        <tr><td>Account Number</td><td>11990130215</td></tr>
        <tr><td>SWIFT / Branch Code</td><td>MBCAZWHX / 18301</td></tr>
        <tr><td>Reference</td><td>Use <strong>${inv.invoice_number}</strong> as payment reference</td></tr>
      </tbody>
    </table>

    <div class="footer">
      <div>Mukamba Gateway • hello@mukambagateway.com</div>
      <div class="muted">This invoice is issued for the purpose of property purchase under Mukamba Gateway. All payments are subject to verification. Terms apply.</div>
    </div>
  </div>
</body></html>`;
  };

  const previewInvoice = (inv: Invoice, autoPrint = false) => {
    const html = buildInvoiceHtml(inv, autoPrint);
    try {
      // Prefer Blob URL to avoid blank rendering in some browsers
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank', 'noopener');
      if (!w) throw new Error('popup blocked');
      // Revoke when the tab has had time to load
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e) {
      // Final fallback
      const w = window.open('', '_blank', 'noopener');
      if (!w) return;
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingFile(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('offer_id', offer.id);
      formData.append('user_id', user.id);
      
      const response = await fetch('/api/upload/proof-of-payment', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const result = await response.json();
      setPaymentData(prev => ({ ...prev, proofUrl: result.url }));
    } catch (error) {
      console.error('Error uploading file:', error);
      setValidationErrors(prev => ({ ...prev, proofOfPayment: 'Failed to upload file. Please try again.' }));
    } finally {
      setUploadingFile(false);
    }
  };

  const validatePaymentDetails = (): boolean => {
    const errors: Record<string, string> = {};

    if (paymentData.paymentMethod === 'bank_transfer') {
      if (!paymentData.proofUrl) {
        errors.proofOfPayment = 'Proof of payment is required for bank transfer';
      }
      if (!paymentData.confirmationChecked) {
        errors.confirmation = 'Please confirm that you have made the transfer';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentMethodChange = (method: PaymentData['paymentMethod']) => {
    setPaymentData(prev => ({ 
      ...prev, 
      paymentMethod: method,
      bankDetails: method === 'bank_transfer' ? prev.bankDetails : undefined
    }));
    setValidationErrors({});
  };

  const handleSubmit = async () => {
    if (!validatePaymentDetails()) return;
    
    setIsLoading(true);
    setStep('processing');
    
    try {
      if (paymentData.paymentMethod === 'bank_transfer') {
        // Handle bank transfer submission
        const response = await fetch('/api/payments/bank-transfer/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            offer_id: offer.id,
            user_id: user.id,
            amount: paymentData.amount,
            proof_url: paymentData.proofUrl,
            transfer_reference: paymentData.transferReference,
            transfer_notes: paymentData.transferNotes
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit bank transfer');
        }
        
        // Call custom onSubmit if provided
        if (onSubmit) {
          await onSubmit({
            ...paymentData,
            payment_id: result.payment_id
          });
        }
        
        setStep('success');
        setTimeout(() => {
          onClose();
          setStep('method');
        }, 3000);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setStep('details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setStep('method');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-lg shadow-2xl mx-4 sm:mx-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="w-6 h-6" />
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <CardTitle className="text-xl">
                {step === 'method' && 'Make Payment'}
                {step === 'details' && 'Payment Details'}
                {step === 'processing' && 'Processing Payment'}
                {step === 'success' && 'Payment Successful!'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {step === 'method' && 'Complete your deposit payment'}
                {step === 'details' && 'Enter your payment details'}
                {step === 'processing' && 'Please wait while we process your payment...'}
                {step === 'success' && 'Your payment has been processed successfully!'}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
              {step === 'method' && (
                <div className="space-y-6">
                  {/* Offer Summary + Invoice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <Home className="w-4 h-4 mr-2" />
                      Offer Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Property:</span>
                        <div className="font-semibold text-blue-900">{offer.property?.title || 'Property'}</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Offer Price:</span>
                        <div className="font-semibold text-blue-900">{formatCurrency(offer.offer_price)}</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Deposit Amount:</span>
                        <div className="font-semibold text-blue-900">{formatCurrency(offer.deposit_amount)}</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Payment Method:</span>
                        <div className="font-semibold text-blue-900 capitalize">{offer.payment_method}</div>
                      </div>
                    </div>
                    {invoice && (
                      <div className="mt-3 rounded-md border border-blue-200 bg-white p-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-blue-700 font-medium">Invoice {invoice.invoice_number}</div>
                          <div className="text-xs text-blue-600">Due {new Date(invoice.due_date).toLocaleDateString()}</div>
                        </div>
                        <div className="text-sm font-semibold text-blue-900">{formatCurrency(invoice.total)}</div>
                      </div>
                    )}
                  </div>

                  {/* Payment Amount */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <h3 className="font-semibold text-green-800 mb-2">Amount to Pay</h3>
                    <div className="text-3xl font-bold text-green-900">
                      {formatCurrency(invoice?.total || offer.deposit_amount)}
                    </div>
                    <p className="text-sm text-green-700 mt-1">Deposit for approved offer</p>
                  </div>

                  {/* Actions: Invoice */}
                  {invoice && (
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => previewInvoice(invoice)}>
                        Preview Invoice
                      </Button>
                      <Button variant="outline" onClick={() => previewInvoice(invoice, true)}>
                        Download / Print
                      </Button>
                    </div>
                  )}

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Payment Method</Label>
                    <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg border-green-500 bg-green-50`}>
                      <div className="w-5 h-5 rounded-full border-2 border-green-500 bg-green-500" aria-hidden />
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <span className="text-base font-medium">Bank Transfer</span>
                          <p className="text-sm text-gray-500">Direct bank transfer</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep('details')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {step === 'details' && (
                <div className="space-y-6">
                  {/* Payment Method Info */}
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Transfer the exact amount to our bank account and upload proof of payment. Your payment will be verified manually within 1-2 business days.
                    </AlertDescription>
                  </Alert>

                  {/* Payment Details Form */}
                  {paymentData.paymentMethod === 'bank_transfer' && (
                    <div className="space-y-6">
                      {/* Bank Details Card */}
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-blue-800 flex items-center">
                            <Building2 className="w-5 h-5 mr-2" />
                            Mukamba FinTech Bank Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-blue-700">Bank Name</Label>
                              <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                <span className="text-sm font-mono">{bankDetails.bankName}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(bankDetails.bankName, 'bankName')}
                                  className="h-8 w-8 p-0"
                                >
                                  {copiedField === 'bankName' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-blue-700">Account Name</Label>
                              <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                <span className="text-sm font-mono">{bankDetails.accountName}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(bankDetails.accountName, 'accountName')}
                                  className="h-8 w-8 p-0"
                                >
                                  {copiedField === 'accountName' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-blue-700">Account Number</Label>
                              <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                <span className="text-sm font-mono">{bankDetails.accountNumber}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(bankDetails.accountNumber, 'accountNumber')}
                                  className="h-8 w-8 p-0"
                                >
                                  {copiedField === 'accountNumber' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-blue-700">SWIFT Code</Label>
                              <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                <span className="text-sm font-mono">{bankDetails.swiftCode}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(bankDetails.swiftCode, 'swiftCode')}
                                  className="h-8 w-8 p-0"
                                >
                                  {copiedField === 'swiftCode' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-blue-700">Reference (Important!)</Label>
                            <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                              <span className="text-sm font-mono font-bold text-yellow-800">{bankDetails.reference}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(bankDetails.reference, 'reference')}
                                className="h-8 w-8 p-0"
                              >
                                {copiedField === 'reference' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                            <p className="text-xs text-yellow-700">Use this exact reference when making your transfer</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Transfer Amount */}
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Label className="text-sm font-medium text-green-700">Transfer Amount</Label>
                            <div className="text-2xl font-bold text-green-800 mt-2">
                              {formatCurrency(paymentData.amount)}
                            </div>
                            <p className="text-xs text-green-600 mt-1">Deposit for approved offer</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Optional Transfer Reference */}
                      <div className="space-y-2">
                        <Label htmlFor="transferReference" className="text-base font-medium">Your Transfer Reference (Optional)</Label>
                        <Input
                          id="transferReference"
                          value={paymentData.transferReference || ''}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, transferReference: e.target.value }))}
                          placeholder="Enter your bank's transaction reference"
                          className="w-full"
                        />
                      </div>

                      {/* File Upload */}
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Upload Proof of Payment</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            id="proofOfPayment"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setPaymentData(prev => ({ ...prev, proofOfPayment: file }));
                                handleFileUpload(file);
                              }
                            }}
                            className="hidden"
                          />
                          <label htmlFor="proofOfPayment" className="cursor-pointer">
                            {uploadingFile ? (
                              <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                                <p className="text-sm text-gray-600">Uploading...</p>
                              </div>
                            ) : paymentData.proofUrl ? (
                              <div className="flex flex-col items-center">
                                <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                                <p className="text-sm text-green-600 font-medium">Proof of payment uploaded</p>
                                <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">Click to upload proof of payment</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                              </div>
                            )}
                          </label>
                        </div>
                        {validationErrors.proofOfPayment && (
                          <p className="text-sm text-red-600">{validationErrors.proofOfPayment}</p>
                        )}
                      </div>

                      {/* Additional Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="transferNotes" className="text-base font-medium">Additional Notes (Optional)</Label>
                        <Textarea
                          id="transferNotes"
                          value={paymentData.transferNotes || ''}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, transferNotes: e.target.value }))}
                          placeholder="Any additional information about your transfer..."
                          rows={3}
                          className="w-full"
                        />
                      </div>

                      {/* Confirmation Checkbox */}
                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border">
                        <Checkbox
                          id="confirmation"
                          checked={paymentData.confirmationChecked || false}
                          onCheckedChange={(checked) => setPaymentData(prev => ({ ...prev, confirmationChecked: !!checked }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor="confirmation" className="text-sm font-medium cursor-pointer">
                            I confirm I have made the bank transfer
                          </Label>
                          <p className="text-xs text-gray-600 mt-1">
                            By checking this box, you confirm that you have completed the bank transfer using the details provided above.
                          </p>
                        </div>
                      </div>
                      {validationErrors.confirmation && (
                        <p className="text-sm text-red-600">{validationErrors.confirmation}</p>
                      )}
                    </div>
                  )}

                  {/* Diaspora payment removed */}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('method')}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      Process Payment
                    </Button>
                  </div>
                </div>
              )}

              {step === 'processing' && (
                <div className="text-center space-y-4 py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CreditCard className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Processing Your Payment</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Please wait while we process your payment...
                    </p>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Payment Submitted!</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {`Your bank transfer of ${formatCurrency(offer.deposit_amount)} has been submitted for verification.`}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Your payment will be verified within 1-2 business days. You will receive an email confirmation once verified.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
