'use client';

/**
 * PaymentModal - Payment gateway for approved offers
 * 
 * Features:
 * - Display offer summary with all details
 * - Multiple payment options (Ecocash, Bank Transfer, Diaspora)
 * - Payment status tracking and confirmation
 * - Integration with offer_payments table
 * - Admin notifications on payment completion
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CreditCard,
  Smartphone,
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
import { User as UserType } from '@/types/auth';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: PropertyOffer;
  user: UserType;
  onSubmit?: (paymentData: PaymentData) => Promise<void>;
}

interface PaymentData {
  paymentMethod: 'ecocash' | 'bank_transfer' | 'diaspora';
  phoneNumber?: string;
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
    paymentMethod: 'ecocash',
    amount: offer.deposit_amount
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [uploadingFile, setUploadingFile] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setStep('method');
      setPaymentData({
        paymentMethod: 'ecocash',
        amount: offer.deposit_amount
      });
      setValidationErrors({});
    }
  }, [isOpen, offer.deposit_amount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Bank details for Mukamba FinTech
  const bankDetails = {
    bankName: 'Standard Bank Zimbabwe',
    accountName: 'Mukamba FinTech (Pvt) Ltd',
    accountNumber: '1234567890',
    swiftCode: 'SBICZWHX',
    branchCode: '001',
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

    if (paymentData.paymentMethod === 'ecocash' && !paymentData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required for Ecocash payment';
    }

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
      phoneNumber: method === 'ecocash' ? prev.phoneNumber : undefined,
      bankDetails: method === 'bank_transfer' ? prev.bankDetails : undefined
    }));
    setValidationErrors({});
  };

  const handleSubmit = async () => {
    if (!validatePaymentDetails()) return;
    
    setIsLoading(true);
    setStep('processing');
    
    try {
      if (paymentData.paymentMethod === 'ecocash') {
        // Call Ecocash API to initiate payment
        const response = await fetch('/api/payments/ecocash/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            offer_id: offer.id,
            phone_number: paymentData.phoneNumber,
            amount: paymentData.amount,
            user_id: user.id
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to initiate payment');
        }
        
        // Call custom onSubmit if provided
        if (onSubmit) {
          await onSubmit({
            ...paymentData,
            transaction_id: result.transaction_id,
            payment_id: result.payment_id
          });
        }
        
        // Show sandbox info if available
        if (result.sandbox_info) {
          console.log('Sandbox Info:', result.sandbox_info);
        }
        
        setStep('success');
        setTimeout(() => {
          onClose();
          setStep('method');
        }, 3000);
      } else if (paymentData.paymentMethod === 'bank_transfer') {
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
      } else {
        // Handle other payment methods (diaspora)
        // Simulate processing for now
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Call custom onSubmit if provided
        if (onSubmit) {
          await onSubmit(paymentData);
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
                {step === 'method' && 'Choose Payment Method'}
                {step === 'details' && 'Payment Details'}
                {step === 'processing' && 'Processing Payment'}
                {step === 'success' && 'Payment Successful!'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {step === 'method' && 'Select your preferred payment method'}
                {step === 'details' && 'Enter your payment details'}
                {step === 'processing' && 'Please wait while we process your payment...'}
                {step === 'success' && 'Your payment has been processed successfully!'}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
              {step === 'method' && (
                <div className="space-y-6">
                  {/* Offer Summary */}
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
                  </div>

                  {/* Payment Amount */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <h3 className="font-semibold text-green-800 mb-2">Amount to Pay</h3>
                    <div className="text-3xl font-bold text-green-900">
                      {formatCurrency(offer.deposit_amount)}
                    </div>
                    <p className="text-sm text-green-700 mt-1">Deposit for approved offer</p>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Select Payment Method</Label>
                    <RadioGroup
                      value={paymentData.paymentMethod}
                      onValueChange={handlePaymentMethodChange}
                      className="space-y-3"
                    >
                      <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        paymentData.paymentMethod === 'ecocash' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}>
                        <RadioGroupItem 
                          value="ecocash" 
                          id="ecocash" 
                          className="w-5 h-5 border-2 border-gray-400 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                        />
                        <Label htmlFor="ecocash" className="cursor-pointer flex-1">
                          <div className="flex items-center">
                            <Smartphone className="w-5 h-5 mr-3 text-gray-600" />
                            <div>
                              <span className="text-base font-medium">Ecocash</span>
                              <p className="text-sm text-gray-500">Mobile money payment</p>
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        paymentData.paymentMethod === 'bank_transfer' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}>
                        <RadioGroupItem 
                          value="bank_transfer" 
                          id="bank_transfer" 
                          className="w-5 h-5 border-2 border-gray-400 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                        />
                        <Label htmlFor="bank_transfer" className="cursor-pointer flex-1">
                          <div className="flex items-center">
                            <Building2 className="w-5 h-5 mr-3 text-gray-600" />
                            <div>
                              <span className="text-base font-medium">Bank Transfer</span>
                              <p className="text-sm text-gray-500">Direct bank transfer</p>
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        paymentData.paymentMethod === 'diaspora' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}>
                        <RadioGroupItem 
                          value="diaspora" 
                          id="diaspora" 
                          className="w-5 h-5 border-2 border-gray-400 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                        />
                        <Label htmlFor="diaspora" className="cursor-pointer flex-1">
                          <div className="flex items-center">
                            <Globe className="w-5 h-5 mr-3 text-gray-600" />
                            <div>
                              <span className="text-base font-medium">Diaspora Payment</span>
                              <p className="text-sm text-gray-500">International payment (Stripe/PayPal)</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
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
                      {paymentData.paymentMethod === 'ecocash' && 
                        'You will receive an Ecocash prompt on your mobile device to complete the payment. The amount will be automatically filled in.'
                      }
                      {paymentData.paymentMethod === 'bank_transfer' && 
                        'Transfer the exact amount to our bank account and upload proof of payment. Your payment will be verified manually within 1-2 business days.'
                      }
                      {paymentData.paymentMethod === 'diaspora' && 
                        'You will be redirected to a secure payment gateway for international payment.'
                      }
                    </AlertDescription>
                  </Alert>

                  {/* Sandbox Information */}
                  {paymentData.paymentMethod === 'ecocash' && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        <strong>Testing Mode:</strong> If you're testing, use PIN codes: 0000, 1234, or 9999 to complete the payment.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Payment Details Form */}
                  {paymentData.paymentMethod === 'ecocash' && (
                    <div className="space-y-3">
                      <Label htmlFor="phoneNumber" className="text-base font-medium">Phone Number</Label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={paymentData.phoneNumber || ''}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="e.g., 0771234567 or +263771234567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {validationErrors.phoneNumber && (
                        <p className="text-sm text-red-600">{validationErrors.phoneNumber}</p>
                      )}
                    </div>
                  )}

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

                  {paymentData.paymentMethod === 'diaspora' && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Payment Gateway</Label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          You will be redirected to a secure payment gateway powered by Stripe or PayPal 
                          to complete your international payment.
                        </p>
                      </div>
                    </div>
                  )}

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
                    <h3 className="font-semibold text-gray-800">
                      {paymentData.paymentMethod === 'bank_transfer' ? 'Payment Submitted!' : 'Payment Successful!'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {paymentData.paymentMethod === 'bank_transfer' 
                        ? `Your bank transfer of ${formatCurrency(offer.deposit_amount)} has been submitted for verification.`
                        : `Your payment of ${formatCurrency(offer.deposit_amount)} has been processed successfully.`
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {paymentData.paymentMethod === 'bank_transfer'
                        ? 'Your payment will be verified within 1-2 business days. You will receive an email confirmation once verified.'
                        : 'You will receive a confirmation email shortly.'
                      }
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
