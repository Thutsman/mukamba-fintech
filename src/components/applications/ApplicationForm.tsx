'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Save, Send, FileText, Upload, CheckCircle, User, Briefcase, Banknote, Home, FileCheck, AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { UnifiedProperty } from '@/lib/property-data';
import { Badge } from '@/components/ui/badge';

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COUNTER_OFFER = 'counter_offer'
}

interface ApplicationFormData {
  // Personal Info (pre-filled from KYC)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  idNumber: string;
  
  // Employment
  employer: string;
  jobTitle: string;
  employmentType: 'full-time' | 'part-time' | 'self-employed' | 'contract';
  monthlyIncome: number;
  employmentStartDate: string;
  
  // Financial
  monthlyExpenses: number;
  creditScore: number;
  bankName: string;
  accountNumber: string;
  
  // Property Preferences
  preferredMoveInDate: string;
  rentAmount: number;
  rentCreditPercentage: number;
  additionalRequirements: string;
  
  // Documents (only what user needs to upload)
  documents: {
    proofOfIncome: File | null;
    bankStatements: File | null;
  };
  
  // Agreements
  agreeToTerms: boolean;
  agreeToCreditCheck: boolean;
  agreeToBackgroundCheck: boolean;
}

interface ApplicationFormProps {
  property: UnifiedProperty;
  onBack: () => void;
  onSubmit: (applicationData: ApplicationFormData) => void;
  onSaveDraft: (applicationData: ApplicationFormData) => void;
  // Add user data for smart pre-fill
  userData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    idNumber: string;
    // Financial data from KYC
    monthlyIncome?: number;
    monthlyExpenses?: number;
    creditScore?: number;
  };
}

const STEPS = [
  { id: 1, title: 'Employment', icon: Briefcase },
  { id: 2, title: 'Financial', icon: Banknote },
  { id: 3, title: 'Preferences', icon: Home },
  { id: 4, title: 'Documents', icon: FileText },
  { id: 5, title: 'Review', icon: FileCheck }
];

