'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Shield, Upload, Check, FileText, Camera, Loader2, Clock, AlertCircle, 
  Download, RefreshCw, Calendar, Award, Eye, Edit, CheckCircle, XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  type IdentityVerificationState, 
  type VerificationDocument, 
  type VerificationCertificate,
  type User as UserType 
} from '@/types/auth';
import { createKYCVerification, uploadKYCDocument } from '@/lib/kyc-services';
import { useAuthStore } from '@/lib/store';

interface IdentityVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  user?: UserType;
  verificationState?: IdentityVerificationState;
  documents?: VerificationDocument[];
  certificates?: VerificationCertificate[];
}

export const IdentityVerificationModal: React.FC<IdentityVerificationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  user,
  verificationState = 'unverified',
  documents = [],
  certificates = []
}) => {
  const { user: storeUser } = useAuthStore();
  const [step, setStep] = React.useState<'document-type' | 'upload' | 'processing' | 'success'>('document-type');
  const [documentType, setDocumentType] = React.useState<string>('');
  const [uploadedFiles, setUploadedFiles] = React.useState<{front?: File, back?: File}>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [showUpdateForm, setShowUpdateForm] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentUpload, setCurrentUpload] = React.useState<'front' | 'back'>('front');

  const documentTypes = [
    { value: 'national-id', label: 'National ID Card', sides: 2 },
    { value: 'passport', label: 'Passport', sides: 1 },
    { value: 'drivers-license', label: "Driver's License", sides: 2 },
  ];

  // Get verification status info
  const getVerificationInfo = () => {
    switch (verificationState) {
      case 'verified':
        return {
          title: 'Identity Verified',
          subtitle: 'Your identity has been successfully verified',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          status: 'Verified'
        };
      case 'pending':
        return {
          title: 'Under Review',
          subtitle: 'Your documents are being reviewed',
          icon: <Clock className="w-6 h-6 text-yellow-600" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          status: 'Pending'
        };
      case 'expired':
        return {
          title: 'Verification Expired',
          subtitle: 'Your verification has expired and needs renewal',
          icon: <AlertCircle className="w-6 h-6 text-red-600" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          status: 'Expired'
        };
      case 'rejected':
        return {
          title: 'Verification Rejected',
          subtitle: 'Your documents were not approved',
          icon: <XCircle className="w-6 h-6 text-red-600" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          status: 'Rejected'
        };
      default:
        return {
          title: 'Identity Verification',
          subtitle: 'Verify your identity to access premium features',
          icon: <Shield className="w-6 h-6 text-blue-600" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          status: 'Unverified'
        };
    }
  };

  const verificationInfo = getVerificationInfo();

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
      // Create a KYC verification record (buyer identity)
      const authUserId = storeUser?.id || user?.id;
      if (!authUserId) throw new Error('User not authenticated');
      const { data: verification, error } = await createKYCVerification(authUserId, {
        verification_type: 'buyer',
        id_number: documentType ? 'submitted' : undefined,
        credit_consent: false
      });
      if (error || !verification) throw new Error(error || 'Failed to create verification');

      // Upload files to Storage and record metadata
      if (uploadedFiles.front) {
        await uploadKYCDocument({
          kyc_verification_id: verification.id,
          document_type: 'id_document',
          file: uploadedFiles.front
        });
      }
      if (uploadedFiles.back) {
        await uploadKYCDocument({
          kyc_verification_id: verification.id,
          document_type: 'id_document',
          file: uploadedFiles.back
        });
      }

      // Move to success, but we do NOT auto-approve; admin will review
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
    setStep('document-type');
    setShowUpdateForm(false);
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
          className="w-full max-w-lg max-h-[90vh] overflow-hidden"
        >
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="w-6 h-6" />
                <div className={`w-12 h-12 ${verificationInfo.bgColor} rounded-full flex items-center justify-center mx-auto`}>
                  {verificationInfo.icon}
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
                {verificationInfo.title}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                {verificationInfo.subtitle}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 max-h-[65vh] overflow-y-auto pr-2">
              {/* Verified State Content */}
              {verificationState === 'verified' && !showUpdateForm && (
                <div className="space-y-6">
                  {/* Verification Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-green-800">Verification Complete</h3>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex justify-between">
                        <span>Verified on:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expires on:</span>
                        <span>{new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Certificates */}
                  {certificates.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-800 mb-3">Verification Certificates</h4>
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
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-verify
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
                      Your documents are being reviewed by our verification team. This usually takes 1-2 business days.
                    </p>
                    <div className="space-y-2 text-sm text-yellow-700">
                      <div className="flex justify-between">
                        <span>Submitted on:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated completion:</span>
                        <span>{new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Review Progress</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>

                  <Button
                    onClick={handleClose}
                    className="w-full bg-blue-600 hover:bg-blue-700"
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
                      <h3 className="font-semibold text-red-800">Verification Expired</h3>
                    </div>
                    <p className="text-sm text-red-700 mb-3">
                      Your identity verification has expired. Please re-verify to continue accessing premium features.
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
                    Re-verify Identity
                  </Button>
                </div>
              )}

              {/* Rejected State Content */}
              {verificationState === 'rejected' && (
                <div className="space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                      <h3 className="font-semibold text-red-800">Verification Rejected</h3>
                    </div>
                    <p className="text-sm text-red-700 mb-3">
                      Your documents were not approved. Please check the requirements and try again.
                    </p>
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium text-red-800 mb-2">Rejection Reason:</h4>
                      <p className="text-sm text-red-700">
                        Document image is unclear or incomplete. Please ensure all text is clearly visible.
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

              {/* Original Upload Flow for Unverified/Update */}
              {(verificationState === 'unverified' || showUpdateForm) && (
                <>
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
                          {showUpdateForm ? 'Update Identity' : 'Verify Identity'}
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
                </>
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