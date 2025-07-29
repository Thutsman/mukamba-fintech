'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
  className
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <motion.div
                  className={cn(
                    'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                    {
                      'bg-primary-500 border-primary-500 text-white': isCompleted,
                      'bg-primary-500 border-primary-500 text-white ring-4 ring-primary-100': isCurrent,
                      'bg-white border-slate-300 text-slate-400': isUpcoming
                    }
                  )}
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted ? '#ef4444' : isCurrent ? '#ef4444' : '#ffffff'
                  }}
                  transition={{ duration: 0.3 }}
                  role="button"
                  aria-label={`Step ${index + 1}: ${step.title}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                    >
                      <Check size={16} />
                    </motion.div>
                  ) : (
                    <span className="text-sm font-semibold">
                      {index + 1}
                    </span>
                  )}
                </motion.div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      'text-sm font-medium transition-colors duration-300',
                      {
                        'text-primary-600': isCompleted || isCurrent,
                        'text-slate-500': isUpcoming
                      }
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-slate-400 mt-1 max-w-24">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="relative h-0.5 bg-slate-200">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-primary-500"
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: index < currentStep ? '100%' : '0%' 
                      }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 w-full bg-slate-200 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
          initial={{ width: '0%' }}
          animate={{ 
            width: `${((currentStep) / (steps.length - 1)) * 100}%` 
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </div>

      {/* Progress Text */}
      <div className="mt-2 text-center text-sm text-slate-600">
        Step {currentStep + 1} of {steps.length}
      </div>
    </div>
  );
}; 