// Data freshness indicator component
const DataFreshnessIndicator: React.FC<{ 
  field: string; 
  isFromKYC: boolean; 
  lastUpdated?: string;
  onUpdate?: () => void;
}> = ({ field, isFromKYC, lastUpdated, onUpdate }) => (
  <div className="flex items-center gap-2 text-xs">
    {isFromKYC ? (
      <>
        <CheckCircle className="w-3 h-3 text-green-600" />
        <span className="text-green-700">Verified from KYC</span>
        {lastUpdated && (
          <span className="text-slate-500">• Updated {lastUpdated}</span>
        )}
      </>
    ) : (
      <>
        <AlertCircle className="w-3 h-3 text-orange-600" />
        <span className="text-orange-700">Needs verification</span>
        {onUpdate && (
          <button 
            onClick={onUpdate}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Update
          </button>
        )}
      </>
    )}
  </div>
);

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  property,
  onBack,
  onSubmit,
  onSaveDraft,
  userData
}) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState<ApplicationFormData>(() => {
    // Smart pre-fill from user data if available
    const initialData: ApplicationFormData = {
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      dateOfBirth: userData?.dateOfBirth || '',
      idNumber: userData?.idNumber || '',
      employer: '',
      jobTitle: '',
      employmentType: '' as any, // Will be validated to ensure it's not empty
      monthlyIncome: userData?.monthlyIncome || 0,
      employmentStartDate: '',
      monthlyExpenses: userData?.monthlyExpenses || 0,
      creditScore: userData?.creditScore || 0,
      bankName: '',
      accountNumber: '',
      preferredMoveInDate: '',
      rentAmount: property.price * 0.01, // Default to 1% of property price
      rentCreditPercentage: 25, // Default 25%
      additionalRequirements: '',
      documents: {
        proofOfIncome: null,
        bankStatements: null,
      },
      agreeToTerms: false,
      agreeToCreditCheck: false,
      agreeToBackgroundCheck: false,
    };

    return initialData;
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateFormData = (field: keyof ApplicationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateDocuments = (field: keyof ApplicationFormData['documents'], file: File | null) => {
    if (file) {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`File size must be less than 10MB. Selected file: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF, JPG, or PNG file.');
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
    
    // Clear any existing errors for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Employment
        if (!formData.employer.trim()) newErrors.employer = 'Employer is required';
        if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
        if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
        if (!formData.employmentStartDate) newErrors.employmentStartDate = 'Employment start date is required';
        break;
      case 2: // Financial
        if (formData.monthlyIncome <= 0) newErrors.monthlyIncome = 'Monthly income must be greater than 0';
        if (formData.monthlyExpenses < 0) newErrors.monthlyExpenses = 'Monthly expenses cannot be negative';
        if (formData.creditScore < 300 || formData.creditScore > 850) newErrors.creditScore = 'Credit score must be between 300 and 850';
        if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
        if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
        break;
      case 3: // Preferences
        if (!formData.preferredMoveInDate) newErrors.preferredMoveInDate = 'Preferred move-in date is required';
        if (formData.rentAmount <= 0) newErrors.rentAmount = 'Rent amount must be greater than 0';
        if (formData.rentCreditPercentage < 0 || formData.rentCreditPercentage > 100) {
          newErrors.rentCreditPercentage = 'Rent credit percentage must be between 0 and 100';
        }
        break;
      case 4: // Documents
        if (!formData.documents.proofOfIncome) newErrors.proofOfIncome = 'Proof of income is required';
        if (!formData.documents.bankStatements) newErrors.bankStatements = 'Bank statements are required';
        break;
      case 5: // Review
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        if (!formData.agreeToCreditCheck) newErrors.agreeToCreditCheck = 'You must agree to the credit check';
        if (!formData.agreeToBackgroundCheck) newErrors.agreeToBackgroundCheck = 'You must agree to the background check';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = () => {
    onSaveDraft(formData);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEmploymentStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employer">Employer/Company *</Label>
          <Input
            id="employer"
            value={formData.employer}
            onChange={(e) => updateFormData('employer', e.target.value)}
            className={errors.employer ? 'border-red-500' : ''}
          />
          {errors.employer && <p className="text-red-500 text-sm mt-1">{errors.employer}</p>}
        </div>
        <div>
          <Label htmlFor="jobTitle">Job Title *</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => updateFormData('jobTitle', e.target.value)}
            className={errors.jobTitle ? 'border-red-500' : ''}
          />
          {errors.jobTitle && <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employmentType">Employment Type *</Label>
          <Select value={formData.employmentType} onValueChange={(value) => updateFormData('employmentType', value)}>
            <SelectTrigger className={errors.employmentType ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="self-employed">Self-employed</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
          {errors.employmentType && <p className="text-red-500 text-sm mt-1">{errors.employmentType}</p>}
        </div>
        <div>
          <Label htmlFor="employmentStartDate">Employment Start Date *</Label>
          <Input
            id="employmentStartDate"
            type="date"
            value={formData.employmentStartDate}
            onChange={(e) => updateFormData('employmentStartDate', e.target.value)}
            className={errors.employmentStartDate ? 'border-red-500' : ''}
          />
          {errors.employmentStartDate && <p className="text-red-500 text-sm mt-1">{errors.employmentStartDate}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="monthlyIncome">Monthly Income (R) *</Label>
        <Input
          id="monthlyIncome"
          type="text"
          value={formData.monthlyIncome === 0 ? '' : formData.monthlyIncome.toString()}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
            updateFormData('monthlyIncome', value ? parseFloat(value) : 0);
          }}
          placeholder="Enter monthly income"
          className={errors.monthlyIncome ? 'border-red-500' : ''}
        />
        {errors.monthlyIncome && <p className="text-red-500 text-sm mt-1">{errors.monthlyIncome}</p>}
      </div>
    </div>
  );

  const renderFinancialStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthlyExpenses">Monthly Expenses (R) *</Label>
          <Input
            id="monthlyExpenses"
            type="text"
            value={formData.monthlyExpenses === 0 ? '' : formData.monthlyExpenses.toString()}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
              updateFormData('monthlyExpenses', value ? parseFloat(value) : 0);
            }}
            placeholder="Enter monthly expenses"
            className={errors.monthlyExpenses ? 'border-red-500' : ''}
          />
          {errors.monthlyExpenses && <p className="text-red-500 text-sm mt-1">{errors.monthlyExpenses}</p>}
        </div>
        <div>
          <Label htmlFor="creditScore">Credit Score</Label>
          <Input
            id="creditScore"
            type="text"
            value={formData.creditScore === 0 ? '' : formData.creditScore.toString()}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
              updateFormData('creditScore', value ? parseInt(value) : 0);
            }}
            placeholder="Enter credit score (300-850)"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="bankName">Bank Name *</Label>
        <Input
          id="bankName"
          value={formData.bankName}
          onChange={(e) => updateFormData('bankName', e.target.value)}
          className={errors.bankName ? 'border-red-500' : ''}
        />
        {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
      </div>
      <div>
        <Label htmlFor="accountNumber">Account Number *</Label>
        <Input
          id="accountNumber"
          value={formData.accountNumber}
          onChange={(e) => updateFormData('accountNumber', e.target.value)}
          className={errors.accountNumber ? 'border-red-500' : ''}
        />
        {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
      </div>
    </div>
  );

  const renderPreferencesStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="preferredMoveInDate">Preferred Move-in Date *</Label>
          <Input
            id="preferredMoveInDate"
            type="date"
            value={formData.preferredMoveInDate}
            onChange={(e) => updateFormData('preferredMoveInDate', e.target.value)}
            className={errors.preferredMoveInDate ? 'border-red-500' : ''}
          />
          {errors.preferredMoveInDate && <p className="text-red-500 text-sm mt-1">{errors.preferredMoveInDate}</p>}
        </div>
        <div>
          <Label htmlFor="rentAmount">Monthly Rent Amount (R) *</Label>
          <Input
            id="rentAmount"
            type="text"
            value={formData.rentAmount === 0 ? '' : formData.rentAmount.toString()}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
              updateFormData('rentAmount', value ? parseFloat(value) : 0);
            }}
            placeholder="Enter monthly rent amount"
            className={errors.rentAmount ? 'border-red-500' : ''}
          />
          {errors.rentAmount && <p className="text-red-500 text-sm mt-1">{errors.rentAmount}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="rentCreditPercentage">Rent Credit Percentage (%)</Label>
        <Input
          id="rentCreditPercentage"
          type="text"
          value={formData.rentCreditPercentage === 0 ? '' : formData.rentCreditPercentage.toString()}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
            updateFormData('rentCreditPercentage', value ? parseInt(value) : 0);
          }}
          placeholder="Enter percentage (0-100)"
        />
      </div>
      <div>
        <Label htmlFor="additionalRequirements">Additional Requirements</Label>
        <Textarea
          id="additionalRequirements"
          value={formData.additionalRequirements}
          onChange={(e) => updateFormData('additionalRequirements', e.target.value)}
          placeholder="Any special requirements or requests..."
          rows={4}
        />
      </div>
    </div>
  );

  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="proofOfIncome">Proof of Income *</Label>
          <div 
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
            onClick={() => document.getElementById('proofOfIncome')?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-3 text-slate-400" />
            <input
              id="proofOfIncome"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => updateDocuments('proofOfIncome', e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                {formData.documents.proofOfIncome ? formData.documents.proofOfIncome.name : 'Click to upload Proof of Income'}
              </p>
              <p className="text-xs text-slate-500">
                {formData.documents.proofOfIncome 
                  ? `File size: ${(formData.documents.proofOfIncome.size / 1024 / 1024).toFixed(2)} MB`
                  : 'PDF, JPG, PNG up to 10MB'
                }
              </p>
            </div>
            {formData.documents.proofOfIncome && (
              <div className="mt-3">
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Uploaded
                </Badge>
              </div>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="bankStatements">Bank Statements (Last 3 months) *</Label>
          <div 
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
            onClick={() => document.getElementById('bankStatements')?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-3 text-slate-400" />
            <input
              id="bankStatements"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => updateDocuments('bankStatements', e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                {formData.documents.bankStatements ? formData.documents.bankStatements.name : 'Click to upload Bank Statements'}
              </p>
              <p className="text-xs text-slate-500">
                {formData.documents.bankStatements 
                  ? `File size: ${(formData.documents.bankStatements.size / 1024 / 1024).toFixed(2)} MB`
                  : 'PDF, JPG, PNG up to 10MB'
                }
              </p>
            </div>
            {formData.documents.bankStatements && (
              <div className="mt-3">
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Uploaded
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Information about pre-filled documents */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Documents Already Verified</h4>
            <p className="text-sm text-blue-700 mb-2">
              The following documents have been verified during your KYC process and will be automatically included in your application:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>ID Document:</strong> Already verified and on file</li>
              <li>• <strong>Credit Report:</strong> Will be automatically generated from credit bureaus</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Personal Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information (Pre-filled from KYC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Full Name</p>
              <p className="font-medium">{formData.firstName} {formData.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Email</p>
              <p className="font-medium">{formData.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Phone</p>
              <p className="font-medium">{formData.phone}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Date of Birth</p>
              <p className="font-medium">{formData.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">ID Number</p>
              <p className="font-medium">{formData.idNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Credit Score</p>
              <p className="font-medium">{formData.creditScore}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Employment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Employer</p>
              <p className="font-medium">{formData.employer}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Job Title</p>
              <p className="font-medium">{formData.jobTitle}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Employment Type</p>
              <p className="font-medium">{formData.employmentType}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Start Date</p>
              <p className="font-medium">{formData.employmentStartDate}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Monthly Income</p>
              <p className="font-medium">R{formData.monthlyIncome.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Monthly Expenses</p>
              <p className="font-medium">R{formData.monthlyExpenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Credit Score</p>
              <p className="font-medium">{formData.creditScore}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Bank Name</p>
              <p className="font-medium">{formData.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Account Number</p>
              <p className="font-medium">{formData.accountNumber}</p>
            </div>
          </div>
          
          {/* Note about loan analysis */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700">
                  <strong>Existing Loans:</strong> Will be automatically analyzed from your uploaded bank statements to ensure accurate financial assessment.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Property</p>
              <p className="font-medium">{property.title}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Location</p>
              <p className="font-medium">{property.address}, {property.city}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Price</p>
              <p className="font-medium">R{property.price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Monthly Rent</p>
              <p className="font-medium">R{formData.rentAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Rent Credit Percentage</p>
              <p className="font-medium">{formData.rentCreditPercentage}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Preferred Move-in Date</p>
              <p className="font-medium">{formData.preferredMoveInDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Pre-verified Documents */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Pre-verified Documents</h4>
                  <p className="text-sm text-green-700">These documents are already verified and will be automatically included:</p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• <strong>ID Document:</strong> Verified during KYC process</li>
                    <li>• <strong>Credit Report:</strong> Will be generated from credit bureaus</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* User Uploaded Documents */}
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Documents to be Uploaded</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Proof of Income</span>
                  <span className={`text-sm ${formData.documents.proofOfIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.documents.proofOfIncome ? '✓ Uploaded' : '✗ Required'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Bank Statements (Last 3 months)</span>
                  <span className={`text-sm ${formData.documents.bankStatements ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.documents.bankStatements ? '✓ Uploaded' : '✗ Required'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
          />
          <Label htmlFor="agreeToTerms" className="text-sm">
            I agree to the terms and conditions of the rent-to-own agreement
          </Label>
        </div>
        {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}

        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeToCreditCheck"
            checked={formData.agreeToCreditCheck}
            onCheckedChange={(checked) => updateFormData('agreeToCreditCheck', checked)}
          />
          <Label htmlFor="agreeToCreditCheck" className="text-sm">
            I authorize a credit check to be performed
          </Label>
        </div>
        {errors.agreeToCreditCheck && <p className="text-red-500 text-sm">{errors.agreeToCreditCheck}</p>}

        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeToBackgroundCheck"
            checked={formData.agreeToBackgroundCheck}
            onCheckedChange={(checked) => updateFormData('agreeToBackgroundCheck', checked)}
          />
          <Label htmlFor="agreeToBackgroundCheck" className="text-sm">
            I authorize a background check to be performed
          </Label>
        </div>
        {errors.agreeToBackgroundCheck && <p className="text-red-500 text-sm">{errors.agreeToBackgroundCheck}</p>}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderEmploymentStep();
      case 2:
        return renderFinancialStep();
      case 3:
        return renderPreferencesStep();
      case 4:
        return renderDocumentsStep();
      case 5:
        return renderReviewStep();
      default:
        return renderEmploymentStep();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <h1 className="text-xl font-semibold text-slate-900">Property Application</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleSaveDraft} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                    isActive ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-white border-slate-300 text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-slate-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {STEPS[currentStep - 1]?.icon && (() => {
                const Icon = STEPS[currentStep - 1].icon;
                return <Icon className="w-5 h-5" />;
              })()}
              {STEPS[currentStep - 1]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < STEPS.length ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
