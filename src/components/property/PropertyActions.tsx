'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Calendar, 
  DollarSign, 
  MessageCircle,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Star,
  Bookmark,
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
  onSignUpPrompt: () => void;
  onPhoneVerification: () => void;
  hasUserOffer?: boolean;
  canMakeOffer?: boolean;
  userOfferStatus?: string;
  showScheduleViewing?: boolean;
  isIdentityPending?: boolean;
}

export const PropertyActions: React.FC<PropertyActionsProps> = ({
  property,
  user,
  onContactSeller,
  onScheduleViewing,
  onMakeOffer,
  onSignUpPrompt,
  onPhoneVerification,
  hasUserOffer = false,
  canMakeOffer = true,
  userOfferStatus,
  showScheduleViewing = true,
  isIdentityPending = false
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
        {/* Contact Seller and Make Offer - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Send Message Button */}
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
                disabled={false}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {canContactSeller ? 'Send Message' : 'Sign in to Message'}
              </Button>
            </motion.div>
          )}

          {/* Make Offer Button */}
          <motion.div
            whileHover={{ scale: (hasUserOffer && userOfferStatus !== 'rejected') || isIdentityPending ? 1 : 1.02 }}
            whileTap={{ scale: (hasUserOffer && userOfferStatus !== 'rejected') || isIdentityPending ? 1 : 0.98 }}
          >
            <Button
            onClick={(hasUserOffer && userOfferStatus !== 'rejected') || isIdentityPending
              ? undefined 
              : (user ? onMakeOffer : onSignUpPrompt)}
              className={`w-full h-14 font-semibold transition-all duration-200 ${
                (hasUserOffer && userOfferStatus !== 'rejected')
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed shadow-md'
                : isIdentityPending
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-md'
                : (user && !canMakeOffer)
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 shadow-md'
                  : canMakeOffer 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 shadow-md'
              } text-white border-0 text-base`}
            disabled={(hasUserOffer && userOfferStatus !== 'rejected') || isIdentityPending}
            >
              {isIdentityPending ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-pulse" />
                  Under Review
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5 mr-2" />
                  {(hasUserOffer && userOfferStatus !== 'rejected') 
                    ? 'Offer Submitted' 
                    : (hasUserOffer && userOfferStatus === 'rejected')
                      ? 'Make New Offer'
                      : (user ? 'Make Offer' : 'Sign in to Make Offer')
                  }
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Schedule Viewing (optional) */}
        {showScheduleViewing && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={user ? onScheduleViewing : onSignUpPrompt}
              variant="outline"
              className="w-full h-14 font-semibold border-2 border-purple-600 text-purple-600 hover:bg-purple-50 hover:border-purple-700 hover:text-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-base"
              disabled={false}
            >
              <Calendar className="w-5 h-5 mr-3" />
              {user ? 'Schedule Viewing' : 'Sign in to Schedule'}
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
          {user && user.is_phone_verified && !user.isIdentityVerified && !isIdentityPending && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                Verify identity to make offers
              </div>
              <Button size="sm" variant="outline" onClick={onMakeOffer} className="h-7 px-2">
                Start
              </Button>
            </div>
          )}
          {isIdentityPending && (
            <div className="flex items-center text-sm text-yellow-600">
              <Clock className="w-4 h-4 mr-2 text-yellow-500 animate-pulse" />
              Identity verification under review - You'll hear from us within 24-48 hours
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
