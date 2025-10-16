'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Mail, AlertCircle, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SuccessPopupProps {
  isVisible: boolean;
  onClose: () => void;
  email?: string;
  title?: string;
  message?: string;
  showSpamGuidance?: boolean;
  autoCloseDelay?: number;
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({
  isVisible,
  onClose,
  email,
  title = "Account Created Successfully! 🎉",
  message = "Your account has been created and you're ready to start exploring!",
  showSpamGuidance = true,
  autoCloseDelay = 8000
}) => {
  const [timeLeft, setTimeLeft] = React.useState(autoCloseDelay / 1000);

  React.useEffect(() => {
    if (isVisible && autoCloseDelay > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible, autoCloseDelay, onClose]);

  React.useEffect(() => {
    if (isVisible) {
      setTimeLeft(autoCloseDelay / 1000);
    }
  }, [isVisible, autoCloseDelay]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white dark:bg-white border-0 shadow-2xl overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-green-100 text-sm">Welcome to Mukamba Gateway!</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              {/* Main message */}
              <div className="text-center">
                <p className="text-slate-700 text-base leading-relaxed">
                  {message}
                </p>
                {email && (
                  <p className="text-slate-600 text-sm mt-2">
                    We've sent a confirmation email to <span className="font-semibold text-slate-800">{email}</span>
                  </p>
                )}
              </div>

              {/* Spam folder guidance */}
              {showSpamGuidance && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 text-sm mb-2">
                        📬 Can't find the email?
                      </h4>
                      <p className="text-amber-800 text-sm leading-relaxed">
                        <strong>Check your spam/junk folder!</strong> Sometimes emails from Mukamba Gateway land there. 
                        If you find it, mark it as "Not Spam" to receive future emails in your inbox.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email confirmation section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 text-sm mb-2">
                      📧 Check Your Email
                    </h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      Please check your email and click the confirmation link to activate your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col space-y-3 pt-2">
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3"
                >
                  Got it! Let's continue
                </Button>
                
                {email && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Open email client
                      window.open(`mailto:${email}`, '_blank');
                    }}
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Open Email App
                  </Button>
                )}
              </div>

              {/* Auto-close indicator */}
              {autoCloseDelay > 0 && timeLeft > 0 && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 text-xs text-slate-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>This popup will close automatically in {timeLeft}s</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
