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
  Info
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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

  const validatePaymentDetails = (): boolean => {
    const errors: Record<string, string> = {};

    if (paymentData.paymentMethod === 'ecocash' && !paymentData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required for Ecocash payment';
    }

    if (paymentData.paymentMethod === 'bank_transfer' && !paymentData.bankDetails) {
      errors.bankDetails = 'Bank details are required for bank transfer';
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
      // Simulate payment processing
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
                        'You will receive an Ecocash prompt on your mobile device to complete the payment.'
                      }
                      {paymentData.paymentMethod === 'bank_transfer' && 
                        'Please provide your bank details for the transfer confirmation.'
                      }
                      {paymentData.paymentMethod === 'diaspora' && 
                        'You will be redirected to a secure payment gateway for international payment.'
                      }
                    </AlertDescription>
                  </Alert>

                  {/* Payment Details Form */}
                  {paymentData.paymentMethod === 'ecocash' && (
                    <div className="space-y-3">
                      <Label htmlFor="phoneNumber" className="text-base font-medium">Phone Number</Label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={paymentData.phoneNumber || ''}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="Enter your phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {validationErrors.phoneNumber && (
                        <p className="text-sm text-red-600">{validationErrors.phoneNumber}</p>
                      )}
                    </div>
                  )}

                  {paymentData.paymentMethod === 'bank_transfer' && (
                    <div className="space-y-3">
                      <Label htmlFor="bankDetails" className="text-base font-medium">Bank Details</Label>
                      <textarea
                        id="bankDetails"
                        value={paymentData.bankDetails || ''}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, bankDetails: e.target.value }))}
                        placeholder="Enter your bank account details"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {validationErrors.bankDetails && (
                        <p className="text-sm text-red-600">{validationErrors.bankDetails}</p>
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
                    <h3 className="font-semibold text-gray-800">Payment Successful!</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Your payment of {formatCurrency(offer.deposit_amount)} has been processed successfully.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      You will receive a confirmation email shortly.
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
