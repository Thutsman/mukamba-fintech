# Admin Approval Workflow for Property Listings

## Overview

This document describes the complete admin approval workflow system for property listings in the Mukamba Fintech application. The system replaces the previous direct listing creation with a proper approval workflow where properties start as pending applications and must be reviewed and approved by administrators before becoming public listings.

## System Architecture

### Database Tables

1. **`property_applications`** - Stores property submission applications
   - `id` - Unique identifier for the application
   - `property_id` - Reference to the properties table
   - `seller_id` - Reference to the seller/user
   - `status` - Application status (pending, approved, rejected)
   - `submitted_at` - When the application was submitted
   - `reviewed_at` - When the application was reviewed
   - `reviewed_by` - Admin who reviewed the application
   - `rejection_reason` - Reason for rejection (if applicable)
   - `admin_notes` - Additional notes from admin

2. **`admin_reviews`** - Tracks admin review actions
   - `id` - Unique identifier for the review
   - `application_id` - Reference to the property application
   - `admin_id` - Admin who performed the review
   - `action` - Review action (approve/reject)
   - `reason` - Reason for rejection (if applicable)
   - `notes` - Additional notes
   - `reviewed_at` - When the review was performed

### Service Layer

The system includes a new service file: `src/lib/property-application-services.ts`

**Key Functions:**
- `createPropertyApplicationInSupabase()` - Creates new pending applications
- `getPropertyApplications()` - Retrieves applications with optional status filtering
- `approvePropertyApplication()` - Approves applications and publishes properties
- `rejectPropertyApplication()` - Rejects applications with reasons
- `getPropertyListingsStats()` - Provides real-time statistics

## Workflow Process

### 1. Property Submission
- Admins use `AdminListingModal.tsx` to submit property listings
- Properties are automatically created with `listing_status: 'pending'`
- A corresponding `property_applications` record is created with `status: 'pending'`

### 2. Admin Review
- Admins view pending applications in `ListingsPage.tsx`
- Real-time statistics show counts of pending, approved, and rejected applications
- Admins can approve or reject applications with notes

### 3. Approval Process
- **Approval**: Property status changes to `'published'`, application status to `'approved'`
- **Rejection**: Property status changes to `'rejected'`, application status to `'rejected'`
- All actions are logged in the `admin_reviews` table

### 4. Public Listing
- Only approved properties appear in public listings
- Rejected properties remain in the system for reference but are not publicly visible

## Component Updates

### AdminListingModal.tsx
- **Before**: Created properties directly with `status: 'active'`
- **After**: Creates pending applications with `status: 'pending'`
- Uses `createPropertyApplicationInSupabase()` service
- Properties start in review queue instead of immediate publication

### ListingsPage.tsx
- **Before**: Displayed mock data with hardcoded counts
- **After**: Displays real database data with live statistics
- Integrates with property application services
- Shows real-time application counts and statuses
- Provides working approve/reject functionality

### AdminDashboard.tsx
- **Before**: Used mock data for property statistics
- **After**: Uses real data from `getPropertyListingsStats()`
- Shows live counts of pending, approved, and rejected applications
- Progress indicators reflect actual approval rates

## Database Migration

To set up the system, run the SQL migration:

```sql
-- Run this in your Supabase SQL editor
-- File: supabase/migrations/20240306000000_property_applications_setup.sql
```

The migration creates:
- Required tables with proper relationships
- Row Level Security (RLS) policies
- Performance indexes
- Helper functions for data retrieval

## Security Features

### Row Level Security (RLS)
- **Admins**: Can view, create, and update all applications
- **Sellers**: Can only view their own applications
- **Unauthorized users**: Cannot access any application data

### Data Validation
- Status values are constrained to valid options
- Foreign key relationships ensure data integrity
- Timestamps are automatically managed

## Usage Examples

### Creating a New Property Application
```typescript
import { createPropertyApplicationInSupabase } from '@/lib/property-application-services';

const propertyListing = {
  // ... property data
  status: 'pending'
};

const applicationId = await createPropertyApplicationInSupabase(propertyListing);
```

### Approving an Application
```typescript
import { approvePropertyApplication } from '@/lib/property-application-services';

const success = await approvePropertyApplication(
  applicationId, 
  adminId, 
  'Property meets all requirements'
);
```

### Getting Application Statistics
```typescript
import { getPropertyListingsStats } from '@/lib/property-application-services';

const stats = await getPropertyListingsStats();
// Returns: { pending: 5, approved: 12, rejected: 2, total: 19 }
```

## Benefits

1. **Quality Control**: All properties are reviewed before publication
2. **Audit Trail**: Complete history of admin decisions and reasons
3. **Real-time Data**: Live statistics and application statuses
4. **Security**: Proper access control and data isolation
5. **Scalability**: Efficient database queries with proper indexing

## Future Enhancements

1. **Email Notifications**: Alert sellers when applications are approved/rejected
2. **Bulk Operations**: Approve/reject multiple applications at once
3. **Advanced Filtering**: Search by property type, location, price range
4. **Review Templates**: Predefined rejection reasons and approval criteria
5. **Performance Metrics**: Track admin review times and approval rates

## Troubleshooting

### Common Issues

1. **Applications not loading**: Check RLS policies and admin role assignment
2. **Approval failing**: Verify property and application IDs exist
3. **Stats not updating**: Ensure `useEffect` dependencies are correct

### Debug Steps

1. Check browser console for error messages
2. Verify database tables exist and have correct structure
3. Confirm RLS policies are properly configured
4. Test service functions individually

## Support

For technical support or questions about the admin approval workflow, refer to:
- Database schema documentation
- Service function documentation
- Component prop interfaces
- Migration file comments
