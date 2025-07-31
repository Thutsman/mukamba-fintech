'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Building, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EarningsEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (earningsData: EarningsData) => void;
}

const earningsSchema = z.object({
  // Deal Information
  propertyTitle: z.string().min(5, "Property title is required"),
  propertyType: z.enum(['house', 'apartment', 'townhouse', 'land', 'commercial']),
  dealType: z.enum(['sale', 'rent_to_buy', 'rental']),
  
  // Financial Details
  dealAmount: z.string().min(1, "Deal amount is required"),
  commissionPercentage: z.string().min(1, "Commission percentage is required"),
  commissionAmount: z.string().min(1, "Commission amount is required"),
  
  // Client Information
  clientName: z.string().min(2, "Client name is required"),
  clientEmail: z.string().email("Valid email is required"),
  
  // Deal Details
  closingDate: z.string().min(1, "Closing date is required"),
  paymentStatus: z.enum(['paid', 'pending', 'partial']),
  notes: z.string().optional(),
  
  // System fields (optional for form, will be added on submit)
  id: z.string().optional(),
  createdAt: z.string().optional(),
});

type EarningsData = z.infer<typeof earningsSchema>;

export const EarningsEntryModal: React.FC<EarningsEntryModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<EarningsData>({
    resolver: zodResolver(earningsSchema),
    defaultValues: {
      dealType: 'sale',
      propertyType: 'house',
      paymentStatus: 'paid',
      closingDate: new Date().toISOString().split('T')[0]
    }
  });

  const watchDealAmount = form.watch('dealAmount');
  const watchCommissionPercentage = form.watch('commissionPercentage');

  // Auto-calculate commission amount
  React.useEffect(() => {
    const dealAmount = parseFloat(watchDealAmount) || 0;
    const commissionPercentage = parseFloat(watchCommissionPercentage) || 0;
    const commissionAmount = (dealAmount * commissionPercentage) / 100;
    
    if (dealAmount > 0 && commissionPercentage > 0) {
      form.setValue('commissionAmount', commissionAmount.toFixed(2));
    }
  }, [watchDealAmount, watchCommissionPercentage, form]);

  const handleSubmit = async (data: EarningsData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call to save earnings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete({
        ...data,
        id: `earning_${Date.now()}`,
        createdAt: new Date().toISOString(),
        dealAmount: data.dealAmount,
        commissionPercentage: data.commissionPercentage,
        commissionAmount: data.commissionAmount
      });
      
      handleClose();
    } catch (error) {
      console.error('Failed to save earnings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="shadow-2xl">
            <CardHeader>
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
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <CardTitle className="text-xl text-center">
                Record Earnings
              </CardTitle>
            </CardHeader>

            <CardContent className="px-6 py-4">
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Deal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">Deal Information</h3>
                  
                  <div>
                    <Label htmlFor="propertyTitle">Property Title *</Label>
                    <Input
                      id="propertyTitle"
                      {...form.register('propertyTitle')}
                      placeholder="3 Bedroom House in Sandton"
                    />
                    {form.formState.errors.propertyTitle && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.propertyTitle.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Property Type *</Label>
                      <Select onValueChange={(value) => form.setValue('propertyType', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Deal Type *</Label>
                      <Select onValueChange={(value) => form.setValue('dealType', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select deal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">Sale</SelectItem>
                          <SelectItem value="rent_to_buy">Rent-to-Buy</SelectItem>
                          <SelectItem value="rental">Rental</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">Financial Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="dealAmount">Deal Amount (R) *</Label>
                      <Input
                        id="dealAmount"
                        type="number"
                        step="0.01"
                        {...form.register('dealAmount')}
                        placeholder="2,500,000"
                      />
                      {form.formState.errors.dealAmount && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.dealAmount.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="commissionPercentage">Commission % *</Label>
                      <Input
                        id="commissionPercentage"
                        type="number"
                        step="0.01"
                        {...form.register('commissionPercentage')}
                        placeholder="3.5"
                      />
                      {form.formState.errors.commissionPercentage && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.commissionPercentage.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="commissionAmount">Commission Amount (R) *</Label>
                      <Input
                        id="commissionAmount"
                        type="number"
                        step="0.01"
                        {...form.register('commissionAmount')}
                        placeholder="87,500"
                        readOnly
                      />
                      {form.formState.errors.commissionAmount && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.commissionAmount.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">Client Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Client Name *</Label>
                      <Input
                        id="clientName"
                        {...form.register('clientName')}
                        placeholder="John Doe"
                      />
                      {form.formState.errors.clientName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.clientName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="clientEmail">Client Email *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        {...form.register('clientEmail')}
                        placeholder="john@example.com"
                      />
                      {form.formState.errors.clientEmail && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.clientEmail.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deal Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">Deal Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="closingDate">Closing Date *</Label>
                      <Input
                        id="closingDate"
                        type="date"
                        {...form.register('closingDate')}
                      />
                      {form.formState.errors.closingDate && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.closingDate.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Payment Status *</Label>
                      <Select onValueChange={(value) => form.setValue('paymentStatus', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      {...form.register('notes')}
                      placeholder="Any additional notes about this deal..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Record Earnings
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 