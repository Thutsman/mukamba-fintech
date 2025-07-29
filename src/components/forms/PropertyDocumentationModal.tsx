'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, Upload, Check, FileText, Loader2, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface PropertyDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const PropertyDocumentationModal: React.FC<PropertyDocumentationModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [step, setStep] = React.useState<'documents' | 'processing' | 'success'>('documents');
  const [uploadedDocuments, setUploadedDocuments] = React.useState<{
    titleDeed?: File;
    propertyTaxCertificate?: File;
    surveyReport?: File;
    complianceCertificate?: File;
  }>({});
  const [propertyDetails, setPropertyDetails] = React.useState({
    propertyAddress: '',
    propertyDescription: '',
    propertyValue: '',
    additionalNotes: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentUpload, setCurrentUpload] = React.useState<keyof typeof uploadedDocuments>('titleDeed');

  const documentTypes = [
    {
      key: 'titleDeed' as const,
      label: 'Title Deed',
      description: 'Official property title deed showing ownership',
      required: true
    },
    {
      key: 'propertyTaxCertificate' as const,
      label: 'Property Tax Certificate',
      description: 'Recent municipal rates and taxes certificate',
      required: true
    },
    {
      key: 'surveyReport' as const,
      label: 'Survey Report',
      description: 'Property survey and boundary report',
      required: false
    },
    {
      key: 'complianceCertificate' as const,
      label: 'Compliance Certificate',
      description: 'Building compliance and occupancy certificate',
      required: false
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDocuments(prev => ({
        ...prev,
        [currentUpload]: file
      }));
    }
  };

  const triggerFileUpload = (documentType: keyof typeof uploadedDocuments) => {
    setCurrentUpload(documentType);
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    // Check if required documents are uploaded
    const requiredDocs = documentTypes.filter(doc => doc.required);
    const missingRequired = requiredDocs.some(doc => !uploadedDocuments[doc.key]);
    
    if (missingRequired) {
      alert('Please upload all required documents before proceeding.');
      return;
    }

    setIsLoading(true);
    setStep('processing');
    
    try {
      // Simulate document processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      setStep('success');
      setTimeout(() => {
        onComplete();
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Property documentation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStep('documents');
      setUploadedDocuments({});
      setPropertyDetails({
        propertyAddress: '',
        propertyDescription: '',
        propertyValue: '',
        additionalNotes: ''
      });
      onClose();
    }
  };

  const requiredDocsUploaded = documentTypes
    .filter(doc => doc.required)
    .every(doc => uploadedDocuments[doc.key]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
        >
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="w-6 h-6" />
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Building className="w-6 h-6 text-orange-600" />
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
                {step === 'documents' && 'Property Documentation'}
                {step === 'processing' && 'Verifying Property Documents'}
                {step === 'success' && 'Property Verified!'}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                {step === 'documents' && 'Upload your property ownership documents to list on our platform'}
                {step === 'processing' && 'Please wait while we verify your property documents'}
                {step === 'success' && 'Your property has been successfully verified and approved for listing'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
              {step === 'documents' && (
                <div className="space-y-6">
                  {/* Property Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Property Information</h3>
                    
                    <div>
                      <Label htmlFor="propertyAddress">Property Address</Label>
                      <Input
                        id="propertyAddress"
                        placeholder="123 Main Street, City, Province"
                        value={propertyDetails.propertyAddress}
                        onChange={(e) => setPropertyDetails(prev => ({ ...prev, propertyAddress: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="propertyValue">Estimated Property Value</Label>
                        <Input
                          id="propertyValue"
                          placeholder="R1,500,000"
                          value={propertyDetails.propertyValue}
                          onChange={(e) => setPropertyDetails(prev => ({ ...prev, propertyValue: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="propertyDescription">Property Type</Label>
                        <Input
                          id="propertyDescription"
                          placeholder="3-bedroom house, apartment, etc."
                          value={propertyDetails.propertyDescription}
                          onChange={(e) => setPropertyDetails(prev => ({ ...prev, propertyDescription: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="additionalNotes"
                        placeholder="Any additional information about the property..."
                        value={propertyDetails.additionalNotes}
                        onChange={(e) => setPropertyDetails(prev => ({ ...prev, additionalNotes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Required Documents</h3>
                    
                    <div className="grid gap-4">
                      {documentTypes.map((docType) => (
                        <div key={docType.key}>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="font-medium">
                              {docType.label}
                              {docType.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                          </div>
                          
                          <div
                            onClick={() => triggerFileUpload(docType.key)}
                            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                              ${uploadedDocuments[docType.key] 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50'
                              }`}
                          >
                            {uploadedDocuments[docType.key] ? (
                              <>
                                <Check className="w-6 h-6 text-green-600 mx-auto mb-1" />
                                <p className="text-sm font-medium text-green-700">
                                  {uploadedDocuments[docType.key]!.name}
                                </p>
                                <p className="text-xs text-green-600 mt-1">Click to replace</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                                <p className="text-sm font-medium text-slate-600">
                                  Upload {docType.label}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                              </>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-500 mt-1">
                            {docType.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      Document Verification Process:
                    </h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• All documents will be verified with municipal records</li>
                      <li>• Property ownership will be confirmed through deeds office</li>
                      <li>• Verification typically takes 24-48 hours</li>
                      <li>• You'll be notified once verification is complete</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!requiredDocsUploaded || isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Building className="w-4 h-4 mr-2" />
                        Submit Property Documentation
                      </>
                    )}
                  </Button>
                </div>
              )}

              {step === 'processing' && (
                <div className="text-center space-y-4 py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Building className="w-8 h-8 text-orange-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Verifying Property Documents</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Checking property ownership and validating documents...
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                          className="w-2 h-2 bg-orange-600 rounded-full"
                        />
                      ))}
                    </div>
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
                    <h3 className="font-semibold text-slate-800">Property Verification Complete!</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Your property is now verified and ready for rent-to-buy listings
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