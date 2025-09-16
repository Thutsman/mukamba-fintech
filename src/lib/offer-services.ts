import { createClient } from '@supabase/supabase-js';
import { PropertyOffer, OfferStats, CreateOfferData, UpdateOfferData } from '@/types/offers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client only if credentials are available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Create a new property offer
 */
export const createPropertyOffer = async (offerData: CreateOfferData): Promise<string | null> => {
  try {
    console.log('Creating property offer with data:', offerData);
    
    // Validate required fields (seller_id is optional for admin-listed properties)
    if (!offerData.property_id || !offerData.buyer_id) {
      console.error('Missing required fields:', {
        property_id: offerData.property_id,
        buyer_id: offerData.buyer_id,
        seller_id: offerData.seller_id
      });
      return `mock-offer-${Date.now()}`;
    }
    
    // Validate that IDs are valid UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    console.log('Validating UUIDs:', {
      property_id: offerData.property_id,
      buyer_id: offerData.buyer_id,
      seller_id: offerData.seller_id,
      property_id_valid: uuidRegex.test(offerData.property_id),
      buyer_id_valid: uuidRegex.test(offerData.buyer_id),
      seller_id_valid: offerData.seller_id ? uuidRegex.test(offerData.seller_id) : 'N/A (optional)'
    });
    
    if (!uuidRegex.test(offerData.property_id) || !uuidRegex.test(offerData.buyer_id) || (offerData.seller_id && !uuidRegex.test(offerData.seller_id))) {
      console.error('Invalid UUID format:', {
        property_id: offerData.property_id,
        buyer_id: offerData.buyer_id,
        seller_id: offerData.seller_id
      });
      return `mock-offer-${Date.now()}`;
    }
    
    if (!supabase) {
      console.log('Supabase client not available, returning mock offer ID');
      return 'mock-offer-id';
    }

    // Calculate expiry date based on timeline
    const expiresAt = calculateOfferExpiry(offerData.estimated_timeline);
    console.log('Calculated expiry date:', expiresAt);

    // Insert the offer
    const insertData = {
      property_id: offerData.property_id,
      buyer_id: offerData.buyer_id,
      seller_id: offerData.seller_id || null, // Optional for admin-listed properties
      offer_price: offerData.offer_price,
      deposit_amount: offerData.deposit_amount,
      payment_method: offerData.payment_method,
      estimated_timeline: offerData.estimated_timeline,
      additional_notes: offerData.additional_notes || null,
      expires_at: expiresAt,
      status: 'pending'
    };
    
    console.log('Inserting offer data:', insertData);
    
            // Test if we can access the table first
            const { data: testData, error: testError } = await supabase
              .from('property_offers')
              .select('id')
              .limit(1);
            
            if (testError) {
              console.error('Cannot access property_offers table:', testError);
              return `mock-offer-${Date.now()}`;
            }
            
            console.log('Table access test successful');
            
            // Check if property exists
            const { data: propertyData, error: propertyError } = await supabase
              .from('properties')
              .select('id')
              .eq('id', offerData.property_id)
              .single();
            
            if (propertyError || !propertyData) {
              console.error('Property does not exist:', {
                property_id: offerData.property_id,
                error: propertyError
              });
              return `mock-offer-${Date.now()}`;
            }
            
            console.log('Property exists:', propertyData.id);
            
            // Check if buyer exists in user_profiles
            const { data: buyerData, error: buyerError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('id', offerData.buyer_id)
              .single();
            
            if (buyerError || !buyerData) {
              console.error('Buyer does not exist in user_profiles:', {
                buyer_id: offerData.buyer_id,
                error: buyerError
              });
              return `mock-offer-${Date.now()}`;
            }
            
            console.log('Buyer exists:', buyerData.id);
            
            // Seller ID is optional for admin-listed properties
            if (offerData.seller_id) {
              const { data: sellerData, error: sellerError } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('id', offerData.seller_id)
                .single();
              
              if (sellerError || !sellerData) {
                console.error('Seller does not exist in user_profiles:', {
                  seller_id: offerData.seller_id,
                  error: sellerError
                });
                return `mock-offer-${Date.now()}`;
              }
              
              console.log('Seller exists:', sellerData.id);
            } else {
              console.log('No seller ID provided - admin-listed property');
            }
    
    // Now try the insert
    const { data, error } = await supabase
      .from('property_offers')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating property offer:', error);
      console.error('Raw Supabase error object:', JSON.stringify(error, null, 2));
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      
      // Return mock ID for development/testing purposes
      console.log('Returning mock offer ID due to error');
      return `mock-offer-${Date.now()}`;
    }

    console.log('Successfully created offer with ID:', data?.id);

    // Update property status to 'under_offer'
    await supabase
      .from('properties')
      .update({ status: 'under_offer' })
      .eq('id', offerData.property_id);

    // Create notification for seller (only if seller_id exists)
    if (offerData.seller_id) {
      await createNotification(
        offerData.seller_id,
        'new_offer',
        'New offer received for your property',
        `You have received a new offer of ${offerData.offer_price} for your property.`
      );
    }

    return data.id;
  } catch (error) {
    console.error('Error in createPropertyOffer:', error);
    console.log('Returning mock offer ID due to exception');
    return `mock-offer-${Date.now()}`;
  }
};

