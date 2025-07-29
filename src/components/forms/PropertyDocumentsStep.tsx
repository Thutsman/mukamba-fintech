'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiFileUpload } from '@/components/ui/MultiFileUpload';
import type { LandlordRegistrationData } from '@/types/auth';
import { useAuthStore } from '@/lib/store';

interface PropertyDocumentsStepProps {
  form: UseFormReturn<any>;
}

interface DocumentSection {
  id: keyof LandlordRegistrationData;
  title: string;
  description: string;
  required: boolean;
  multiple: boolean;
  acceptedTypes: string;
  icon: React.ReactNode;
}

export const PropertyDocumentsStep: React.FC<PropertyDocumentsStepProps> = ({ form }) => {
  const { registrationData, setRegistrationData } = useAuthStore();
  const landlordData = registrationData as LandlordRegistrationData;

  const documentSections: DocumentSection[] = [
    {
      id: 'idDocument',
      title: 'Identity Document',
      description: 'Clear copy of your South African ID or Zimbabwean ID',
      required: true,
      multiple: false,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      icon: <FileText className="w-5 h-5 text-blue-600" />
    },
    {
      id: 'titleDeeds',
      title: 'Title Deeds',
      description: 'Original title deeds for all properties in your portfolio',
      required: true,
      multiple: true,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      icon: <FileText className="w-5 h-5 text-red-600" />
    },
    {
      id: 'propertyTaxCertificates',
      title: 'Property Tax Certificates',
      description: 'Current property tax certificates for each property',
      required: true,
      multiple: true,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      icon: <FileText className="w-5 h-5 text-green-600" />
    },
    {
      id: 'municipalRatesCertificates',
      title: 'Municipal Rates Certificates',
      description: 'Municipal rates clearance certificates',
      required: true,
      multiple: true,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      icon: <FileText className="w-5 h-5 text-purple-600" />
    },
    {
      id: 'propertyInsurance',
      title: 'Property Insurance',
      description: 'Current property insurance policies and certificates',
      required: true,
      multiple: true,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      icon: <FileText className="w-5 h-5 text-orange-600" />
    },
    {
      id: 'complianceCertificates',
      title: 'Compliance Certificates',
      description: 'Electrical, plumbing, and other compliance certificates',
      required: false,
      multiple: true,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      icon: <FileText className="w-5 h-5 text-teal-600" />
    }
  ];

  // Add business documents if business is registered
  if (landlordData.businessRegistered) {
    documentSections.push(
      {
        id: 'businessRegistrationDoc',
        title: 'Business Registration',
        description: 'Business registration certificate or CK1 document',
        required: true,
        multiple: false,
        acceptedTypes: '.pdf,.jpg,.jpeg,.png',
        icon: <FileText className="w-5 h-5 text-indigo-600" />
      },
      {
        id: 'taxClearanceCertificate',
        title: 'Tax Clearance Certificate',
        description: 'SARS tax clearance certificate for your business',
        required: false,
        multiple: false,
        acceptedTypes: '.pdf,.jpg,.jpeg,.png',
        icon: <FileText className="w-5 h-5 text-yellow-600" />
      }
    );
  }

  const handleFileUpload = (sectionId: keyof LandlordRegistrationData, files: File[]) => {
    if (documentSections.find(s => s.id === sectionId)?.multiple) {
      setRegistrationData({ [sectionId]: files });
    } else {
      setRegistrationData({ [sectionId]: files[0] || null });
    }
  };

  const getUploadedFiles = (sectionId: keyof LandlordRegistrationData): File[] => {
    const data = landlordData[sectionId];
    if (!data) return [];
    
    // Handle different data types
    if (sectionId === 'properties') return []; // Properties are not files
    
    // Ensure we're dealing with File objects
    if (Array.isArray(data)) {
      return data.filter((item): item is File => item instanceof File);
    }
    
    if (data instanceof File) {
      return [data];
    }
    
    return [];
  };

  const isDocumentComplete = (section: DocumentSection): boolean => {
    const files = getUploadedFiles(section.id);
    return files.length > 0;
  };

  const getCompletionStatus = () => {
    const requiredSections = documentSections.filter(s => s.required);
    const completedRequired = requiredSections.filter(s => isDocumentComplete(s));
    const optionalSections = documentSections.filter(s => !s.required);
    const completedOptional = optionalSections.filter(s => isDocumentComplete(s));
    
    return {
      required: completedRequired.length,
      totalRequired: requiredSections.length,
      optional: completedOptional.length,
      totalOptional: optionalSections.length,
      overallComplete: completedRequired.length === requiredSections.length
    };
  };

  const status = getCompletionStatus();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Property Documentation
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Upload the required documents to verify property ownership and legal compliance.
        </p>
        
        {/* Progress Summary */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-900/20 dark:to-red-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Document Upload Progress
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {status.required}/{status.totalRequired} required • {status.optional}/{status.totalOptional} optional
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(status.required / status.totalRequired) * 100}%` }}
            />
          </div>
          {status.overallComplete && (
            <div className="flex items-center mt-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">All required documents uploaded!</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {documentSections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${isDocumentComplete(section) ? 'border-green-200 dark:border-green-800' : section.required ? 'border-red-200 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    {section.icon}
                    <span className="ml-2">{section.title}</span>
                    {section.required && (
                      <span className="ml-2 text-red-500 text-sm">*</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {isDocumentComplete(section) ? (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5 mr-1" />
                        <span className="text-sm">Complete</span>
                      </div>
                    ) : section.required ? (
                      <div className="flex items-center text-red-600 dark:text-red-400">
                        <AlertCircle className="w-5 h-5 mr-1" />
                        <span className="text-sm">Required</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">Optional</span>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {section.description}
                </p>
                
                <MultiFileUpload
                  onFilesChange={(files: File[]) => handleFileUpload(section.id, files)}
                  accept={section.acceptedTypes}
                  maxSize={10 * 1024 * 1024} // 10MB in bytes
                  label={`Upload ${section.title}`}
                  description={section.description}
                  files={getUploadedFiles(section.id)}
                  multiple={section.multiple}
                  className="w-full"
                />

                {section.multiple && section.id === 'titleDeeds' && landlordData.properties && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      <strong>Note:</strong> Please upload title deeds for all {landlordData.properties.length} properties in your portfolio.
                    </p>
                  </div>
                )}

                {section.id === 'complianceCertificates' && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      <strong>Compliance certificates may include:</strong> Electrical Certificate of Compliance (COC), 
                      Plumbing Certificate, Gas Certificate, Pool Certificate, etc.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Important Notes */}
      <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              All documents must be clear, legible, and current (issued within the last 6 months where applicable).
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Title deeds must be original or certified copies from the Deeds Office.
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Property tax and municipal rates certificates must show current payment status.
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Documents will be verified with relevant authorities during the KYC process.
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              File formats accepted: PDF, JPG, PNG. Maximum file size: 10MB per document.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}; 