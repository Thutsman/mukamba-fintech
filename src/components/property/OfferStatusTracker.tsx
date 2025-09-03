import React from 'react';

interface Offer {
  id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  submittedAt: string;
  counterOffer?: number;
}

interface OfferStatusTrackerProps {
  offers?: Offer[];
  propertyId?: string;
}

const OfferStatusTracker: React.FC<OfferStatusTrackerProps> = ({ offers = [] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'countered':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Offer Status</h3>
        <p className="text-gray-600">No offers submitted yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Your Offers</h3>
      <div className="space-y-4">
        {offers.map((offer) => (
          <div key={offer.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">${offer.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">
                  Submitted {new Date(offer.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
              </span>
            </div>
            {offer.counterOffer && (
              <p className="text-sm text-blue-600">
                Counter offer: ${offer.counterOffer.toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export { OfferStatusTracker };
