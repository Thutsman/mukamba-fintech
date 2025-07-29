'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Check } from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import type { CreditScoreData } from '@/types/auth';

interface CreditScoreGeneratorProps {
  creditData: CreditScoreData;
  isLoading?: boolean;
  className?: string;
}

export const CreditScoreGenerator: React.FC<CreditScoreGeneratorProps> = ({
  creditData,
  isLoading = false,
  className
}) => {
  const [animatedScore, setAnimatedScore] = React.useState(0);
  const [showFactors, setShowFactors] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && creditData.score > 0) {
      // Animate score counting up
      const duration = 2000;
      const steps = 50;
      const increment = creditData.score / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= creditData.score) {
          setAnimatedScore(creditData.score);
          setShowFactors(true);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [creditData.score, isLoading]);

  const getScoreColor = (score: number): string => {
    if (score >= 800) return '#10b981'; // Excellent - Green
    if (score >= 740) return '#059669'; // Very Good - Dark Green
    if (score >= 670) return '#f59e0b'; // Good - Orange
    if (score >= 580) return '#d97706'; // Fair - Dark Orange
    return '#ef4444'; // Poor - Red
  };

  const getRatingDescription = (rating: CreditScoreData['rating']): string => {
    switch (rating) {
      case 'Excellent':
        return 'Outstanding credit profile. You qualify for the best rates and terms.';
      case 'Very Good':
        return 'Strong credit profile. You qualify for competitive rates.';
      case 'Good':
        return 'Good credit profile. You qualify for most financial products.';
      case 'Fair':
        return 'Fair credit profile. Some limitations may apply.';
      case 'Poor':
        return 'Credit profile needs improvement. Limited options available.';
    }
  };

  const factorItems = [
    {
      label: 'Monthly Income',
      value: creditData.factors.income,
      icon: creditData.factors.income > 50 ? TrendingUp : creditData.factors.income > 25 ? Minus : TrendingDown,
      color: creditData.factors.income > 50 ? 'text-success-500' : creditData.factors.income > 25 ? 'text-warning-500' : 'text-primary-500'
    },
    {
      label: 'Age Factor',
      value: creditData.factors.age,
      icon: creditData.factors.age > 50 ? TrendingUp : creditData.factors.age > 25 ? Minus : TrendingDown,
      color: creditData.factors.age > 50 ? 'text-success-500' : creditData.factors.age > 25 ? 'text-warning-500' : 'text-primary-500'
    },
    {
      label: 'Employment Status',
      value: creditData.factors.employment,
      icon: creditData.factors.employment > 50 ? TrendingUp : creditData.factors.employment > 25 ? Minus : TrendingDown,
      color: creditData.factors.employment > 50 ? 'text-success-500' : creditData.factors.employment > 25 ? 'text-warning-500' : 'text-primary-500'
    }
  ];

  if (isLoading) {
    return (
      <div className={cn('p-6 text-center', className)}>
        <div className="flex items-center justify-center mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <ProgressRing value={50} size={120} color="#ef4444" />
          </motion.div>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Calculating Credit Score
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Analyzing your financial profile...
        </p>
      </div>
    );
  }

  return (
    <div className={cn('p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg', className)}>
      {/* Credit Score Display */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <ProgressRing
              value={(animatedScore / 850) * 100}
              size={120}
              strokeWidth={8}
              color={getScoreColor(creditData.score)}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  className="text-2xl font-bold text-slate-800 dark:text-slate-200"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  {animatedScore}
                </motion.div>
                <div className="text-xs text-slate-500">/ 850</div>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            {creditData.rating} Credit Score
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {getRatingDescription(creditData.rating)}
          </p>
        </motion.div>
      </div>

      {/* Credit Factors */}
      {showFactors && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Score Factors
          </h4>
          <div className="space-y-3">
            {factorItems.map((factor, index) => (
              <motion.div
                key={factor.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2 + index * 0.2, duration: 0.3 }}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex items-center">
                  <factor.icon className={cn('w-5 h-5 mr-3', factor.color)} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {factor.label}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mr-2">
                    +{factor.value}
                  </span>
                  <div className="w-16 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <motion.div
                      className={cn('h-2 rounded-full', {
                        'bg-success-500': factor.value > 50,
                        'bg-warning-500': factor.value > 25 && factor.value <= 50,
                        'bg-primary-500': factor.value <= 25
                      })}
                      initial={{ width: 0 }}
                      animate={{ width: `${(factor.value / 100) * 100}%` }}
                      transition={{ delay: 2.5 + index * 0.2, duration: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Approval Status */}
      {showFactors && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.5 }}
          className="mt-6 p-4 bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-lg border border-success-200 dark:border-success-800"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center mr-3">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h5 className="font-semibold text-success-800 dark:text-success-200">
                Pre-qualification Approved
              </h5>
              <p className="text-sm text-success-700 dark:text-success-300">
                You meet our initial requirements for rent-to-buy programs.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}; 