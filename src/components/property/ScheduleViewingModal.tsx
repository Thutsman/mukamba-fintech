'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PropertyListing } from '@/types/property';
import { User as UserType } from '@/types/auth';

interface ScheduleViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyListing;
  user: UserType;
  onSubmit: (data: ViewingData) => Promise<void>;
}

interface ViewingData {
  viewingDate: string;
  viewingTime: string;
  viewingType: 'in_person' | 'virtual' | 'both';
  attendees: number;
  specialRequirements: string;
  contactMethod: 'phone' | 'email' | 'both';
  notes: string;
}

export const ScheduleViewingModal: React.FC<ScheduleViewingModalProps> = ({
  isOpen,
  onClose,
  property,
  user,
  onSubmit
}) => {
  const [step, setStep] = React.useState<'form' | 'submitting' | 'success'>('form');
  const [formData, setFormData] = React.useState<ViewingData>({
    viewingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    viewingTime: '10:00',
    viewingType: 'in_person',
    attendees: 1,
    specialRequirements: '',
    contactMethod: 'both',
    notes: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStep('submitting');
    
    try {
      await onSubmit(formData);
      setStep('success');
      setTimeout(() => {
        onClose();
        setStep('form');
        setFormData({
          viewingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          viewingTime: '10:00',
          viewingType: 'in_person',
          attendees: 1,
          specialRequirements: '',
          contactMethod: 'both',
          notes: ''
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to schedule viewing:', error);
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setStep('form');
      setFormData({
        viewingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        viewingTime: '10:00',
        viewingType: 'in_person',
        attendees: 1,
        specialRequirements: '',
        contactMethod: 'both',
        notes: ''
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-lg shadow-2xl"
        >
          <Card className="border-0">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="w-6 h-6" />
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6 text-blue-600" />
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
                {step === 'form' && 'Schedule Viewing'}
                {step === 'submitting' && 'Scheduling Viewing'}
                {step === 'success' && 'Viewing Scheduled!'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {step === 'form' && `Book a viewing for ${property.title}`}
                {step === 'submitting' && 'Please wait while we schedule your viewing...'}
                {step === 'success' && 'Your viewing has been scheduled successfully!'}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {step === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Property Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{property.title}</h4>
                        <p className="text-sm text-gray-600">{property.location.suburb}, {property.location.city}</p>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{user.firstName} {user.lastName}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.phone && (
                          <p className="text-sm text-gray-600">{user.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Viewing Date */}
                  <div className="space-y-3">
                    <Label htmlFor="viewingDate" className="text-base font-medium">Preferred Date</Label>
                    <Input
                      id="viewingDate"
                      type="date"
                      value={formData.viewingDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, viewingDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <p className="text-sm text-gray-600">
                      Selected: {formatDate(formData.viewingDate)}
                    </p>
                  </div>

                  {/* Viewing Time */}
                  <div className="space-y-3">
                    <Label htmlFor="viewingTime" className="text-base font-medium">Preferred Time</Label>
                    <select
                      id="viewingTime"
                      value={formData.viewingTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, viewingTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {timeSlots.map(time => (
                        <option key={time} value={time}>
                          {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Viewing Type */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Viewing Type</Label>
                    <RadioGroup
                      value={formData.viewingType}
                      onValueChange={(value: ViewingData['viewingType']) => 
                        setFormData(prev => ({ ...prev, viewingType: value }))
                      }
                      className="grid grid-cols-3 gap-3"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="in_person" id="in_person" />
                        <Label htmlFor="in_person" className="cursor-pointer">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            In Person
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="virtual" id="virtual" />
                        <Label htmlFor="virtual" className="cursor-pointer">
                          <div className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Virtual
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both" className="cursor-pointer">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Both
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Number of Attendees */}
                  <div className="space-y-3">
                    <Label htmlFor="attendees" className="text-base font-medium">Number of Attendees</Label>
                    <select
                      id="attendees"
                      value={formData.attendees}
                      onChange={(e) => setFormData(prev => ({ ...prev, attendees: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'person' : 'people'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Method */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Preferred Contact Method</Label>
                    <RadioGroup
                      value={formData.contactMethod}
                      onValueChange={(value: ViewingData['contactMethod']) => 
                        setFormData(prev => ({ ...prev, contactMethod: value }))
                      }
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone" />
                        <Label htmlFor="phone" className="cursor-pointer">Phone</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email" className="cursor-pointer">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both" className="cursor-pointer">Both</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Special Requirements */}
                  <div className="space-y-3">
                    <Label htmlFor="specialRequirements" className="text-base font-medium">Special Requirements</Label>
                    <Textarea
                      id="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                      placeholder="Any special requirements, accessibility needs, or specific areas you'd like to focus on..."
                      rows={3}
                    />
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-3">
                    <Label htmlFor="notes" className="text-base font-medium">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional information or questions you'd like to discuss during the viewing..."
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
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Viewing
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {step === 'submitting' && (
                <div className="text-center space-y-4 py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Scheduling Your Viewing</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Please wait while we schedule your viewing with the seller...
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
                    <h3 className="font-semibold text-gray-800">Viewing Scheduled Successfully!</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Your viewing has been scheduled for {formatDate(formData.viewingDate)} at {new Date(`2000-01-01T${formData.viewingTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      The seller will contact you to confirm the details.
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
