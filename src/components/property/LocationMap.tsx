import React from 'react';

interface LocationMapProps {
  address?: string;
  latitude?: number;
  longitude?: number;
}

const LocationMap: React.FC<LocationMapProps> = ({ address, latitude, longitude }) => {
  return (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-600">Map component - {address || 'Location not specified'}</p>
    </div>
  );
};

export default LocationMap;
