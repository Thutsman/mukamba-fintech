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
  // Personal Information
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  
  // Company Information
  companyName: z.string().min(2, "Company name is required"),
  companyRegistrationNumber: z.string().min(4, "Company registration number is required"),
  businessAddress: z.string().min(10, "Business address is required"),
  
  // EAC Registration
  eacNumber: z.string().min(4, "EAC Registration Number is required")
    .regex(/^EAC\d{5,}$/, "EAC number must start with 'EAC' followed by at least 5 digits"),
  eacExpiryDate: z.string().min(1, "EAC expiry date is required"),
  
  // Professional Information
  bio: z.string().min(50, "Bio should be at least 50 characters"),
  yearsOfExperience: z.number().min(1, "Years of experience is required"),
  
  // Required Documents
  companyRegistrationDocument: z.instanceof(File, { message: "Company registration document is required" })
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine((file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), 
      "File must be JPEG, PNG, or PDF"),
  principalAgentIdDocument: z.instanceof(File, { message: "Principal agent's ID document is required" })
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine((file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), 
      "File must be JPEG, PNG, or PDF"),
  eacRegistrationCertificate: z.instanceof(File, { message: "EAC registration certificate is required" })
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
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
    companyRegistrationDocument?: File | null;
    principalAgentIdDocument?: File | null;
    eacRegistrationCertificate?: File | null;
  }>({});

  const form = useForm<AgentOnboardingData>({
    resolver: zodResolver(agentOnboardingSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      companyName: '',
      companyRegistrationNumber: '',
      businessAddress: '',
      eacNumber: '',
      eacExpiryDate: '',
      bio: '',
      yearsOfExperience: 1,
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
          className="w-full max-w-2xl max-h-[90vh] flex flex-col"
        >
          <Card className="shadow-2xl flex flex-col max-h-full">
            <CardHeader className="flex-shrink-0">
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

            <CardContent className="flex-1 px-6 py-4">
              <div className="overflow-y-auto modal-scrollable" style={{ 
                scrollbarWidth: 'thin', 
                scrollbarColor: '#cbd5e1 #f1f5f9',
                minHeight: '400px',
                maxHeight: '60vh',
                paddingRight: '8px'
              }}>
                {/* Scroll indicator */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    <div className="w-1 h-1 bg-slate-400 rounded-full mr-2 animate-pulse"></div>
                    Scroll to see all fields
                    <div className="ml-2 text-slate-400">↓</div>
                  </div>
                </div>
              
                              {step === 'form' && (
                  <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pb-8">
                  <div className="space-y-4">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div>
                        <Label htmlFor="email">Email Address</Label>
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
                      <Label htmlFor="phone">Phone Number</Label>
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

                    {/* Company Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div>
                        <Label htmlFor="companyRegistrationNumber">Company Registration Number</Label>
                        <Input
                          id="companyRegistrationNumber"
                          {...form.register('companyRegistrationNumber')}
                          placeholder="2023/123456/07"
                        />
                        {form.formState.errors.companyRegistrationNumber && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.companyRegistrationNumber.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="businessAddress">Business Address</Label>
                      <Textarea
                        id="businessAddress"
                        {...form.register('businessAddress')}
                        placeholder="Enter your complete business address..."
                        rows={2}
                      />
                      {form.formState.errors.businessAddress && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.businessAddress.message}
                        </p>
                      )}
                    </div>

                    {/* EAC Registration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div>
                        <Label htmlFor="eacExpiryDate">EAC Expiry Date</Label>
                        <Input
                          id="eacExpiryDate"
                          type="date"
                          {...form.register('eacExpiryDate')}
                        />
                        {form.formState.errors.eacExpiryDate && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.eacExpiryDate.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                        <Input
                          id="yearsOfExperience"
                          type="number"
                          {...form.register('yearsOfExperience', { valueAsNumber: true })}
                          placeholder="5"
                          min="1"
                        />
                        {form.formState.errors.yearsOfExperience && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.yearsOfExperience.message}
                          </p>
                        )}
                      </div>

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
                    </div>

                    {/* Document Uploads */}
                    <div className="space-y-4">
                      <FileUpload
                        label="Company Registration Document"
                        description="Upload your company registration certificate or business license"
                        onFileSelect={(file) => {
                          setUploadedFiles(prev => ({ ...prev, companyRegistrationDocument: file }));
                          if (file) form.setValue('companyRegistrationDocument', file);
                        }}
                        value={uploadedFiles.companyRegistrationDocument}
                        error={form.formState.errors.companyRegistrationDocument?.message}
                      />

                      <FileUpload
                        label="Principal Agent's ID Document"
                        description="Upload your valid government-issued ID document"
                        onFileSelect={(file) => {
                          setUploadedFiles(prev => ({ ...prev, principalAgentIdDocument: file }));
                          if (file) form.setValue('principalAgentIdDocument', file);
                        }}
                        value={uploadedFiles.principalAgentIdDocument}
                        error={form.formState.errors.principalAgentIdDocument?.message}
                      />

                      <FileUpload
                        label="EAC Registration Certificate"
                        description="Upload your valid EAC registration certificate"
                        onFileSelect={(file) => {
                          setUploadedFiles(prev => ({ ...prev, eacRegistrationCertificate: file }));
                          if (file) form.setValue('eacRegistrationCertificate', file);
                        }}
                        value={uploadedFiles.eacRegistrationCertificate}
                        error={form.formState.errors.eacRegistrationCertificate?.message}
                      />
                    </div>
                  </div>

                                     <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                     <h4 className="text-sm font-medium text-amber-800 mb-2">
                       Real Estate Agent Verification Requirements:
                     </h4>
                     <ul className="text-xs text-amber-700 space-y-1">
                       <li>• Company Registration Documents (Certificate or Business License)</li>
                       <li>• Principal Agent's Proof of Identity (Government-issued ID)</li>
                       <li>• Valid Estate Agents Council (EAC) Registration Certificate</li>
                       <li>• Valid EAC Registration Number (format: EAC12345)</li>
                       <li>• Professional bio (minimum 50 characters)</li>
                       <li>• Complete business address and contact information</li>
                     </ul>
                   </div>
                   
                   {/* Extra spacing to ensure scrollability */}
                   <div className="h-8"></div>

                </form>
              )}

              {/* Sticky Submit Button for Form Step */}
              {step === 'form' && (
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 pt-4 border-t border-slate-200 dark:border-slate-700 -mx-6 -mb-4 px-6 pb-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={form.handleSubmit(handleFormSubmit)}
                  >
                    Submit for Verification
                  </Button>
                </div>
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
               </div>
             </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 