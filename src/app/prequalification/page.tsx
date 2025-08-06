'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  CheckCircle, 
  DollarSign, 
  Shield,
  ArrowLeft,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PrequalificationPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePrequalify = async () => {
    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Prequalification completed! You are approved for rent-to-buy financing.');
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Property
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Instant Prequalification
            </h1>
            <p className="text-slate-600">
              Get pre-approved for rent-to-buy financing in under 2 minutes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prequalification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-600" />
                Quick Prequalification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Verified Buyer</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your KYC verification is complete. We'll use your verified information for instant prequalification.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Your Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Monthly Income:</span>
                        <span className="font-medium">$8,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Credit Score:</span>
                        <span className="font-medium">750</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Employment Status:</span>
                        <span className="font-medium">Full-time</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Property Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Property Price:</span>
                        <span className="font-medium">$250,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Monthly Rental:</span>
                        <span className="font-medium">$2,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Rent Credit:</span>
                        <span className="font-medium">70%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handlePrequalify}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Prequalify Instantly
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Prequalification Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Instant Approval</h4>
                      <p className="text-sm text-slate-600">Get pre-approved in under 2 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">No Credit Check</h4>
                      <p className="text-sm text-slate-600">We use your verified income and employment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Rent Credit</h4>
                      <p className="text-sm text-slate-600">70% of your rent goes toward the purchase</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Flexible Terms</h4>
                      <p className="text-sm text-slate-600">Choose your down payment and term length</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Estimated Approval
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      $2,500/month
                    </div>
                    <div className="text-sm text-blue-700">
                      Estimated monthly payment
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Down Payment:</span>
                      <span className="font-medium">$25,000 (10%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Rent Credit:</span>
                      <span className="font-medium">$1,750/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Time to Ownership:</span>
                      <span className="font-medium">~8 years</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 