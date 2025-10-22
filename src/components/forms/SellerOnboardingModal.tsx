'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Shield, 
  CreditCard, 
  Phone, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  X,
  Building,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Camera,
  Upload,
  Loader2,
  Star,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { BuyerPhoneVerificationModal } from './BuyerPhoneVerificationModal';
import { IdentityVerificationModal } from './IdentityVerificationModal';

// Local file metadata type for uploads
type UploadedFileRef = {
  id: string;
  name: string;
  url: string;
  type: 'photo' | 'document';
  size: number;
  uploaded_at: string;
};

interface SellerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (sellerData: any) => void;
}

type OnboardingStep = 'welcome' | 'phone' | 'identity' | 'property' | 'documents' | 'complete';

export const SellerOnboardingModal: React.FC<SellerOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = React.useState<OnboardingStep>('welcome');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isResuming, setIsResuming] = React.useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = React.useState<boolean | null>(null);
  const [isIdentityVerified, setIsIdentityVerified] = React.useState<boolean | null>(null);
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = React.useState(false);
  const [showIdentityVerificationModal, setShowIdentityVerificationModal] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState<{[key: string]: string}>({});
  const [formData, setFormData] = React.useState({
    phone: '',
    propertyAddress: '',
    propertyType: '',
    estimatedValue: '',
    reasonForSelling: '',
    acceptsInstallments: false,
    preferredDepositAmount: '',
    installmentDurationMonths: '',
    minimumDepositPercentage: '',
    documents: [] as File[],
    uploadedPropertyPhotos: [] as any[],
    uploadedPropertyDocuments: [] as any[],
    onboardingRecordId: null as string | null
  });

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: <Home className="w-4 h-4" /> },
    { id: 'phone', title: 'Phone Verification', icon: <Phone className="w-4 h-4" /> },
    { id: 'identity', title: 'Identity Verification', icon: <Shield className="w-4 h-4" /> },
    { id: 'property', title: 'Property Details', icon: <Building className="w-4 h-4" /> },
    { id: 'documents', title: 'Upload Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'complete', title: 'Complete', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Check phone verification status when modal opens
  React.useEffect(() => {
    const checkPhoneVerificationStatus = async () => {
      if (!isOpen || !user?.id || !supabase) return;
      
      try {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('is_phone_verified, is_identity_verified, phone')
          .eq('id', user.id)
          .single();
        
        if (userProfile) {
          setIsPhoneVerified(userProfile.is_phone_verified || false);
          setIsIdentityVerified(userProfile.is_identity_verified || false);
          if (userProfile.phone) {
            setFormData(prev => ({ ...prev, phone: userProfile.phone }));
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        setIsPhoneVerified(false);
        setIsIdentityVerified(false);
      }
    };
    
    checkPhoneVerificationStatus();
  }, [isOpen, user?.id]);

  // Load saved progress when modal opens (only if not completed)
  React.useEffect(() => {
    const loadProgress = async () => {
      if (!isOpen || !user?.id || !supabase) return;
      
      try {
        const { data: savedProgress } = await supabase
          .from('seller_onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        // Only load progress if onboarding is not completed
        if (savedProgress && savedProgress.current_step !== 'complete') {
          setIsResuming(true);
          setCurrentStep(savedProgress.current_step as OnboardingStep);
          setFormData(savedProgress.form_data || formData);
          
          // Show resume message briefly
          setTimeout(() => setIsResuming(false), 3000);
        } else {
          // If completed or no progress, start fresh
          setCurrentStep('welcome');
          setFormData({
            phone: '',
            propertyAddress: '',
            propertyType: '',
            estimatedValue: '',
            reasonForSelling: '',
            acceptsInstallments: false,
            preferredDepositAmount: '',
            installmentDurationMonths: '',
            minimumDepositPercentage: '',
            documents: [] as File[],
            uploadedPropertyPhotos: [] as any[],
            uploadedPropertyDocuments: [] as any[],
            onboardingRecordId: null
          });
        }
      } catch (error) {
        console.log('No saved progress found, starting fresh');
        // Start fresh if no progress found
        setCurrentStep('welcome');
        setFormData({
          phone: '',
          propertyAddress: '',
          propertyType: '',
          estimatedValue: '',
          reasonForSelling: '',
          acceptsInstallments: false,
          preferredDepositAmount: '',
          installmentDurationMonths: '',
          minimumDepositPercentage: '',
          documents: [] as File[],
          uploadedPropertyPhotos: [] as any[],
          uploadedPropertyDocuments: [] as any[],
          onboardingRecordId: null
        });
      }
    };
    
    loadProgress();
  }, [isOpen, user?.id]);

  // Save progress to database
  const saveProgress = async () => {
    if (!user?.id || isSaving || !supabase) return;
    
    setIsSaving(true);
    try {
      const completedSteps = steps.slice(0, currentStepIndex + 1).map(s => s.id);
      
      if (formData.onboardingRecordId) {
        // Update existing record
        await supabase
          .from('seller_onboarding_progress')
          .update({
            current_step: currentStep,
            form_data: formData,
            completed_steps: completedSteps,
            updated_at: new Date().toISOString()
          })
          .eq('id', formData.onboardingRecordId);
      } else {
        // Create new record for initial steps
        const { data: result, error } = await supabase
          .from('seller_onboarding_progress')
          .insert({
            user_id: user.id,
            current_step: currentStep,
            form_data: formData,
            completed_steps: completedSteps,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
        
        if (error) {
          console.error('Error creating progress record:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            fullError: error
          });
          // Don't throw error here, just log it and continue
        } else if (result && result.length > 0) {
          setFormData(prev => ({ ...prev, onboardingRecordId: result[0].id }));
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save verification data to appropriate tables
  const saveVerificationData = async (step: OnboardingStep, data: any) => {
    if (!user?.id || !supabase) return;
    
    try {
      switch (step) {
        case 'phone':
          await supabase.from('phone_verification_attempts').insert({
            user_id: user.id,
            phone_number: data.phone,
            verification_code: Math.floor(100000 + Math.random() * 900000).toString(), // Generate 6-digit code
            is_verified: false,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now
          });
          break;
          
        case 'identity':
          await supabase.from('identity_verifications').insert({
            user_id: user.id,
            document_type: 'government_id',
            verification_status: 'pending',
            created_at: new Date().toISOString()
          });
          break;
          
        case 'property':
          // Save property details to seller_onboarding_progress table
          console.log('Saving property data:', {
            user_id: user.id,
            property_address: data.propertyAddress,
            property_type: data.propertyType,
            estimated_property_value: data.estimatedValue,
            reason_for_selling: data.reasonForSelling,
            accepts_installments: data.acceptsInstallments,
            preferred_deposit_amount: data.preferredDepositAmount,
            installment_duration_months: data.installmentDurationMonths,
            minimum_deposit_percentage: data.minimumDepositPercentage
          });
          
          const { data: result, error } = await supabase
            .from('seller_onboarding_progress')
            .insert({
              user_id: user.id,
              property_address: data.propertyAddress,
              property_type: data.propertyType,
              estimated_property_value: data.estimatedValue ? parseFloat(data.estimatedValue) : null,
              reason_for_selling: data.reasonForSelling,
              accepts_installments: data.acceptsInstallments,
              preferred_deposit_amount: data.preferredDepositAmount ? parseFloat(data.preferredDepositAmount) : null,
              installment_duration_months: data.installmentDurationMonths ? parseInt(data.installmentDurationMonths) : null,
              minimum_deposit_percentage: data.minimumDepositPercentage ? parseFloat(data.minimumDepositPercentage) : null,
              current_step: 'property',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();
          
          if (error) {
            console.error('Error saving property data:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
              fullError: error
            });
            // Don't throw error, just log it and continue
          } else {
            console.log('Property data saved successfully:', result);
            // Store the new record ID for subsequent updates
            if (result && result.length > 0) {
              setFormData(prev => ({ ...prev, onboardingRecordId: result[0].id }));
            }
          }
          break;
          
        case 'documents':
          // Save uploaded documents to seller_onboarding_progress table
          console.log('Saving documents data:', {
            user_id: user.id,
            onboarding_record_id: data.onboardingRecordId,
            uploaded_property_photos: data.uploadedPropertyPhotos,
            uploaded_property_documents: data.uploadedPropertyDocuments
          });
          
          if (!data.onboardingRecordId) {
            console.error('No onboarding record ID found for documents');
            // Try to find the most recent record for this user
            const { data: recentRecord, error: findError } = await supabase
              .from('seller_onboarding_progress')
              .select('id')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (findError || !recentRecord) {
              console.error('Could not find any onboarding record for user:', findError);
              return;
            }
            
            // Update the form data with the found record ID
            setFormData(prev => ({ ...prev, onboardingRecordId: recentRecord.id }));
            data.onboardingRecordId = recentRecord.id;
          }
          
          const { data: docResult, error: docError } = await supabase
            .from('seller_onboarding_progress')
            .update({
              uploaded_property_photos: data.uploadedPropertyPhotos || [],
              uploaded_property_documents: data.uploadedPropertyDocuments || [],
              current_step: 'documents',
              updated_at: new Date().toISOString()
            })
            .eq('id', data.onboardingRecordId);
          
          if (docError) {
            console.error('Error saving documents data:', docError);
          } else {
            console.log('Documents data saved successfully:', docResult);
          }
          break;
      }
    } catch (error) {
      console.error('Error saving verification data:', error);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (currentStep === 'property') {
      // Required fields for property step
      if (!formData.propertyAddress.trim()) {
        errors.propertyAddress = 'Property address is required';
      }
      if (!formData.propertyType) {
        errors.propertyType = 'Property type is required';
      }
      if (!formData.estimatedValue.trim()) {
        errors.estimatedValue = 'Estimated property value is required';
      }
      
      // Validate installment fields if user accepts installments
      if (formData.acceptsInstallments) {
        if (!formData.preferredDepositAmount.trim()) {
          errors.preferredDepositAmount = 'Preferred deposit amount is required when accepting installments';
        }
        if (!formData.installmentDurationMonths) {
          errors.installmentDurationMonths = 'Installment duration is required when accepting installments';
        }
        if (!formData.minimumDepositPercentage.trim()) {
          errors.minimumDepositPercentage = 'Minimum deposit percentage is required when accepting installments';
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }
    
    // Handle phone verification step specially
    if (currentStep === 'phone') {
      if (isPhoneVerified) {
        // Skip phone verification if already verified
        const currentIndex = steps.findIndex(step => step.id === currentStep);
        if (currentIndex < steps.length - 1) {
          setCurrentStep(steps[currentIndex + 1].id as OnboardingStep);
        }
        return;
      } else {
        // Show phone verification modal
        setShowPhoneVerificationModal(true);
        return;
      }
    }
    
    // Handle identity verification step specially
    if (currentStep === 'identity') {
      if (isIdentityVerified) {
        // Skip identity verification if already verified
        const currentIndex = steps.findIndex(step => step.id === currentStep);
        if (currentIndex < steps.length - 1) {
          setCurrentStep(steps[currentIndex + 1].id as OnboardingStep);
        }
        return;
      } else {
        // Show identity verification modal
        setShowIdentityVerificationModal(true);
        return;
      }
    }
    
    // Save current step data
    console.log('Saving data for step:', currentStep, 'with formData:', formData);
    await saveVerificationData(currentStep, formData);
    await saveProgress();
    
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as OnboardingStep);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as OnboardingStep);
    }
  };

  const handleComplete = async () => {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save final verification data
      await saveVerificationData(currentStep, formData);
      
      // Mark onboarding as complete
      if (formData.onboardingRecordId) {
        await supabase
          .from('seller_onboarding_progress')
          .update({
            current_step: 'complete',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', formData.onboardingRecordId);
      }
      
      // Update user profile to indicate seller intent
      await supabase
        .from('user_profiles')
        .update({
          roles: ['user', 'seller'], // Add seller role
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);
      
      // Reset form data and close modal
      resetForm();
      onComplete(formData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      phone: '',
      propertyAddress: '',
      propertyType: '',
      estimatedValue: '',
      reasonForSelling: '',
      acceptsInstallments: false,
      preferredDepositAmount: '',
      installmentDurationMonths: '',
      minimumDepositPercentage: '',
      documents: [] as File[],
      uploadedPropertyPhotos: [] as any[],
      uploadedPropertyDocuments: [] as any[],
      onboardingRecordId: null
    });
    setFormErrors({});
    setCurrentStep('welcome');
    setIsPhoneVerified(null);
    setIsIdentityVerified(null);
    setShowPhoneVerificationModal(false);
    setShowIdentityVerificationModal(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const handlePropertyPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!user?.id || !supabase) return;

    try {
      const uploadedPhotos: UploadedFileRef[] = [];
      
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not a valid image file`);
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `user-${user.id}/photos/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-documents')
          .upload(filePath, file);

        if (error) {
          console.error('Storage upload error:', error);
          throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('property-documents')
          .getPublicUrl(filePath);

        uploadedPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2)}`,
          name: file.name,
          url: urlData.publicUrl,
          type: 'photo',
          size: file.size,
          uploaded_at: new Date().toISOString()
        });
      }
      
      setFormData(prev => ({
        ...prev,
        uploadedPropertyPhotos: [...(prev.uploadedPropertyPhotos || []), ...uploadedPhotos]
      }));

      // Show success message
      toast.success(`Successfully uploaded ${uploadedPhotos.length} photo(s)`);

    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePropertyDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!user?.id || !supabase) return;

    try {
      const uploadedDocuments: UploadedFileRef[] = [];
      
      for (const file of files) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`${file.name} is not a valid document file. Only PDF and images are allowed.`);
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 10MB`);
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `user-${user.id}/documents/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-documents')
          .upload(filePath, file);

        if (error) {
          console.error('Storage upload error:', error);
          throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('property-documents')
          .getPublicUrl(filePath);

        uploadedDocuments.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2)}`,
          name: file.name,
          url: urlData.publicUrl,
          type: 'document',
          size: file.size,
          uploaded_at: new Date().toISOString()
        });
      }
      
      setFormData(prev => ({
        ...prev,
        uploadedPropertyDocuments: [...(prev.uploadedPropertyDocuments || []), ...uploadedDocuments]
      }));

      // Show success message
      toast.success(`Successfully uploaded ${uploadedDocuments.length} document(s)`);

    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePhoneVerificationComplete = async (phoneNumber: string) => {
    // Update form data with verified phone number
    setFormData(prev => ({ ...prev, phone: phoneNumber }));
    
    // Update phone verification status
    setIsPhoneVerified(true);
    
    // Close phone verification modal
    setShowPhoneVerificationModal(false);
    
    // Move to next step
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as OnboardingStep);
    }
  };

  const handleIdentityVerificationComplete = async () => {
    // Update identity verification status
    setIsIdentityVerified(true);
    
    // Close identity verification modal
    setShowIdentityVerificationModal(false);
    
    // Move to next step
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as OnboardingStep);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div>
              <p className="text-slate-600 mb-6">
                Let's get your property listed and reach thousands of qualified buyers. 
                This process takes about 5-10 minutes and unlocks premium selling features.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-sm mb-1">Pre-qualified Buyers</h4>
                <p className="text-xs text-slate-600">Access to verified buyers ready to purchase</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-sm mb-1">Competitive Offers</h4>
                <p className="text-xs text-slate-600">Get multiple offers and choose the best one</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-sm mb-1">Fast Closing</h4>
                <p className="text-xs text-slate-600">Close deals faster with our streamlined process</p>
              </div>
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Phone Verification</h3>
              {isPhoneVerified ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-sm text-green-800">Phone Already Verified</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Your phone number {formData.phone} has already been verified. You can proceed to the next step.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600">We'll send you a verification code to confirm your phone number</p>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-blue-800">Why we need this</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Phone verification enables direct communication with Mukamba Gateway team and ensures secure transactions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'identity':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Identity Verification</h3>
              {isIdentityVerified ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-sm text-green-800">Identity Already Verified</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Your identity has already been verified. You can proceed to the next step.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600">Upload a government-issued ID to verify your identity</p>
                  
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h4 className="font-semibold text-slate-800 mb-2">Upload ID Document</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Accepted: Driver's License, Passport, National ID
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => setShowIdentityVerificationModal(true)}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo or Upload
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-green-800">Secure & Private</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Your documents are encrypted and only used for verification purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'property':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Property Details</h3>
              <p className="text-slate-600">Tell us about the property you want to sell</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="propertyAddress">Property Address</Label>
                <Input
                  id="propertyAddress"
                  placeholder="123 Main Street, City, State"
                  value={formData.propertyAddress}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, propertyAddress: e.target.value }));
                    // Clear error when user starts typing
                    if (formErrors.propertyAddress) {
                      setFormErrors(prev => ({ ...prev, propertyAddress: '' }));
                    }
                  }}
                  className={formErrors.propertyAddress ? 'border-red-500 focus:border-red-500' : ''}
                />
                {formErrors.propertyAddress && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.propertyAddress}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <select
                  id="propertyType"
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.propertyType ? 'border-red-500 focus:border-red-500' : 'border-slate-300'}`}
                  value={formData.propertyType}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, propertyType: e.target.value }));
                    // Clear error when user makes selection
                    if (formErrors.propertyType) {
                      setFormErrors(prev => ({ ...prev, propertyType: '' }));
                    }
                  }}
                >
                  <option value="">Select property type</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Land</option>
                </select>
                {formErrors.propertyType && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.propertyType}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="estimatedValue">Estimated Property Value</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  placeholder="500,000"
                  value={formData.estimatedValue}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, estimatedValue: e.target.value }));
                    // Clear error when user starts typing
                    if (formErrors.estimatedValue) {
                      setFormErrors(prev => ({ ...prev, estimatedValue: '' }));
                    }
                  }}
                  className={formErrors.estimatedValue ? 'border-red-500 focus:border-red-500' : ''}
                />
                {formErrors.estimatedValue && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.estimatedValue}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="reasonForSelling">Reason for Selling</Label>
                <Textarea
                  id="reasonForSelling"
                  placeholder="Tell us why you're selling (optional)"
                  value={formData.reasonForSelling}
                  onChange={(e) => setFormData(prev => ({ ...prev, reasonForSelling: e.target.value }))}
                />
              </div>

              {/* Installment Preferences Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Payment Preferences</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="acceptsInstallments"
                      checked={formData.acceptsInstallments || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, acceptsInstallments: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="acceptsInstallments" className="text-sm font-medium text-slate-700">
                      Accept installment payments
                    </Label>
                  </div>

                  {formData.acceptsInstallments && (
                    <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                      <div>
                        <Label htmlFor="preferredDepositAmount">Preferred Deposit Amount (USD)</Label>
                        <Input
                          id="preferredDepositAmount"
                          type="number"
                          placeholder="50,000"
                          value={formData.preferredDepositAmount}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, preferredDepositAmount: e.target.value }));
                            // Clear error when user starts typing
                            if (formErrors.preferredDepositAmount) {
                              setFormErrors(prev => ({ ...prev, preferredDepositAmount: '' }));
                            }
                          }}
                          className={formErrors.preferredDepositAmount ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {formErrors.preferredDepositAmount && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.preferredDepositAmount}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="installmentDurationMonths">Installment Duration (Months)</Label>
                        <select
                          id="installmentDurationMonths"
                          className={`w-full px-3 py-2 border rounded-md ${formErrors.installmentDurationMonths ? 'border-red-500 focus:border-red-500' : 'border-slate-300'}`}
                          value={formData.installmentDurationMonths}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, installmentDurationMonths: e.target.value }));
                            // Clear error when user makes selection
                            if (formErrors.installmentDurationMonths) {
                              setFormErrors(prev => ({ ...prev, installmentDurationMonths: '' }));
                            }
                          }}
                        >
                          <option value="">Select duration</option>
                          <option value="12">12 months</option>
                          <option value="24">24 months</option>
                          <option value="36">36 months</option>
                          <option value="48">48 months</option>
                          <option value="60">60 months</option>
                        </select>
                        {formErrors.installmentDurationMonths && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.installmentDurationMonths}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="minimumDepositPercentage">Minimum Deposit Percentage</Label>
                        <Input
                          id="minimumDepositPercentage"
                          type="number"
                          placeholder="10"
                          value={formData.minimumDepositPercentage}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, minimumDepositPercentage: e.target.value }));
                            // Clear error when user starts typing
                            if (formErrors.minimumDepositPercentage) {
                              setFormErrors(prev => ({ ...prev, minimumDepositPercentage: '' }));
                            }
                          }}
                          className={formErrors.minimumDepositPercentage ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        <p className="text-xs text-slate-500 mt-1">Enter percentage (e.g., 10 for 10%)</p>
                        {formErrors.minimumDepositPercentage && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.minimumDepositPercentage}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Property Documents</h3>
              <p className="text-slate-600">Upload relevant property documents to speed up the listing process</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-sm mb-1">Property Photos</h4>
                  <p className="text-xs text-slate-600 mb-3">High-quality images of your property</p>
                  
                  {/* Uploaded Photos Display */}
                  {formData.uploadedPropertyPhotos && formData.uploadedPropertyPhotos.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-green-600 mb-2">
                        {formData.uploadedPropertyPhotos.length} photo(s) uploaded
                      </p>
                      <div className="space-y-1">
                        {formData.uploadedPropertyPhotos.map((photo, index) => (
                          <div key={photo.id} className="text-xs text-slate-600 bg-green-50 p-2 rounded">
                            {photo.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePropertyPhotoUpload}
                    className="hidden"
                    id="property-photos-upload"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('property-photos-upload')?.click()}
                  >
                    {formData.uploadedPropertyPhotos && formData.uploadedPropertyPhotos.length > 0 ? 'Add More Photos' : 'Upload Photos'}
                  </Button>
                </div>
                
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-sm mb-1">Property Documents</h4>
                  <p className="text-xs text-slate-600 mb-3">Deed, title, or ownership documents</p>
                  
                  {/* Uploaded Documents Display */}
                  {formData.uploadedPropertyDocuments && formData.uploadedPropertyDocuments.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-green-600 mb-2">
                        {formData.uploadedPropertyDocuments.length} document(s) uploaded
                      </p>
                      <div className="space-y-1">
                        {formData.uploadedPropertyDocuments.map((doc, index) => (
                          <div key={doc.id} className="text-xs text-slate-600 bg-green-50 p-2 rounded">
                            {doc.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={handlePropertyDocumentUpload}
                    className="hidden"
                    id="property-documents-upload"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('property-documents-upload')?.click()}
                  >
                    {formData.uploadedPropertyDocuments && formData.uploadedPropertyDocuments.length > 0 ? 'Add More Documents' : 'Upload Documents'}
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-orange-800">Optional but Recommended</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Uploading documents now will help us list your property faster and attract more serious buyers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                You're All Set!
              </h3>
              <p className="text-slate-600 mb-6">
                Thank you for completing the seller onboarding process. Our team will review your information and contact you within 24 hours.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">What happens next?</h4>
                <ul className="text-xs text-slate-600 space-y-1 text-left">
                  <li>• We'll review your property details</li>
                  <li>• Schedule a property valuation</li>
                  <li>• Create your listing</li>
                  <li>• Start receiving buyer inquiries</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">You'll receive:</h4>
                <ul className="text-xs text-slate-600 space-y-1 text-left">
                  <li>• Welcome email with next steps</li>
                  <li>• Property listing preview</li>
                  <li>• Market analysis report</li>
                  <li>• Dedicated seller dashboard access</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Reset form when modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Home className="w-5 h-5 mr-2 text-red-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Welcome to Mukamba Gateway Seller Program!
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Resume Message */}
        {isResuming && (
          <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center text-blue-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Welcome back! Resuming your seller onboarding...</span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Step {currentStepIndex + 1} of {steps.length}</span>
            <div className="flex items-center space-x-2">
              {isSaving && (
                <div className="flex items-center text-blue-600">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  <span className="text-xs">Saving...</span>
                </div>
              )}
              <span className="text-slate-600">{Math.round(progress)}% Complete</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${
                  index <= currentStepIndex ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  index <= currentStepIndex 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {index < currentStepIndex ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 'welcome'}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-2">
            {currentStep === 'complete' ? (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-red-600 hover:bg-red-700"
                disabled={currentStep === 'property' && (
                  !formData.propertyAddress.trim() || 
                  !formData.propertyType || 
                  !formData.estimatedValue.trim() ||
                  (formData.acceptsInstallments && (
                    !formData.preferredDepositAmount.trim() ||
                    !formData.installmentDurationMonths ||
                    !formData.minimumDepositPercentage.trim()
                  ))
                )}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Phone Verification Modal */}
      <BuyerPhoneVerificationModal
        isOpen={showPhoneVerificationModal}
        onClose={() => setShowPhoneVerificationModal(false)}
        onVerificationComplete={handlePhoneVerificationComplete}
        userEmail={user?.email}
      />

      {/* Identity Verification Modal */}
      <IdentityVerificationModal
        isOpen={showIdentityVerificationModal}
        onClose={() => setShowIdentityVerificationModal(false)}
        onComplete={handleIdentityVerificationComplete}
        user={user || undefined}
        verificationState="unverified"
      />
    </div>
  );
};
