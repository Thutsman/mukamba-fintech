'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Eye, 
  CheckCircle, 
  ArrowRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface IdentityVerificationNotificationProps {
  isVisible: boolean;
  onClose: () => void;
}

export const IdentityVerificationNotification: React.FC<IdentityVerificationNotificationProps> = ({
  isVisible,
  onClose
}) => {
  const router = useRouter();

  const handleBrowseProperties = () => {
    router.push('/listings');
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              
              <CardTitle className="text-xl text-slate-800">
                Identity Verification Submitted
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                Your documents have been received and are under review
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Status Message */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-yellow-800">Under Review</h3>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  Our verification team will review your documents within the next 24-48 hours. 
                  You'll receive an email notification once the review is complete.
                </p>
                <div className="space-y-2 text-sm text-yellow-700">
                  <div className="flex justify-between">
                    <span>Submitted on:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected completion:</span>
                    <span>{new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* While You Wait Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  While you wait:
                </h4>
                <p className="text-sm text-blue-700">
                  You may continue browsing properties on our platform. Your account will be 
                  automatically updated once verification is complete.
                </p>
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                <Button
                  onClick={handleBrowseProperties}
                  className="w-full bg-[#7F1518] hover:bg-[#6A1214] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  size="lg"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Browse Properties
                </Button>
              </div>

              {/* Additional Info */}
              <div className="text-center">
                <p className="text-xs text-slate-500">
                  Your verification status will be updated automatically once approved
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
