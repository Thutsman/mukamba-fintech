'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiFileUpload } from '@/components/ui/MultiFileUpload';
import type { SellerVerificationData } from '@/types/auth';
import { useAuthStore } from '@/lib/store';

interface PropertyDocumentsStepProps {
  form: UseFormReturn<any>;
}

export const PropertyDocumentsStep: React.FC<PropertyDocumentsStepProps> = ({ form }) => {
  const { user, updateUser } = useAuthStore();
  const [documents, setDocuments] = React.useState<Partial<SellerVerificationData>>({});

  const handleFileUpload = (documentType: string, files: File[]) => {
    console.log(`Uploading ${files.length} files for ${documentType}`);
    // Handle file upload logic here
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Property Documents</h2>
        <p className="text-slate-600 mt-2">Upload your property-related documents for verification</p>
      </div>

      <div className="grid gap-6">
        {/* Identity Document */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Identity Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Clear copy of your South African ID or Zimbabwean ID
            </p>
            <MultiFileUpload
              onFilesChange={(files) => handleFileUpload('idDocument', files)}
              accept="image/*,.pdf"
              multiple={false}
              maxSize={5 * 1024 * 1024} // 5MB
              label="Upload Identity Document"
              description="Clear copy of your ID"
            />
          </CardContent>
        </Card>

        {/* Title Deeds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              Title Deeds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Official title deeds for all properties you wish to list
            </p>
            <MultiFileUpload
              onFilesChange={(files) => handleFileUpload('titleDeeds', files)}
              accept="image/*,.pdf"
              multiple={true}
              maxSize={5 * 1024 * 1024} // 5MB
              label="Upload Title Deeds"
              description="Official title deeds for properties"
            />
          </CardContent>
        </Card>

        {/* Property Tax Certificates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-orange-600" />
              Property Tax Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Current property tax certificates showing payments are up to date
            </p>
            <MultiFileUpload
              onFilesChange={(files) => handleFileUpload('propertyTaxCertificates', files)}
              accept="image/*,.pdf"
              multiple={true}
              maxSize={5 * 1024 * 1024} // 5MB
              label="Upload Tax Certificates"
              description="Property tax certificates"
            />
          </CardContent>
        </Card>

        {/* Business Registration (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Business Registration <span className="text-sm text-slate-500 ml-2">(Optional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              If you're registering as a business entity, upload your business registration documents
            </p>
            <MultiFileUpload
              onFilesChange={(files) => handleFileUpload('businessRegistrationDoc', files)}
              accept="image/*,.pdf"
              multiple={false}
              maxSize={5 * 1024 * 1024} // 5MB
              label="Upload Business Registration"
              description="Business registration documents"
            />
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900">Document Requirements</h4>
            <ul className="text-sm text-blue-800 mt-1 space-y-1">
              <li>• All documents must be clear and legible</li>
              <li>• Accepted formats: PDF, JPG, PNG</li>
              <li>• Maximum file size: 5MB per document</li>
              <li>• Documents should be recent (within 3 months where applicable)</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 