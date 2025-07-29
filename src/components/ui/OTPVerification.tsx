'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Phone, Mail, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from './button';

interface OTPVerificationProps {
  type: 'phone' | 'email';
  contactInfo: string;
  onVerify: (code: string) => Promise<boolean>;
  onResend: () => Promise<boolean>;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  type,
  contactInfo,
  onVerify,
  onResend,
  isLoading = false,
  error,
  className
}) => {
  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = React.useState(300); // 5 minutes
  const [isVerified, setIsVerified] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  React.useEffect(() => {
    if (timeLeft > 0 && !isVerified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isVerified]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digits
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode: string) => {
    try {
      const success = await onVerify(otpCode);
      if (success) {
        setIsVerified(true);
      }
    } catch (error) {
      // Error handled by parent component
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const success = await onResend();
      if (success) {
        setTimeLeft(300); // Reset timer
        setCode(['', '', '', '', '', '']); // Clear code
        inputRefs.current[0]?.focus(); // Focus first input
      }
    } catch (error) {
      // Error handled by parent component
    } finally {
      setIsResending(false);
    }
  };

  const maskContactInfo = (info: string, type: 'phone' | 'email'): string => {
    if (type === 'email') {
      const [username, domain] = info.split('@');
      return `${username.charAt(0)}${'*'.repeat(username.length - 2)}${username.charAt(username.length - 1)}@${domain}`;
    } else {
      return `${info.slice(0, 3)}****${info.slice(-2)}`;
    }
  };

  if (isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('p-6 text-center bg-success-50 dark:bg-success-900/20 rounded-xl border border-success-200 dark:border-success-800', className)}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold text-success-800 dark:text-success-200 mb-2">
          Verification Successful
        </h3>
        <p className="text-sm text-success-700 dark:text-success-300">
          Your {type} has been verified successfully.
        </p>
      </motion.div>
    );
  }

  return (
    <div className={cn('p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg', className)}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          {type === 'phone' ? (
            <Phone className="w-8 h-8 text-primary-600" />
          ) : (
            <Mail className="w-8 h-8 text-primary-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Verify Your {type === 'phone' ? 'Phone Number' : 'Email Address'}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          We've sent a 6-digit code to{' '}
          <span className="font-medium">{maskContactInfo(contactInfo, type)}</span>
        </p>
      </div>

      {/* OTP Input Fields */}
      <div className="flex justify-center space-x-3 mb-6">
        {code.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              'w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg transition-all duration-200 focus:outline-none',
              {
                'border-slate-300 dark:border-slate-600 focus:border-primary-500 dark:focus:border-primary-400': !error,
                'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400': error,
                'bg-slate-50 dark:bg-slate-700': !digit,
                'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-600': digit && !error
              }
            )}
            disabled={isLoading || isVerified}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center text-sm text-red-600 dark:text-red-400 mb-4"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </motion.div>
      )}

      {/* Timer and Resend */}
      <div className="text-center">
        {timeLeft > 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Code expires in{' '}
            <span className="font-medium text-primary-600 dark:text-primary-400">
              {formatTime(timeLeft)}
            </span>
          </p>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            Code has expired. Please request a new one.
          </p>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={isResending || (timeLeft > 240)} // Allow resend only after 1 minute
          className="text-primary-600 hover:text-primary-700"
        >
          {isResending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend Code
            </>
          )}
        </Button>

        {timeLeft > 240 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            You can request a new code in {formatTime(timeLeft - 240)}
          </p>
        )}
      </div>

      {/* Manual Verify Button (if needed) */}
      {code.every(digit => digit !== '') && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Button
            onClick={() => handleVerify(code.join(''))}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}; 