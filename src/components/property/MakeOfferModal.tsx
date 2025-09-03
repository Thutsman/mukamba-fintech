'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  DollarSign, 
  Calendar, 
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
  TrendingUp,
  TrendingDown,
  FileText,
  Shield,
  Calculator,
  Percent,
  CreditCard,
  Banknote
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { PropertyListing } from '@/types/property';
import { User as UserType } from '@/types/auth';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyListing;
  user: UserType;
  onSubmit: (data: OfferData) => Promise<void>;
}

interface OfferData {
  offerPrice: number;
  financingMethod: 'cash' | 'installment' | 'bank_loan';
  downPayment?: number;
  monthlyPayment?: number;
  offerExpiration: number; // days
  conditions: string[];
  additionalConditions: string;
  earnestMoney: number;
  closingDate: string;
  contingencies: {
    inspection: boolean;
    financing: boolean;
    appraisal: boolean;
    saleOfCurrentHome: boolean;
  };
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  isOpen,
  onClose,
  property,
  user,
  onSubmit
}) => {
  const [step, setStep] = React.useState<'form' | 'review' | 'submitting' | 'success'>('form');
  const [formData, setFormData] = React.useState<OfferData>({
    offerPrice: property.financials.price,
    financingMethod: 'cash',
    offerExpiration: 7,
    conditions: [],
    additionalConditions: '',
    earnestMoney: Math.round(property.financials.price * 0.02), // 2% default
    closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    contingencies: {
      inspection: true,
      financing: false,
      appraisal: false,
      saleOfCurrentHome: false
    }
  });
  const [isLoading, setIsLoading] = React.useState(false);

  // Calculate monthly payment for installment
  React.useEffect(() => {
    if (formData.financingMethod === 'installment' && formData.downPayment) {
      const remainingAmount = formData.offerPrice - formData.downPayment;
      const monthlyPayment = Math.round(remainingAmount / 12); // Simple 12-month calculation
      setFormData(prev => ({ ...prev, monthlyPayment }));
    }
  }, [formData.financingMethod, formData.downPayment, formData.offerPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handleConfirmOffer = async () => {
    setIsLoading(true);
    setStep('submitting');
    
    try {
      await onSubmit(formData);
      setStep('success');
      setTimeout(() => {
        onClose();
        setStep('form');
        setFormData({
          offerPrice: property.financials.price,
          financingMethod: 'cash',
          offerExpiration: 7,
          conditions: [],
          additionalConditions: '',
          earnestMoney: Math.round(property.financials.price * 0.02),
          closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          contingencies: {
            inspection: true,
            financing: false,
            appraisal: false,
            saleOfCurrentHome: false
          }
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to submit offer:', error);
      setStep('review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setStep('form');
      setFormData({
        offerPrice: property.financials.price,
        financingMethod: 'cash',
        offerExpiration: 7,
        conditions: [],
        additionalConditions: '',
        earnestMoney: Math.round(property.financials.price * 0.02),
        closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contingencies: {
          inspection: true,
          financing: false,
          appraisal: false,
          saleOfCurrentHome: false
        }
      });
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-lg shadow-2xl"
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Property Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{property.title}</h4>
                        <p className="text-sm text-gray-600">{property.location.streetAddress}, {property.location.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Listed Price</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(property.financials.price)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Offer Price */}
                  <div className="space-y-3">
                    <Label htmlFor="offerPrice" className="text-base font-medium">Your Offer Price</Label>
                    <div className="relative">
                      <Input
                        id="offerPrice"
                        type="number"
                        value={formData.offerPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, offerPrice: Number(e.target.value) }))}
                        className="text-lg font-semibold pr-20"
                        required
                        min={1}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {property.financials.currency}
                      </div>
                    </div>
                    
                    {/* Price comparison */}
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
                  </div>

                  {/* Financing Method */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Financing Method</Label>
                    <RadioGroup
                      value={formData.financingMethod}
                      onValueChange={(value: OfferData['financingMethod']) => 
                        setFormData(prev => ({ ...prev, financingMethod: value }))
                      }
                      className="grid grid-cols-3 gap-3"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="cursor-pointer">
                          <div className="flex items-center">
                            <Banknote className="w-4 h-4 mr-2" />
                            Cash
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="installment" id="installment" />
                        <Label htmlFor="installment" className="cursor-pointer">
                          <div className="flex items-center">
                            <Calculator className="w-4 h-4 mr-2" />
                            Installment
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="bank_loan" id="bank_loan" />
                        <Label htmlFor="bank_loan" className="cursor-pointer">
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Bank Loan
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Down Payment (for installment) */}
                  {formData.financingMethod === 'installment' && (
                    <div className="space-y-3">
                      <Label htmlFor="downPayment" className="text-base font-medium">Down Payment</Label>
                      <div className="relative">
                        <Input
                          id="downPayment"
                          type="number"
                          value={formData.downPayment || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, downPayment: Number(e.target.value) }))}
                          className="pr-20"
                          placeholder="Enter down payment amount"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {property.financials.currency}
                        </div>
                      </div>
                      {formData.downPayment && (
                        <div className="text-sm text-gray-600">
                          Monthly payment: {formatCurrency(formData.monthlyPayment || 0)} for 12 months
                        </div>
                      )}
                    </div>
                  )}

                  {/* Offer Expiration */}
                  <div className="space-y-3">
                    <Label htmlFor="offerExpiration" className="text-base font-medium">Offer Expires In</Label>
                    <select
                      id="offerExpiration"
                      value={formData.offerExpiration}
                      onChange={(e) => setFormData(prev => ({ ...prev, offerExpiration: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value={1}>1 day</option>
                      <option value={3}>3 days</option>
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                    </select>
                  </div>

                  {/* Earnest Money */}
                  <div className="space-y-3">
                    <Label htmlFor="earnestMoney" className="text-base font-medium">Earnest Money Deposit</Label>
                    <div className="relative">
                      <Input
                        id="earnestMoney"
                        type="number"
                        value={formData.earnestMoney}
                        onChange={(e) => setFormData(prev => ({ ...prev, earnestMoney: Number(e.target.value) }))}
                        className="pr-20"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {property.financials.currency}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Typically 1-3% of the offer price. This shows your serious intent to purchase.
                    </p>
                  </div>

                  {/* Closing Date */}
                  <div className="space-y-3">
                    <Label htmlFor="closingDate" className="text-base font-medium">Preferred Closing Date</Label>
                    <Input
                      id="closingDate"
                      type="date"
                      value={formData.closingDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, closingDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* Contingencies */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Contingencies</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inspection"
                          checked={formData.contingencies.inspection}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              contingencies: { ...prev.contingencies, inspection: checked as boolean }
                            }))
                          }
                        />
                        <Label htmlFor="inspection" className="cursor-pointer">Home Inspection</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="financing"
                          checked={formData.contingencies.financing}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              contingencies: { ...prev.contingencies, financing: checked as boolean }
                            }))
                          }
                        />
                        <Label htmlFor="financing" className="cursor-pointer">Financing Approval</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="appraisal"
                          checked={formData.contingencies.appraisal}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              contingencies: { ...prev.contingencies, appraisal: checked as boolean }
                            }))
                          }
                        />
                        <Label htmlFor="appraisal" className="cursor-pointer">Appraisal</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saleOfCurrentHome"
                          checked={formData.contingencies.saleOfCurrentHome}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              contingencies: { ...prev.contingencies, saleOfCurrentHome: checked as boolean }
                            }))
                          }
                        />
                        <Label htmlFor="saleOfCurrentHome" className="cursor-pointer">Sale of Current Home</Label>
                      </div>
                    </div>
                  </div>

                  {/* Additional Conditions */}
                  <div className="space-y-3">
                    <Label htmlFor="additionalConditions" className="text-base font-medium">Additional Conditions or Notes</Label>
                    <Textarea
                      id="additionalConditions"
                      value={formData.additionalConditions}
                      onChange={(e) => setFormData(prev => ({ ...prev, additionalConditions: e.target.value }))}
                      placeholder="Any additional conditions, requests, or notes for the seller..."
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
                      disabled={isLoading}
                    >
                      Review Offer
                    </Button>
                  </div>
                </form>
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
                        <span className="text-gray-600">Financing:</span>
                        <div className="font-semibold capitalize">{formData.financingMethod.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Earnest Money:</span>
                        <div className="font-semibold">{formatCurrency(formData.earnestMoney)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Closing Date:</span>
                        <div className="font-semibold">{new Date(formData.closingDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Contingencies Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-3">Contingencies</h3>
                    <div className="space-y-1">
                      {Object.entries(formData.contingencies).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className={`text-sm font-medium ${value ? 'text-green-600' : 'text-gray-500'}`}>
                            {value ? 'Yes' : 'No'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Conditions */}
                  {formData.additionalConditions && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Additional Conditions</h3>
                      <p className="text-sm text-gray-700">{formData.additionalConditions}</p>
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
                      disabled={isLoading}
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
                  <div>
                    <h3 className="font-semibold text-gray-800">Submitting Your Offer</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Please wait while we submit your offer to the seller...
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
                    <h3 className="font-semibold text-gray-800">Offer Submitted Successfully!</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Your offer has been sent to the seller. You'll receive a response within {formData.offerExpiration} days.
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