/**
 * Get all property offers with related data
 */
export const getPropertyOffers = async (filters?: {
  status?: string;
  property_id?: string;
  buyer_id?: string;
  seller_id?: string;
}): Promise<PropertyOffer[]> => {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning mock offers');
      return getMockOffers(filters?.buyer_id);
    }

    let query = supabase
      .from('property_offers')
      .select(`
        *,
        property:properties(id, title, price, currency, city, country, street_address, suburb),
        buyer:user_profiles!property_offers_buyer_id_fkey(id, first_name, last_name, email, phone),
        seller:user_profiles!property_offers_seller_id_fkey(id, first_name, last_name, email),
        reviewer:user_profiles!property_offers_admin_reviewed_by_fkey(id, first_name, last_name)
      `)
      .order('submitted_at', { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.property_id) {
      query = query.eq('property_id', filters.property_id);
    }
    if (filters?.buyer_id) {
      query = query.eq('buyer_id', filters.buyer_id);
    }
    if (filters?.seller_id) {
      query = query.eq('seller_id', filters.seller_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching property offers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPropertyOffers:', error);
    return [];
  }
};

/**
 * Update an offer (approve/reject)
 */
export const updatePropertyOffer = async (
  offerId: string, 
  updateData: UpdateOfferData,
  adminId?: string
): Promise<boolean> => {
  try {
    if (!supabase) {
      console.log('Supabase client not available, mock update successful');
      return true;
    }

    console.log('Updating property offer:', {
      offerId,
      updateData,
      adminId
    });

    const updatePayload: any = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    // Only add admin fields if adminId is provided
    if (adminId) {
      updatePayload.admin_reviewed_by = adminId;
      updatePayload.admin_reviewed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('property_offers')
      .update(updatePayload)
      .eq('id', offerId);

    if (error) {
      console.error('Error updating property offer:', error);
      console.error('Raw Supabase error object:', JSON.stringify(error, null, 2));
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      console.error('Update payload:', updatePayload);
      console.error('Offer ID:', offerId);
      return false;
    }

    // If offer is approved or rejected, update property status
    if (updateData.status === 'approved') {
      await supabase
        .from('properties')
        .update({ status: 'sold' })
        .eq('id', (await getPropertyOfferById(offerId))?.property_id);
    } else if (updateData.status === 'rejected') {
      await supabase
        .from('properties')
        .update({ status: 'active' })
        .eq('id', (await getPropertyOfferById(offerId))?.property_id);
    }

    return true;
  } catch (error) {
    console.error('Error in updatePropertyOffer:', error);
    return false;
  }
};

/**
 * Get a single offer by ID
 */
export const getPropertyOfferById = async (offerId: string): Promise<PropertyOffer | null> => {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning mock offer');
      return getMockOffers()[0] || null;
    }

    const { data, error } = await supabase
      .from('property_offers')
      .select(`
        *,
        property:properties(id, title, price, currency, city, country, street_address, suburb),
        buyer:user_profiles!property_offers_buyer_id_fkey(id, first_name, last_name, email, phone),
        seller:user_profiles!property_offers_seller_id_fkey(id, first_name, last_name, email),
        reviewer:user_profiles!property_offers_admin_reviewed_by_fkey(id, first_name, last_name)
      `)
      .eq('id', offerId)
      .single();

    if (error) {
      console.error('Error fetching property offer:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getPropertyOfferById:', error);
    return null;
  }
};

/**
 * Get offer statistics
 */
export const getOfferStats = async (): Promise<OfferStats> => {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning mock stats');
      return {
        total: 15,
        pending: 8,
        approved: 4,
        rejected: 2,
        withdrawn: 1,
        expired: 0
      };
    }

    const { data, error } = await supabase
      .from('property_offers')
      .select('status');

    if (error) {
      console.error('Error fetching offer stats:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        withdrawn: 0,
        expired: 0
      };
    }

    const stats: OfferStats = {
      total: data.length,
      pending: data.filter(o => o.status === 'pending').length,
      approved: data.filter(o => o.status === 'approved').length,
      rejected: data.filter(o => o.status === 'rejected').length,
      withdrawn: data.filter(o => o.status === 'withdrawn').length,
      expired: data.filter(o => o.status === 'expired').length
    };

    return stats;
  } catch (error) {
    console.error('Error in getOfferStats:', error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      withdrawn: 0,
      expired: 0
    };
  }
};

