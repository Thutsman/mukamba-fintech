'use client';

/**
 * MakeOfferModal - Simplified buyer offer flow for Mukamba Gateway
 * 
 * Features:
 * - Admin-defined financial terms validation
 * - Simplified form with 5 key fields
 * - Real-time validation against property requirements
 * - Prepared for Ecocash payment integration
 * - Mobile-responsive design with accessibility features
 * 
 * Next Steps for Ecocash Integration:
 * - After form submission, trigger Ecocash payment modal for deposit
 * - On payment success, mark offer as "Deposit Paid"
 * - Store transaction in offer_payments table
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
  TrendingUp,
  TrendingDown,
  Calculator,
  Banknote,
  Clock,
  Info,
  CreditCard
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PropertyListing } from '@/types/property';
import { User as UserType } from '@/types/auth';
import { createPropertyOffer } from '@/lib/offer-services';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyListing;
  user: UserType;
  onSubmit?: (data: OfferData) => Promise<void>;
  onViewOffers?: () => void;
}

interface OfferData {
  offerPrice: number;
  depositOffered: number;
  paymentMethod: 'cash' | 'installments';
  estimatedTimeline: string;
  monthlyInstallment: number;
  additionalNotes: string;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  isOpen,
  onClose,
  property,
  user,
  onSubmit,
  onViewOffers
}) => {
  const [step, setStep] = React.useState<'form' | 'review' | 'submitting' | 'success'>('form');
  const [formData, setFormData] = React.useState<OfferData>({
    offerPrice: 0, // Start with 0, let user input their own amount
    depositOffered: 0, // Start with 0, let user input their own amount
    paymentMethod: 'cash',
    estimatedTimeline: '', // Start empty, let user input their own timeline
    monthlyInstallment: 0, // Start with 0, let user input their own amount
    additionalNotes: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // Keep cross-field validations in sync as user types
  React.useEffect(() => {
    const errors: Record<string, string> = {};

    // Offer price validations
    if (formData.offerPrice <= 0) {
      errors.offerPrice = 'Please enter an offer price';
    } else {
      const minOffer = property.financials.price * 0.7;
      const maxOffer = property.financials.price;
      if (formData.offerPrice < minOffer) {
        errors.offerPrice = `Offer must be at least ${formatCurrency(minOffer)} (70% of listed price)`;
      } else if (formData.offerPrice > maxOffer) {
        errors.offerPrice = `Offer cannot exceed ${formatCurrency(maxOffer)} (listed price)`;
      }
    }

    if (formData.paymentMethod === 'installments') {
      // Deposit
      if (formData.depositOffered <= 0) {
        errors.depositOffered = 'Please enter a deposit amount';
      } else {
        const minDeposit = property.financials.price * 0.4;
        if (formData.depositOffered < minDeposit) {
          errors.depositOffered = `Deposit must be at least ${formatCurrency(minDeposit)} (40% of listed price)`;
        }
        if (property.financials.rentToBuyDeposit && formData.depositOffered < property.financials.rentToBuyDeposit) {
          errors.depositOffered = `Deposit must be at least ${formatCurrency(property.financials.rentToBuyDeposit)}`;
        }
      }

      // Timeline
      const months = getTimelineMonths(formData.estimatedTimeline);
      if (!formData.estimatedTimeline) {
        errors.estimatedTimeline = 'Please enter an estimated completion timeline';
      } else if (months === 0) {
        errors.estimatedTimeline = 'Timeline must be greater than 0 months for installments';
      } else if (property.financials.paymentDuration && months > property.financials.paymentDuration) {
        errors.estimatedTimeline = `Timeline cannot exceed ${property.financials.paymentDuration} months`;
      }

      // Monthly installment vs requirement
      if (formData.monthlyInstallment <= 0) {
        errors.monthlyInstallment = 'Please enter a monthly installment amount';
      } else if (months > 0) {
        const remaining = formData.offerPrice - formData.depositOffered;
        const required = remaining / months;
        if (formData.monthlyInstallment < required) {
          errors.monthlyInstallment = `Monthly payment must be at least ${formatCurrency(required)} to complete payment in ${months} months`;
        }
      }
    }

    setValidationErrors(errors);
  }, [formData.offerPrice, formData.depositOffered, formData.paymentMethod, formData.estimatedTimeline, formData.monthlyInstallment, property.financials.price, property.financials.paymentDuration, property.financials.rentToBuyDeposit]);

  // Auto-calculate monthly installment when offer price, deposit, or timeline changes
  React.useEffect(() => {
    if (formData.paymentMethod === 'installments' && 
        formData.offerPrice > 0 && 
        formData.depositOffered > 0 && 
        formData.estimatedTimeline && 
        formData.estimatedTimeline !== 'ready_to_pay_in_full') {
      
      const months = getTimelineMonths(formData.estimatedTimeline);
      if (months > 0) {
        const remainingAmount = formData.offerPrice - formData.depositOffered;
        const calculatedMonthly = remainingAmount / months;
        
        // Only auto-calculate if the current monthly installment is 0 or very close to the calculated value
        // This prevents overriding user's manual input
        if (formData.monthlyInstallment === 0 || Math.abs(formData.monthlyInstallment - calculatedMonthly) < 1) {
          setFormData(prev => ({ ...prev, monthlyInstallment: calculatedMonthly }));
        }
      }
    }
  }, [formData.offerPrice, formData.depositOffered, formData.estimatedTimeline, formData.paymentMethod]);

  // Real-time validation function
  const validateField = (field: string, value: any) => {
    const errors: Record<string, string> = { ...validationErrors };

    if (field === 'offerPrice') {
      const offerPrice = Number(value);
      
      if (offerPrice <= 0) {
        errors.offerPrice = 'Please enter an offer price';
      } else {
        const minimumOffer = property.financials.price * 0.7;
        const maximumOffer = property.financials.price;
        
        if (offerPrice < minimumOffer) {
          errors.offerPrice = `Offer must be at least ${formatCurrency(minimumOffer)} (70% of listed price)`;
        } else if (offerPrice > maximumOffer) {
          errors.offerPrice = `Offer cannot exceed ${formatCurrency(maximumOffer)} (listed price)`;
        } else {
          delete errors.offerPrice; // Clear error if valid
        }
      }
    }

    if (field === 'depositOffered') {
      const depositOffered = Number(value);
      
      if (depositOffered <= 0) {
        errors.depositOffered = 'Please enter a deposit amount';
      } else {
        const minimumDeposit = property.financials.price * 0.4; // 40% of listed price
        
        if (depositOffered < minimumDeposit) {
          errors.depositOffered = `Deposit must be at least ${formatCurrency(minimumDeposit)} (40% of listed price)`;
        } else {
          delete errors.depositOffered; // Clear error if valid
        }
      }
    }

    if (field === 'monthlyInstallment') {
      const monthlyInstallment = Number(value);
      
      if (monthlyInstallment <= 0) {
        errors.monthlyInstallment = 'Please enter a monthly installment amount';
      } else {
        // Validate against timeline if both are provided
        if (formData.estimatedTimeline && formData.estimatedTimeline !== 'ready_to_pay_in_full') {
          const timelineMonths = getTimelineMonths(formData.estimatedTimeline);
          const remainingAmount = formData.offerPrice - formData.depositOffered;
          const requiredMonthlyPayment = timelineMonths > 0 ? (remainingAmount / timelineMonths) : Infinity;
          
          if (timelineMonths === 0) {
            errors.monthlyInstallment = 'Please provide a valid timeline in months (> 0)';
          } else if (monthlyInstallment < requiredMonthlyPayment) {
            errors.monthlyInstallment = `Monthly payment must be at least ${formatCurrency(requiredMonthlyPayment)} to complete payment in ${timelineMonths} months`;
          } else {
            delete errors.monthlyInstallment;
          }
        } else {
          delete errors.monthlyInstallment; // Clear error if valid
        }
      }
    }

    setValidationErrors(errors);
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate that offer price is provided
    if (formData.offerPrice <= 0) {
      errors.offerPrice = 'Please enter an offer price';
    }

    // Validate offer price range (70% to 100% of listed price)
    const minimumOffer = property.financials.price * 0.7;
    const maximumOffer = property.financials.price;
    
    if (formData.offerPrice > 0 && formData.offerPrice < minimumOffer) {
      errors.offerPrice = `Offer must be at least ${formatCurrency(minimumOffer)} (70% of listed price)`;
    }
    
    if (formData.offerPrice > maximumOffer) {
      errors.offerPrice = `Offer cannot exceed ${formatCurrency(maximumOffer)} (listed price)`;
    }

    // Only validate deposit and timeline for installments
    if (formData.paymentMethod === 'installments') {
      // Validate that deposit is provided
      if (formData.depositOffered <= 0) {
        errors.depositOffered = 'Please enter a deposit amount';
      } else {
        // Validate minimum deposit (40% of listed price)
        const minimumDeposit = property.financials.price * 0.4;
        if (formData.depositOffered < minimumDeposit) {
          errors.depositOffered = `Deposit must be at least ${formatCurrency(minimumDeposit)} (40% of listed price)`;
        }
        
        // Also validate against property-specific required deposit if higher
        if (property.financials.rentToBuyDeposit && formData.depositOffered < property.financials.rentToBuyDeposit) {
          errors.depositOffered = `Deposit must be at least ${formatCurrency(property.financials.rentToBuyDeposit)}`;
        }
      }

      // Validate that timeline is provided
      if (!formData.estimatedTimeline) {
        errors.estimatedTimeline = 'Please enter an estimated completion timeline';
      }

      // Validate that monthly installment is provided
      if (formData.monthlyInstallment <= 0) {
        errors.monthlyInstallment = 'Please enter a monthly installment amount';
      } else {
        // Validate monthly installment against timeline
        if (formData.estimatedTimeline && formData.estimatedTimeline !== 'ready_to_pay_in_full') {
          const timelineMonths = getTimelineMonths(formData.estimatedTimeline);
          const remainingAmount = formData.offerPrice - formData.depositOffered;
          const requiredMonthlyPayment = timelineMonths > 0 ? (remainingAmount / timelineMonths) : Infinity;
          
          if (timelineMonths === 0) {
            errors.estimatedTimeline = 'Timeline must be greater than 0 months for installments';
          } else if (formData.monthlyInstallment < requiredMonthlyPayment) {
            errors.monthlyInstallment = `Monthly payment must be at least ${formatCurrency(requiredMonthlyPayment)} to complete payment in ${timelineMonths} months`;
          }
        }
      }

      // Validate timeline against payment duration
      if (property.financials.paymentDuration) {
        const timelineMonths = getTimelineMonths(formData.estimatedTimeline);
        if (timelineMonths > property.financials.paymentDuration) {
          errors.estimatedTimeline = `Timeline cannot exceed ${property.financials.paymentDuration} months`;
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to get timeline in months
  const getTimelineMonths = (timeline: string): number => {
    if (!timeline) return 0;
    if (timeline === 'ready_to_pay_in_full') return 0;
    if (timeline.endsWith('_months')) {
      const num = Number(timeline.replace('_months', ''));
      return Number.isFinite(num) && num > 0 ? num : 0;
    }
    // Fallback for unexpected raw numeric strings
    const parsed = Number(timeline);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };

  // Helper to suggest months based on user's preferred monthly payment
  const getSuggestedMonths = (remainingAmount: number, monthlyInstallment: number): number => {
    if (!Number.isFinite(remainingAmount) || remainingAmount <= 0) return 0;
    if (!Number.isFinite(monthlyInstallment) || monthlyInstallment <= 0) return 0;
    return Math.ceil(remainingAmount / monthlyInstallment);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
    setStep('review');
    }
  };

  const handleConfirmOffer = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setStep('submitting');
    
    try {
      // Prepare offer data with appropriate defaults for cash payments
      const offerData = {
        property_id: property.id,
        buyer_id: user.id,
        // seller_id is optional for admin-listed properties
        offer_price: formData.offerPrice,
        deposit_amount: formData.paymentMethod === 'cash' ? formData.offerPrice : formData.depositOffered,
        payment_method: formData.paymentMethod,
        estimated_timeline: formData.paymentMethod === 'cash' ? 'ready_to_pay_in_full' : formData.estimatedTimeline,
        additional_notes: formData.additionalNotes
      };

      // Submit to property_offers table
      const offerId = await createPropertyOffer(offerData);

      if (offerId) {
        // Call custom onSubmit if provided
        if (onSubmit) {
      await onSubmit(formData);
        }
        
      setStep('success');
      // Remove auto-close timeout - modal will only close when user clicks "View offer Submitted"
      } else {
        throw new Error('Failed to create offer');
      }
    } catch (error) {
      console.error('Failed to submit offer:', error);
      setStep('review');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setFormData({
      offerPrice: 0,
      depositOffered: 0,
      paymentMethod: 'cash',
      estimatedTimeline: '',
      monthlyInstallment: 0,
      additionalNotes: ''
    });
    setValidationErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForm();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: property.financials.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const priceDifference = formData.offerPrice - property.financials.price;
  const priceDifferencePercent = (priceDifference / property.financials.price) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-lg shadow-2xl mx-4 sm:mx-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="w-6 h-6" />
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <DollarSign className="w-6 h-6 text-green-600" />
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
                {step === 'form' && 'Make an Offer'}
                {step === 'review' && 'Review Your Offer'}
                {step === 'submitting' && 'Submitting Offer'}
                {step === 'success' && 'Offer Submitted!'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {step === 'form' && `Submit your offer for ${property.title}`}
                {step === 'review' && 'Please review your offer details before submitting'}
                {step === 'submitting' && 'Please wait while we submit your offer...'}
                {step === 'success' && 'Your offer has been submitted successfully!'}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
              {step === 'form' && (
                <TooltipProvider>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Property Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{property.title}</h4>
                        <p className="text-sm text-gray-600">{property.location.suburb}, {property.location.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Listed Price</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(property.financials.price)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                      <Label className="text-base font-medium">How will you pay?</Label>
                    <RadioGroup
                        value={formData.paymentMethod}
                        onValueChange={(value: OfferData['paymentMethod']) => 
                          setFormData(prev => ({ ...prev, paymentMethod: value }))
                      }
                      className="grid grid-cols-1 gap-3"
                    >
                      <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.paymentMethod === 'cash' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}>
                        <RadioGroupItem 
                          value="cash" 
                          id="cash" 
                          className="w-5 h-5 border-2 border-gray-400 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                        />
                        <Label htmlFor="cash" className="cursor-pointer flex-1">
                          <div className="flex items-center">
                            <Banknote className="w-5 h-5 mr-3 text-gray-600" />
                            <span className="text-base font-medium">Cash</span>
                          </div>
                        </Label>
                      </div>
                      <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.paymentMethod === 'installments' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}>
                          <RadioGroupItem 
                            value="installments" 
                            id="installments" 
                            className="w-5 h-5 border-2 border-gray-400 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                          />
                          <Label htmlFor="installments" className="cursor-pointer flex-1">
                          <div className="flex items-center">
                              <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                              <span className="text-base font-medium">Installments</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Offer Price */}
                  <div className="space-y-3">
                    <Label htmlFor="offerPrice" className="text-base font-medium">Your Offer Price</Label>
                    <div className="relative">
                      <Input
                        id="offerPrice"
                        type="number"
                        value={formData.offerPrice || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = value === '' ? 0 : Number(value);
                          setFormData(prev => ({ 
                            ...prev, 
                            offerPrice: numericValue 
                          }));
                          // Real-time validation
                          validateField('offerPrice', numericValue);
                        }}
                          className="text-lg font-semibold pr-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        required
                        min={1}
                          placeholder="Enter your offer price"
                          aria-describedby="offer-price-help"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {property.financials.currency}
                      </div>
                    </div>
                    
                    {/* Price comparison */}
                      {formData.offerPrice > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price difference:</span>
                      <div className={`flex items-center ${
                        priceDifference > 0 ? 'text-green-600' : 
                        priceDifference < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {priceDifference > 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : priceDifference < 0 ? (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        ) : null}
                        {formatCurrency(Math.abs(priceDifference))} ({priceDifferencePercent.toFixed(1)}%)
                      </div>
                    </div>
                      )}
                      {validationErrors.offerPrice && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.offerPrice}
                        </p>
                      )}
                  </div>

                    {/* Deposit Offered - Only show for installments */}
                    {formData.paymentMethod === 'installments' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="depositOffered" className="text-base font-medium">Deposit Offered</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>This shows your commitment to purchase. Must match or exceed the required deposit.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <Input
                            id="depositOffered"
                            type="number"
                            value={formData.depositOffered || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numericValue = value === '' ? 0 : Number(value);
                              setFormData(prev => ({ 
                                ...prev, 
                                depositOffered: numericValue 
                              }));
                              // Real-time validation
                              validateField('depositOffered', numericValue);
                            }}
                            className="pr-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            required
                            min={0}
                            placeholder="Enter deposit amount"
                            aria-describedby="deposit-help"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {property.financials.currency}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Minimum deposit: {formatCurrency(property.financials.price * 0.4)} (40% of listed price)
                        </p>
                        {property.financials.rentToBuyDeposit && property.financials.rentToBuyDeposit > (property.financials.price * 0.4) && (
                          <p className="text-xs text-gray-500">
                            Property-specific required deposit: {formatCurrency(property.financials.rentToBuyDeposit)}
                          </p>
                        )}
                        {validationErrors.depositOffered && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationErrors.depositOffered}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Estimated Completion Timeline - Only show for installments */}
                    {formData.paymentMethod === 'installments' && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="estimatedTimeline" className="text-base font-medium">Estimated Completion Timeline</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>How long do you expect to complete full payment? Enter number of months or "0" for ready to pay in full.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                    <div className="relative">
                      <Input
                            id="estimatedTimeline"
                        type="number"
                            value={formData.estimatedTimeline === 'ready_to_pay_in_full' ? '0' : (formData.estimatedTimeline.replace('_months', '') || '')}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                setFormData(prev => ({ ...prev, estimatedTimeline: '' }));
                              } else if (value === '0') {
                                setFormData(prev => ({ ...prev, estimatedTimeline: 'ready_to_pay_in_full' }));
                              } else {
                                const timelineValue = `${value}_months`;
                                setFormData(prev => ({ ...prev, estimatedTimeline: timelineValue }));
                                
                                // Auto-calculate monthly installment when timeline is entered
                                if (formData.offerPrice > 0 && formData.depositOffered > 0) {
                                  const months = Number(value);
                                  if (months > 0) {
                                    const remainingAmount = formData.offerPrice - formData.depositOffered;
                                    const calculatedMonthly = remainingAmount / months;
                                    setFormData(prev => ({ ...prev, monthlyInstallment: calculatedMonthly }));
                                  }
                                }
                              }
                              // Re-validate monthly installment when timeline changes
                              if (formData.monthlyInstallment > 0) {
                                validateField('monthlyInstallment', formData.monthlyInstallment);
                              }
                            }}
                            className="pr-16 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            placeholder="Enter number of months (0 for ready to pay in full)"
                            min={0}
                            aria-describedby="timeline-help"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            months
                      </div>
                    </div>
                        {property.financials.paymentDuration && (
                    <p className="text-xs text-gray-500">
                            Maximum allowed: {property.financials.paymentDuration} months
                          </p>
                        )}
                        {/* Show calculated monthly payment requirement */}
                        {formData.offerPrice > 0 && formData.depositOffered > 0 && formData.estimatedTimeline && formData.estimatedTimeline !== 'ready_to_pay_in_full' && getTimelineMonths(formData.estimatedTimeline) > 0 && (
                          <p className="text-xs text-blue-600">
                            Required monthly payment: {formatCurrency((formData.offerPrice - formData.depositOffered) / getTimelineMonths(formData.estimatedTimeline))} to complete in {formData.estimatedTimeline.replace('_months', '')} months
                          </p>
                        )}
                        {validationErrors.estimatedTimeline && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationErrors.estimatedTimeline}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Monthly Installment Amount - Only show for installments */}
                    {formData.paymentMethod === 'installments' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="monthlyInstallment" className="text-base font-medium">Monthly Installment Amount</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Enter your preferred monthly payment amount for the remaining balance after deposit. This will be auto-calculated when you enter the timeline.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <Input
                            id="monthlyInstallment"
                            type="number"
                            value={formData.monthlyInstallment || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numericValue = value === '' ? 0 : Number(value);
                              setFormData(prev => ({ 
                                ...prev, 
                                monthlyInstallment: numericValue 
                              }));
                              // Real-time validation
                              validateField('monthlyInstallment', numericValue);
                            }}
                            className="pr-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            placeholder="Enter monthly installment amount"
                            min={0}
                            aria-describedby="monthly-installment-help"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {property.financials.currency}
                          </div>
                        </div>
                        {validationErrors.monthlyInstallment && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationErrors.monthlyInstallment}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Additional Notes */}
                  <div className="space-y-3">
                      <Label htmlFor="additionalNotes" className="text-base font-medium">Message to Seller (optional)</Label>
                    <Textarea
                        id="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                        placeholder="Any additional message or notes for the seller..."
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
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
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isLoading || Object.keys(validationErrors).length > 0}
                    >
                      Review Offer
                    </Button>
                  </div>
                </form>
                </TooltipProvider>
              )}

              {step === 'review' && (
                <div className="space-y-6">
                  {/* Offer Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-3">Offer Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Offer Price:</span>
                        <div className="font-semibold text-lg">{formatCurrency(formData.offerPrice)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment Method:</span>
                        <div className="font-semibold capitalize">{formData.paymentMethod}</div>
                      </div>
                      {formData.paymentMethod === 'installments' && (
                        <>
                      <div>
                            <span className="text-gray-600">Deposit Offered:</span>
                            <div className="font-semibold">{formatCurrency(formData.depositOffered)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Timeline:</span>
                        <div className="font-semibold">
                          {formData.estimatedTimeline === 'ready_to_pay_in_full' 
                            ? 'Ready to pay in full' 
                            : `${formData.estimatedTimeline.replace('_months', '')} months`
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Monthly Installment:</span>
                        <div className="font-semibold">{formatCurrency(formData.monthlyInstallment)}</div>
                      </div>
                        </>
                      )}
                      {formData.paymentMethod === 'cash' && (
                        <div>
                          <span className="text-gray-600">Payment Type:</span>
                          <div className="font-semibold">Full payment upfront</div>
                      </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Details */}
                  {formData.paymentMethod === 'installments' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-3">Payment Plan</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deposit:</span>
                          <span className="font-medium">{formatCurrency(formData.depositOffered)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Remaining Amount:</span>
                          <span className="font-medium">{formatCurrency(formData.offerPrice - formData.depositOffered)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Your Preferred Monthly Payment:</span>
                          <span className="font-medium">{formatCurrency(formData.monthlyInstallment)}</span>
                        </div>
                        {formData.estimatedTimeline !== 'ready_to_pay_in_full' && getTimelineMonths(formData.estimatedTimeline) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Calculated Monthly Payment:</span>
                            <span className="font-medium">
                              {formatCurrency((formData.offerPrice - formData.depositOffered) / getTimelineMonths(formData.estimatedTimeline))}
                          </span>
                          </div>
                        )}
                        {/* Suggested months in review */}
                        {formData.monthlyInstallment > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Suggested Timeline (at your monthly):</span>
                            <span className="font-medium">
                              {getSuggestedMonths(formData.offerPrice - formData.depositOffered, formData.monthlyInstallment)} months
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cash Payment Details */}
                  {formData.paymentMethod === 'cash' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-3">Cash Payment Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-medium">{formatCurrency(formData.offerPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Type:</span>
                          <span className="font-medium">Full payment upfront</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Timeline:</span>
                          <span className="font-medium">Immediate payment</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {formData.additionalNotes && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Message to Seller</h3>
                      <p className="text-sm text-gray-700">{formData.additionalNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('form')}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Edit Offer
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirmOffer}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isLoading || Object.keys(validationErrors).length > 0}
                    >
                      Submit Offer
                    </Button>
                  </div>
                </div>
              )}

              {step === 'submitting' && (
                <div className="text-center space-y-4 py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </motion.div>
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
                    <p className="text-sm text-gray-600 mt-1">
                      Your offer has been sent to the seller. You'll receive a response soon.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Next step: Complete your deposit payment via Ecocash to secure your offer.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={() => {
                        if (onViewOffers) {
                          onViewOffers();
                        }
                        onClose();
                        resetForm();
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      View Offer Submitted
                    </Button>
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
