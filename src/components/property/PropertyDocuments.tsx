import React from 'react';

interface PropertyDocumentsProps {
  documents?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({ documents = [] }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Property Documents</h3>
      {documents.length > 0 ? (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center space-x-2">
              <span className="text-blue-600 hover:underline cursor-pointer">
                {doc.name}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No documents available</p>
      )}
    </div>
  );
};

export default PropertyDocuments;
