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
  Zap,
  Info,
  UserCheck,
  Timer
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PropertyListing } from '@/types/property';
import { User } from '@/types/auth';

// Local interface to ensure type compatibility for property status
interface LocalPropertyWithStatus {
  status: 'active' | 'under_offer' | 'sold' | 'rented' | 'pending' | 'draft';
}
import { useRouter } from 'next/navigation';
import { PropertyGallery } from './PropertyGallery';
import LocationMap from './LocationMap';
import PropertyDocuments from './PropertyDocuments';
import { PropertyActions } from './PropertyActions';
import { ExpressInterestModal } from './ExpressInterestModal';
import { MakeOfferModal } from './MakeOfferModal';
import { ScheduleViewingModal } from './ScheduleViewingModal';
import { OfferStatusTracker } from './OfferStatusTracker';
import { BuyerPhoneVerificationModal } from '@/components/forms/BuyerPhoneVerificationModal';
import { buyerServices } from '@/lib/buyer-services';
import { useAuthStore } from '@/lib/store';
import { getPropertyOffers } from '@/lib/offer-services';
import { IdentityVerificationModal } from '@/components/forms/IdentityVerificationModal';
import { FinancialAssessmentModal } from '@/components/forms/FinancialAssessmentModal';
import { useMessageStore } from '@/lib/message-store';
import { checkPendingIdentityVerification } from '../../lib/check-pending-verification';

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
  // Local verification state to immediately unlock actions post-upload
  const [identityVerifiedLocal, setIdentityVerifiedLocal] = React.useState<boolean>(false);
  const [isIdentityPending, setIsIdentityPending] = React.useState<boolean>(false);
  
  // Offer flow state
  const [showExpressInterestModal, setShowExpressInterestModal] = React.useState(false);
  const [showMakeOfferModal, setShowMakeOfferModal] = React.useState(false);
  const [showScheduleViewingModal, setShowScheduleViewingModal] = React.useState(false);
  const [showOfferTracker, setShowOfferTracker] = React.useState(false);
  
  // Phone verification modal state
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = React.useState(false);
  // Identity & Financial verification modals
  const [showIdentityModal, setShowIdentityModal] = React.useState(false);
  const [showFinancialModal, setShowFinancialModal] = React.useState(false);
  
  // Offer status tracking
  const [propertyOffers, setPropertyOffers] = React.useState<any[]>([]);
  const [userOffers, setUserOffers] = React.useState<any[]>([]);
  const [userOffer, setUserOffer] = React.useState<any>(null);
  const [isLoadingOffers, setIsLoadingOffers] = React.useState(false);

  // Load offers for this property (pending + approved for public summary)
    const loadOffers = async () => {
    console.log('PropertyDetailsPage: Loading offers for property:', property.id);
      setIsLoadingOffers(true);
    try {
      // Always fetch public offers summary for bidding activity display
      try {
        const apiUrl = `/api/properties/${property.id}/offers/summary`;
        console.log('PropertyDetailsPage: Fetching from API:', apiUrl);
        
        const res = await fetch(apiUrl, { cache: 'no-store' });
        console.log('PropertyDetailsPage: API response status:', res.status);
        
        if (res.ok) {
          const json = await res.json();
          console.log('PropertyDetailsPage: API response data:', json);
          
          if (json?.success) {
            // Map to expected lightweight shape when using API
            const minimal = (json.offers || []).map((o: any) => ({
              id: `${property.id}-${o.submitted_at}-${o.offer_price}`,
              property_id: property.id,
              buyer_id: 'anonymous',
              offer_price: o.offer_price,
              payment_method: o.payment_method,
              status: o.status,
              submitted_at: o.submitted_at
            }));
            console.log('PropertyDetailsPage: Mapped offers:', minimal);
            setPropertyOffers(minimal);
          } else {
            console.log('PropertyDetailsPage: API returned success: false');
            setPropertyOffers([]);
          }
        } else {
          console.log('PropertyDetailsPage: API request failed with status:', res.status);
          setPropertyOffers([]);
        }
      } catch (error) {
        console.error('PropertyDetailsPage: Error fetching offers from API:', error);
        // Fallback to client supabase fetch with identities, filtered by property
      try {
        const offers = await getPropertyOffers({ property_id: property.id });
          console.log('PropertyDetailsPage: Fallback offers:', offers);
        setPropertyOffers(offers);
        } catch (fallbackError) {
          console.error('PropertyDetailsPage: Error fetching offers from client:', fallbackError);
          setPropertyOffers([]);
        }
      }
      
      // Get user's offers for this property (only if user is logged in)
      if (user) {
        try {
          const userOffersList = await getPropertyOffers({ property_id: property.id });
          const allUserOffers = (userOffersList || []).filter((offer: any) => offer.buyer_id === user.id);
        setUserOffers(allUserOffers);
        
        // Set the most recent offer as the current user offer
        const currentUserOffer = allUserOffers.length > 0 ? allUserOffers[0] : null;
        setUserOffer(currentUserOffer);
        } catch (error) {
          console.error('Error loading user offers:', error);
          setUserOffers([]);
          setUserOffer(null);
        }
      }
      } catch (error) {
        console.error('Error loading offers:', error);
      } finally {
        setIsLoadingOffers(false);
      }
    };

  React.useEffect(() => {
    loadOffers();
  }, [property.id, user]);

  // Check for pending identity verification
  React.useEffect(() => {
    const checkPendingVerification = async () => {
      if (!user?.id || user.isIdentityVerified) return;
      
      try {
        const { hasPending } = await checkPendingIdentityVerification(user.id);
        setIsIdentityPending(hasPending);
      } catch (error) {
        console.error('Error checking pending identity verification:', error);
      }
    };

    checkPendingVerification();
  }, [user?.id, user?.isIdentityVerified]);

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
    if (!user.is_phone_verified) {
      setShowPhoneVerificationModal(true);
      return;
    }
    setShowExpressInterestModal(true);
  };

  const handleScheduleViewing = () => {
    if (!user) {
      onSignUpPrompt?.();
      return;
    }
    if (!user.is_phone_verified) {
      setShowPhoneVerificationModal(true);
      return;
    }
    setShowScheduleViewingModal(true);
  };

  const handleMakeOffer = () => {
    if (!user) {
      onSignUpPrompt?.();
      return;
    }
    // Require phone verification first for any action
    if (!user.is_phone_verified) {
      setShowPhoneVerificationModal(true);
      return;
    }

    // Check if identity verification is pending
    if (isIdentityPending) {
      // Show pending status message instead of opening modal
      return;
    }

    // Identity verification required for all offers
    if (!user.isIdentityVerified) {
      setShowIdentityModal(true);
      return;
    }

    if (hasUserOffer() && userOffer?.status !== 'rejected') {
      // User already has an active offer (not rejected), don't allow another one
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


  const handleExpressInterest = async (data: any) => {
    // Route message to admin inbox
    try {
      const buyerName = user ? `${user.firstName} ${user.lastName}` : 'Anonymous';
      await useMessageStore.getState().addMessage({
        propertyId: property.id,
        propertyTitle: property.title,
        buyerId: user?.id || 'anonymous',
        buyerName,
        buyerEmail: user?.email,
        buyerPhone: user?.phone,
        content: typeof data === 'string' ? data : (data?.message || ''),
        messageType: 'inquiry',
      });
    } catch (e) {
      console.error('Failed to send message:', e);
      throw e; // Re-throw to let the modal handle the error
    }
  };

  const handleSubmitOffer = async (data: any) => {
    // The MakeOfferModal now handles the API call directly
    // This is just for any additional custom logic if needed
    console.log('Offer submitted:', data);
    
    // Refresh offers after submission
    if (user) {
      try {
        const offers = await getPropertyOffers({ property_id: property.id });
        setPropertyOffers(offers);
        
        // Get ALL user's offers for this property
        const allUserOffers = offers.filter(offer => offer.buyer_id === user.id);
        setUserOffers(allUserOffers);
        
        // Set the most recent offer as the current user offer
        const currentUserOffer = allUserOffers.length > 0 ? allUserOffers[0] : null;
        setUserOffer(currentUserOffer);
      } catch (error) {
        console.error('Error refreshing offers:', error);
      }
    }
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
    console.log('PropertyDetailsPage - User object:', user);
    console.log('PropertyDetailsPage - is_phone_verified:', user?.is_phone_verified);
    console.log('PropertyDetailsPage - kyc_level:', user?.kyc_level);
    
    if (!user) return 'anonymous';
    if (!user.is_phone_verified) return 'email_verified';
    if (user.kyc_level === 'identity') return 'phone_verified';
    if (user.kyc_level === 'financial') return 'identity_verified';
    if (user.kyc_level === 'complete') return 'financial_verified';
    return 'phone_verified';
  };

  const accessLevel = getUserAccessLevel();
  console.log('PropertyDetailsPage - Access level determined:', accessLevel);

  // Helper functions for offer status
  const hasUserOffer = () => userOffer !== null;
  const hasAnyOffers = () => propertyOffers.length > 0;
  const isPropertyUnderOffer = () => (property as LocalPropertyWithStatus).status === 'under_offer' || hasAnyOffers();
  const canMakeOffer = () => {
    if (!user) return false;
    if (!user.is_phone_verified) return false;
    if (!user.isIdentityVerified) return false;
    if (hasUserOffer() && userOffer?.status !== 'rejected') return false;
    return true;
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  // Get time ago string
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Compact offer status component for sidebar
  const CompactOfferStatus = () => {
    if (!user || !hasUserOffer()) return null;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'bg-blue-50 border-blue-200 text-blue-900';
        case 'approved': return 'bg-green-50 border-green-200 text-green-900';
        case 'rejected': return 'bg-red-50 border-red-200 text-red-900';
        default: return 'bg-gray-50 border-gray-200 text-gray-900';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'pending': return <Timer className="w-4 h-4" />;
        case 'approved': return <CheckCircle className="w-4 h-4" />;
        case 'rejected': return <AlertCircle className="w-4 h-4" />;
        default: return <Info className="w-4 h-4" />;
      }
    };

    const getStatusMessage = (status: string) => {
      switch (status) {
        case 'pending': return 'Under Review';
        case 'approved': return 'Approved';
        case 'rejected': return 'Not Accepted';
        default: return 'Unknown Status';
      }
    };

    const submittedDateTime = formatDateTime(userOffer.submitted_at);
    const reviewedDateTime = userOffer.admin_reviewed_at ? formatDateTime(userOffer.admin_reviewed_at) : null;

    return (
      <Card className={`${getStatusColor(userOffer.status)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              <UserCheck className="w-4 h-4 mr-2" />
              Your Offer
            </CardTitle>
            <div className="flex items-center space-x-1">
              {getStatusIcon(userOffer.status)}
              <span className="text-sm font-semibold">{getStatusMessage(userOffer.status)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status-specific message */}
          {userOffer.status === 'rejected' && (
            <div className="bg-red-100 rounded-lg p-2 border border-red-200">
              <p className="text-xs text-red-800 font-medium">
                Your offer was not accepted.
              </p>
              {userOffer.rejection_reason && (
                <p className="text-xs text-red-700 mt-1">
                  <span className="font-medium">Reason:</span> {userOffer.rejection_reason}
                </p>
              )}
            </div>
          )}

          {userOffer.status === 'pending' && (
            <div className="bg-blue-100 rounded-lg p-2 border border-blue-200">
              <p className="text-xs text-blue-800">
                Your offer is under review.
              </p>
            </div>
          )}

          {userOffer.status === 'approved' && (
            <div className="bg-green-100 rounded-lg p-2 border border-green-200">
              <p className="text-xs text-green-800 font-medium">
                Congratulations! Your offer has been approved.
              </p>
            </div>
          )}

          {/* Offer details - compact */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="opacity-75">Ref #:</span>
              <span className="font-semibold font-mono">{userOffer.offer_reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-75">Price:</span>
              <span className="font-semibold">{formatCurrency(userOffer.offer_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-75">Deposit:</span>
              <span className="font-semibold">{formatCurrency(userOffer.deposit_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-75">Method:</span>
              <span className="font-semibold capitalize">{userOffer.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-75">Timeline:</span>
              <span className="font-semibold">
                {userOffer.estimated_timeline === 'ready_to_pay_in_full' 
                  ? 'Full payment' 
                  : `${userOffer.estimated_timeline.replace('_months', '')} months`
                }
              </span>
            </div>
          </div>

          {/* Timestamps - compact */}
          <div className="pt-2 border-t border-current border-opacity-20 space-y-1">
            <div className="text-xs">
              <span className="opacity-75">Submitted:</span>
              <div className="font-semibold">
                {submittedDateTime.date} at {submittedDateTime.time}
              </div>
            </div>
            {reviewedDateTime && (
              <div className="text-xs">
                <span className="opacity-75">
                  {userOffer.status === 'rejected' ? 'Rejected:' : 'Reviewed:'}
                </span>
                <div className="font-semibold">
                  {reviewedDateTime.date} at {reviewedDateTime.time}
                </div>
              </div>
            )}
          </div>

          {/* Additional notes - compact */}
          {userOffer.additional_notes && (
            <div className="pt-2 border-t border-current border-opacity-20">
              <span className="text-xs opacity-75">Notes:</span>
              <div className="text-xs mt-1 font-medium line-clamp-2">
                {userOffer.additional_notes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Offer history component
  const OfferHistory = () => {
    if (!user || userOffers.length <= 1) return null; // Only show if more than 1 offer

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'text-blue-600';
        case 'approved': return 'text-green-600';
        case 'rejected': return 'text-red-600';
        default: return 'text-gray-600';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'pending': return <Timer className="w-3 h-3" />;
        case 'approved': return <CheckCircle className="w-3 h-3" />;
        case 'rejected': return <AlertCircle className="w-3 h-3" />;
        default: return <Info className="w-3 h-3" />;
      }
    };

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Offer History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {userOffers.slice(1).map((offer, index) => {
            const submittedDateTime = formatDateTime(offer.submitted_at);
            const reviewedDateTime = offer.admin_reviewed_at ? formatDateTime(offer.admin_reviewed_at) : null;
            
            return (
              <div key={offer.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      Offer #{userOffers.length - index}
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      {offer.offer_reference}
                    </span>
                  </div>
                  <div className={`flex items-center space-x-1 ${getStatusColor(offer.status)}`}>
                    {getStatusIcon(offer.status)}
                    <span className="text-xs font-medium capitalize">{offer.status}</span>
                  </div>
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">{formatCurrency(offer.offer_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="font-medium capitalize">{offer.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Submitted:</span>
                    <span className="font-medium">{submittedDateTime.date}</span>
                  </div>
                  {reviewedDateTime && (
                    <div className="flex justify-between">
                      <span>{offer.status === 'rejected' ? 'Rejected:' : 'Reviewed:'}</span>
                      <span className="font-medium">{reviewedDateTime.date}</span>
                    </div>
                  )}
                  {offer.rejection_reason && (
                    <div className="pt-1 border-t border-gray-200">
                      <span className="text-red-600 font-medium">Reason:</span>
                      <div className="text-red-600 text-xs mt-1">{offer.rejection_reason}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  // Under offer badge component
  const UnderOfferBadge = () => {
    if (!isPropertyUnderOffer() || hasUserOffer()) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-orange-500 text-white hover:bg-orange-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              Under Offer
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>An offer is under review. You may still submit an offer.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // More robust back navigation for mobile
                  try {
                    // Check if we can go back in history
                    if (typeof window !== 'undefined') {
                      // Try native browser back first (works better on mobile)
                      if (window.history.length > 1) {
                        window.history.back();
                      } else {
                        // Fallback to Next.js router
                        router.back();
                      }
                    } else {
                      // Server-side fallback
                      router.push('/listings');
                    }
                  } catch (error) {
                    console.error('Navigation error:', error);
                    // Ultimate fallback to home page
                    router.push('/');
                  }
                }}
                className="flex items-center space-x-2 touch-manipulation"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  minHeight: '44px', // iOS recommended touch target size
                  minWidth: '44px'
                }}
                onTouchStart={(e) => {
                  // Add visual feedback for touch
                  e.currentTarget.style.opacity = '0.7';
                }}
                onTouchEnd={(e) => {
                  // Remove visual feedback
                  e.currentTarget.style.opacity = '1';
                }}
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
                  {property.location.suburb}, {property.location.city}
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
                    {(property as LocalPropertyWithStatus).status === 'sold' 
                      ? (property.financials.finalSalePrice ? formatCurrency(property.financials.finalSalePrice) : formatCurrency(property.financials.price))
                      : formatCurrency(property.financials.price)
                    }
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {(property as LocalPropertyWithStatus).status === 'sold' && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Sold
                      </Badge>
                    )}
                    {property.seller.isVerified && (
                      <Badge className="bg-blue-500 text-white">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified Seller
                      </Badge>
                    )}
                    <UnderOfferBadge />
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
                  
                  {/* Call to Action - Make Offer */}
                  {(property as LocalPropertyWithStatus).status !== 'sold' && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              Interested in this property?
                            </h4>
                            <p className="text-sm text-gray-600">
                              {hasUserOffer()
                                ? `Your offer is ${userOffer?.status === 'approved' ? 'approved' : userOffer?.status === 'rejected' ? 'rejected' : 'under review'}`
                                : canMakeOffer() 
                                ? 'Submit your offer now to secure this property' 
                                : !user 
                                  ? 'Sign up to make an offer on this property'
                                  : !user.is_phone_verified
                                    ? 'Verify your phone to make an offer'
                                    : isIdentityPending
                                      ? 'Identity verification under review - You\'ll hear from us within 24-48 hours'
                                      : 'Complete identity verification to make an offer'
                              }
                            </p>
                          </div>
                          <Button
                            onClick={canMakeOffer() ? handleMakeOffer : (!user ? onSignUpPrompt : handleMakeOffer)}
                            className={`ml-4 h-12 px-6 font-semibold transition-all duration-200 ${
                              hasUserOffer()
                                ? 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-md'
                                : canMakeOffer()
                                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl' 
                                : isIdentityPending
                                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-md'
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 shadow-md'
                            } text-white border-0`}
                            disabled={hasUserOffer() || (!user && false)}
                          >
                            {hasUserOffer() ? (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Offer Submitted
                              </>
                            ) : isIdentityPending ? (
                              <>
                                <Clock className="w-5 h-5 mr-2 animate-pulse" />
                                Under Review
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-5 h-5 mr-2" />
                                {canMakeOffer() ? 'Make Offer' : !user ? 'Sign Up to Offer' : 'Make Offer'}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
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
                        
                        {property.listingType === 'installment' ? (
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
                                    <span>Required Deposit:</span>
                                    <span className="font-medium">
                                      {property.financials.rentToBuyDeposit ? formatCurrency(property.financials.rentToBuyDeposit) : 'Contact seller'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Payment Duration:</span>
                                    <span className="font-medium">
                                      {property.financials.paymentDuration ? `${property.financials.paymentDuration} months` : 'Contact seller'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Monthly Payment:</span>
                                    <span className="font-medium">
                                      {property.financials.monthlyInstallment ? formatCurrency(property.financials.monthlyInstallment) : 'Contact seller'}
                                    </span>
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
                        ) : (
                          <div className="bg-green-50 rounded-lg p-6">
                            <div className="flex items-center mb-4">
                              <DollarSign className="w-6 h-6 text-green-600 mr-3" />
                              <h4 className="text-lg font-medium text-green-900">Cash Sale</h4>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="bg-white rounded-lg p-4 border border-green-200">
                                <h5 className="font-medium text-gray-900 mb-2">Sale Details</h5>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div className="flex justify-between">
                                    <span>Selling Price:</span>
                                    <span className="font-medium">{formatCurrency(property.financials.price)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Currency:</span>
                                    <span className="font-medium">{property.financials.currency}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Price per m²:</span>
                                    <span className="font-medium">{formatCurrency(Math.round(property.financials.price / property.details.size))}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h5 className="font-medium text-blue-900 mb-2">Cash Sale Benefits</h5>
                                <ul className="space-y-2 text-sm text-blue-800">
                                  <li className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Immediate property ownership</span>
                                  </li>
                                  <li className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>No monthly payments required</span>
                                  </li>
                                  <li className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Simplified transaction process</span>
                                  </li>
                                  <li className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Potential for better negotiation</span>
                                  </li>
                                </ul>
                              </div>

                              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                <h5 className="font-medium text-yellow-900 mb-2">Important Notes</h5>
                                <ul className="space-y-2 text-sm text-yellow-800">
                                  <li className="flex items-start">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Full payment required at time of purchase</span>
                                  </li>
                                  <li className="flex items-start">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Legal documentation and transfer fees apply</span>
                                  </li>
                                  <li className="flex items-start">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Contact seller for payment arrangements</span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {accessLevel === 'anonymous' ? (
                              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <p className="text-sm text-blue-700 mb-3">
                                  Sign up to contact the seller and arrange payment
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
                                  Verify your phone number to contact the seller
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
                                  Contact Seller for Purchase
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
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
            {/* Offer Status - Show first if user has an offer */}
            <CompactOfferStatus />

            {/* Offer History - Show if user has multiple offers */}
            <OfferHistory />

            {/* Property Actions - Hide if sold */}
            {(property as LocalPropertyWithStatus).status !== 'sold' && (
            <PropertyActions
              property={property}
              user={user}
              onContactSeller={handleContactSeller}
              onScheduleViewing={handleScheduleViewing}
              onMakeOffer={handleMakeOffer}
              onSignUpPrompt={onSignUpPrompt || (() => {})}
              onPhoneVerification={handlePhoneVerification}
              hasUserOffer={hasUserOffer()}
              canMakeOffer={canMakeOffer()}
              userOfferStatus={userOffer?.status}
              showScheduleViewing={false}
              isIdentityPending={isIdentityPending}
              />
            )}

            {/* Sold Property Message */}
            {(property as LocalPropertyWithStatus).status === 'sold' && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Property Sold</h3>
                  <p className="text-green-700 mb-4">
                    This property has been successfully sold. Thank you for your interest!
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="text-sm text-green-800">
                      <div className="font-semibold mb-1">Final Sale Price</div>
                      <div className="text-xl font-bold text-green-900">
                        {property.financials.finalSalePrice ? formatCurrency(property.financials.finalSalePrice) : formatCurrency(property.financials.price)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Show sold status and sale price if property is sold */}
                {(property as LocalPropertyWithStatus).status === 'sold' ? (
                  <>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-4">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-semibold text-green-900">Property Sold</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">Final Sale Price</span>
                          <span className="font-bold text-green-900 text-lg">
                            {property.financials.finalSalePrice ? formatCurrency(property.financials.finalSalePrice) : formatCurrency(property.financials.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">Currency</span>
                          <span className="font-semibold text-green-900">{property.financials.currency}</span>
                        </div>
                        {property.financials.saleDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700">Sale Date</span>
                            <span className="font-semibold text-green-900">
                              {new Date(property.financials.saleDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Original listing price for comparison */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Original Listing Price</span>
                        <span className="font-medium text-gray-800 line-through">
                          {formatCurrency(property.financials.price)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : property.listingType === 'installment' ? (
                  <>
                    {/* Installment Listing Stats */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Required Deposit</span>
                      <span className="font-semibold">
                        {property.financials.rentToBuyDeposit ? formatCurrency(property.financials.rentToBuyDeposit) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payment Duration</span>
                      <span className="font-semibold">
                        {property.financials.paymentDuration ? `${property.financials.paymentDuration} months` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Currency</span>
                      <span className="font-semibold">{property.financials.currency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Monthly Installment</span>
                      <span className="font-semibold">
                        {property.financials.monthlyInstallment ? formatCurrency(property.financials.monthlyInstallment) : 'N/A'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Cash Sale Listing Stats */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Selling Price</span>
                      <span className="font-semibold">
                        {formatCurrency(property.financials.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Currency</span>
                      <span className="font-semibold">{property.financials.currency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price per m²</span>
                      <span className="font-semibold">
                        {formatCurrency(Math.round(property.financials.price / property.details.size))}
                      </span>
                    </div>
                  </>
                )}
                
                {/* Common Stats */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="font-semibold">{property.views}</span>
                </div>
              </CardContent>
            </Card>

            {/* Bidding Activity - Show if property has offers or is under offer */}
            {(propertyOffers.length > 0 || isPropertyUnderOffer() || isLoadingOffers) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Bidding Activity
                      {isLoadingOffers && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadOffers}
                      disabled={isLoadingOffers}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Refresh
                    </Button>
          </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingOffers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-500">Loading offers...</span>
                    </div>
                  ) : (
                    <>
                      {/* Offer Statistics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className="text-sm text-blue-600 font-medium">Total Offers</div>
                          <div className="text-2xl font-bold text-blue-900">{propertyOffers.length}</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <div className="text-sm text-green-600 font-medium">Highest Offer</div>
                          <div className="text-xl font-bold text-green-900">
                            {propertyOffers.length > 0 ? formatCurrency(Math.max(...propertyOffers.map(offer => offer.offer_price))) : 'No offers yet'}
                          </div>
                        </div>
                      </div>

                  {/* Price Range - Only show if there are offers */}
                  {propertyOffers.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Offer Range</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Lowest:</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(Math.min(...propertyOffers.map(offer => offer.offer_price)))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Highest:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(Math.max(...propertyOffers.map(offer => offer.offer_price)))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Average:</span>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(Math.round(propertyOffers.reduce((sum, offer) => sum + offer.offer_price, 0) / propertyOffers.length))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Recent Offers</h4>
                    {propertyOffers.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {propertyOffers
                          .filter(offer => offer.status === 'pending' || offer.status === 'approved')
                          .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
                          .slice(0, 5)
                          .map((offer, index) => {
                            const isUserOffer = user && offer.buyer_id && offer.buyer_id === user.id;
                            const submittedDate = new Date(offer.submitted_at);
                            const timeAgo = getTimeAgo(submittedDate);
                            
                            return (
                              <div key={offer.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                                isUserOffer 
                                  ? 'bg-blue-50 border-blue-200' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    isUserOffer 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-gray-400 text-white'
                                  }`}>
                                    {isUserOffer ? 'You' : 'B'}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {formatCurrency(offer.offer_price)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {isUserOffer ? 'Your offer' : 'Anonymous bidder'} • {timeAgo}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-xs px-2 py-1 rounded-full ${
                                    offer.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : offer.status === 'approved'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {offer.status.toUpperCase()}
                                  </div>
                                  {offer.payment_method && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {offer.payment_method}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No offers yet</p>
                        <p className="text-xs text-gray-400 mt-1">Be the first to make an offer</p>
                      </div>
                    )}
                  </div>

                  {/* Competitive Bidding Message - Only show if there are multiple offers */}
                  {propertyOffers.length > 1 && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-orange-900 mb-1">Competitive Bidding</h5>
                          <p className="text-sm text-orange-800">
                            This property has multiple offers. Consider making a competitive offer to increase your chances.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                      {/* Call to Action for Making Offers */}
                      {!hasUserOffer() && canMakeOffer() && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-start space-x-2">
                            <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <h5 className="font-medium text-blue-900 mb-1">Make Your Offer</h5>
                              <p className="text-sm text-blue-800 mb-3">
                                Submit your offer to be considered for this property.
                              </p>
                              <Button 
                                onClick={handleMakeOffer}
                                className="w-full"
                                size="sm"
                              >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Make an Offer
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

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

      {/* Identity Verification Modal */}
      <IdentityVerificationModal
        isOpen={showIdentityModal}
        onClose={() => setShowIdentityModal(false)}
        onComplete={async () => {
          // Refresh user data from database to get updated verification status
          try {
            const { checkAuth } = useAuthStore.getState();
            await checkAuth();
            
            // Also immediately check for pending verification to update UI
            if (user?.id) {
              const { hasPending } = await checkPendingIdentityVerification(user.id);
              setIsIdentityPending(hasPending);
            }
          } catch (error) {
            console.error('Error refreshing user data:', error);
          }
          setShowIdentityModal(false);
        }}
      />

      {/* Financial Assessment Modal */}
      <FinancialAssessmentModal
        isOpen={showFinancialModal}
        onClose={() => setShowFinancialModal(false)}
        onComplete={() => {
          // Keep status pending until admin approval
          setShowFinancialModal(false);
        }}
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
