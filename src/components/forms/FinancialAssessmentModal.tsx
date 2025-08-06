'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, DollarSign, TrendingUp, Check, FileText, Calculator, Loader2, Upload, Camera,
  User, MapPin, Building, CreditCard, Calendar, Globe, Home, Briefcase, Wallet,
  CheckCircle, Clock, AlertCircle, XCircle, Download, RefreshCw, Edit
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

import { 
  type FinancialVerificationState, 
  type VerificationDocument, 
  type VerificationCertificate,
  type User as UserType 
} from '@/types/auth';

interface FinancialAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  user?: UserType;
  verificationState?: FinancialVerificationState;
  documents?: VerificationDocument[];
  certificates?: VerificationCertificate[];
  financialProfile?: {
    creditScore: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    disposableIncome: number;
    debtToIncomeRatio: number;
    preApprovedAmount: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    lastUpdated: Date;
  };
}

// Validation patterns
const ID_PATTERNS = {
  zw: /^\d{2}-\d{6}-[A-Z]-\d{2}$/
};

const calculateAge = (dateOfBirth: string) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const financialSchema = z.object({
  // Personal Identity
  idNumber: z.string()
    .min(1, "ID number is required")
    .refine(
      (value) => ID_PATTERNS.zw.test(value),
      "Must be a valid Zimbabwe ID (XX-XXXXXX-X-XX)"
    ),
    dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine(
      (value) => calculateAge(value) >= 18,
      "Must be 18 years or older"
    ),
  nationality: z.string().min(1, "Nationality is required"),  
  // Address Information
  residentialAddress: z.object({
    streetAddress: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    postalCode: z.string().optional(),
  }),
  employmentStatus: z.string().min(1, "Please select your employment status"),
  monthlyIncome: z.string().min(1, "Monthly income is required"),
  employerName: z.string().min(2, "Employer name is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  employmentDuration: z.string().min(1, "Please select employment duration"),
  additionalIncome: z.string().optional(),
  monthlyExpenses: z.string().min(1, "Monthly expenses are required"),
  hasDebts: z.string().min(1, "Please specify if you have existing debts"),
  debtDetails: z.string().optional(),
});

type FinancialFormData = z.infer<typeof financialSchema>;

export const FinancialAssessmentModal: React.FC<FinancialAssessmentModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  user,
  verificationState = 'unverified',
  documents = [],
  certificates = [],
  financialProfile
}) => {
  const [step, setStep] = React.useState<'form' | 'documents' | 'processing' | 'results' | 'success'>('form');
  const [isLoading, setIsLoading] = React.useState(false);
  const [creditScore, setCreditScore] = React.useState(0);
  const [assessmentResults, setAssessmentResults] = React.useState<any>(null);
  const [uploadedDocuments, setUploadedDocuments] = React.useState<{
    proofOfIncome?: File;
    proofOfAddress?: File;
  }>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentUpload, setCurrentUpload] = React.useState<'proofOfIncome' | 'proofOfAddress'>('proofOfIncome');
  const [formProgress, setFormProgress] = React.useState(0);
  const [showUpdateForm, setShowUpdateForm] = React.useState(false);

  // Get verification status info
  const getVerificationInfo = () => {
    switch (verificationState) {
      case 'verified':
        return {
          title: 'Financial Assessment Complete',
          subtitle: 'Your financial profile has been verified and approved',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          status: 'Verified'
        };
      case 'pending':
        return {
          title: 'Under Review',
          subtitle: 'Your financial assessment is being reviewed',
          icon: <Clock className="w-6 h-6 text-yellow-600" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          status: 'Pending'
        };
      case 'expired':
        return {
          title: 'Assessment Expired',
          subtitle: 'Your financial assessment has expired and needs renewal',
          icon: <AlertCircle className="w-6 h-6 text-red-600" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          status: 'Expired'
        };
      case 'rejected':
        return {
          title: 'Assessment Rejected',
          subtitle: 'Your financial assessment was not approved',
          icon: <XCircle className="w-6 h-6 text-red-600" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          status: 'Rejected'
        };
      default:
        return {
          title: 'Financial Assessment',
          subtitle: 'Complete your financial assessment to access financing options',
          icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          status: 'Unverified'
        };
    }
  };

  const verificationInfo = getVerificationInfo();

  const form = useForm<FinancialFormData>({
    resolver: zodResolver(financialSchema),
    defaultValues: {
      // Personal Identity
      idNumber: '',
      dateOfBirth: '',
      nationality: '',
      
      // Address Information
      residentialAddress: {
        streetAddress: '',
        city: '',
        province: '',
        postalCode: '',
      },
      employmentStatus: '',
      monthlyIncome: '',
      employerName: '',
      jobTitle: '',
      employmentDuration: '',
      additionalIncome: '',
      monthlyExpenses: '',
      hasDebts: '',
      debtDetails: '',
    }
  });

  const watchHasDebts = form.watch('hasDebts');
  const formValues = form.watch();

  // Calculate form progress
  React.useEffect(() => {
    const requiredFields = [
      'idNumber', 'dateOfBirth', 'nationality',
      'residentialAddress.streetAddress', 'residentialAddress.city', 'residentialAddress.province',
      'employmentStatus', 'monthlyIncome', 'employerName', 'jobTitle', 'employmentDuration',
      'monthlyExpenses', 'hasDebts'
    ];
    
    const filledFields = requiredFields.filter(field => {
      let value: any;
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        value = (formValues as any)[parent]?.[child];
      } else {
        value = (formValues as any)[field];
      }
      return value && value.toString().trim() !== '';
    });
    
    const progress = Math.round((filledFields.length / requiredFields.length) * 100);
    setFormProgress(progress);
  }, [formValues]);

  const handleFormSubmit = async (data: FinancialFormData) => {
    // Validate all required fields
    const errors = await form.trigger();
    if (!errors) {
      return;
    }

    // All validations passed, move to document upload step
    setStep('documents');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDocuments(prev => ({
        ...prev,
        [currentUpload]: file
      }));
    }
  };

  const triggerFileUpload = (documentType: 'proofOfIncome' | 'proofOfAddress') => {
    setCurrentUpload(documentType);
    fileInputRef.current?.click();
  };

  const handleDocumentsSubmit = async () => {
    console.log('Starting document submission with:', uploadedDocuments);
    setIsLoading(true);
    setStep('processing');
    
    try {
      // Simulate financial assessment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock credit score and assessment using form data
      const formData = form.getValues();
      const income = parseInt(formData.monthlyIncome.replace(/\D/g, ''));
      const expenses = parseInt(formData.monthlyExpenses.replace(/\D/g, ''));
      const baseScore = Math.max(500, Math.min(850, 600 + Math.floor((income - expenses) / 100)));
      const finalScore = baseScore + Math.floor(Math.random() * 100 - 50);
      
      setCreditScore(Math.max(300, Math.min(850, finalScore)));
      setAssessmentResults({
        income,
        expenses,
        disposableIncome: income - expenses,
        debtToIncomeRatio: Math.random() * 0.4,
        creditUtilization: Math.random() * 0.6,
        riskLevel: finalScore > 700 ? 'Low' : finalScore > 600 ? 'Medium' : 'High'
      });
      
      setStep('results');
    } catch (error) {
      console.error('Financial assessment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    setStep('success');
    setTimeout(() => {
      onComplete();
      handleClose();
    }, 2500);
  };

  const handleClose = () => {
    if (!isLoading) {
      setStep('form');
      form.reset();
      setCreditScore(0);
      setAssessmentResults(null);
      setUploadedDocuments({});
      setShowUpdateForm(false);
      onClose();
    }
  };

  const handleDownloadCertificate = (certificate: VerificationCertificate) => {
    // Simulate certificate download
    console.log('Downloading certificate:', certificate.id);
    // In real implementation, this would trigger a download
  };

  const handleUpdateInformation = () => {
    setShowUpdateForm(true);
  };

  const handleReVerification = () => {
    setStep('form');
    setShowUpdateForm(false);
  };

  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num ? `R${parseInt(num).toLocaleString()}` : '';
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCreditScoreLabel = (score: number) => {
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    return 'Poor';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-blue-900/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          <Card className="shadow-2xl bg-white/95 backdrop-blur-xl border-0">
            <CardHeader className="text-center relative">
              {/* Progress Bar */}
              {step === 'form' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${formProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
              
                             <div className="flex items-center justify-between mb-4 mt-2">
                 <div className="w-6 h-6" />
                 <motion.div 
                   className={`w-14 h-14 ${verificationInfo.bgColor} rounded-full flex items-center justify-center mx-auto shadow-lg`}
                   whileHover={{ scale: 1.05 }}
                   transition={{ type: "spring", stiffness: 300 }}
                 >
                   {verificationInfo.icon}
                 </motion.div>
                 <Button
                   variant="ghost"
                   size="icon"
                   onClick={handleClose}
                   disabled={isLoading}
                   className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                 >
                   <X className="w-5 h-5" />
                 </Button>
               </div>
               
               {/* Verification Status Badge */}
               {verificationState !== 'unverified' && (
                 <Badge 
                   variant={verificationState === 'verified' ? 'default' : 'secondary'}
                   className={`mb-2 ${verificationInfo.color}`}
                 >
                   {verificationInfo.status}
                 </Badge>
               )}

               <CardTitle className="text-xl">
                 {verificationState !== 'unverified' ? verificationInfo.title : (
                   step === 'form' ? 'Financial Assessment' :
                   step === 'documents' ? 'Upload Supporting Documents' :
                   step === 'processing' ? 'Analyzing Your Finances' :
                   step === 'results' ? 'Your Credit Profile' :
                   'Assessment Complete!'
                 )}
               </CardTitle>
               <p className="text-sm text-slate-600 mt-2">
                 {verificationState !== 'unverified' ? verificationInfo.subtitle : (
                   step === 'form' ? 'Help us understand your financial situation to provide personalized rent-to-buy options' :
                   step === 'documents' ? 'Upload proof of income and address to complete your financial verification' :
                   step === 'processing' ? 'Please wait while we calculate your credit score and financial profile' :
                   step === 'results' ? 'Review your credit assessment and financial recommendations' :
                   'Your financial profile has been successfully created'
                 )}
               </p>
            </CardHeader>

                         <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
               {/* Verified State Content */}
               {verificationState === 'verified' && !showUpdateForm && (
                 <div className="space-y-6">
                   {/* Financial Profile Summary */}
                   {financialProfile && (
                     <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                       <div className="flex items-center justify-between mb-3">
                         <h3 className="font-semibold text-green-800">Financial Profile</h3>
                         <CheckCircle className="w-5 h-5 text-green-600" />
                       </div>
                       <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                         <div>
                           <span className="font-medium">Credit Score:</span>
                           <span className="ml-2">{financialProfile.creditScore}</span>
                         </div>
                         <div>
                           <span className="font-medium">Pre-approved:</span>
                           <span className="ml-2">R{financialProfile.preApprovedAmount.toLocaleString()}</span>
                         </div>
                         <div>
                           <span className="font-medium">Risk Level:</span>
                           <span className="ml-2">{financialProfile.riskLevel}</span>
                         </div>
                         <div>
                           <span className="font-medium">Last Updated:</span>
                           <span className="ml-2">{financialProfile.lastUpdated.toLocaleDateString()}</span>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Certificates */}
                   {certificates.length > 0 && (
                     <div>
                       <h4 className="font-medium text-slate-800 mb-3">Financial Certificates</h4>
                       <div className="space-y-2">
                         {certificates.map((cert) => (
                           <div key={cert.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                             <div>
                               <p className="font-medium text-sm">{cert.type} Certificate</p>
                               <p className="text-xs text-slate-500">
                                 Level: {cert.verificationLevel} • Expires: {cert.expiresAt.toLocaleDateString()}
                               </p>
                             </div>
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => handleDownloadCertificate(cert)}
                             >
                               <Download className="w-4 h-4 mr-1" />
                               Download
                             </Button>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Action Buttons */}
                   <div className="flex space-x-3">
                     <Button
                       variant="outline"
                       onClick={handleUpdateInformation}
                       className="flex-1"
                     >
                       <Edit className="w-4 h-4 mr-2" />
                       Update Information
                     </Button>
                     <Button
                       onClick={handleReVerification}
                       className="flex-1 bg-purple-600 hover:bg-purple-700"
                     >
                       <RefreshCw className="w-4 h-4 mr-2" />
                       Re-assess
                     </Button>
                   </div>
                 </div>
               )}

               {/* Pending State Content */}
               {verificationState === 'pending' && (
                 <div className="space-y-6">
                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                     <div className="flex items-center mb-3">
                       <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                       <h3 className="font-semibold text-yellow-800">Under Review</h3>
                     </div>
                     <p className="text-sm text-yellow-700 mb-3">
                       Your financial assessment is being reviewed by our team. This usually takes 2-3 business days.
                     </p>
                     <div className="space-y-2 text-sm text-yellow-700">
                       <div className="flex justify-between">
                         <span>Submitted on:</span>
                         <span>{new Date().toLocaleDateString()}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Estimated completion:</span>
                         <span>{new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                       </div>
                     </div>
                   </div>

                   {/* Progress Indicator */}
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span>Review Progress</span>
                       <span>40%</span>
                     </div>
                     <Progress value={40} className="h-2" />
                   </div>

                   <Button
                     onClick={handleClose}
                     className="w-full bg-purple-600 hover:bg-purple-700"
                   >
                     Close
                   </Button>
                 </div>
               )}

               {/* Expired State Content */}
               {verificationState === 'expired' && (
                 <div className="space-y-6">
                   <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                     <div className="flex items-center mb-3">
                       <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                       <h3 className="font-semibold text-red-800">Assessment Expired</h3>
                     </div>
                     <p className="text-sm text-red-700 mb-3">
                       Your financial assessment has expired. Please complete a new assessment to continue accessing financing options.
                     </p>
                     <div className="space-y-2 text-sm text-red-700">
                       <div className="flex justify-between">
                         <span>Expired on:</span>
                         <span>{new Date().toLocaleDateString()}</span>
                       </div>
                     </div>
                   </div>

                   <Button
                     onClick={handleReVerification}
                     className="w-full bg-red-600 hover:bg-red-700"
                   >
                     <RefreshCw className="w-4 h-4 mr-2" />
                     Complete New Assessment
                   </Button>
                 </div>
               )}

               {/* Rejected State Content */}
               {verificationState === 'rejected' && (
                 <div className="space-y-6">
                   <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                     <div className="flex items-center mb-3">
                       <XCircle className="w-5 h-5 text-red-600 mr-2" />
                       <h3 className="font-semibold text-red-800">Assessment Rejected</h3>
                     </div>
                     <p className="text-sm text-red-700 mb-3">
                       Your financial assessment was not approved. Please review the requirements and try again.
                     </p>
                     <div className="bg-white p-3 rounded border">
                       <h4 className="font-medium text-red-800 mb-2">Rejection Reason:</h4>
                       <p className="text-sm text-red-700">
                         Income documentation is insufficient or unclear. Please provide recent pay slips or bank statements.
                       </p>
                     </div>
                   </div>

                   <Button
                     onClick={handleReVerification}
                     className="w-full bg-red-600 hover:bg-red-700"
                   >
                     <RefreshCw className="w-4 h-4 mr-2" />
                     Try Again
                   </Button>
                 </div>
               )}

               {/* Original Assessment Flow for Unverified/Update */}
               {(verificationState === 'unverified' || showUpdateForm) && (
                 <>
                   {step === 'form' && (
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                                     {/* Personal Identity */}
                   <motion.div 
                     className="space-y-4"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5 }}
                   >
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                         <User className="w-4 h-4 text-white" />
                       </div>
                       <h3 className="font-semibold text-slate-800 text-lg">Personal Identity</h3>
                     </div>
                    
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <Label htmlFor="idNumber" className="flex items-center">
                           ID Number
                           <span className="text-red-500 ml-1">*</span>
                           <span className="ml-2 text-xs text-slate-500">(Format: XX-XXXXXX-X-XX)</span>
                         </Label>
                         <Input
                           id="idNumber"
                           placeholder="63-123456-A-12"
                           {...form.register('idNumber', {
                             required: "ID number is required",
                             pattern: {
                               value: /^\d{2}-\d{6}-[A-Z]-\d{2}$/,
                               message: "Please enter a valid Zimbabwe ID number format (XX-XXXXXX-X-XX)"
                             },
                                                           onChange: (e) => {
                                // Get the raw input value (remove any existing formatting)
                                let rawValue = e.target.value.replace(/[^A-Za-z0-9]/g, '');
                                
                                // Limit to 11 characters
                                if (rawValue.length > 11) {
                                  rawValue = rawValue.slice(0, 11);
                                }
                                
                                // Format the ID number
                                let formattedValue = '';
                                if (rawValue.length >= 1) formattedValue += rawValue.slice(0, 2);
                                if (rawValue.length >= 3) formattedValue += '-' + rawValue.slice(2, 8);
                                if (rawValue.length >= 9) formattedValue += '-' + rawValue.slice(8, 9);
                                if (rawValue.length >= 10) formattedValue += '-' + rawValue.slice(9, 11);
                                
                                // Convert to uppercase
                                formattedValue = formattedValue.toUpperCase();
                                
                                // Update the input value
                                e.target.value = formattedValue;
                                
                                // Update the form value
                                form.setValue('idNumber', formattedValue, { shouldValidate: true });
                                
                                // Clear errors if the format is valid
                                if (formattedValue.match(/^\d{2}-\d{6}-[A-Z]-\d{2}$/)) {
                                  form.clearErrors('idNumber');
                                }
                              }
                           })}
                           className={form.formState.errors.idNumber ? "border-red-500" : ""}
                         />
                         {form.formState.errors.idNumber && (
                           <p className="text-sm text-red-600 mt-1">
                             {form.formState.errors.idNumber.message}
                           </p>
                         )}
                       </div>

                      <div>
                        <Label htmlFor="dateOfBirth" className="flex items-center">
                          Date of Birth
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          {...form.register('dateOfBirth', {
                            required: "Date of birth is required",
                            validate: (value) => calculateAge(value) >= 18 || "Must be 18 years or older",
                            onChange: (e) => {
                              if (e.target.value && calculateAge(e.target.value) >= 18) {
                                form.clearErrors('dateOfBirth');
                              }
                            }
                          })}
                          className={form.formState.errors.dateOfBirth ? "border-red-500" : ""}
                        />
                        {form.formState.errors.dateOfBirth && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.dateOfBirth.message}
                          </p>
                        )}
                      </div>
                                         </div>

                     <div>
                       <Label htmlFor="nationality" className="flex items-center">
                         Nationality
                         <span className="text-red-500 ml-1">*</span>
                       </Label>
                       <Input
                         id="nationality"
                         placeholder="Enter your nationality"
                         {...form.register('nationality', {
                           required: "Nationality is required",
                           onChange: (e) => {
                             if (e.target.value) {
                               form.clearErrors('nationality');
                             }
                           }
                         })}
                         className={form.formState.errors.nationality ? "border-red-500" : ""}
                       />
                       {form.formState.errors.nationality && (
                         <p className="text-sm text-red-600 mt-1">
                           {form.formState.errors.nationality.message}
                         </p>
                       )}
                                          </div>
                   </motion.div>

                                      {/* Address Information */}
                   <motion.div 
                     className="space-y-4"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.1 }}
                   >
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                         <Home className="w-4 h-4 text-white" />
                       </div>
                       <h3 className="font-semibold text-slate-800 text-lg">Residential Address</h3>
                     </div>
                    
                    <div>
                      <Label htmlFor="streetAddress" className="flex items-center">
                        Street Address
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="streetAddress"
                        placeholder="Enter your street address"
                        {...form.register('residentialAddress.streetAddress', {
                          required: "Street address is required",
                          onChange: (e) => {
                            if (e.target.value) {
                              form.clearErrors('residentialAddress.streetAddress');
                            }
                          }
                        })}
                        className={form.formState.errors.residentialAddress?.streetAddress ? "border-red-500" : ""}
                      />
                      {form.formState.errors.residentialAddress?.streetAddress && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.residentialAddress.streetAddress.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="flex items-center">
                          City
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="city"
                          placeholder="Enter city"
                          {...form.register('residentialAddress.city', {
                            required: "City is required",
                            onChange: (e) => {
                              if (e.target.value) {
                                form.clearErrors('residentialAddress.city');
                              }
                            }
                          })}
                          className={form.formState.errors.residentialAddress?.city ? "border-red-500" : ""}
                        />
                        {form.formState.errors.residentialAddress?.city && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.residentialAddress.city.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="province" className="flex items-center">
                          Province/State
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select 
                          onValueChange={(value) => {
                            form.setValue('residentialAddress.province', value, { shouldValidate: true });
                            form.clearErrors('residentialAddress.province');
                          }}
                        >
                          <SelectTrigger className={form.formState.errors.residentialAddress?.province ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                                                                            <SelectContent className="z-[9999] relative mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                            <SelectItem value="Harare" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Harare</SelectItem>
                            <SelectItem value="Bulawayo" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Bulawayo</SelectItem>
                            <SelectItem value="Gauteng" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Gauteng</SelectItem>
                            <SelectItem value="Western Cape" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Western Cape</SelectItem>
                            <SelectItem value="Other" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.residentialAddress?.province && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.residentialAddress.province.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="postalCode">
                          Postal Code
                        </Label>
                        <Input
                          id="postalCode"
                          placeholder="Enter postal code"
                          {...form.register('residentialAddress.postalCode')}
                        />
                      </div>
                                         </div>
                   </motion.div>

                                      {/* Employment Information */}
                   <motion.div 
                     className="space-y-4"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.2 }}
                   >
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                         <Briefcase className="w-4 h-4 text-white" />
                       </div>
                       <h3 className="font-semibold text-slate-800 text-lg">Employment Information</h3>
                     </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="employmentStatus">Employment Status</Label>
                        <Select 
                          onValueChange={(value) => {
                            form.setValue('employmentStatus', value);
                            form.clearErrors('employmentStatus');
                          }}
                        >
                          <SelectTrigger className={form.formState.errors.employmentStatus ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                                                                            <SelectContent className="z-[9999] relative mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                            <SelectItem value="full-time" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Full-time Employee</SelectItem>
                            <SelectItem value="part-time" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Part-time Employee</SelectItem>
                            <SelectItem value="self-employed" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Self-employed</SelectItem>
                            <SelectItem value="contract" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Contract Worker</SelectItem>
                            <SelectItem value="unemployed" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Unemployed</SelectItem>
                            <SelectItem value="retired" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.employmentStatus && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.employmentStatus.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="monthlyIncome">Monthly Income (Before Tax)</Label>
                                                  <Input
                            id="monthlyIncome"
                            placeholder="R25,000"
                            {...form.register('monthlyIncome', {
                              required: "Monthly income is required",
                              onChange: (e) => {
                                const formatted = formatCurrency(e.target.value);
                                form.setValue('monthlyIncome', formatted, { shouldValidate: true });
                                if (formatted) {
                                  form.clearErrors('monthlyIncome');
                                }
                              }
                            })}
                            className={form.formState.errors.monthlyIncome ? "border-red-500" : ""}
                          />
                        {form.formState.errors.monthlyIncome && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.monthlyIncome.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="employerName">Employer Name</Label>
                                                  <Input
                            id="employerName"
                            placeholder="Company Name"
                            {...form.register('employerName', {
                              required: "Employer name is required",
                              onChange: (e) => {
                                if (e.target.value) {
                                  form.clearErrors('employerName');
                                }
                              }
                            })}
                            className={form.formState.errors.employerName ? "border-red-500" : ""}
                          />
                        {form.formState.errors.employerName && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.employerName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="jobTitle">Job Title</Label>
                                                  <Input
                            id="jobTitle"
                            placeholder="Software Developer"
                            {...form.register('jobTitle', {
                              required: "Job title is required",
                              onChange: (e) => {
                                if (e.target.value) {
                                  form.clearErrors('jobTitle');
                                }
                              }
                            })}
                            className={form.formState.errors.jobTitle ? "border-red-500" : ""}
                          />
                        {form.formState.errors.jobTitle && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.jobTitle.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="employmentDuration">Employment Duration</Label>
                      <Select 
                        onValueChange={(value) => {
                          form.setValue('employmentDuration', value, { shouldValidate: true });
                          form.clearErrors('employmentDuration');
                        }}
                      >
                        <SelectTrigger className={form.formState.errors.employmentDuration ? "border-red-500" : ""}>
                          <SelectValue placeholder="How long at current job?" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999] relative mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                          <SelectItem value="0-6months" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">0-6 months</SelectItem>
                          <SelectItem value="6-12months" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">6-12 months</SelectItem>
                          <SelectItem value="1-2years" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">1-2 years</SelectItem>
                          <SelectItem value="2-5years" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">2-5 years</SelectItem>
                          <SelectItem value="5+years" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.employmentDuration && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.employmentDuration.message}
                        </p>
                      )}
                                         </div>
                   </motion.div>

                                      {/* Financial Information */}
                   <motion.div 
                     className="space-y-4"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.3 }}
                   >
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                         <Wallet className="w-4 h-4 text-white" />
                       </div>
                       <h3 className="font-semibold text-slate-800 text-lg">Financial Information</h3>
                     </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="additionalIncome">Additional Income (Optional)</Label>
                        <Input
                          id="additionalIncome"
                          placeholder="R5,000"
                          {...form.register('additionalIncome')}
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value);
                            form.setValue('additionalIncome', formatted);
                          }}
                        />
                        <p className="text-xs text-slate-500 mt-1">Rental income, freelance, investments, etc.</p>
                      </div>

                      <div>
                        <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                                                  <Input
                            id="monthlyExpenses"
                            placeholder="R15,000"
                            {...form.register('monthlyExpenses', {
                              required: "Monthly expenses are required",
                              onChange: (e) => {
                                const formatted = formatCurrency(e.target.value);
                                form.setValue('monthlyExpenses', formatted, { shouldValidate: true });
                                if (formatted) {
                                  form.clearErrors('monthlyExpenses');
                                }
                              }
                            })}
                            className={form.formState.errors.monthlyExpenses ? "border-red-500" : ""}
                          />
                        {form.formState.errors.monthlyExpenses && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.monthlyExpenses.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="hasDebts">Do you have existing debts?</Label>
                      <Select 
                        onValueChange={(value) => {
                          form.setValue('hasDebts', value, { shouldValidate: true });
                          form.clearErrors('hasDebts');
                        }}
                      >
                        <SelectTrigger className={form.formState.errors.hasDebts ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999] relative mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                          <SelectItem value="no" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">No debts</SelectItem>
                          <SelectItem value="minimal" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Minimal debts (&lt; R50,000)</SelectItem>
                          <SelectItem value="moderate" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Moderate debts (R50,000 - R200,000)</SelectItem>
                          <SelectItem value="significant" className="hover:bg-blue-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Significant debts (&gt; R200,000)</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.hasDebts && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.hasDebts.message}
                        </p>
                      )}
                    </div>

                    {watchHasDebts && watchHasDebts !== 'no' && (
                      <div>
                        <Label htmlFor="debtDetails">Debt Details (Optional)</Label>
                        <Textarea
                          id="debtDetails"
                          placeholder="Credit cards, personal loans, car finance, etc."
                          {...form.register('debtDetails')}
                          rows={3}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Help us understand your debt situation for better recommendations
                        </p>
                      </div>
                                         )}
                   </motion.div>

                                      <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.4 }}
                   >
                     <Button
                       type="submit"
                       disabled={isLoading}
                       className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                     >
                       <>
                         <FileText className="w-4 h-4 mr-2" />
                         Continue to Documents
                       </>
                     </Button>
                   </motion.div>
                </form>
              )}

              {step === 'documents' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-medium text-slate-800 mb-2">
                      Supporting Documents Required
                    </h3>
                    <p className="text-sm text-slate-600">
                      Upload clear, recent documents to verify your financial information
                    </p>
                  </div>

                  <div className="grid gap-6">
                    {/* Proof of Income */}
                    <div>
                      <Label className="block mb-3 font-medium">Proof of Income</Label>
                      <div
                        onClick={() => triggerFileUpload('proofOfIncome')}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                          ${uploadedDocuments.proofOfIncome 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                          }`}
                      >
                        {uploadedDocuments.proofOfIncome ? (
                          <>
                            <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-green-700">
                              {uploadedDocuments.proofOfIncome.name}
                            </p>
                            <p className="text-xs text-green-600 mt-1">Click to replace</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-600">
                              Upload Pay Slip, Bank Statement, or Employment Letter
                            </p>
                            <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Recent pay slip (last 3 months), bank statements, or official employment letter
                      </p>
                    </div>

                    {/* Proof of Address */}
                    <div>
                      <Label className="block mb-3 font-medium">Proof of Address</Label>
                      <div
                        onClick={() => triggerFileUpload('proofOfAddress')}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                          ${uploadedDocuments.proofOfAddress 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                          }`}
                      >
                        {uploadedDocuments.proofOfAddress ? (
                          <>
                            <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-green-700">
                              {uploadedDocuments.proofOfAddress.name}
                            </p>
                            <p className="text-xs text-green-600 mt-1">Click to replace</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-600">
                              Upload Utility Bill or Lease Agreement
                            </p>
                            <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Recent utility bill or official lease agreement (not older than 3 months)
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">
                      Document Requirements:
                    </h4>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>• Documents must be recent (not older than 3 months)</li>
                      <li>• All text must be clearly visible and legible</li>
                      <li>• Personal information should match your profile details</li>
                      <li>• Documents should be in original format (not photocopies of photocopies)</li>
                    </ul>
                  </div>

                  {/* Document Status Message */}
                  {(!uploadedDocuments.proofOfIncome || !uploadedDocuments.proofOfAddress) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> You can proceed with at least one document. 
                        {!uploadedDocuments.proofOfIncome && !uploadedDocuments.proofOfAddress && (
                          <span className="block mt-1">Please upload at least one document to continue.</span>
                        )}
                        {uploadedDocuments.proofOfIncome && !uploadedDocuments.proofOfAddress && (
                          <span className="block mt-1">Proof of address is optional but recommended for better assessment.</span>
                        )}
                        {!uploadedDocuments.proofOfIncome && uploadedDocuments.proofOfAddress && (
                          <span className="block mt-1">Proof of income is optional but recommended for better assessment.</span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep('form')}
                      className="flex-1"
                    >
                      Back to Form
                    </Button>
                    <Button
                      onClick={() => {
                        console.log('Calculate Credit Score button clicked');
                        console.log('Uploaded documents:', uploadedDocuments);
                        handleDocumentsSubmit();
                      }}
                      disabled={(!uploadedDocuments.proofOfIncome && !uploadedDocuments.proofOfAddress) || isLoading}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Credit Score
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'processing' && (
                <div className="text-center space-y-6 py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Calculator className="w-10 h-10 text-purple-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Calculating Your Credit Score</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Analyzing income, expenses, and risk factors...
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <div className="flex space-x-1">
                        {[0, 1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                            className="w-2 h-2 bg-purple-600 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 'results' && assessmentResults && (
                <div className="space-y-6">
                  {/* Credit Score Display */}
                  <div className="text-center bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Credit Score</h3>
                    <div className="relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className={`text-6xl font-bold ${getCreditScoreColor(creditScore)} mb-2`}
                      >
                        {creditScore}
                      </motion.div>
                      <p className={`text-lg font-semibold ${getCreditScoreColor(creditScore)}`}>
                        {getCreditScoreLabel(creditScore)}
                      </p>
                      <p className="text-sm text-slate-600 mt-2">Out of 850</p>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-800">Financial Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Monthly Income:</span>
                          <span className="font-medium">R{assessmentResults.income.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Monthly Expenses:</span>
                          <span className="font-medium">R{assessmentResults.expenses.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-slate-600">Disposable Income:</span>
                          <span className="font-medium text-green-600">
                            R{assessmentResults.disposableIncome.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-800">Risk Assessment</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Risk Level:</span>
                          <span className={`font-medium ${
                            assessmentResults.riskLevel === 'Low' ? 'text-green-600' :
                            assessmentResults.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {assessmentResults.riskLevel}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Debt-to-Income Ratio:</span>
                          <span className="font-medium">
                            {(assessmentResults.debtToIncomeRatio * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Recommendations</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {creditScore >= 750 && (
                        <>
                          <li>• You qualify for premium rent-to-buy properties</li>
                          <li>• Eligible for the lowest rent credit percentages (up to 35%)</li>
                          <li>• Pre-approved for financing up to R1.5M</li>
                        </>
                      )}
                      {creditScore >= 650 && creditScore < 750 && (
                        <>
                          <li>• You qualify for most rent-to-buy properties</li>
                          <li>• Eligible for rent credit percentages up to 25%</li>
                          <li>• Pre-approved for financing up to R1M</li>
                        </>
                      )}
                      {creditScore < 650 && (
                        <>
                          <li>• Consider improving credit score for better options</li>
                          <li>• Start with smaller rent-to-buy properties</li>
                          <li>• Focus on building payment history</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <Button
                    onClick={handleComplete}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Continue to Dashboard
                  </Button>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center space-y-4 py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Check className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Financial Assessment Complete!</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Your credit profile has been created and you now have access to personalized rent-to-buy options
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 