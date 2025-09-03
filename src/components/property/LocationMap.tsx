import React from 'react';

interface PropertyListing {
  id: string;
  title: string;
  address: string;
  latitude?: number;
  longitude?: number;
  // Add other property fields as needed
  [key: string]: any;
}

interface LocationMapProps {
  property: PropertyListing;
  address?: string;
  latitude?: number;
  longitude?: number;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  property, 
  address, 
  latitude, 
  longitude 
}) => {
  // Use property data if available, otherwise fall back to individual props
  const displayAddress = property?.address || address || 'Location not specified';
  const lat = property?.latitude || latitude;
  const lng = property?.longitude || longitude;

  return (
    <div className="space-y-4">
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center border">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Interactive Map</p>
          <p className="text-sm text-gray-500 mt-1">{displayAddress}</p>
          {lat && lng && (
            <p className="text-xs text-gray-400 mt-1">
              Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>
      
      {/* Property location details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Location Details</h4>
        <p className="text-gray-700">{displayAddress}</p>
        {property?.neighborhood && (
          <p className="text-sm text-gray-600 mt-1">
            Neighborhood: {property.neighborhood}
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationMap;
