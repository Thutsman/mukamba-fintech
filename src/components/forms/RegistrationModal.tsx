'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const { user, updateUser } = useAuthStore();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const steps = [
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'verification', title: 'Verification', icon: Phone },
    { id: 'documents', title: 'Documents', icon: FileText },
    { id: 'complete', title: 'Complete', icon: CheckCircle }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete registration
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onComplete();
      }, 1500);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
        >
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold">
                Complete Your Registration
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          isCompleted
                            ? 'bg-green-600 border-green-600 text-white'
                            : isActive
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-16 h-0.5 mx-2 ${
                            isCompleted ? 'bg-green-600' : 'bg-slate-300'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step Content */}
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    {React.createElement(steps[currentStep].icon, {
                      className: "w-8 h-8 text-blue-600"
                    })}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-slate-600">
                    {currentStep === 0 && "We'll collect your basic information to get started."}
                    {currentStep === 1 && "Verify your identity with phone and email verification."}
                    {currentStep === 2 && "Upload required documents for KYC compliance."}
                    {currentStep === 3 && "Your registration is complete! Welcome to Mukamba."}
                  </p>
                  
                  {isLoading && (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0 || isLoading}
                >
                  Back
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : currentStep === steps.length - 1 ? (
                    'Complete Registration'
                  ) : (
                    'Next'
                  )}
                </Button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is a simplified registration flow. 
                  The full KYC process will be available in the profile dashboard after signup.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 