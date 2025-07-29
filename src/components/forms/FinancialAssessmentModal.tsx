'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, TrendingUp, Check, FileText, Calculator, Loader2, Upload, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface FinancialAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const financialSchema = z.object({
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
  onComplete
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

  const form = useForm<FinancialFormData>({
    resolver: zodResolver(financialSchema),
    defaultValues: {
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

  const handleFormSubmit = async (data: FinancialFormData) => {
    // Move to document upload step
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
      onClose();
    }
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="w-6 h-6" />
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
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
              <CardTitle className="text-xl">
                {step === 'form' && 'Financial Assessment'}
                {step === 'documents' && 'Upload Supporting Documents'}
                {step === 'processing' && 'Analyzing Your Finances'}
                {step === 'results' && 'Your Credit Profile'}
                {step === 'success' && 'Assessment Complete!'}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                {step === 'form' && 'Help us understand your financial situation to provide personalized rent-to-buy options'}
                {step === 'documents' && 'Upload proof of income and address to complete your financial verification'}
                {step === 'processing' && 'Please wait while we calculate your credit score and financial profile'}
                {step === 'results' && 'Review your credit assessment and financial recommendations'}
                {step === 'success' && 'Your financial profile has been successfully created'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
              {step === 'form' && (
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                  {/* Employment Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Employment Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="employmentStatus">Employment Status</Label>
                        <Select onValueChange={(value) => form.setValue('employmentStatus', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time Employee</SelectItem>
                            <SelectItem value="part-time">Part-time Employee</SelectItem>
                            <SelectItem value="self-employed">Self-employed</SelectItem>
                            <SelectItem value="contract">Contract Worker</SelectItem>
                            <SelectItem value="unemployed">Unemployed</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
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
                          {...form.register('monthlyIncome')}
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value);
                            form.setValue('monthlyIncome', formatted);
                          }}
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
                          {...form.register('employerName')}
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
                          {...form.register('jobTitle')}
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
                      <Select onValueChange={(value) => form.setValue('employmentDuration', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="How long at current job?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-6months">0-6 months</SelectItem>
                          <SelectItem value="6-12months">6-12 months</SelectItem>
                          <SelectItem value="1-2years">1-2 years</SelectItem>
                          <SelectItem value="2-5years">2-5 years</SelectItem>
                          <SelectItem value="5+years">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.employmentDuration && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.employmentDuration.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Financial Information</h3>
                    
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
                          {...form.register('monthlyExpenses')}
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value);
                            form.setValue('monthlyExpenses', formatted);
                          }}
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
                      <Select onValueChange={(value) => form.setValue('hasDebts', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No debts</SelectItem>
                          <SelectItem value="minimal">Minimal debts (&lt; R50,000)</SelectItem>
                          <SelectItem value="moderate">Moderate debts (R50,000 - R200,000)</SelectItem>
                          <SelectItem value="significant">Significant debts (&gt; R200,000)</SelectItem>
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
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Continue to Documents
                    </>
                  </Button>
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

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep('form')}
                      className="flex-1"
                    >
                      Back to Form
                    </Button>
                    <Button
                      onClick={handleDocumentsSubmit}
                      disabled={!uploadedDocuments.proofOfIncome || !uploadedDocuments.proofOfAddress || isLoading}
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 