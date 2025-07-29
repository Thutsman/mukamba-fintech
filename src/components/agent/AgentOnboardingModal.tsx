'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, FileText, Camera, Building, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/FileUpload';

interface AgentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const agentOnboardingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  companyName: z.string().min(2, "Company name is required"),
  eacNumber: z.string().min(4, "EAC Registration Number is required"),
  bio: z.string().min(50, "Bio should be at least 50 characters"),
  businessLicense: z.instanceof(File, { message: "Business license is required" })
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine((file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), 
      "File must be JPEG, PNG, or PDF"),
  idDocument: z.instanceof(File, { message: "ID document is required" })
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine((file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), 
      "File must be JPEG, PNG, or PDF"),
});

type AgentOnboardingData = z.infer<typeof agentOnboardingSchema>;

export const AgentOnboardingModal: React.FC<AgentOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [step, setStep] = React.useState<'form' | 'documents' | 'processing' | 'success'>('form');
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<{
    businessLicense?: File | null;
    idDocument?: File | null;
  }>({});

  const form = useForm<AgentOnboardingData>({
    resolver: zodResolver(agentOnboardingSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      eacNumber: '',
      bio: '',
    }
  });

  const handleFormSubmit = async (data: AgentOnboardingData) => {
    setStep('processing');
    setIsLoading(true);

    try {
      // Simulate API call to verify EAC number and save agent data
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setStep('success');
      setTimeout(() => {
        onComplete();
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Agent verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStep('form');
      form.reset();
      setUploadedFiles({});
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
          className="w-full max-w-2xl"
        >
          <Card className="shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="w-6 h-6" />
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <UserCheck className="w-6 h-6 text-blue-600" />
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
                {step === 'form' && 'Agent Verification'}
                {step === 'processing' && 'Verifying Information'}
                {step === 'success' && 'Verification Complete!'}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {step === 'form' && (
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    {/* Personal Information */}
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        {...form.register('fullName')}
                        placeholder="John Doe"
                      />
                      {form.formState.errors.fullName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* Company Information */}
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        {...form.register('companyName')}
                        placeholder="Real Estate Company Ltd"
                      />
                      {form.formState.errors.companyName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.companyName.message}
                        </p>
                      )}
                    </div>

                    {/* EAC Registration */}
                    <div>
                      <Label htmlFor="eacNumber">EAC Registration Number</Label>
                      <Input
                        id="eacNumber"
                        {...form.register('eacNumber')}
                        placeholder="EAC12345"
                      />
                      {form.formState.errors.eacNumber && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.eacNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Agent Bio */}
                    <div>
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        {...form.register('bio')}
                        placeholder="Tell us about your experience and expertise..."
                        rows={4}
                      />
                      {form.formState.errors.bio && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.bio.message}
                        </p>
                      )}
                    </div>

                    {/* Document Uploads */}
                    <div className="space-y-4">
                      <FileUpload
                        label="Business License"
                        description="Upload your current business license"
                        onFileSelect={(file) => {
                          setUploadedFiles(prev => ({ ...prev, businessLicense: file }));
                          if (file) form.setValue('businessLicense', file);
                        }}
                        value={uploadedFiles.businessLicense}
                        error={form.formState.errors.businessLicense?.message}
                      />

                      <FileUpload
                        label="ID Document"
                        description="Upload your valid ID document"
                        onFileSelect={(file) => {
                          setUploadedFiles(prev => ({ ...prev, idDocument: file }));
                          if (file) form.setValue('idDocument', file);
                        }}
                        value={uploadedFiles.idDocument}
                        error={form.formState.errors.idDocument?.message}
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">
                      Verification Requirements:
                    </h4>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>• Valid business license</li>
                      <li>• Government-issued ID</li>
                      <li>• Active EAC registration number</li>
                      <li>• Professional bio (minimum 50 characters)</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Submit for Verification
                  </Button>
                </form>
              )}

              {step === 'processing' && (
                <div className="text-center space-y-4 py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Building className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Verifying Your Information</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Please wait while we verify your agent credentials
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
                    <Check className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Verification Complete!</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Your agent profile has been verified successfully
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