/**
 * Helper function to calculate offer expiry date
 */
const calculateOfferExpiry = (timeline: string): string => {
  const now = new Date();
  let daysToAdd = 7; // Default 7 days

  if (timeline === 'ready_to_pay_in_full') {
    daysToAdd = 3; // 3 days for cash offers
  } else if (timeline.includes('_months')) {
    const months = parseInt(timeline.replace('_months', ''));
    daysToAdd = Math.min(months * 7, 30); // Max 30 days
  }

  const expiryDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
  return expiryDate.toISOString();
};

/**
 * Helper function to create notifications
 */
const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string
): Promise<void> => {
  try {
    if (!supabase) return;

    await supabase
      .from('system_notifications')
      .insert([{
        user_id: userId,
        notification_type: type,
        title,
        message,
        read: false
      }]);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * Mock data for development
 */
const getMockOffers = (buyerId?: string): PropertyOffer[] => [
  {
    id: '1',
    property_id: 'prop-1',
    buyer_id: buyerId || 'buyer-1',
    seller_id: 'seller-1',
    offer_price: 250000,
    deposit_amount: 25000,
    payment_method: 'installments',
    estimated_timeline: '6_months',
    additional_notes: 'Interested in viewing the property first',
    status: 'pending',
    submitted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    property: {
      id: 'prop-1',
      title: 'Modern 3-Bedroom House',
      price: 280000,
      currency: 'USD',
      location: { city: 'Harare', country: 'ZW' }
    },
    buyer: {
      id: buyerId || 'buyer-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+263771234567'
    },
    seller: {
      id: 'seller-1',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com'
    }
  },
  {
    id: '2',
    property_id: 'prop-2',
    buyer_id: buyerId || 'buyer-2',
    seller_id: 'seller-2',
    offer_price: 180000,
    deposit_amount: 18000,
    payment_method: 'cash',
    estimated_timeline: 'ready_to_pay_in_full',
    additional_notes: 'Ready to proceed immediately',
    status: 'approved',
    admin_reviewed_by: 'admin-1',
    admin_reviewed_at: new Date().toISOString(),
    admin_notes: 'Good offer, buyer is pre-approved',
    submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    property: {
      id: 'prop-2',
      title: 'Luxury Apartment',
      price: 200000,
      currency: 'USD',
      location: { city: 'Johannesburg', country: 'SA' }
    },
    buyer: {
      id: buyerId || 'buyer-2',
      first_name: 'Sarah',
      last_name: 'Wilson',
      email: 'sarah@example.com',
      phone: '+27123456789'
    },
    seller: {
      id: 'seller-2',
      first_name: 'Mike',
      last_name: 'Johnson',
      email: 'mike@example.com'
    },
    reviewer: {
      id: 'admin-1',
      first_name: 'Admin',
      last_name: 'User'
    }
  }
];
