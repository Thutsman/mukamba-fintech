'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Upload, Check, FileText, Camera, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IdentityVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const IdentityVerificationModal: React.FC<IdentityVerificationModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [step, setStep] = React.useState<'document-type' | 'upload' | 'processing' | 'success'>('document-type');
  const [documentType, setDocumentType] = React.useState<string>('');
  const [uploadedFiles, setUploadedFiles] = React.useState<{front?: File, back?: File}>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentUpload, setCurrentUpload] = React.useState<'front' | 'back'>('front');

  const documentTypes = [
    { value: 'national-id', label: 'National ID Card', sides: 2 },
    { value: 'passport', label: 'Passport', sides: 1 },
    { value: 'drivers-license', label: "Driver's License", sides: 2 },
  ];

  const handleDocumentTypeSelect = (type: string) => {
    setDocumentType(type);
    setStep('upload');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [currentUpload]: file
      }));
    }
  };

  const triggerFileUpload = (side: 'front' | 'back') => {
    setCurrentUpload(side);
    fileInputRef.current?.click();
  };

  const handleSubmitDocuments = async () => {
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
      console.error('Document verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStep('document-type');
      setDocumentType('');
      setUploadedFiles({});
      onClose();
    }
  };

  const selectedDoc = documentTypes.find(doc => doc.value === documentType);
  const canSubmit = uploadedFiles.front && (selectedDoc?.sides === 1 || uploadedFiles.back);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg"
        >
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="w-6 h-6" />
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-blue-600" />
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
                {step === 'document-type' && 'Choose Document Type'}
                {step === 'upload' && 'Upload Your Documents'}
                {step === 'processing' && 'Verifying Your Identity'}
                {step === 'success' && 'Identity Verified!'}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                {step === 'document-type' && 'Select a government-issued ID to verify your identity'}
                {step === 'upload' && 'Take clear photos of your document'}
                {step === 'processing' && 'Please wait while we verify your documents'}
                {step === 'success' && 'Your identity has been successfully verified'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 'document-type' && (
                <div className="space-y-4">
                  <Label>Select Document Type</Label>
                  <div className="grid gap-3">
                    {documentTypes.map((doc) => (
                      <Button
                        key={doc.value}
                        variant="outline"
                        onClick={() => handleDocumentTypeSelect(doc.value)}
                        className="h-auto p-4 justify-start text-left hover:border-blue-300"
                      >
                        <FileText className="w-5 h-5 mr-3 text-blue-600" />
                        <div>
                          <div className="font-medium">{doc.label}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {doc.sides === 1 ? 'Single page upload' : 'Front and back required'}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {step === 'upload' && selectedDoc && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-medium text-slate-800 mb-2">
                      Upload {selectedDoc.label}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Ensure all text is clearly visible and the document is not expired
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {/* Front/Main Document */}
                    <div>
                      <Label className="block mb-2">
                        {selectedDoc.sides === 1 ? 'Document Photo' : 'Front Side'}
                      </Label>
                      <div
                        onClick={() => triggerFileUpload('front')}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                          ${uploadedFiles.front 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                      >
                        {uploadedFiles.front ? (
                          <>
                            <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-green-700">
                              {uploadedFiles.front.name}
                            </p>
                            <p className="text-xs text-green-600 mt-1">Click to replace</p>
                          </>
                        ) : (
                          <>
                            <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-600">
                              Click to upload or take photo
                            </p>
                            <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 10MB</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Back Side (if required) */}
                    {selectedDoc.sides === 2 && (
                      <div>
                        <Label className="block mb-2">Back Side</Label>
                        <div
                          onClick={() => triggerFileUpload('back')}
                          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                            ${uploadedFiles.back 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                        >
                          {uploadedFiles.back ? (
                            <>
                              <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <p className="text-sm font-medium text-green-700">
                                {uploadedFiles.back.name}
                              </p>
                              <p className="text-xs text-green-600 mt-1">Click to replace</p>
                            </>
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm font-medium text-slate-600">
                                Click to upload or take photo
                              </p>
                              <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 10MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">
                      Document Requirements:
                    </h4>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>• Document must be current and not expired</li>
                      <li>• All text and photos must be clearly visible</li>
                      <li>• No reflections or shadows on the document</li>
                      <li>• Document should fill most of the image frame</li>
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep('document-type')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmitDocuments}
                      disabled={!canSubmit}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Verify Identity
                    </Button>
                  </div>
                </div>
              )}

              {step === 'processing' && (
                <div className="text-center space-y-4 py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Shield className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Processing Documents</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      This usually takes 30-60 seconds
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
                          className="w-2 h-2 bg-blue-600 rounded-full"
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
                    <h3 className="font-semibold text-slate-800">Identity Verified!</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      You now have access to financing options and exclusive properties
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
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