import React from 'react';
import { PropertyListing } from '@/types/property';

interface LocationMapProps {
  property: PropertyListing;
}

const LocationMap: React.FC<LocationMapProps> = ({ property }) => {
  // Extract address from the property's location structure
  const displayAddress = `${property.location.suburb}, ${property.location.city}`;
  
  const coordinates = property?.location?.coordinates;
  const lat = coordinates?.latitude;
  const lng = coordinates?.longitude;

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
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p>City: {property.location.city}</p>
          <p>Suburb: {property.location.suburb}</p>
          <p>Country: {property.location.country}</p>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
