'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Building,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  Phone,
  Mail,
  Download,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ApplicationStatus as AppStatus } from './ApplicationForm';

interface ApplicationStatusProps {
  applicationId: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    price: number;
    imageUrl?: string;
  };
  status: AppStatus;
  submittedDate: Date;
  estimatedReviewTime: number; // in days
  onBack: () => void;
  onContactAgent: () => void;
  onDownloadDocuments: () => void;
}

const STATUS_STEPS = [
  { id: 'draft', title: 'Draft', icon: FileText, description: 'Application in progress' },
  { id: 'submitted', title: 'Submitted', icon: CheckCircle, description: 'Application submitted successfully' },
  { id: 'under_review', title: 'Under Review', icon: Clock, description: 'Application being reviewed' },
  { id: 'approved', title: 'Approved', icon: CheckCircle, description: 'Application approved' },
  { id: 'rejected', title: 'Rejected', icon: X, description: 'Application rejected' },
  { id: 'counter_offer', title: 'Counter Offer', icon: AlertCircle, description: 'Counter offer received' }
];

const STATUS_CONFIG = {
  [AppStatus.DRAFT]: { color: 'bg-slate-100 text-slate-800', icon: FileText },
  [AppStatus.SUBMITTED]: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  [AppStatus.UNDER_REVIEW]: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  [AppStatus.APPROVED]: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  [AppStatus.REJECTED]: { color: 'bg-red-100 text-red-800', icon: X },
  [AppStatus.COUNTER_OFFER]: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle }
};

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({
  applicationId,
  property,
  status,
  submittedDate,
  estimatedReviewTime,
  onBack,
  onContactAgent,
  onDownloadDocuments
}) => {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(() => {
    const stepIndex = STATUS_STEPS.findIndex(step => step.id === status);
    return stepIndex >= 0 ? stepIndex : 0;
  });

  const progressPercentage = ((currentStepIndex + 1) / STATUS_STEPS.length) * 100;

  const getStatusIcon = (stepId: string) => {
    const step = STATUS_STEPS.find(s => s.id === stepId);
    return step?.icon || FileText;
  };

  const isStepCompleted = (stepIndex: number) => {
    const stepId = STATUS_STEPS[stepIndex].id;
    const statusOrder = ['draft', 'submitted', 'under_review', 'approved', 'counter_offer'];
    const currentStatusIndex = statusOrder.indexOf(status);
    const stepStatusIndex = statusOrder.indexOf(stepId);
    return stepStatusIndex <= currentStatusIndex;
  };

  const isStepActive = (stepIndex: number) => {
    return STATUS_STEPS[stepIndex].id === status;
  };

  const getEstimatedCompletionDate = () => {
    const completionDate = new Date(submittedDate);
    completionDate.setDate(completionDate.getDate() + estimatedReviewTime);
    return completionDate;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <h1 className="text-xl font-semibold text-slate-900">Application Status</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadDocuments}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Documents
              </Button>
              <Button
                size="sm"
                onClick={onContactAgent}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Agent
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Application Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">{property.title}</h3>
                <p className="text-slate-600 mb-4">{property.address}, {property.city}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500">Application ID:</span>
                  <span className="font-mono text-slate-700">{applicationId}</span>
                </div>
                <div className="flex items-center gap-4 text-sm mt-2">
                  <span className="text-slate-500">Submitted:</span>
                  <span className="text-slate-700">{submittedDate.toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    R{property.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-500">Property Price</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Application Progress</span>
              <Badge className={STATUS_CONFIG[status].color}>
                {STATUS_CONFIG[status].icon && (() => {
                  const Icon = STATUS_CONFIG[status].icon;
                  return <Icon className="w-3 h-3 mr-1" />;
                })()}
                {status.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm text-slate-500 mt-2">
                <span>Submitted</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
            </div>

            <div className="space-y-4">
              {STATUS_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = isStepCompleted(index);
                const isActive = isStepActive(index);
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      isActive ? 'bg-blue-50 border-blue-200' :
                      isCompleted ? 'bg-green-50 border-green-200' :
                      'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isActive ? 'bg-blue-500 text-white' :
                      isCompleted ? 'bg-green-500 text-white' :
                      'bg-slate-300 text-slate-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        isActive ? 'text-blue-900' :
                        isCompleted ? 'text-green-900' :
                        'text-slate-700'
                      }`}>
                        {step.title}
                      </h4>
                      <p className={`text-sm ${
                        isActive ? 'text-blue-700' :
                        isCompleted ? 'text-green-700' :
                        'text-slate-500'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                    {isActive && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Current
                      </Badge>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Timeline and Updates */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timeline & Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900">Application Submitted</h4>
                    <span className="text-sm text-slate-500">{submittedDate.toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Your application has been successfully submitted and is now in our review queue.
                  </p>
                </div>
              </div>

              {status !== AppStatus.DRAFT && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900">Under Review</h4>
                      <span className="text-sm text-slate-500">
                        {new Date(submittedDate.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Our team is currently reviewing your application and supporting documents.
                    </p>
                  </div>
                </div>
              )}

              {status === AppStatus.APPROVED && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900">Application Approved</h4>
                      <span className="text-sm text-slate-500">Today</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Congratulations! Your application has been approved. We'll contact you shortly with next steps.
                    </p>
                  </div>
                </div>
              )}

              {status === AppStatus.REJECTED && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900">Application Rejected</h4>
                      <span className="text-sm text-slate-500">Today</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Unfortunately, your application was not approved. Please contact us for more information.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estimated Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Estimated Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Review Process</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Document Review:</span>
                    <span className="text-slate-900">1-2 business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Credit Check:</span>
                    <span className="text-slate-900">1 business day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Final Decision:</span>
                    <span className="text-slate-900">1 business day</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Expected Completion</h4>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-900">
                    {getEstimatedCompletionDate().toLocaleDateString()}
                  </div>
                  <div className="text-sm text-blue-700">
                    {estimatedReviewTime} business days from submission
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Phone className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium text-slate-900 mb-1">Call Us</h4>
                <p className="text-sm text-slate-600">+27 11 123 4567</p>
                <p className="text-xs text-slate-500">Mon-Fri, 8AM-6PM</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Mail className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium text-slate-900 mb-1">Email Us</h4>
                <p className="text-sm text-slate-600">support@mukamba.com</p>
                <p className="text-xs text-slate-500">24/7 Support</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium text-slate-900 mb-1">Live Chat</h4>
                <p className="text-sm text-slate-600">Chat with Agent</p>
                <p className="text-xs text-slate-500">Instant Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
