'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Calendar, 
  DollarSign, 
  Heart, 
  MessageCircle,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Star,
  Bookmark,
  Eye,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PropertyListing } from '@/types/property';
import { User } from '@/types/auth';

interface PropertyActionsProps {
  property: PropertyListing;
  user?: User;
  onContactSeller: () => void;
  onScheduleViewing: () => void;
  onMakeOffer: () => void;
  onAddToFavorites: () => void;
  onSignUpPrompt: () => void;
  onPhoneVerification: () => void;
  isFavorite: boolean;
  hasUserOffer?: boolean;
  canMakeOffer?: boolean;
  userOfferStatus?: string;
}

export const PropertyActions: React.FC<PropertyActionsProps> = ({
  property,
  user,
  onContactSeller,
  onScheduleViewing,
  onMakeOffer,
  onAddToFavorites,
  onSignUpPrompt,
  onPhoneVerification,
  isFavorite,
  hasUserOffer = false,
  canMakeOffer = true,
  userOfferStatus
}) => {
  // Determine user's access level based on KYC
  const getAccessLevel = () => {
    if (!user) return 'none';
    if (!user.is_phone_verified) return 'email';
    if (user.kyc_level === 'complete') return 'financial';
    if (user.kyc_level === 'financial') return 'financial';
    if (user.kyc_level === 'identity') return 'identity';
    if (user.kyc_level === 'phone') return 'phone';
    return 'phone';
  };

  const accessLevel = getAccessLevel();

  // Check if user can contact seller
  const canContactSeller = accessLevel === 'phone' || accessLevel === 'identity' || accessLevel === 'financial';

  // Check if user needs phone verification for any action
  const needsPhoneVerification = user && !canContactSeller && !canMakeOffer;

  // Debug logging
  console.log('PropertyActions - User object:', user);
  console.log('PropertyActions - is_phone_verified:', user?.is_phone_verified);
  console.log('PropertyActions - kyc_level:', user?.kyc_level);
  console.log('PropertyActions - Access level determined:', accessLevel);
  console.log('PropertyActions - canContactSeller:', canContactSeller);
  console.log('PropertyActions - needsPhoneVerification:', needsPhoneVerification);

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div className="grid grid-cols-1 gap-3">
        {/* Contact Seller - Only show if user can contact or is not logged in */}
        {(!user || canContactSeller) && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={canContactSeller ? onContactSeller : onSignUpPrompt}
              className={`w-full h-14 font-semibold transition-all duration-200 ${
                canContactSeller 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 shadow-md'
              } text-white border-0 text-base`}
              disabled={!user}
            >
              <Phone className="w-5 h-5 mr-3" />
              {canContactSeller ? 'Contact Seller' : 'Sign Up to Contact'}
            </Button>
          </motion.div>
        )}

        {/* Schedule Viewing */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={user ? onScheduleViewing : onSignUpPrompt}
            variant="outline"
            className="w-full h-14 font-semibold border-2 border-purple-600 text-purple-600 hover:bg-purple-50 hover:border-purple-700 hover:text-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-base"
            disabled={!user}
          >
            <Calendar className="w-5 h-5 mr-3" />
            {user ? 'Schedule Viewing' : 'Sign Up to Schedule'}
          </Button>
        </motion.div>

        {/* Make Offer - Only show if user can make offers or is not logged in */}
        {(!user || canMakeOffer) && (
          <motion.div
            whileHover={{ scale: (hasUserOffer && userOfferStatus !== 'rejected') ? 1 : 1.02 }}
            whileTap={{ scale: (hasUserOffer && userOfferStatus !== 'rejected') ? 1 : 0.98 }}
          >
            <Button
              onClick={(hasUserOffer && userOfferStatus !== 'rejected') ? undefined : (canMakeOffer ? onMakeOffer : onSignUpPrompt)}
              className={`w-full h-14 font-semibold transition-all duration-200 ${
                (hasUserOffer && userOfferStatus !== 'rejected')
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed shadow-md'
                  : canMakeOffer 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 shadow-md'
              } text-white border-0 text-base`}
              disabled={!user || (hasUserOffer && userOfferStatus !== 'rejected')}
            >
              <DollarSign className="w-5 h-5 mr-3" />
              {(hasUserOffer && userOfferStatus !== 'rejected') 
                ? 'Offer Submitted' 
                : (hasUserOffer && userOfferStatus === 'rejected')
                  ? 'Make New Offer'
                  : (canMakeOffer ? 'Make Offer' : 'Sign Up to Offer')
              }
            </Button>
          </motion.div>
        )}
      </div>

      {/* Single Phone Verification Button (when needed) */}
      {needsPhoneVerification && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Button
            onClick={onPhoneVerification}
            className="w-full h-12 font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Verify Phone to Contact Seller & Make Offers
          </Button>
        </motion.div>
      )}

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Add to Favorites */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={user ? onAddToFavorites : onSignUpPrompt}
            variant="outline"
            className={`h-12 px-4 font-medium transition-all duration-200 ${
              isFavorite 
                ? 'border-2 border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600 shadow-md' 
                : 'border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 shadow-sm'
            }`}
          >
            <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500' : ''}`} />
            <span className="text-sm">{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
          </Button>
        </motion.div>


        {/* Share */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            className="h-12 px-4 font-medium border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 shadow-sm"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: property.title,
                  text: `Check out this property: ${property.title}`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                // You could add a toast notification here
              }
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            <span className="text-sm">Share</span>
          </Button>
        </motion.div>
      </div>

      {/* Access Level Indicator */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Your Access Level:</span>
          </div>
          <Badge 
            variant="outline" 
            className={`font-medium ${
              accessLevel === 'financial' ? 'border-green-500 text-green-600 bg-green-50' :
              accessLevel === 'identity' ? 'border-blue-500 text-blue-600 bg-blue-50' :
              accessLevel === 'phone' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
              accessLevel === 'email' ? 'border-orange-500 text-orange-600 bg-orange-50' :
              'border-gray-300 text-gray-500 bg-gray-50'
            }`}
          >
            {accessLevel === 'financial' ? 'Financial Verified' :
             accessLevel === 'identity' ? 'Identity Verified' :
             accessLevel === 'phone' ? 'Phone Verified' :
             accessLevel === 'email' ? 'Email Verified' :
             'Not Verified'}
          </Badge>
        </div>
        
        {/* Action Requirements */}
        <div className="space-y-2">
          {!canContactSeller && user && (
            <div className="flex items-center text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
              Verify phone number to contact seller and make offers
            </div>
          )}
          {!user && (
            <div className="flex items-center text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
              Sign up to access all property features
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
