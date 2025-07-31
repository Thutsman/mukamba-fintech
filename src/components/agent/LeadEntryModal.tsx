'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, AlertCircle, Calendar, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface LeadEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (leadData: LeadData) => void;
}

const leadSchema = z.object({
  // Contact Information
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  
  // Property Interest
  propertyInterest: z.string().min(5, "Property interest is required"),
  propertyType: z.enum(['house', 'apartment', 'townhouse', 'land', 'commercial']),
  budget: z.string().min(1, "Budget is required"),
  location: z.string().min(2, "Preferred location is required"),
  
  // Lead Details
  urgency: z.enum(['low', 'medium', 'high']),
  source: z.enum(['website', 'referral', 'social_media', 'walk_in', 'other']),
  notes: z.string().optional(),
  
  // Follow-up
  nextFollowUp: z.string().min(1, "Follow-up date is required"),
});

type LeadData = z.infer<typeof leadSchema>;

export const LeadEntryModal: React.FC<LeadEntryModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LeadData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      urgency: 'medium',
      source: 'website',
      propertyType: 'house',
      nextFollowUp: new Date().toISOString().split('T')[0]
    }
  });

  const handleSubmit = async (data: LeadData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call to save lead
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete({
        ...data,
        id: `lead_${Date.now()}`,
        status: 'new' as const,
        isVerified: false,
        lastContact: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });
      
      handleClose();
    } catch (error) {
      console.error('Failed to save lead:', error);
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
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <UserPlus className="w-6 h-6 text-blue-600" />
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
                Add New Lead
              </CardTitle>
            </CardHeader>

            <CardContent className="px-6 py-4">
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        {...form.register('name')}
                        placeholder="John Doe"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register('email')}
                        placeholder="john@example.com"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...form.register('phone')}
                      placeholder="+27 123 456 789"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Property Interest */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">Property Interest</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyType">Property Type *</Label>
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
                      <Label htmlFor="budget">Budget *</Label>
                      <Input
                        id="budget"
                        {...form.register('budget')}
                        placeholder="R 2,500,000"
                      />
                      {form.formState.errors.budget && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.budget.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Preferred Location *</Label>
                    <Input
                      id="location"
                      {...form.register('location')}
                      placeholder="Sandton, Johannesburg"
                    />
                    {form.formState.errors.location && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.location.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="propertyInterest">Specific Property Interest *</Label>
                    <Textarea
                      id="propertyInterest"
                      {...form.register('propertyInterest')}
                      placeholder="Describe the type of property they're looking for..."
                      rows={3}
                    />
                    {form.formState.errors.propertyInterest && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.propertyInterest.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Lead Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">Lead Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Urgency Level *</Label>
                      <RadioGroup
                        value={form.watch('urgency')}
                        onValueChange={(value) => form.setValue('urgency', value as any)}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="low" />
                          <Label htmlFor="low" className="text-sm">Low</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <Label htmlFor="medium" className="text-sm">Medium</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="high" />
                          <Label htmlFor="high" className="text-sm">High</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Lead Source *</Label>
                      <Select onValueChange={(value) => form.setValue('source', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="walk_in">Walk-in</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="nextFollowUp">Next Follow-up Date *</Label>
                    <Input
                      id="nextFollowUp"
                      type="date"
                      {...form.register('nextFollowUp')}
                    />
                    {form.formState.errors.nextFollowUp && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.nextFollowUp.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      {...form.register('notes')}
                      placeholder="Any additional notes about this lead..."
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
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Lead
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