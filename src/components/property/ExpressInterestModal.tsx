'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageCircle, 
  User,
  CheckCircle,
  Send,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Simplified modal: radio groups removed
import { PropertyListing } from '@/types/property';
import { User as UserType } from '@/types/auth';

interface ExpressInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyListing;
  user: UserType;
  onSubmit: (data: ExpressInterestData) => Promise<void>;
}

interface ExpressInterestData {
  message: string;
}

export const ExpressInterestModal: React.FC<ExpressInterestModalProps> = ({
  isOpen,
  onClose,
  property,
  user,
  onSubmit
}) => {
  const [step, setStep] = React.useState<'form' | 'submitting' | 'success'>('form');
  const [formData, setFormData] = React.useState<ExpressInterestData>({
    message: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);

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
        setFormData({ message: '' });
      }, 2000);
    } catch (error) {
      console.error('Failed to submit interest:', error);
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setStep('form');
      setFormData({ message: '' });
    }
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
                  <MessageCircle className="w-6 h-6 text-blue-600" />
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
                {step === 'form' && 'Send Message'}
                {step === 'submitting' && 'Sending Message'}
                {step === 'success' && 'Message Sent!'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {step === 'form' && `Message the seller about ${property.title}`}
                {step === 'submitting' && 'Please wait while we send your message...'}
                {step === 'success' && 'The seller will contact you soon!'}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {step === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Property Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
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

                  {/* Message */}
                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-base font-medium">Your message</Label>
                    <Textarea
                      id="message"
                      placeholder={'Type your message to the Admin...'}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="resize-none"
                      required
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
                      disabled={isLoading || !formData.message.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
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
                    <Send className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Sending Your Message</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Please wait while we send your message to the Admin...
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
                    <h3 className="font-semibold text-gray-800">Message Sent Successfully!</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      The Admin will contact you soon.
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
