import React from 'react';
import { PropertyListing } from '@/types/property';

type AccessLevel = "anonymous" | "email_verified" | "phone_verified" | "identity_verified" | "financial_verified";

interface PropertyDocumentsProps {
  property: PropertyListing;
  accessLevel: AccessLevel;
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
  const getAccessibleDocuments = () => {
    // Define which documents are accessible at each access level
    switch (accessLevel) {
      case "financial_verified":
        return ["all_documents", "financial_reports", "legal_documents", "inspection_reports"];
      case "identity_verified":
        return ["property_details", "photos", "legal_documents"];
      case "phone_verified":
        return ["property_details", "photos"];
      case "email_verified":
        return ["property_details"];
      default:
        return ["basic_info"];
    }
  };

  const accessibleDocs = getAccessibleDocuments();
  const hasFullAccess = accessLevel === "financial_verified";
  const canViewDocuments = accessLevel !== "anonymous";

  // Mock documents data - in real app this would come from the property or API
  const mockDocuments = documents.length > 0 ? documents : [
    { id: '1', name: 'Property Title Deed', url: '#', type: 'legal' },
    { id: '2', name: 'Floor Plan', url: '#', type: 'design' },
    { id: '3', name: 'Property Survey', url: '#', type: 'legal' },
    { id: '4', name: 'Energy Certificate', url: '#', type: 'compliance' }
  ];

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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Property Documents</h3>
        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
          Access Level: {accessLevel.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {!hasFullAccess && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Complete verification to access all documents. Current access level: {accessLevel.replace('_', ' ')}
          </p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600">
          Documents for: <span className="font-medium">{property.title}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          The following documents are available at your access level.
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
              {hasFullAccess ? (
                <span className="text-sm text-green-600 font-medium">Available</span>
              ) : (
                <span className="text-gray-400 text-sm">Restricted</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No documents available for this property</p>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Available at your level:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {accessibleDocs.map((doc, index) => (
            <li key={index} className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {doc.replace('_', ' ').toUpperCase()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PropertyDocuments;
