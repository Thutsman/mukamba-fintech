'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Shield, Upload, Check, FileText, Camera, Loader2, Clock, AlertCircle, 
  Download, RefreshCw, Calendar, Award, Eye, Edit, CheckCircle, XCircle,
  User, Smile
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  type IdentityVerificationState, 
  type VerificationDocument, 
  type VerificationCertificate,
  type User as UserType 
} from '@/types/auth';
import { createKYCVerification, uploadKYCDocument } from '@/lib/kyc-services';
import { useAuthStore } from '@/lib/store';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const [step, setStep] = React.useState<'personal-info' | 'document-type' | 'upload' | 'selfie' | 'processing' | 'success'>('personal-info');
  const [documentType, setDocumentType] = React.useState<string>('');
  const [uploadedFiles, setUploadedFiles] = React.useState<{front?: File, back?: File}>({});
  const [selfiePhoto, setSelfiePhoto] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showUpdateForm, setShowUpdateForm] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const selfieInputRef = React.useRef<HTMLInputElement>(null);
  const [currentUpload, setCurrentUpload] = React.useState<'front' | 'back'>('front');
  
  // Webcam states
  const [showWebcam, setShowWebcam] = React.useState(false);
  const [webcamStream, setWebcamStream] = React.useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  // Personal information state
  const [personalInfo, setPersonalInfo] = React.useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    idNumber: ''
  });

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

  const handlePersonalInfoSubmit = () => {
    // Validate personal information
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.dateOfBirth || !personalInfo.idNumber) {
      alert('Please fill in all personal information fields');
      return;
    }
    setStep('document-type');
  };

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

  const handleSelfieSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelfiePhoto(file);
    }
  };

  const triggerSelfieUpload = () => {
    selfieInputRef.current?.click();
  };

  // Webcam functions
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      setWebcamStream(stream);
      setShowWebcam(true);
      
      // Wait for the video element to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Unable to access webcam. Please check your camera permissions.');
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setShowWebcam(false);
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
            setSelfiePhoto(file);
            stopWebcam();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleSubmitDocuments = async () => {
    // Move to selfie step after document upload
    setStep('selfie');
  };

  const handleSubmitSelfie = async () => {
    setIsLoading(true);
    setStep('processing');
    try {
      // Create a KYC verification record (buyer identity)
      const authUserId = storeUser?.id || user?.id;
      if (!authUserId) throw new Error('User not authenticated');
      const { data: verification, error } = await createKYCVerification(authUserId, {
        verification_type: 'identity',
        id_number: personalInfo.idNumber,
        date_of_birth: personalInfo.dateOfBirth,
        first_name: personalInfo.firstName,
        last_name: personalInfo.lastName,
        credit_consent: false
      });
      if (error || !verification) throw new Error(error || 'Failed to create verification');

      // Upload ID documents to Storage and record metadata
      let uploadErrors: string[] = [];
      
      // Map document type selection to database values
      const getDocumentType = (selectedType: string): 'id_document' => {
        switch (selectedType) {
          case 'national-id': return 'id_document';
          case 'passport': return 'id_document';
          case 'drivers-license': return 'id_document';
          default: return 'id_document';
        }
      };
      
      const dbDocumentType = getDocumentType(documentType);
      
      if (uploadedFiles.front) {
        const frontResult = await uploadKYCDocument({
          kyc_verification_id: verification.id,
          document_type: dbDocumentType,
          document_side: 'front',
          file: uploadedFiles.front
        });
        if (frontResult.error) {
          uploadErrors.push(`Front document: ${frontResult.error}`);
        }
      }
      
      if (uploadedFiles.back) {
        const backResult = await uploadKYCDocument({
          kyc_verification_id: verification.id,
          document_type: dbDocumentType,
          document_side: 'back',
          file: uploadedFiles.back
        });
        if (backResult.error) {
          uploadErrors.push(`Back document: ${backResult.error}`);
        }
      }

      // Upload selfie photo
      if (selfiePhoto) {
        const selfieResult = await uploadKYCDocument({
          kyc_verification_id: verification.id,
          document_type: 'selfie_photo',
          document_side: 'front',
          file: selfiePhoto
        });
        if (selfieResult.error) {
          uploadErrors.push(`Selfie: ${selfieResult.error}`);
        }
      }

      // Only update user's identity verification status if ALL uploads succeeded
      if (uploadErrors.length === 0) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ is_identity_verified: true })
          .eq('id', authUserId);

        if (updateError) {
          console.error('Error updating user identity verification:', updateError);
          throw new Error(`Failed to update verification status: ${updateError.message}`);
        }
      } else {
        // If any uploads failed, don't mark as verified
        console.error('Document uploads failed:', uploadErrors);
        throw new Error(`Document upload failed: ${uploadErrors.join(', ')}`);
      }

      // Move to success, but we do NOT auto-approve; admin will review
      setStep('success');
      setTimeout(() => {
        onComplete();
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Document verification failed:', error);
      // Show error to user
      alert(`Identity verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStep('selfie'); // Go back to selfie step so user can try again
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      // Clean up webcam resources
      stopWebcam();
      
      setStep('personal-info');
      setDocumentType('');
      setUploadedFiles({});
      setSelfiePhoto(null);
      setPersonalInfo({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        idNumber: ''
      });
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
    setStep('personal-info');
    setShowUpdateForm(false);
  };

  const selectedDoc = documentTypes.find(doc => doc.value === documentType);
  const canSubmit = uploadedFiles.front && (selectedDoc?.sides === 1 || uploadedFiles.back);

  // Handle video stream when webcam is active
  React.useEffect(() => {
    if (showWebcam && webcamStream && videoRef.current) {
      videoRef.current.srcObject = webcamStream;
      videoRef.current.play().catch(console.error);
    }
  }, [showWebcam, webcamStream]);

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
                  {step === 'personal-info' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="font-medium text-slate-800 mb-2">
                          Personal Information
                        </h3>
                        <p className="text-sm text-slate-600">
                          Please provide your personal details for identity verification
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={personalInfo.firstName}
                              onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                              placeholder="Enter your first name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={personalInfo.lastName}
                              onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                              placeholder="Enter your last name"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={personalInfo.dateOfBirth}
                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="idNumber">ID Number</Label>
                          <Input
                            id="idNumber"
                            value={personalInfo.idNumber}
                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, idNumber: e.target.value }))}
                            placeholder="Enter your ID number"
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">
                          Privacy Notice:
                        </h4>
                        <p className="text-xs text-blue-700">
                          Your personal information is encrypted and stored securely. We only use this information for identity verification purposes.
                        </p>
                      </div>

                      <Button
                        onClick={handlePersonalInfoSubmit}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!personalInfo.firstName || !personalInfo.lastName || !personalInfo.dateOfBirth || !personalInfo.idNumber}
                      >
                        Continue to Document Upload
                      </Button>
                    </div>
                  )}

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
                          Continue to Selfie
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 'selfie' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Smile className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="font-medium text-slate-800 mb-2">
                          Take a Selfie
                        </h3>
                        <p className="text-sm text-slate-600">
                          We need to verify that you are the person in the ID document
                        </p>
                      </div>

                      {!showWebcam ? (
                        <div className="space-y-4">
                          <div>
                            <Label className="block mb-2">Selfie Photo</Label>
                            <div
                              onClick={triggerSelfieUpload}
                              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                                ${selfiePhoto 
                                  ? 'border-green-300 bg-green-50' 
                                  : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                                }`}
                            >
                              {selfiePhoto ? (
                                <>
                                  <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                  <p className="text-sm font-medium text-green-700">
                                    {selfiePhoto.name}
                                  </p>
                                  <p className="text-xs text-green-600 mt-1">Click to replace</p>
                                </>
                              ) : (
                                <>
                                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                  <p className="text-sm font-medium text-slate-600">
                                    Click to upload a photo
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB</p>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-slate-500 mb-3">or</p>
                            <Button
                              onClick={startWebcam}
                              variant="outline"
                              className="w-full"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Use Webcam
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative bg-slate-100 rounded-lg border-2 border-purple-200 overflow-hidden">
                            {webcamStream ? (
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-64 object-cover"
                                style={{ transform: 'scaleX(-1)' }} // Mirror the video
                                onLoadedMetadata={() => {
                                  if (videoRef.current) {
                                    videoRef.current.play().catch(console.error);
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-64 flex items-center justify-center bg-slate-200">
                                <div className="text-center">
                                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                  <p className="text-sm text-slate-600">Starting camera...</p>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                Look at the camera
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3">
                            <Button
                              onClick={captureSelfie}
                              className="flex-1 bg-purple-600 hover:bg-purple-700"
                              disabled={!webcamStream}
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Capture Photo
                            </Button>
                            <Button
                              onClick={stopWebcam}
                              variant="outline"
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                          
                          {/* Debug info */}
                          {process.env.NODE_ENV === 'development' && (
                            <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded">
                              Debug: Stream active: {webcamStream ? 'Yes' : 'No'}, 
                              Video element: {videoRef.current ? 'Yes' : 'No'}
                            </div>
                          )}
                        </div>
                      )}

                      <canvas ref={canvasRef} className="hidden" />

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-purple-800 mb-2">
                          Selfie Requirements:
                        </h4>
                        <ul className="text-xs text-purple-700 space-y-1">
                          <li>• Look directly at the camera</li>
                          <li>• Ensure good lighting on your face</li>
                          <li>• Remove glasses and hats if possible</li>
                          <li>• Make sure your face is clearly visible</li>
                          <li>• No filters or photo editing</li>
                        </ul>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setStep('upload')}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleSubmitSelfie}
                          disabled={!selfiePhoto}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          Complete Verification
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
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelfieSelect}
                className="hidden"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 