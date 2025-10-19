'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  Sparkles, 
  Lightbulb,
  Shield,
  User,
  Camera
} from 'lucide-react';

interface VerificationTimelineProps {
  className?: string;
}

export const VerificationTimeline: React.FC<VerificationTimelineProps> = ({ className = '' }) => {
  const timelineSteps = [
    {
      icon: <Shield className="w-5 h-5 text-green-600" />,
      title: "Documents uploaded and auto-checked immediately",
      description: "Our system instantly analyzes your photos for quality and face matching",
      status: "completed"
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      title: "Admin review: typically within 24-48 hours (if needed)",
      description: "If auto-approval isn't possible, our team will manually review your documents",
      status: "pending"
    },
    {
      icon: <Mail className="w-5 h-5 text-blue-600" />,
      title: "You'll receive email notification when approved",
      description: "We'll send you a confirmation email as soon as your identity is verified",
      status: "pending"
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      title: "Start using premium features",
      description: "Access exclusive properties, financing options, and priority support",
      status: "pending"
    }
  ];

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          What to Expect
        </h3>
        <p className="text-sm text-slate-600">
          Here's what happens after you submit your documents
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {timelineSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-4"
          >
            {/* Timeline line and icon */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step.status === 'completed' 
                  ? 'bg-green-100 border-green-300' 
                  : 'bg-blue-100 border-blue-300'
              }`}>
                {step.icon}
              </div>
              {index < timelineSteps.length - 1 && (
                <div className={`w-0.5 h-8 mt-2 ${
                  step.status === 'completed' ? 'bg-green-300' : 'bg-blue-200'
                }`} />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-4">
              <h4 className={`font-medium text-sm ${
                step.status === 'completed' ? 'text-green-800' : 'text-slate-800'
              }`}>
                {step.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Helpful tip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
      >
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">
              💡 Helpful Tip
            </p>
            <p className="text-xs text-amber-700">
              High-quality, well-lit photos with clear text and faces speed up approval. 
              Make sure your ID document is fully visible and not blurry.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
