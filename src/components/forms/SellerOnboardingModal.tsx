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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

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
  const [formData, setFormData] = React.useState({
    phone: '',
    propertyAddress: '',
    propertyType: '',
    estimatedValue: '',
    reasonForSelling: '',
    documents: [] as File[]
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

  // Load saved progress when modal opens
  React.useEffect(() => {
    const loadProgress = async () => {
      if (!isOpen || !user?.id || !supabase) return;
      
      try {
        const { data: savedProgress } = await supabase
          .from('seller_onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (savedProgress) {
          setIsResuming(true);
          setCurrentStep(savedProgress.current_step as OnboardingStep);
          setFormData(savedProgress.form_data || formData);
          
          // Show resume message briefly
          setTimeout(() => setIsResuming(false), 3000);
        }
      } catch (error) {
        console.log('No saved progress found, starting fresh');
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
      
      await supabase
        .from('seller_onboarding_progress')
        .upsert({
          user_id: user.id,
          current_step: currentStep,
          form_data: formData,
          completed_steps: completedSteps,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
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
          // Update user profile with property details
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('additional_info')
            .eq('id', user.id)
            .single();
          
          const updatedInfo = {
            ...profile?.additional_info,
            property_details: {
              address: data.propertyAddress,
              type: data.propertyType,
              estimated_value: data.estimatedValue,
              reason_for_selling: data.reasonForSelling,
              listing_intent: true,
              created_at: new Date().toISOString()
            }
          };
          
          await supabase
            .from('user_profiles')
            .update({ 
              additional_info: updatedInfo,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          break;
      }
    } catch (error) {
      console.error('Error saving verification data:', error);
    }
  };

  const handleNext = async () => {
    // Save current step data
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
      await supabase
        .from('seller_onboarding_progress')
        .update({
          current_step: 'complete',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);
      
      // Update user profile to indicate seller intent
      await supabase
        .from('user_profiles')
        .update({
          roles: ['user', 'seller'], // Add seller role
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);
      
      onComplete(formData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
              <Home className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Welcome to Mukamba Seller Program!
              </h3>
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
              <p className="text-slate-600">We'll send you a verification code to confirm your phone number</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-blue-800">Why we need this</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Phone verification enables direct communication with potential buyers and ensures secure transactions.
                    </p>
                  </div>
                </div>
              </div>
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
              <p className="text-slate-600">Upload a government-issued ID to verify your identity</p>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h4 className="font-semibold text-slate-800 mb-2">Upload ID Document</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Accepted: Driver's License, Passport, National ID
                </p>
                <Button variant="outline">
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
                  onChange={(e) => setFormData(prev => ({ ...prev, propertyAddress: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <select
                  id="propertyType"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  value={formData.propertyType}
                  onChange={(e) => setFormData(prev => ({ ...prev, propertyType: e.target.value }))}
                >
                  <option value="">Select property type</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Land</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="estimatedValue">Estimated Property Value</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  placeholder="500,000"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                />
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
                  <Button variant="outline" size="sm">
                    Upload Photos
                  </Button>
                </div>
                
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-sm mb-1">Property Documents</h4>
                  <p className="text-xs text-slate-600 mb-3">Deed, title, or ownership documents</p>
                  <Button variant="outline" size="sm">
                    Upload Documents
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
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center">
            <Home className="w-5 h-5 mr-2 text-red-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Seller Onboarding
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
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
