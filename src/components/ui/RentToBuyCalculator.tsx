'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  DollarSign, 
  Home, 
  TrendingUp, 
  Clock, 
  PiggyBank,
  ArrowRight,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Property, RentToBuyCalculation } from '@/types/property';
import { calculateRentToBuy } from '@/lib/property-services';

interface RentToBuyCalculatorProps {
  property?: Property;
  className?: string;
  onCalculationChange?: (calculation: RentToBuyCalculation | null) => void;
}

export const RentToBuyCalculator: React.FC<RentToBuyCalculatorProps> = ({
  property,
  className = '',
  onCalculationChange
}) => {
  const [inputs, setInputs] = React.useState({
    purchasePrice: property?.listPrice || 750000,
    monthlyRent: property?.monthlyRent || 3200,
    rentCreditPercentage: property?.rentToBuy?.rentCreditPercentage || 25,
    optionPeriod: property?.rentToBuy?.optionPeriod || 36,
    downPaymentAmount: property?.rentToBuy?.minimumDownPayment || 50000,
    interestRate: 4.5,
    loanTerm: 25,
  });

  const [calculation, setCalculation] = React.useState<RentToBuyCalculation | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);

  // Recalculate when inputs change
  React.useEffect(() => {
    if (property) {
      setIsCalculating(true);
      const timer = setTimeout(() => {
        const result = calculateRentToBuy(property, inputs);
        setCalculation(result);
        onCalculationChange?.(result);
        setIsCalculating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [inputs, property, onCalculationChange]);

  const handleInputChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (!property || !property.rentToBuyOption) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Rent-to-Buy Calculator
          </h3>
          <p className="text-slate-500">
            Select a property with rent-to-buy option to use the calculator
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calculator Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-red-600" />
            Rent-to-Buy Calculator
            <div className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
              Interactive
            </div>
          </CardTitle>
          <p className="text-sm text-slate-600">
            Adjust the parameters below to see how rent-to-buy compares to traditional renting
          </p>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scenario Parameters</CardTitle>
            <p className="text-sm text-slate-600">
              Customize the calculation based on your situation
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Purchase Price */}
            <div className="space-y-2">
              <Label htmlFor="purchasePrice" className="flex items-center">
                <Home className="w-4 h-4 mr-1" />
                Purchase Price
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                value={inputs.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                className="text-lg font-medium"
              />
              <p className="text-xs text-slate-500">
                The agreed purchase price of the property
              </p>
            </div>

            {/* Monthly Rent */}
            <div className="space-y-2">
              <Label htmlFor="monthlyRent" className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Monthly Rent Payment
              </Label>
              <Input
                id="monthlyRent"
                type="number"
                value={inputs.monthlyRent}
                onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
                className="text-lg font-medium"
              />
              <p className="text-xs text-slate-500">
                Your monthly rental payment during the option period
              </p>
            </div>

            {/* Rent Credit Percentage */}
            <div className="space-y-2">
              <Label htmlFor="rentCreditPercentage" className="flex items-center">
                <PiggyBank className="w-4 h-4 mr-1" />
                Rent Credit Percentage
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="rentCreditPercentage"
                  type="number"
                  min="0"
                  max="50"
                  value={inputs.rentCreditPercentage}
                  onChange={(e) => handleInputChange('rentCreditPercentage', Number(e.target.value))}
                  className="text-lg font-medium"
                />
                <span className="text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500">
                Percentage of rent that goes toward your down payment
              </p>
            </div>

            {/* Option Period */}
            <div className="space-y-2">
              <Label htmlFor="optionPeriod" className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Option Period
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="optionPeriod"
                  type="number"
                  min="12"
                  max="60"
                  value={inputs.optionPeriod}
                  onChange={(e) => handleInputChange('optionPeriod', Number(e.target.value))}
                  className="text-lg font-medium"
                />
                <span className="text-slate-500">months</span>
              </div>
              <p className="text-xs text-slate-500">
                How long you'll rent before deciding to purchase
              </p>
            </div>

            {/* Down Payment */}
            <div className="space-y-2">
              <Label htmlFor="downPaymentAmount" className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Additional Down Payment
              </Label>
              <Input
                id="downPaymentAmount"
                type="number"
                value={inputs.downPaymentAmount}
                onChange={(e) => handleInputChange('downPaymentAmount', Number(e.target.value))}
                className="text-lg font-medium"
              />
              <p className="text-xs text-slate-500">
                Cash down payment in addition to accumulated rent credits
              </p>
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <Label htmlFor="interestRate" className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Mortgage Interest Rate
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={inputs.interestRate}
                  onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                  className="text-lg font-medium"
                />
                <span className="text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500">
                Expected mortgage interest rate
              </p>
            </div>

            {/* Loan Term */}
            <div className="space-y-2">
              <Label htmlFor="loanTerm" className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Mortgage Term
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="loanTerm"
                  type="number"
                  min="15"
                  max="30"
                  value={inputs.loanTerm}
                  onChange={(e) => handleInputChange('loanTerm', Number(e.target.value))}
                  className="text-lg font-medium"
                />
                <span className="text-slate-500">years</span>
              </div>
              <p className="text-xs text-slate-500">
                Length of your mortgage loan
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="space-y-4">
          <AnimatePresence>
            {isCalculating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardContent className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Calculator className="w-8 h-8 text-red-500 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-slate-600">Calculating your scenario...</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : calculation ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-700">
                      Your Rent-to-Buy Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Rent Credit Accumulation */}
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <PiggyBank className="w-5 h-5 text-green-600 mr-2" />
                          <span className="font-medium">Rent Credits Earned</span>
                        </div>
                        <span className="text-xl font-bold text-green-700">
                          {formatCurrency(calculation.results.rentCreditAccumulated)}
                        </span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        {formatPercentage(inputs.rentCreditPercentage)} of {formatCurrency(inputs.monthlyRent)}/month × {inputs.optionPeriod} months
                      </p>
                    </div>

                    {/* Monthly Mortgage Payment */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Home className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="font-medium">Future Mortgage Payment</span>
                        </div>
                        <span className="text-xl font-bold text-blue-700">
                          {formatCurrency(calculation.results.monthlyMortgagePayment)}
                        </span>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">
                        After {formatCurrency(calculation.results.rentCreditAccumulated + inputs.downPaymentAmount)} down payment
                      </p>
                    </div>

                    {/* Total Savings */}
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingUp className="w-5 h-5 text-yellow-600 mr-2" />
                          <span className="font-medium">Potential Savings</span>
                        </div>
                        <span className="text-xl font-bold text-yellow-700">
                          {formatCurrency(Math.max(0, calculation.results.savings))}
                        </span>
                      </div>
                      <p className="text-sm text-yellow-600 mt-1">
                        vs. traditional renting + equity built
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total rent paid during option period:</span>
                        <span className="font-medium">{formatCurrency(calculation.results.totalRentPaid)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Rent credits accumulated:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(calculation.results.rentCreditAccumulated)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Additional down payment:</span>
                        <span className="font-medium">{formatCurrency(inputs.downPaymentAmount)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total down payment:</span>
                        <span className="font-medium font-bold">
                          {formatCurrency(calculation.results.rentCreditAccumulated + inputs.downPaymentAmount)}
                        </span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Remaining mortgage balance:</span>
                        <span className="font-medium">{formatCurrency(calculation.results.remainingBalance)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Monthly mortgage payment:</span>
                        <span className="font-medium">{formatCurrency(calculation.results.monthlyMortgagePayment)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Property value (equity built):</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(calculation.results.equityBuilt)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total cost of ownership:</span>
                        <span className="font-medium">{formatCurrency(calculation.results.totalCostOfOwnership)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Traditional renting cost:</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(calculation.results.traditionalRentComparison)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendation */}
                <Card>
                  <CardContent className="p-6">
                    {calculation.results.savings > 0 ? (
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-green-700 mb-1">
                            Rent-to-Buy is Recommended
                          </h4>
                          <p className="text-sm text-slate-600">
                            Based on your inputs, rent-to-buy could save you{' '}
                            <span className="font-bold text-green-600">
                              {formatCurrency(calculation.results.savings)}
                            </span>{' '}
                            compared to traditional renting, while building equity in a home.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-orange-700 mb-1">
                            Consider Your Options
                          </h4>
                          <p className="text-sm text-slate-600">
                            Based on current parameters, traditional renting might be more cost-effective. 
                            However, rent-to-buy still builds equity and provides path to homeownership.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}; 