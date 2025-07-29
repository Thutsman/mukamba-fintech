'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Components
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { FileUpload } from '@/components/ui/FileUpload';
import { CreditScoreGenerator } from '@/components/ui/CreditScoreGenerator';
import { OTPVerification } from '@/components/ui/OTPVerification';

// Types and Validation
import { type RegistrationData } from '@/types/auth';
import { getStepSchema } from '@/lib/validations';
import { useAuthStore } from '@/lib/store';

// Services
import { creditScoreService, otpService, idValidationService } from '@/lib/mock-services';

// New Landlord Step Components
import { PropertyPortfolioStep } from './PropertyPortfolioStep';
import { PropertyDocumentsStep } from './PropertyDocumentsStep';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Step config will be determined dynamically based on user role

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    registrationData,
    currentStep,
    setRegistrationData,
    nextStep,
    prevStep,
    completeRegistration,
    isLoading,
    error,
    setError
  } = useAuthStore();

  const [creditData, setCreditData] = React.useState<CreditScoreData | null>(null);
  const [isCalculatingCredit, setIsCalculatingCredit] = React.useState(false);
  const [showOTP, setShowOTP] = React.useState(false);
  const [otpType, setOtpType] = React.useState<'phone' | 'email'>('phone');

  const userRole = registrationData.role || 'tenant';
  const steps = getRegistrationSteps(userRole);
  const currentStepId = steps[currentStep];
  const stepConfig = getStepConfig(userRole, currentStep);
  const schema = getStepSchema(currentStepId);

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: registrationData,
    mode: 'onChange'
  });

  // Update form when registration data changes
  React.useEffect(() => {
    form.reset(registrationData);
  }, [registrationData, form]);

  const onSubmit = async (data: any) => {
    setError(null);
    setRegistrationData(data);

    switch (currentStepId) {
      case 'personal-info':
        // Move to verification step
        nextStep();
        break;

      case 'verification':
        // Validate ID and show OTP
        try {
          const idResult = await idValidationService.validateID(
            data.idNumber,
            data.nationality
          );
          
          if (!idResult.isValid) {
            setError(idResult.error || 'Invalid ID number');
            return;
          }

          // Auto-fill date of birth if extracted from ID
          if (idResult.details?.dateOfBirth) {
            setRegistrationData({ ...data, dateOfBirth: idResult.details.dateOfBirth });
          }

          setShowOTP(true);
        } catch (error) {
          setError('ID validation failed. Please try again.');
        }
        break;

      case 'financial-assessment':
        // Calculate credit score
        setIsCalculatingCredit(true);
        try {
          const creditScore = await creditScoreService.calculateCreditScore({
            ...registrationData,
            ...data
          } as RegistrationData);
          setCreditData(creditScore);
          setIsCalculatingCredit(false);
        } catch (error) {
          setIsCalculatingCredit(false);
          setError('Credit assessment failed. Please try again.');
        }
        break;

      case 'kyc-documents':
        // Complete registration
        await completeRegistration();
        break;

      default:
        nextStep();
    }
  };

  const handleOTPVerify = async (code: string): Promise<boolean> => {
    try {
      const result = await otpService.verifyOTP('mock-id', code);
      if (result.success) {
        setShowOTP(false);
        nextStep();
        return true;
      } else {
        setError(result.error || 'OTP verification failed');
        return false;
      }
    } catch (error) {
      setError('OTP verification failed. Please try again.');
      return false;
    }
  };

  const handleOTPResend = async (): Promise<boolean> => {
    try {
      const result = await otpService.sendOTP(
        registrationData.phone || '',
        registrationData.email || '',
        otpType
      );
      return result.success;
    } catch (error) {
      return false;
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Join Mukamba
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Create your account to access rent-to-buy properties
            </p>
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

        {/* Progress Stepper */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <ProgressStepper
            steps={stepConfig}
            currentStep={currentStep}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {showOTP ? (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <OTPVerification
                  type={otpType}
                  contactInfo={otpType === 'phone' ? registrationData.phone || '' : registrationData.email || ''}
                  onVerify={handleOTPVerify}
                  onResend={handleOTPResend}
                  error={error || undefined}
                />
              </motion.div>
            ) : (
              <motion.div
                key={currentStepId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
                  {/* Step Content */}
                  {currentStepId === 'personal-info' && (
                    <PersonalInfoStep form={form} />
                  )}
                  
                  {currentStepId === 'verification' && (
                    <VerificationStep form={form} />
                  )}
                  
                  {currentStepId === 'financial-assessment' && (
                    <>
                      {isCalculatingCredit || creditData ? (
                        <CreditScoreGenerator
                          creditData={creditData || { score: 0, factors: { income: 0, age: 0, employment: 0, random: 0 }, rating: 'Poor' }}
                          isLoading={isCalculatingCredit}
                        />
                      ) : (
                        <FinancialAssessmentStep form={form} />
                      )}
                    </>
                  )}
                  
                  {currentStepId === 'kyc-documents' && (
                    <KYCDocumentsStep form={form} registrationData={registrationData} setRegistrationData={setRegistrationData} />
                  )}

                  {/* Landlord-specific steps */}
                  {currentStepId === 'property-portfolio' && (
                    <PropertyPortfolioStep form={form} />
                  )}
                  
                  {currentStepId === 'property-documents' && (
                    <PropertyDocumentsStep form={form} />
                  )}
                  
                  {currentStepId === 'completion' && (
                    <CompletionStep />
                  )}

                  {/* Error Display */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Credit Score Navigation - Special case */}
                  {!showOTP && currentStepId === 'financial-assessment' && creditData && !isCalculatingCredit && (
                    <div className="flex justify-between pt-6 mt-8 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={isLoading}
                        className="min-w-[100px]"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>

                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
                      >
                        Continue to Documents
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}

                  {/* Regular Navigation Buttons */}
                  {!showOTP && currentStepId !== 'completion' && !(currentStepId === 'financial-assessment' && (isCalculatingCredit || creditData)) && (
                    <div className={`flex pt-6 mt-8 border-t border-slate-200 dark:border-slate-700 ${currentStep === 0 ? 'justify-end' : 'justify-between'}`}>
                      {currentStep > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          disabled={isLoading}
                          className="min-w-[100px]"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                      )}

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white min-w-[100px]"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : currentStepId === 'kyc-documents' ? (
                          'Complete Registration'
                        ) : (
                          <>
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// Step Components
interface StepProps {
  form: any;
}

const PersonalInfoStep: React.FC<StepProps> = ({ form }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Personal Information</h3>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300">First Name</Label>
        <input
          {...form.register('firstName')}
          className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          placeholder="John"
        />
        {form.formState.errors.firstName && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.firstName.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="lastName">Last Name</Label>
        <input
          {...form.register('lastName')}
          className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Doe"
        />
        {form.formState.errors.lastName && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.lastName.message}</p>
        )}
      </div>
    </div>

    <div>
      <Label htmlFor="email">Email Address</Label>
      <input
        {...form.register('email')}
        type="email"
        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="john@example.com"
      />
      {form.formState.errors.email && (
        <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
      )}
    </div>

    <div>
      <Label htmlFor="phone">Phone Number</Label>
      <input
        {...form.register('phone')}
        type="tel"
        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="+27123456789"
      />
      {form.formState.errors.phone && (
        <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>
      )}
    </div>

    <div>
      <Label htmlFor="password">Password</Label>
      <input
        {...form.register('password')}
        type="password"
        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="Create a strong password"
      />
      {form.formState.errors.password && (
        <p className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</p>
      )}
    </div>

    <div>
      <Label htmlFor="role">I am a</Label>
      <select
        {...form.register('role')}
        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Select your role</option>
        <option value="tenant">Tenant (Looking for property)</option>
        <option value="landlord">Landlord (Property owner)</option>
      </select>
      {form.formState.errors.role && (
        <p className="text-sm text-red-600 mt-1">{form.formState.errors.role.message}</p>
      )}
    </div>
  </div>
);

const VerificationStep: React.FC<StepProps> = ({ form }) => {
  const selectedNationality = form.watch('nationality');
  
  const getIdFormatHint = (nationality: string) => {
    switch (nationality) {
      case 'SA':
        return {
          format: '13 digits (no spaces or dashes)',
          example: 'Example: 0000000000000',
          placeholder: '0000000000000'
        };
      case 'ZIM':
        return {
          format: 'XX-XXXXXX-X-XX or XX-XXXXXXX-X-XX',
          example: 'Examples: 01-000000-A-01 or 10-0000000-B-10',
          placeholder: '01-000000-A-01'
        };
      default:
        return {
          format: '',
          example: '',
          placeholder: 'Enter your ID number'
        };
    }
  };

  const idHint = getIdFormatHint(selectedNationality);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Identity Verification</h3>
      
      <div>
        <Label htmlFor="nationality" className="text-slate-700 dark:text-slate-300">Nationality</Label>
        <select
          {...form.register('nationality')}
          className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="">Select nationality</option>
          <option value="SA">South African</option>
          <option value="ZIM">Zimbabwean</option>
        </select>
        {form.formState.errors.nationality && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.nationality.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="idNumber" className="text-slate-700 dark:text-slate-300">ID Number</Label>
        {idHint.format && (
          <div className="mt-1 mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Format: {idHint.format}</p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">{idHint.example}</p>
          </div>
        )}
        <input
          {...form.register('idNumber')}
          className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          placeholder={idHint.placeholder}
        />
        {form.formState.errors.idNumber && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.idNumber.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="dateOfBirth" className="text-slate-700 dark:text-slate-300">Date of Birth</Label>
        <input
          {...form.register('dateOfBirth')}
          type="date"
          className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        />
        {form.formState.errors.dateOfBirth && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.dateOfBirth.message}</p>
        )}
      </div>
    </div>
  );
};

const FinancialAssessmentStep: React.FC<StepProps> = ({ form }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Financial Assessment</h3>
    
    <div>
      <Label htmlFor="monthlyIncome">Monthly Income</Label>
      <input
        {...form.register('monthlyIncome', { valueAsNumber: true })}
        type="number"
        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="50000"
      />
      {form.formState.errors.monthlyIncome && (
        <p className="text-sm text-red-600 mt-1">{form.formState.errors.monthlyIncome.message}</p>
      )}
    </div>

    <div>
      <Label htmlFor="employmentStatus">Employment Status</Label>
      <select
        {...form.register('employmentStatus')}
        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Select employment status</option>
        <option value="permanent">Permanent Employee</option>
        <option value="contract">Contract Worker</option>
        <option value="self-employed">Self Employed</option>
        <option value="unemployed">Unemployed</option>
      </select>
      {form.formState.errors.employmentStatus && (
        <p className="text-sm text-red-600 mt-1">{form.formState.errors.employmentStatus.message}</p>
      )}
    </div>

    <div>
      <Label htmlFor="bankName" className="text-slate-700 dark:text-slate-300">Bank Name</Label>
      <select
        {...form.register('bankName')}
        className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
      >
        <option value="">Select your bank</option>
        
        {/* South African Banks */}
        <optgroup label="🇿🇦 South African Banks">
          <option value="Standard Bank">Standard Bank</option>
          <option value="FNB">FNB (First National Bank)</option>
          <option value="ABSA">ABSA</option>
          <option value="Nedbank">Nedbank</option>
          <option value="Capitec">Capitec Bank</option>
          <option value="Discovery Bank">Discovery Bank</option>
          <option value="Investec">Investec</option>
          <option value="African Bank">African Bank</option>
        </optgroup>
        
        {/* Zimbabwean Banks */}
        <optgroup label="🇿🇼 Zimbabwean Banks">
          <option value="CBZ Bank">CBZ Bank</option>
          <option value="Stanbic Bank">Stanbic Bank Zimbabwe</option>
          <option value="Standard Chartered">Standard Chartered Zimbabwe</option>
          <option value="FBC Bank">FBC Bank</option>
          <option value="CABS">CABS (Central Africa Building Society)</option>
          <option value="ZB Bank">ZB Bank</option>
          <option value="Steward Bank">Steward Bank</option>
          <option value="NMB Bank">NMB Bank</option>
          <option value="BancABC">BancABC</option>
          <option value="Ecobank">Ecobank Zimbabwe</option>
        </optgroup>
        
        {/* Other Option */}
        <option value="Other">Other (Not listed above)</option>
      </select>
      {form.formState.errors.bankName && (
        <p className="text-sm text-red-600 mt-1">{form.formState.errors.bankName.message}</p>
      )}
    </div>

    <div className="flex items-center space-x-2">
      <input
        {...form.register('creditConsent')}
        type="checkbox"
        className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
      />
      <Label htmlFor="creditConsent" className="text-sm">
        I consent to credit checks and financial assessment
      </Label>
    </div>
    {form.formState.errors.creditConsent && (
      <p className="text-sm text-red-600 mt-1">{form.formState.errors.creditConsent.message}</p>
    )}
  </div>
);

interface KYCStepProps {
  form: any;
  registrationData: any;
  setRegistrationData: any;
}

const KYCDocumentsStep: React.FC<KYCStepProps> = ({ 
  form, 
  registrationData, 
  setRegistrationData 
}) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Upload Documents</h3>
    
    <FileUpload
      label="ID Document"
      description="Upload a clear photo of your ID document"
      onFileSelect={(file) => setRegistrationData({ ...registrationData, idDocument: file })}
      value={registrationData.idDocument}
      error={form.formState.errors.idDocument?.message}
    />

    <FileUpload
      label="Proof of Income"
      description="Upload your latest payslip or income statement"
      onFileSelect={(file) => setRegistrationData({ ...registrationData, proofOfIncome: file })}
      value={registrationData.proofOfIncome}
      error={form.formState.errors.proofOfIncome?.message}
    />

    <FileUpload
      label="Bank Statement"
      description="Upload your latest bank statement (last 3 months)"
      onFileSelect={(file) => setRegistrationData({ ...registrationData, bankStatement: file })}
      value={registrationData.bankStatement}
      error={form.formState.errors.bankStatement?.message}
    />
  </div>
);

const CompletionStep: React.FC = () => (
  <div className="text-center py-8">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-6"
    >
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </motion.div>
    
    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
      Welcome to Mukamba!
    </h3>
    
    <p className="text-slate-600 dark:text-slate-400 mb-6">
      Your account has been created successfully. You can now explore rent-to-buy properties and start your journey to homeownership.
    </p>

    <div className="space-y-2 text-sm text-slate-500">
      <p>✓ Identity verified</p>
      <p>✓ Financial assessment completed</p>
      <p>✓ Documents uploaded</p>
      <p>✓ Account activated</p>
    </div>
  </div>
); 