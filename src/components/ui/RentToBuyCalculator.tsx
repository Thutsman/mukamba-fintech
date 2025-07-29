import React from 'react';
import { Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyListing } from '@/types/property';

interface RentToBuyCalculation {
  totalRentPaid: number;
  rentCredit: number;
  remainingBalance: number;
  equityBuilt: number;
  percentageOwned: number;
  monthlyRent: number;
  purchasePrice: number;
  timeframe: number;
}

interface RentToBuyCalculatorProps {
  property?: PropertyListing;
  className?: string;
  onCalculationChange?: (calculation: RentToBuyCalculation | null) => void;
}

export const RentToBuyCalculator: React.FC<RentToBuyCalculatorProps> = ({
  property,
  className = '',
  onCalculationChange
}) => {
  if (!property || property.listingType !== 'rent-to-buy') {
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
    <Card className={className}>
      <CardContent className="p-8 text-center">
        <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          Rent-to-Buy Calculator
        </h3>
        <p className="text-slate-500">
          Calculator functionality coming soon
        </p>
      </CardContent>
    </Card>
  );
}; 