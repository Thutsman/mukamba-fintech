'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Share2,
  Eye,
  Star,
  DollarSign,
  Home,
  Calendar,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Download,
  Bookmark,
  Users,
  Car,
  Wifi,
  Snowflake,
  Dumbbell,
  TreePine,
  Camera,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Building,
  TrendingUp,
  Calculator,
  FileText,
  Award,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyListing } from '@/types/property';
import { User } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { PropertyGallery } from './PropertyGallery';
import { LocationMap } from './LocationMap';
import { PropertyDocuments } from './PropertyDocuments';
import { SimilarProperties } from './SimilarProperties';
import { PropertyActions } from './PropertyActions';
import { ExpressInterestModal } from './ExpressInterestModal';
import { MakeOfferModal } from './MakeOfferModal';
import { ScheduleViewingModal } from './ScheduleViewingModal';
import { OfferStatusTracker } from './OfferStatusTracker';
import { BuyerPhoneVerificationModal } from '@/components/forms/BuyerPhoneVerificationModal';
import { buyerServices } from '@/lib/buyer-services';
import { useAuthStore } from '@/lib/store';

interface PropertyDetailsPageProps {
  property: PropertyListing;
  user?: User;
  onSignUpPrompt?: () => void;
  onPhoneVerification?: () => void;
  onBuyerSignup?: () => void;
}

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({
  property,
  user,
  onSignUpPrompt,
  onPhoneVerification,
  onBuyerSignup
}) => {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('overview');
  
  // Offer flow state
  const [showExpressInterestModal, setShowExpressInterestModal] = React.useState(false);
  const [showMakeOfferModal, setShowMakeOfferModal] = React.useState(false);
  const [showScheduleViewingModal, setShowScheduleViewingModal] = React.useState(false);
  const [showOfferTracker, setShowOfferTracker] = React.useState(false);
  
  // Phone verification modal state
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = React.useState(false);
  
  // Mock offers data - in real app this would come from API
  const [userOffers, setUserOffers] = React.useState<any[]>([]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: property.financials.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle favorite toggle
  const toggleFavorite = () => {
    if (!user) {
      onSignUpPrompt?.();
      return;
    }
    setIsFavorite(!isFavorite);
  };

  // Phone verification handlers
  const handlePhoneVerification = () => {
    if (!user) {
      onSignUpPrompt?.();
      return;
    }
    setShowPhoneVerificationModal(true);
  };

  const handlePhoneVerificationComplete = async (phoneNumber: string) => {
    try {
      // Update user in store with phone verification
      if (user) {
        updateUser({
          ...user,
          phone: phoneNumber,
          is_phone_verified: true,
          kyc_level: 'phone'
        });
      }
      
      setShowPhoneVerificationModal(false);
      
      // Show success message or redirect
      console.log('Phone verification completed successfully');
    } catch (error) {
      console.error('Error completing phone verification:', error);
    }
  };

  // Offer flow handlers
  const handleContactSeller = () => {
    if (!user) {
      onSignUpPrompt?.();
      return;
    }
    setShowExpressInterestModal(true);
  };

  const handleScheduleViewing = () => {
    if (!user) {
      onSignUpPrompt?.();
      return;
    }
    setShowScheduleViewingModal(true);
  };

  const handleMakeOffer = () => {
    if (!user) {
      onSignUpPrompt?.();
      return;
    }
    setShowMakeOfferModal(true);
  };

  const handleAddToFavorites = () => {
    if (!user) {
      onSignUpPrompt?.();
      return;
    }
    setIsFavorite(!isFavorite);
  };

  const handleGetFinancing = () => {
    // Navigate to financing page or show financing modal
    console.log('Navigate to financing');
  };

  const handleExpressInterest = async (data: any) => {
    // In real app, this would call an API
    console.log('Express interest:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleSubmitOffer = async (data: any) => {
    // In real app, this would call an API
    console.log('Submit offer:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleScheduleViewingSubmit = async (data: any) => {
    // In real app, this would call an API
    console.log('Schedule viewing:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Get user access level based on KYC
  const getUserAccessLevel = () => {
    if (!user) return 'anonymous';
    if (!user.is_phone_verified) return 'email_verified';
    if (user.kyc_level === 'identity') return 'phone_verified';
    if (user.kyc_level === 'financial') return 'identity_verified';
    if (user.kyc_level === 'complete') return 'financial_verified';
    return 'phone_verified';
  };

  const accessLevel = getUserAccessLevel();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {property.title}
                </h1>
                <p className="text-sm text-gray-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {property.location.streetAddress}, {property.location.city}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className={`${isFavorite ? 'text-red-500' : 'text-gray-500'}`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.print()}
              >
                <FileText className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <PropertyGallery property={property} />

            {/* Property Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {formatCurrency(property.financials.price)}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {property.seller.isVerified && (
                      <Badge className="bg-blue-500 text-white">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified Seller
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center">
                    <Bed className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {property.details.bedrooms || 0} bed{(property.details.bedrooms || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {property.details.bathrooms || 0} bath{(property.details.bathrooms || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Square className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {property.details.size.toLocaleString()} m²
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {property.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="payment">Payment Terms</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Features & Amenities</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Property Features</h4>
                            <div className="space-y-2">
                              {property.details.features?.map((feature, index) => (
                                <div key={index} className="flex items-center text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Amenities</h4>
                            <div className="space-y-2">
                              {property.details.amenities?.map((amenity, index) => (
                                <div key={index} className="flex items-center text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                  {amenity}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="payment" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Payment Terms</h3>
                        <div className="bg-blue-50 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <Calculator className="w-6 h-6 text-blue-600 mr-3" />
                            <h4 className="text-lg font-medium text-blue-900">Installment Payment Plan</h4>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <h5 className="font-medium text-gray-900 mb-2">Payment Structure</h5>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                  <span>Deposit Required:</span>
                                  <span className="font-medium">50% of total price</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Balance Payment:</span>
                                  <span className="font-medium">Over 6 months</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Monthly Payment:</span>
                                  <span className="font-medium">{formatCurrency(Math.round(property.financials.price * 0.5 / 6))}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <h5 className="font-medium text-green-900 mb-2">Key Benefits</h5>
                              <ul className="space-y-2 text-sm text-green-800">
                                <li className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>No interest charges on installment payments</span>
                                </li>
                                <li className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>Flexible payment schedule</span>
                                </li>
                                <li className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>Property ownership upon completion</span>
                                </li>
                                <li className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>No hidden fees or charges</span>
                                </li>
                              </ul>
                            </div>

                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                              <h5 className="font-medium text-yellow-900 mb-2">Important Notes</h5>
                              <ul className="space-y-2 text-sm text-yellow-800">
                                <li className="flex items-start">
                                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>Property possession only after full payment completion</span>
                                </li>
                                <li className="flex items-start">
                                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>Payment terms are set by the seller and may vary</span>
                                </li>
                                <li className="flex items-start">
                                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>Contact seller for specific payment arrangements</span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          {accessLevel === 'anonymous' ? (
                            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <p className="text-sm text-blue-700 mb-3">
                                Sign up to get detailed payment information and contact the seller
                              </p>
                              <Button 
                                className="w-full"
                                onClick={onSignUpPrompt}
                              >
                                Sign Up Now
                              </Button>
                            </div>
                          ) : accessLevel === 'email_verified' ? (
                            <div className="mt-6 bg-orange-50 rounded-lg p-4 border border-orange-200">
                              <p className="text-sm text-orange-700 mb-3">
                                Verify your phone number to contact the seller for payment details
                              </p>
                              <Button 
                                className="w-full"
                                onClick={handlePhoneVerification}
                              >
                                Verify Phone
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-6">
                              <Button className="w-full">
                                <Phone className="w-4 h-4 mr-2" />
                                Contact Seller for Payment Details
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="location" className="p-6">
                    <LocationMap property={property} />
                  </TabsContent>

                  <TabsContent value="documents" className="p-6">
                    <PropertyDocuments property={property} accessLevel={accessLevel} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Property Actions */}
            <PropertyActions
              property={property}
              user={user}
              onContactSeller={handleContactSeller}
              onScheduleViewing={handleScheduleViewing}
              onMakeOffer={handleMakeOffer}
              onAddToFavorites={handleAddToFavorites}
              onGetFinancing={handleGetFinancing}
              onSignUpPrompt={onSignUpPrompt || (() => {})}
              onPhoneVerification={handlePhoneVerification}
              isFavorite={isFavorite}
            />

            {/* Property Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price per m²</span>
                  <span className="font-semibold">
                    {formatCurrency(Math.round(property.financials.price / property.details.size))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Rental</span>
                  <span className="font-semibold">
                    {property.financials.monthlyRental ? formatCurrency(property.financials.monthlyRental) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="font-semibold">{property.views}</span>
                </div>
              </CardContent>
            </Card>

            {/* Similar Properties */}
            <SimilarProperties 
              currentProperty={property} 
              user={user}
              onPropertySelect={(property) => {
                // Navigate to property details
                router.push(`/property/${property.id}`);
              }}
            />
          </div>
        </div>
      </div>

      {/* Phone Verification Modal */}
      <BuyerPhoneVerificationModal
        isOpen={showPhoneVerificationModal}
        onClose={() => setShowPhoneVerificationModal(false)}
        onVerificationComplete={handlePhoneVerificationComplete}
        buyerType={user?.buyer_type}
        userEmail={user?.email}
      />

      {/* Offer Flow Modals */}
      <ExpressInterestModal
        isOpen={showExpressInterestModal}
        onClose={() => setShowExpressInterestModal(false)}
        property={property}
        user={user!}
        onSubmit={handleExpressInterest}
      />

      <MakeOfferModal
        isOpen={showMakeOfferModal}
        onClose={() => setShowMakeOfferModal(false)}
        property={property}
        user={user!}
        onSubmit={handleSubmitOffer}
      />

      <ScheduleViewingModal
        isOpen={showScheduleViewingModal}
        onClose={() => setShowScheduleViewingModal(false)}
        property={property}
        user={user!}
        onSubmit={handleScheduleViewingSubmit}
      />
    </div>
  );
};
