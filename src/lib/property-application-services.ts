import { createClient } from '@supabase/supabase-js';
import { PropertyListing } from '@/types/property';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PropertyApplication {
  id?: string;
  seller_id: string;
  property_data: PropertyListing;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  admin_notes?: string;
}

export interface AdminReview {
  id?: string;
  application_id: string;
  admin_id: string;
  action: 'approve' | 'reject';
  reason?: string;
  notes?: string;
  reviewed_at?: string;
}

export async function createPropertyApplicationInSupabase(
  propertyListing: PropertyListing
): Promise<string | null> {
  try {
    // First, create the property record
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .insert({
        title: propertyListing.title,
        description: propertyListing.description,
        property_type: propertyListing.propertyType,
        listing_type: propertyListing.listingType,
        country: propertyListing.location.country,
        city: propertyListing.location.city,
        suburb: propertyListing.location.suburb,
        street_address: propertyListing.location.streetAddress,
        size_sqm: propertyListing.details.size,
        bedrooms: propertyListing.details.bedrooms,
        bathrooms: propertyListing.details.bathrooms,
        parking_spaces: propertyListing.details.parking,
        price: propertyListing.financials.price,
        currency: propertyListing.financials.currency,
        rent_to_buy_deposit: propertyListing.financials.rentToBuyDeposit,
        monthly_installment: propertyListing.financials.monthlyInstallment,
        payment_duration: propertyListing.financials.paymentDuration,
        features: propertyListing.details.features,
        amenities: propertyListing.details.amenities,
        status: 'pending',
        seller_id: null,
      })
      .select('id')
      .single();

    if (propertyError) {
      console.error('Error creating property:', propertyError);
      return null;
    }

    // Create property images records for the uploaded images
    if (propertyListing.media.images && Array.isArray(propertyListing.media.images)) {
      const imageRecords = propertyListing.media.images.map((imageUrl, index) => ({
        property_id: propertyData.id,
        image_url: imageUrl,
        image_order: index,
        is_main_image: index === 0, // First image is main image
      }));

      const { error: imageError } = await supabase
        .from('property_images')
        .insert(imageRecords);

      if (imageError) {
        console.error('Error creating property images records:', imageError);
        // Don't fail the entire operation, just log the error
      } else {
        console.log('Property images records created successfully');
      }
    }

    // Create the property application record
    const { data: applicationData, error: applicationError } = await supabase
      .from('property_applications')
      .insert({
        property_id: propertyData.id,
        seller_id: null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (applicationError) {
      console.error('Error creating application:', applicationError);
      return null;
    }

    return applicationData.id;
  } catch (error) {
    console.error('Error in createPropertyApplicationInSupabase:', error);
    return null;
  }
}

export async function getPropertyApplications(status?: string): Promise<PropertyApplication[]> {
  try {
    let query = supabase
      .from('property_applications')
      .select(`
        *,
        properties (*),
        auth.users!property_applications_seller_id_fkey (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .order('submitted_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return [];
    }

    // Transform the data to match PropertyApplication interface
    if (data) {
      return data.map((item: any) => ({
        id: item.id,
        seller_id: item.seller_id,
        property_data: item.properties as PropertyListing,
        status: item.status,
        submitted_at: item.submitted_at,
        reviewed_at: item.reviewed_at,
        reviewed_by: item.reviewed_by,
        rejection_reason: item.rejection_reason,
        admin_notes: item.admin_notes,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error in getPropertyApplications:', error);
    return [];
  }
}

export async function approvePropertyApplication(
  applicationId: string,
  adminId: string,
  notes?: string
): Promise<boolean> {
  try {
    // Update the application status
    const { error: applicationError } = await supabase
      .from('property_applications')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        admin_notes: notes,
      })
      .eq('id', applicationId);

    if (applicationError) {
      console.error('Error approving application:', applicationError);
      return false;
    }

    // Get the property ID from the application
    const { data: applicationData, error: fetchError } = await supabase
      .from('property_applications')
      .select('property_id')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      console.error('Error fetching application:', fetchError);
      return false;
    }

    // Update the property status to published
    const { error: propertyError } = await supabase
      .from('properties')
      .update({
        status: 'published',
      })
      .eq('id', applicationData.property_id);

    if (propertyError) {
      console.error('Error updating property status:', propertyError);
      return false;
    }

    // Create admin review record
    const { error: reviewError } = await supabase
      .from('admin_reviews')
      .insert({
        application_id: applicationId,
        admin_id: adminId,
        action: 'approve',
        notes: notes,
      });

    if (reviewError) {
      console.error('Error creating review record:', reviewError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in approvePropertyApplication:', error);
    return false;
  }
}

export async function rejectPropertyApplication(
  applicationId: string,
  adminId: string,
  reason: string,
  notes?: string
): Promise<boolean> {
  try {
    // Update the application status
    const { error: applicationError } = await supabase
      .from('property_applications')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        rejection_reason: reason,
        admin_notes: notes,
      })
      .eq('id', applicationId);

    if (applicationError) {
      console.error('Error rejecting application:', applicationError);
      return false;
    }

    // Get the property ID from the application
    const { data: applicationData, error: fetchError } = await supabase
      .from('property_applications')
      .select('property_id')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      console.error('Error fetching application:', fetchError);
      return false;
    }

    // Update the property status to rejected
    const { error: propertyError } = await supabase
      .from('properties')
      .update({
        status: 'rejected',
      })
      .eq('id', applicationData.property_id);

    if (propertyError) {
      console.error('Error updating property status:', propertyError);
      return false;
    }

    // Create admin review record
    const { error: reviewError } = await supabase
      .from('admin_reviews')
      .insert({
        application_id: applicationId,
        admin_id: adminId,
        action: 'reject',
        reason: reason,
        notes: notes,
      });

    if (reviewError) {
      console.error('Error creating review record:', reviewError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in rejectPropertyApplication:', error);
    return false;
  }
}

export async function getPropertyListingsStats(): Promise<{
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}> {
  try {
    const { data, error } = await supabase
      .from('property_applications')
      .select('status');

    if (error) {
      console.error('Error fetching stats:', error);
      return { pending: 0, approved: 0, rejected: 0, total: 0 };
    }

    const stats = {
      pending: data.filter(app => app.status === 'pending').length,
      approved: data.filter(app => app.status === 'approved').length,
      rejected: data.filter(app => app.status === 'rejected').length,
      total: data.length,
    };

    return stats;
  } catch (error) {
    console.error('Error in getPropertyListingsStats:', error);
    return { pending: 0, approved: 0, rejected: 0, total: 0 };
  }
}
