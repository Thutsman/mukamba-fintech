import React from 'react';
import { PropertyListing } from '@/types/property';

interface PropertyDocumentsProps {
  property: PropertyListing;
  accessLevel: 'guest' | 'basic' | 'verified' | 'premium';
  documents?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({ 
  property, 
  accessLevel, 
  documents = [] 
}) => {
  // Mock documents data - in real app this would come from the property or API
  const mockDocuments = documents.length > 0 ? documents : [
    { id: '1', name: 'Property Title Deed', url: '#', type: 'legal' },
    { id: '2', name: 'Floor Plan', url: '#', type: 'design' },
    { id: '3', name: 'Property Survey', url: '#', type: 'legal' },
    { id: '4', name: 'Energy Certificate', url: '#', type: 'compliance' }
  ];

  const canViewDocuments = accessLevel !== 'guest';

  if (!canViewDocuments) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Property Documents</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Sign up to view property documents and legal information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Property Documents</h3>
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600">
          Documents for: <span className="font-medium">{property.title}</span>
        </p>
      </div>
      
      {mockDocuments.length > 0 ? (
        <div className="space-y-3">
          {mockDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">
                    {doc.type.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{doc.type}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No documents available for this property</p>
      )}
    </div>
  );
};

export default PropertyDocuments;
