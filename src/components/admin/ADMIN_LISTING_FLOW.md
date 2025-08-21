# Admin Listing Flow Documentation

## Overview

This document describes the complete flow from when a verified seller submits a property listing to when it becomes publicly visible in the PropertyListings component.

## Flow Summary

1. **Seller Submission**: Verified seller submits property via PropertyListingModal
2. **Admin Review**: Admin reviews submission in AdminDashboard > Listings tab
3. **Admin Approval**: Admin approves/rejects the submission
4. **Add to Listings**: Admin uses "Add Listing" button to add approved properties to public listings
5. **Public Visibility**: Property appears in PropertyListings component

## Components Involved

### 1. PropertyListingModal (Seller Side)
- **Location**: `src/components/forms/PropertyListingModal.tsx`
- **Purpose**: Allows verified sellers to submit property listings
- **Data Collected**:
  - Basic property information (title, description, type)
  - Location details (city, suburb, street address)
  - Property specifications (size, bedrooms, bathrooms, parking)
  - Financial details (price, rent-to-buy options)
  - Property features and amenities
  - Property photos and documents

### 2. AdminDashboard
- **Location**: `src/components/admin/AdminDashboard.tsx`
- **Purpose**: Main admin interface for managing the platform
- **Key Features**:
  - Overview of platform statistics
  - Navigation to different admin sections
  - Integration with ListingsPage for property management

### 3. ListingsPage
- **Location**: `src/components/admin/ListingsPage.tsx`
- **Purpose**: Admin interface for reviewing and managing property submissions
- **Key Features**:
  - View all property submissions (pending, approved, rejected)
  - Approve/reject submissions
  - Add approved properties to public listings
  - Bulk actions on multiple listings

### 4. AdminListingModal
- **Location**: `src/components/admin/AdminListingModal.tsx`
- **Purpose**: Modal for admins to add approved properties to public listings
- **Key Features**:
  - Pre-fills with approved admin listing data
  - Allows editing of property information
  - Upload property photos
  - Convert to PropertyListing format for public display

### 5. PropertyListings
- **Location**: `src/components/property/PropertyListings.tsx`
- **Purpose**: Public interface showing all active property listings
- **Key Features**:
  - Displays all approved and active properties
  - Search and filter functionality
  - Property cards with details and photos

## Data Flow

### Step 1: Seller Submission
```typescript
// Seller fills out PropertyListingModal
const sellerData = {
  title: "Modern 3-Bedroom House",
  description: "Beautiful house in prime location...",
  propertyType: "house",
  listingType: "rent-to-buy",
  // ... other property details
};

// Data is submitted and stored as AdminListing
const adminListing: AdminListing = {
  id: "listing_123",
  propertyTitle: sellerData.title,
  sellerName: "John Smith",
  status: "pending",
  // ... other fields
};
```

### Step 2: Admin Review
```typescript
// Admin sees pending listings in ListingsPage
const pendingListings = adminListings.filter(l => l.status === 'pending');

// Admin can approve/reject
onApproveListing(listingId); // Changes status to 'approved'
onRejectListing(listingId, reason); // Changes status to 'rejected'
```

### Step 3: Add to Public Listings
```typescript
// Admin clicks "Add Listing" button for approved listing
const handleAddListing = (adminListing: AdminListing) => {
  // Opens AdminListingModal with pre-filled data
  setSelectedListingForAdd(adminListing);
  setIsAddListingModalOpen(true);
};

// Admin completes the form and submits
const handleAddToListingsComplete = (propertyListing: PropertyListing) => {
  // Converts AdminListing to PropertyListing format
  // Adds to PropertyListings component
  onAddToListings(propertyListing);
};
```

### Step 4: Public Display
```typescript
// PropertyListing is now available in PropertyListings
const propertyListing: PropertyListing = {
  id: "prop_123",
  title: "Modern 3-Bedroom House",
  status: "active",
  // ... all property details for public display
};
```

## Key Data Transformations

### AdminListing → PropertyListing
```typescript
// Conversion happens in AdminListingModal
const propertyListing: PropertyListing = {
  id: adminListing.id,
  title: adminListing.propertyTitle,
  description: formData.description,
  propertyType: formData.propertyType,
  listingType: formData.listingType,
  location: {
    country: formData.country,
    city: formData.city,
    suburb: formData.suburb,
    streetAddress: formData.streetAddress,
  },
  details: {
    size: parseInt(formData.size),
    bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
    bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
    parking: formData.parking ? parseInt(formData.parking) : undefined,
    features: formData.features || [],
    amenities: formData.amenities || [],
  },
  financials: {
    price: parseInt(formData.price),
    currency: formData.currency,
    rentToBuyDeposit: formData.rentToBuyDeposit ? parseInt(formData.rentToBuyDeposit) : undefined,
    monthlyRental: formData.monthlyRental ? parseInt(formData.monthlyRental) : undefined,
    rentCreditPercentage: formData.rentCreditPercentage ? parseInt(formData.rentCreditPercentage) : undefined,
  },
  media: {
    mainImage: imageUrls[0] || '/placeholder-property.jpg',
    images: imageUrls,
  },
  seller: {
    id: adminListing.sellerId,
    name: formData.sellerName,
    isVerified: formData.sellerIsVerified,
    contactInfo: {
      phone: formData.sellerPhone,
      email: formData.sellerEmail,
    },
  },
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  views: 0,
  savedBy: 0,
  inquiries: 0,
};
```

## Usage Examples

### Basic Admin Flow
```typescript
// 1. Admin reviews pending listings
const pendingListings = listings.filter(l => l.status === 'pending');

// 2. Admin approves a listing
onApproveListing('listing_123');

// 3. Admin adds approved listing to public listings
handleAddListing(approvedListing);

// 4. Admin completes the form in AdminListingModal
// 5. Property appears in PropertyListings
```

### Integration Example
```typescript
// See AdminListingIntegrationExample.tsx for complete integration
export const AdminListingIntegrationExample = ({ user }) => {
  const [propertyListings, setPropertyListings] = useState([]);

  const handleAddToListings = (propertyListing) => {
    setPropertyListings(prev => [propertyListing, ...prev]);
  };

  return (
    <AdminDashboard
      user={user}
      onAddToListings={handleAddToListings}
    />
  );
};
```

## Configuration

### Required Props
- `AdminListingModal`: Requires `onComplete` callback to handle the final PropertyListing
- `ListingsPage`: Requires `onAddToListings` callback to handle adding to public listings
- `AdminDashboard`: Integrates with ListingsPage and handles the complete flow

### Optional Features
- Pre-filling with approved admin listing data
- Photo upload and management
- Validation and error handling
- Toast notifications for success/error states

## Security Considerations

1. **Admin Authentication**: Only authenticated admins can access the admin dashboard
2. **Data Validation**: All form inputs are validated using Zod schemas
3. **File Upload Security**: Image uploads are restricted to specific file types and sizes
4. **Status Management**: Only approved listings can be added to public listings

## Future Enhancements

1. **Bulk Operations**: Add multiple approved listings at once
2. **Template System**: Pre-defined templates for common property types
3. **Auto-Approval**: Rules-based automatic approval for trusted sellers
4. **Audit Trail**: Track all admin actions and changes
5. **Scheduling**: Schedule when properties go live in public listings
